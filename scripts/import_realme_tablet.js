const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

function calculatePriority(name) {
    let priority = 100;
    const n = name.toLowerCase();

    // The newer the tablet the lower the number.
    if (n.includes('pad x')) priority = 45;
    else if (n.includes('pad 2 lite')) priority = 48;
    else if (n.includes('pad 2')) priority = 40;
    else if (n.includes('mini')) priority = 60;
    else if (n.includes('pad')) priority = 55;

    if (n.includes('lte') || n.includes('5g')) priority -= 1; // LTE slightly better priority

    return priority;
}

async function main() {
    const tsvData = fs.readFileSync(path.join(__dirname, '..', 'realme_tablets.tsv'), 'utf8');
    const lines = tsvData.split('\n');

    // Ensure Brand is created/updated for Realme
    await prisma.brand.upsert({
        where: { id: 'realme' },
        update: {},
        create: {
            id: 'realme',
            name: 'Realme',
            logo: '/models/realme/logo.png', // Fallback
            categories: ['smartphone', 'tablet'],
            priority: 7
        }
    });

    const rlBrand = await prisma.brand.findUnique({ where: { id: 'realme' } });
    if (rlBrand && !rlBrand.categories.includes('tablet')) {
        await prisma.brand.update({
            where: { id: 'realme' },
            data: {
                categories: [...rlBrand.categories, 'tablet']
            }
        });
    }

    const processedModels = new Set();
    const modelCache = new Map();

    console.log(`Processing Realme Tablets...`);

    // Skip header line (i=1)
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const [brand, modelName, variant, priceStr, imgPathRaw] = line.split('\t');
        if (!modelName || !variant || !priceStr) continue;

        const price = parseInt(priceStr, 10) || 0;

        // Clean name
        let cleanName = modelName.trim();

        let imgPath = imgPathRaw || `/models/realme-tablet/coming_soon.png`;
        const priority = calculatePriority(cleanName);

        let model;

        if (!processedModels.has(cleanName)) {
            const existingModel = await prisma.model.findFirst({
                where: {
                    brandId: 'realme',
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
                        brandId: 'realme',
                        name: cleanName,
                        img: imgPath,
                        category: 'tablet',
                        priority: priority
                    }
                });
                console.log(`Created Realme Tablet Model: ${cleanName}`);
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
