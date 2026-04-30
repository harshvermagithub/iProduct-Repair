const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

function calculatePriority(name) {
    const n = name.toLowerCase();

    // Series Base
    let seriesBase = 3000;

    if (n.includes('hmd')) {
        seriesBase = 0;
    } else if (n.includes('nokia x') || n.includes('xr')) {
        seriesBase = 1000;
    } else if (n.includes('nokia g')) {
        seriesBase = 2000;
    } else if (n.includes('pureview') || n.includes('nokia 9')) {
        seriesBase = 1500;
    } else if (n.includes('nokia c')) {
        seriesBase = 4000;
    } else {
        // Number series (6.1, 5.4)
        seriesBase = 3000;
    }

    // Gen
    // G42 -> 42. C32 -> 32. 7.2 -> 7.2.
    let gen = 0;
    const match = n.match(/(\d+(\.\d+)?)/);
    if (match) gen = parseFloat(match[1]);

    // Gen Logic:
    // G42 -> 42. (100 - 42)*10 = 580.
    // 7.2 -> 7.2. (100 - 7.2)*10 ~ 930.
    // Problem: G42 (2580) vs 7.2 (3930).
    // G > Number. Correct.

    // HMD Skyline -> 0. Gen? 0.
    // (100 - 0)*10 = 1000.
    // Base 0 + 1000 = 1000.
    // X30 -> X(1000) + (100-30)*10 (700) = 1700.
    // HMD (1000) < X30 (1700). Correct.

    let genScore = (100 - gen) * 10;

    // Variant
    let variantScore = 0;
    if (n.includes('plus')) variantScore -= 10;
    if (n.includes('max')) variantScore -= 10;
    if (n.includes('fusion')) variantScore -= 20;

    return seriesBase + genScore + variantScore;
}

async function main() {
    console.log('Starting Nokia Import...');

    const tsvPath = path.join(__dirname, 'nokia_data.tsv');
    const tsvContent = fs.readFileSync(tsvPath, 'utf-8');
    const rows = tsvContent.split('\n').slice(1).filter(r => r.trim());

    const validModelNames = new Set();

    // Ensure Nokia Brand
    // Priority 13
    await prisma.brand.upsert({
        where: { id: 'nokia' },
        update: {
            name: 'Nokia',
            priority: 13
            // logo: NO CHANGE
        },
        create: {
            id: 'nokia',
            name: 'Nokia',
            priority: 13,
            logo: '/brands/nokia.svg',
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
                brandId: 'nokia',
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
                    brandId: 'nokia',
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
        where: { brandId: 'nokia' }
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

    console.log('Nokia import complete.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
