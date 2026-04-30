const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

function calculatePriority(name) {
    const n = name.toLowerCase();

    // Series Base
    let seriesBase = 5000;

    if (n.includes('poco f')) {
        seriesBase = 1000;
    } else if (n.includes('poco x')) {
        seriesBase = 2000;
    } else if (n.includes('poco m')) {
        seriesBase = 3000;
    } else if (n.includes('poco c')) {
        seriesBase = 4000;
    }

    // Gen
    // Poco F1 -> 1. Poco X2 -> 2. Poco C65 -> 65.
    let gen = 0;
    const match = n.match(/(\d+)/);
    if (match) gen = parseInt(match[1]);

    // Gen Logic:
    // (100 - Gen) * 10.

    let genScore = (100 - gen) * 10;

    // Variant
    let variantScore = 0;
    if (n.includes('gt')) variantScore -= 30; // Gaming Top
    if (n.includes('pro')) variantScore -= 20;
    if (n.includes('plus') || n.includes('+') || n.includes('max')) variantScore -= 10;
    if (n.includes('neo')) variantScore += 5;

    return seriesBase + genScore + variantScore;
}

async function main() {
    console.log('Starting Poco Import...');

    const tsvPath = path.join(__dirname, 'poco_data.tsv');
    const tsvContent = fs.readFileSync(tsvPath, 'utf-8');
    const rows = tsvContent.split('\n').slice(1).filter(r => r.trim());

    const validModelNames = new Set();

    // Ensure Poco Brand
    // Priority 10
    await prisma.brand.upsert({
        where: { id: 'poco' },
        update: {
            name: 'Poco',
            priority: 10
            // logo: NO CHANGE
        },
        create: {
            id: 'poco',
            name: 'Poco',
            priority: 10,
            logo: '/brands/poco.svg',
            categories: ['smartphone']
        }
    });

    const modelMap = {};

    for (const row of rows) {
        const cols = row.split('\t');
        if (cols.length < 5) continue;
        const [brand, modelName, variantName, priceStr, imagePath] = cols;

        if (!imagePath || imagePath.trim() === '') continue; // Skip no image

        validModelNames.add(modelName);

        if (!modelMap[modelName]) {
            modelMap[modelName] = { variants: [], img: imagePath };
        }
        modelMap[modelName].variants.push({
            name: variantName,
            price: parseInt(priceStr) || 0
        });
    }

    for (const [mName, data] of Object.entries(modelMap)) {
        const priority = calculatePriority(mName);

        const existingModel = await prisma.model.findFirst({
            where: {
                brandId: 'poco',
                name: { equals: mName, mode: 'insensitive' }
            }
        });

        let modelId;
        if (existingModel) {
            await prisma.model.update({
                where: { id: existingModel.id },
                data: {
                    img: data.img,
                    priority: priority
                }
            });
            modelId = existingModel.id;
            await prisma.variant.deleteMany({ where: { modelId: modelId } });
        } else {
            const newM = await prisma.model.create({
                data: {
                    brandId: 'poco',
                    name: mName,
                    img: data.img,
                    category: 'smartphone',
                    priority: priority
                }
            });
            modelId = newM.id;
        }

        for (const v of data.variants) {
            await prisma.variant.create({
                data: {
                    modelId: modelId,
                    name: v.name,
                    basePrice: v.price
                }
            });
        }
        console.log(`Updated ${mName} (Priority: ${priority})`);
    }

    // Cleanup Orphans
    const allModels = await prisma.model.findMany({
        where: { brandId: 'poco' }
    });

    for (const m of allModels) {
        const found = Array.from(validModelNames).some(v => v.toLowerCase() === m.name.toLowerCase());
        if (!found) {
            console.log(`Deleting orphan model: ${m.name}`);
            try {
                await prisma.variant.deleteMany({ where: { modelId: m.id } });
                await prisma.model.delete({ where: { id: m.id } });
            } catch (e) {
                console.error(`Could not delete ${m.name}: ${e.message}`);
            }
        }
    }

    console.log('Poco import complete.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
