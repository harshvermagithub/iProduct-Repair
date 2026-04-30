const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

function calculatePriority(name) {
    let priority = 100;
    const n = name.toLowerCase();

    // The newer the tablet the lower the number.
    if (n.includes('pad 3')) priority = 40;
    else if (n.includes('pad 2')) priority = 45;
    else if (n.includes('pad go2') || n.includes('pad go 2')) priority = 48;
    else if (n.includes('pad lite')) priority = 50;
    else if (n.includes('pad go')) priority = 55;
    else if (n.includes('pad')) priority = 60; // Original OnePlus Pad

    if (n.includes('lte') || n.includes('5g')) priority -= 1; // LTE slightly better priority

    return priority;
}

async function main() {
    const tsvData = fs.readFileSync(path.join(__dirname, '..', 'oneplus_tablets.tsv'), 'utf8');
    const lines = tsvData.split('\n');

    // Ensure Brand is created/updated for OnePlus
    await prisma.brand.upsert({
        where: { id: 'oneplus' },
        update: {},
        create: {
            id: 'oneplus',
            name: 'OnePlus',
            logo: '/models/oneplus/logo.png', // Fallback, assuming already exists
            categories: ['smartphone', 'tablet'],
            priority: 4
        }
    });

    const opBrand = await prisma.brand.findUnique({ where: { id: 'oneplus' } });
    if (opBrand && !opBrand.categories.includes('tablet')) {
        await prisma.brand.update({
            where: { id: 'oneplus' },
            data: {
                categories: [...opBrand.categories, 'tablet']
            }
        });
    }

    const processedModels = new Set();
    const modelCache = new Map();

    console.log(`Processing OnePlus Tablets...`);

    // Skip header line (i=1)
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const [brand, modelName, variant, priceStr, imgPathRaw] = line.split('\t');
        if (!modelName || !variant || !priceStr) continue;

        const price = parseInt(priceStr, 10) || 0;

        // Clean name
        let cleanName = modelName.replace(/^Oneplus /i, 'OnePlus ').trim();
        cleanName = cleanName.replace(/ Tablet/gi, '').trim(); // Remove " Tablet" wording

        // Check if file exists, some extensions are weird like .webp in the local copies
        let imgPath = imgPathRaw || `/models/oneplus-tablet/coming_soon.png`;
        const localPath = path.join(__dirname, '..', 'public', imgPath);
        if (!fs.existsSync(localPath)) {
            if (fs.existsSync(localPath + '.webp')) {
                imgPath = imgPath + '.webp';
            } else if (fs.existsSync(localPath + '.jpeg')) {
                imgPath = imgPath + '.jpeg';
            } else if (fs.existsSync(localPath + '.jpg')) {
                imgPath = imgPath + '.jpg';
            }
        }

        const priority = calculatePriority(cleanName);

        let model;

        if (!processedModels.has(cleanName)) {
            const existingModel = await prisma.model.findFirst({
                where: {
                    brandId: 'oneplus',
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
                        brandId: 'oneplus',
                        name: cleanName,
                        img: imgPath,
                        category: 'tablet',
                        priority: priority
                    }
                });
                console.log(`Created OnePlus Tablet Model: ${cleanName}`);
            }

            // Clean variants
            await prisma.variant.deleteMany({
                where: { modelId: model.id }
            });

            processedModels.add(cleanName);
            modelCache.set(cleanName, model);
        } else {
            model = modelCache.get(cleanName);
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
