const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

function calculatePriority(name) {
    const n = name.toLowerCase();

    // Find/Fold > Reno > F > K > A
    let seriesBase = 6000; // Base (A Series)
    if (n.includes('find') || n.includes('fold')) seriesBase = 0;
    else if (n.includes('reno')) seriesBase = 2000;
    else if (n.includes('f') && !n.includes('find') && !n.includes('fold')) seriesBase = 4000;
    else if (n.includes('k')) seriesBase = 5000;

    // Generation
    let gen = 0;
    // Reno 15 -> 15
    // Oppo A78 -> 78
    // Oppo K13 -> 13
    // Find X9 -> 9
    // Find N3 -> 3

    const match = n.match(/(\d+)/);
    if (match) gen = parseInt(match[1]);

    // Special: Find X8 > Find N3?
    // Find X is 8. Find N is 3. X8 score 920. N3 score 970.

    // Higher Gen first
    let genScore = (100 - gen) * 10;

    // Pro/Plus/5G adjustments
    let variantScore = 0;
    if (n.includes('pro')) variantScore -= 2;
    if (n.includes('plus') || n.includes('+')) variantScore -= 1;
    if (n.includes('5g')) variantScore -= 0.5;

    return seriesBase + genScore + variantScore;
}

async function main() {
    console.log('Starting Oppo Import...');

    const tsvPath = path.join(__dirname, 'oppo_data.tsv');
    const tsvContent = fs.readFileSync(tsvPath, 'utf-8');
    const rows = tsvContent.split('\n').slice(1).filter(r => r.trim());

    const validModelNames = new Set();

    // Ensure Oppo Brand (Do NOT change logo)
    // Priority 5 (after Google)
    await prisma.brand.upsert({
        where: { id: 'oppo' },
        update: {
            name: 'Oppo',
            priority: 5
            // logo: NO CHANGE
        },
        create: {
            id: 'oppo',
            name: 'Oppo',
            priority: 5,
            logo: '/brands/oppo.svg', // Default if brand new
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
                brandId: 'oppo',
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
                    brandId: 'oppo',
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
    const allOppoModels = await prisma.model.findMany({
        where: { brandId: 'oppo' }
    });

    for (const m of allOppoModels) {
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

    console.log('Oppo import complete.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
