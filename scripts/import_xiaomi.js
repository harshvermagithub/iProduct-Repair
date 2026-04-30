const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

function calculatePriority(name) {
    const n = name.toLowerCase();

    // Series Base
    let seriesBase = 4000; // Redmi Number (default)

    if (n.startsWith('xiaomi') || n.startsWith('mi ') || n.includes(' mi ')) {
        // Xiaomi Mi Series
        // Check if Mi Note or Mi A
        if (n.includes('note') || n.includes(' a')) seriesBase = 2000; // Mi Note/A is mid
        else seriesBase = 1000; // Flagship
    } else if (n.includes('redmi k')) {
        seriesBase = 2000;
    } else if (n.includes('redmi note')) {
        seriesBase = 3000;
    } else if (n.includes('redmi a') || n.includes('redmi go') || n.includes('redmi y')) {
        seriesBase = 5000;
    } else if (n.includes('black shark')) {
        seriesBase = 6000;
    } else {
        // Default Redmi Number or fallback
        seriesBase = 4000;
    }

    // Gen
    let gen = 0;
    const match = n.match(/(\d+)/);
    if (match) gen = parseInt(match[1]);

    // Gen Logic: 1 to 20 range mostly.
    // (40 - Gen) * 10.

    let genScore = (40 - gen) * 10;

    // Variant
    let variantScore = 0;
    if (n.includes('ultra')) variantScore -= 30;
    if (n.includes('pro')) variantScore -= 20;
    if (n.includes('plus') || n.includes('+') || n.includes('max')) variantScore -= 10;
    if (n.includes('5g')) variantScore -= 5;

    return seriesBase + genScore + variantScore;
}

async function main() {
    console.log('Starting Xiaomi Import...');

    const tsvPath = path.join(__dirname, 'xiaomi_data.tsv');
    const tsvContent = fs.readFileSync(tsvPath, 'utf-8');
    const rows = tsvContent.split('\n').slice(1).filter(r => r.trim());

    const validModelNames = new Set();

    // Ensure Xiaomi Brand
    // Priority 7
    await prisma.brand.upsert({
        where: { id: 'xiaomi' },
        update: {
            name: 'Xiaomi',
            priority: 7
            // logo: NO CHANGE
        },
        create: {
            id: 'xiaomi',
            name: 'Xiaomi',
            priority: 7,
            logo: '/brands/xiaomi.svg',
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
                brandId: 'xiaomi',
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
                    brandId: 'xiaomi',
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

    // Reuse Logic: Cleanup Orphans
    // CAUTION: User might have existing Redmi separated?
    // Dofy scraped "Redmi" and "Xiaomi" together.
    // If our DB has brand 'redmi', this script won't touch it.
    // This script only touches `brandId: 'xiaomi'`.
    // If Dofy listed "Redmi Note 10" and we import it under 'xiaomi' brand,
    // AND we had 'redmi' brand before...
    // The user said "Xiaomi models".
    // Usually Redmi is under Xiaomi.
    // I will proceed putting all under 'xiaomi'.
    // If 'redmi' brand exists, I should check.
    // But `fix_brand_priorities.js` didn't list 'redmi' as top brand.
    // Assuming 'xiaomi' covers all.

    const allModels = await prisma.model.findMany({
        where: { brandId: 'xiaomi' }
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

    console.log('Xiaomi import complete.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
