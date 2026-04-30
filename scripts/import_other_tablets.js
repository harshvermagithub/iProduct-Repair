const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

const brandMapping = {
    'mi': 'xiaomi',
    'oppo': 'oppo',
    'nokia': 'nokia',
    'honor': 'honor',
    'motorola': 'motorola',
    'lenovo': 'lenovo',
    'poco': 'poco'
};

async function main() {
    const tsvData = fs.readFileSync(path.join(__dirname, '..', 'other_tablets.tsv'), 'utf8');
    const lines = tsvData.split('\n');

    const processedModels = new Set();
    const modelCache = new Map();

    console.log(`Processing Other Tablets...`);

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const [rawBrand, modelName, variant, priceStr, imgPathRaw] = line.split('\t');
        if (!rawBrand || !modelName || !variant || !priceStr) continue;

        const dbBrandId = brandMapping[rawBrand.toLowerCase()] || rawBrand.toLowerCase();
        const price = parseInt(priceStr, 10) || 0;

        let cleanName = modelName.trim();
        let imgPath = imgPathRaw || `/models/${dbBrandId}-tablet/coming_soon.png`;

        const priority = 50; // default priority for other tablets

        // Ensure category array includes tablet for this brand
        const brandObj = await prisma.brand.findUnique({ where: { id: dbBrandId } });
        if (brandObj && !brandObj.categories.includes('tablet')) {
            await prisma.brand.update({
                where: { id: dbBrandId },
                data: { categories: [...brandObj.categories, 'tablet'] }
            });
        } else if (!brandObj) {
            // Check if brand needs to be created, though most should exist from smartphones
            await prisma.brand.create({
                data: {
                    id: dbBrandId,
                    name: dbBrandId.charAt(0).toUpperCase() + dbBrandId.slice(1),
                    logo: `/models/${dbBrandId}/logo.png`,
                    categories: ['smartphone', 'tablet'],
                    priority: 50
                }
            });
        }

        let model;
        const uniqueKey = `${dbBrandId}_${cleanName}`;

        if (!processedModels.has(uniqueKey)) {
            const existingModel = await prisma.model.findFirst({
                where: {
                    brandId: dbBrandId,
                    name: { equals: cleanName, mode: 'insensitive' },
                    category: 'tablet'
                }
            });

            if (existingModel) {
                model = await prisma.model.update({
                    where: { id: existingModel.id },
                    data: {
                        img: imgPath,
                        priority: priority
                    }
                });
            } else {
                model = await prisma.model.create({
                    data: {
                        brandId: dbBrandId,
                        name: cleanName,
                        img: imgPath,
                        category: 'tablet',
                        priority: priority
                    }
                });
                console.log(`Created ${dbBrandId} Tablet Model: ${cleanName}`);
            }

            // Clean variants
            await prisma.variant.deleteMany({
                where: { modelId: model.id }
            });

            processedModels.add(uniqueKey);
            modelCache.set(uniqueKey, model);
        } else {
            model = modelCache.get(uniqueKey);
        }

        await prisma.variant.create({
            data: {
                modelId: model.id,
                name: variant,
                basePrice: price
            }
        });
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
