const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

function calculatePriority(name) {
    const n = name.toLowerCase();
    // Default high priority (lower number)
    let priority = 100;

    // Pro models usually highest priority
    if (n.includes('pro')) {
        priority -= 20;
        if (n.includes('m4') || n.includes('m5')) priority -= 10;
        else if (n.includes('m2') || n.includes('m1')) priority -= 5;
    }
    // Air models
    else if (n.includes('air')) {
        priority -= 15;
        if (n.includes('m2') || n.includes('m3')) priority -= 5;
    }
    // Mini models
    else if (n.includes('mini')) {
        priority -= 10;
        if (n.includes('6th gen')) priority -= 5;
    }
    // Standard iPad
    else {
        priority -= 5;
        if (n.includes('10th') || n.includes('11th')) priority -= 5;
    }

    // Newer Generations give slightly higher priority (lower number)
    const genMatch = n.match(/(\d+)th gen/);
    if (genMatch) {
        priority -= parseInt(genMatch[1]);
    }

    return priority;
}

async function main() {
    const tsvData = fs.readFileSync(path.join(__dirname, 'apple_tablet_data.tsv'), 'utf8');
    const lines = tsvData.split('\n');

    // Load image mappings from temp.json
    const tempJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'temp.json'), 'utf8'));
    const imageMap = new Map();
    if (tempJson && tempJson.selectModel) {
        tempJson.selectModel.forEach(m => {
            if (m.ThumbnailPath) {
                // Remove 'model/' prefix
                imageMap.set(m.Name, `/models/apple-tablet/${m.ThumbnailPath.replace('model/', '')}`);
            }
        });
    }

    // Ensure Brand is created/updated for Apple Tablets
    await prisma.brand.upsert({
        where: { id: 'apple' },
        update: {},
        create: {
            id: 'apple',
            name: 'Apple',
            logo: '/models/apple/logo.png',
            categories: ['smartphone', 'tablet'],
            priority: 100
        }
    });

    // Ensure 'tablet' category is inside brand
    const appleBrand = await prisma.brand.findUnique({ where: { id: 'apple' } });
    if (appleBrand && !appleBrand.categories.includes('tablet')) {
        await prisma.brand.update({
            where: { id: 'apple' },
            data: {
                categories: [...appleBrand.categories, 'tablet']
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

        const [brand, modelName, variant, priceStr] = line.split('\t');
        if (!modelName || !variant || !priceStr) continue;

        const price = parseInt(priceStr, 10) || 0;

        const imgPath = imageMap.get(modelName) || `/models/apple-tablet/Apple_${modelName.replace(/ /g, '_')}.png`;
        const priority = calculatePriority(modelName);

        let model;

        if (!processedModels.has(modelName)) {
            const existingModel = await prisma.model.findFirst({
                where: {
                    brandId: 'apple',
                    name: { equals: modelName, mode: 'insensitive' },
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
                console.log(`Updated Tablet Model: ${modelName} (Img: ${imgPath})`);
            } else {
                model = await prisma.model.create({
                    data: {
                        brandId: 'apple',
                        name: modelName,
                        img: imgPath,
                        category: 'tablet',
                        priority: priority
                    }
                });
                console.log(`Created Tablet Model: ${modelName} (Priority: ${priority})`);
            }

            // Clean variants
            await prisma.variant.deleteMany({
                where: { modelId: model.id }
            });

            processedModels.add(modelName);
            modelCache.set(modelName, model);
        } else {
            model = modelCache.get(modelName);
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

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => await prisma.$disconnect());
