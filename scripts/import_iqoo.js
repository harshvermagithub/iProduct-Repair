const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

function calculatePriority(name) {
    const n = name.toLowerCase();

    // Series Base
    // iQOO 12 -> Number Series
    // iQOO Neo 9 -> Neo Series
    // iQOO Z9 -> Z Series

    let seriesBase = 4000;

    // Check 'neo' first? No.
    if (n.includes('neo')) {
        seriesBase = 2000;
    } else if (n.includes('z')) {
        seriesBase = 3000;
    } else if (n.includes('u')) {
        seriesBase = 4000;
    } else {
        // Fallback to Number series (e.g. iQOO 12, iQOO 9)
        // Usually contains digits but no Z/U/Neo.
        seriesBase = 1000;
    }

    // Gen
    // iQOO 12 -> 12. Neo 7 -> 7. Z9 -> 9.
    let gen = 0;
    const match = n.match(/(\d+)/);
    if (match) gen = parseInt(match[1]);

    // Gen Logic:
    // (100 - Gen) * 10.

    let genScore = (100 - gen) * 10;

    // Variant
    let variantScore = 0;
    if (n.includes('legend')) variantScore -= 25; // Legend is special
    if (n.includes('pro')) variantScore -= 20;
    if (n.includes('se')) variantScore -= 5;
    if (n.includes('lite')) variantScore += 10;
    if (n.includes('x')) variantScore += 5;

    return seriesBase + genScore + variantScore;
}

async function main() {
    console.log('Starting iQOO Import...');

    const tsvPath = path.join(__dirname, 'iqoo_data.tsv');
    const tsvContent = fs.readFileSync(tsvPath, 'utf-8');
    const rows = tsvContent.split('\n').slice(1).filter(r => r.trim());

    const validModelNames = new Set();

    // Ensure iQOO Brand
    // Priority 11
    await prisma.brand.upsert({
        where: { id: 'iqoo' },
        update: {
            name: 'iQOO',
            priority: 11
            // logo: NO CHANGE
        },
        create: {
            id: 'iqoo',
            name: 'iQOO',
            priority: 11,
            logo: '/brands/iqoo.svg',
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
                brandId: 'iqoo',
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
                    brandId: 'iqoo',
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
        where: { brandId: 'iqoo' }
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

    console.log('iQOO import complete.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
