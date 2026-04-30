const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

function calculatePriority(name) {
    let priority = 100;
    const n = name.toLowerCase();

    // S- series tablets
    if (n.includes('s10') || n.includes('s9') || n.includes('s8') || n.includes('s7') || n.includes('s6') || n.includes('s5') || n.includes('s4')) {
        priority = 50;
        const match = n.match(/s(\d+)/);
        if (match) {
            const gen = parseInt(match[1]);
            priority -= gen; // S10 -> 40, S9 -> 41
        }

        if (n.includes('ultra')) priority -= 5;
        if (n.includes('plus') || n.includes('+')) priority -= 2;
        if (n.includes('fe')) priority += 2;
        if (n.includes('lite')) priority += 5;
    }
    // A- series tablets
    else if (n.includes('galaxy tab a') || n.includes('tab a')) {
        priority = 80;
        const match = n.match(/a(\d+)/);
        if (match) {
            priority -= parseInt(match[1]);
        }
    }

    return priority;
}

async function main() {
    const tsvData = fs.readFileSync(path.join(__dirname, '..', 'samsung_tablets.tsv'), 'utf8');
    const lines = tsvData.split('\n');

    // Ensure Brand is created/updated for Samsung Tablets
    await prisma.brand.upsert({
        where: { id: 'samsung' },
        update: {},
        create: {
            id: 'samsung',
            name: 'Samsung',
            logo: '/models/samsung/logo.png',
            categories: ['smartphone', 'tablet'],
            priority: 99
        }
    });

    const samsungBrand = await prisma.brand.findUnique({ where: { id: 'samsung' } });
    if (samsungBrand && !samsungBrand.categories.includes('tablet')) {
        await prisma.brand.update({
            where: { id: 'samsung' },
            data: {
                categories: [...samsungBrand.categories, 'tablet']
            }
        });
    }

    const processedModels = new Set();
    const modelCache = new Map();

    console.log(`Processing rows...`);

    // Skip header line (i=1)
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const [brand, modelName, variant, priceStr, imgPathRaw] = line.split('\t');
        if (!modelName || !variant || !priceStr) continue;

        const price = parseInt(priceStr, 10) || 0;

        // Clean name
        let cleanName = modelName.replace(/^Samsung /i, '').trim();

        // Let's use the local file match if exists
        const imgPath = imgPathRaw || `/models/samsung-tablet/coming_soon.png`;
        const priority = calculatePriority(cleanName);

        let model;

        if (!processedModels.has(cleanName)) {
            const existingModel = await prisma.model.findFirst({
                where: {
                    brandId: 'samsung',
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
                        brandId: 'samsung',
                        name: cleanName,
                        img: imgPath,
                        category: 'tablet',
                        priority: priority
                    }
                });
                console.log(`Created Tablet Model: ${cleanName}`);
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
