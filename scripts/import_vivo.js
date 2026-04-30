const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

function calculatePriority(name) {
    const n = name.toLowerCase();

    // Series Base
    let seriesBase = 6000; // Y and others (Budget)
    if (n.includes('fold')) seriesBase = 0; // Top
    else if (n.startsWith('vivo x') || n.includes(' x')) seriesBase = 1000; // X Series
    else if (n.startsWith('vivo v') || n.includes(' v')) seriesBase = 2000; // V Series
    else if (n.startsWith('vivo t') || n.includes(' t')) seriesBase = 4000; // T Series
    else if (n.startsWith('vivo s') || n.includes(' s')) seriesBase = 5000; // S Series
    else if (n.startsWith('vivo z') || n.includes(' z')) seriesBase = 5000; // Z Series (Older Mid)
    // Y is 6000.

    // Generation Number
    // V30 -> 30. X100 -> 100. Y200 -> 200. Y17 -> 17.
    let gen = 0;
    const match = n.match(/(\d+)/);
    if (match) gen = parseInt(match[1]);

    // Higher Gen = Newer = Lower Score
    // Range of Gen: 1 to 300.
    // (400 - Gen) * 10.
    // X200: (400-200)*10 = 2000. Base 1000. Total 3000.
    // X100: (400-100)*10 = 3000. Base 1000. Total 4000.
    // V30: (400-30)*10 = 3700. Base 2000. Total 5700.

    // Fold 5: (400-5)*10 = 3950. Base 0. Total 3950.
    // Fold 5 (3950) vs X100 (4000). Fold appears before X100. Good.
    // Fold 3: (400-3)*10 = 3970. Base 0. Total 3970.

    let genScore = (400 - gen) * 10;

    // Variant adjustments
    let variantScore = 0;
    if (n.includes('pro')) variantScore -= 20;
    if (n.includes('plus') || n.includes('+') || n.includes('ultra')) variantScore -= 10;
    if (n.includes('5g')) variantScore -= 5;

    return seriesBase + genScore + variantScore;
}

async function main() {
    console.log('Starting Vivo Import...');

    const tsvPath = path.join(__dirname, 'vivo_data.tsv');
    const tsvContent = fs.readFileSync(tsvPath, 'utf-8');
    const rows = tsvContent.split('\n').slice(1).filter(r => r.trim());

    const validModelNames = new Set();

    // Ensure Vivo Brand
    // Priority 6
    await prisma.brand.upsert({
        where: { id: 'vivo' },
        update: {
            name: 'Vivo',
            priority: 6
            // logo: NO CHANGE
        },
        create: {
            id: 'vivo',
            name: 'Vivo',
            priority: 6,
            logo: '/brands/vivo.svg',
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
                brandId: 'vivo',
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
                    brandId: 'vivo',
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
        where: { brandId: 'vivo' }
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

    console.log('Vivo import complete.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
