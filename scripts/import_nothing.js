const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

function calculatePriority(name) {
    const n = name.toLowerCase();

    // Nothing Phone (2a) -> 2.
    // Nothing Phone (1) -> 1.

    let gen = 0;
    const match = n.match(/(\d+)/);
    if (match) gen = parseInt(match[1]);

    // Range 1-10.
    // (10 - Gen) * 100.
    // 3 -> 700.
    // 2 -> 800.
    // 1 -> 900.

    let base = (10 - gen) * 100;

    // Variant
    if (n.includes('a')) base += 50; // 'a' is budget version, lower priority (higher score)
    if (n.includes('pro') || n.includes('plus')) base -= 20; // Upgrade
    if (n.includes('lite')) base += 80;

    return base;
}

async function main() {
    console.log('Starting Nothing Import...');

    const tsvPath = path.join(__dirname, 'nothing_data.tsv');
    const tsvContent = fs.readFileSync(tsvPath, 'utf-8');
    const rows = tsvContent.split('\n').slice(1).filter(r => r.trim());

    const validModelNames = new Set();

    // Ensure Nothing Brand
    // Priority 12
    await prisma.brand.upsert({
        where: { id: 'nothing' },
        update: {
            name: 'Nothing',
            priority: 12
        },
        create: {
            id: 'nothing',
            name: 'Nothing',
            priority: 12,
            logo: '/brands/nothing.svg',
            categories: ['smartphone']
        }
    });

    const modelMap = {};

    for (const row of rows) {
        const cols = row.split('\t');
        if (cols.length < 5) continue;
        const [brand, modelName, variantName, priceStr, imagePath] = cols;

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
                brandId: 'nothing',
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
                    brandId: 'nothing',
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

    console.log('Nothing import complete.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
