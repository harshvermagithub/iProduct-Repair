const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');
const fs = require('fs');

const prisma = new PrismaClient();

// Map for specific image overrides when standard naming fails
const imageOverrides = {
    'iphone 17 air': 'Apple_iPhone_Air.png'
};

function calculatePriority(name) {
    const n = name.toLowerCase();
    let gen = 0;

    // Extract Generation
    const match = n.match(/iphone\s+(\d+)/);
    if (match) {
        gen = parseInt(match[1]);
    } else {
        // Handle Roman Numerals / Special Cases roughly
        if (n.includes('iphone x')) gen = 10;
        else if (n.includes('iphone se')) return 9000; // Place SE at the end
    }

    if (gen === 0) return 9999; // Fallback for unknown

    // Determine Variant Rank (Lower is Higher Priority in Ascending Sort)
    // Order: Pro Max (1) > Pro (2) > Plus (3) > Base (4) > E (4.5) > Air (5) > Mini (6)
    let rank = 4; // Default to Base

    if (n.includes('pro max')) rank = 1;
    else if (n.includes('pro')) rank = 2;
    else if (n.includes('plus')) rank = 3;
    else if (n.includes('mini')) rank = 6;
    else if (n.includes('air')) rank = 5;
    else if (n.match(/\b\d+\s?e\b/)) rank = 4.5; // Matches "16 e" or "16e"

    // Formula: Older generations get higher numbers (lower priority)
    // (30 - 17) * 10 = 130.
    // (30 - 16) * 10 = 140.
    // Result: 130 < 140. Correct.
    return (30 - gen) * 10 + rank;
}

async function main() {
    const workbook = XLSX.readFile('imgs/Smartphone Buyback Prices.xlsx');
    const sheet = workbook.Sheets['Apple iPhones'];
    if (!sheet) {
        console.error("Sheet 'Apple iPhones' not found");
        return;
    }
    const data = XLSX.utils.sheet_to_json(sheet);

    // Build Image Map
    const imageDir = 'public/models/apple';
    let fileMap = new Map();
    try {
        if (fs.existsSync(imageDir)) {
            const files = fs.readdirSync(imageDir);
            files.forEach(file => {
                fileMap.set(file.toLowerCase(), file);
            });
            console.log(`Found ${files.length} images in ${imageDir}`);
        }
    } catch (err) { console.error(err); }

    // Ensure Brand
    await prisma.brand.upsert({
        where: { id: 'apple' },
        update: {},
        create: {
            id: 'apple',
            name: 'Apple',
            logo: '/models/apple/logo.png',
            categories: ['smartphone'],
            priority: 100
        }
    });

    console.log(`Processing ${data.length} rows...`);

    const processedModels = new Set();
    const modelCache = new Map();

    for (const row of data) {
        const modelName = row['Model'];
        const storage = row['Storage Variant'];
        const priceStr = row['New Price (+5%) (₹)'];

        if (!modelName || !storage || !priceStr) continue;

        const priceClean = String(priceStr).replace(/[^0-9]/g, '');
        const price = parseInt(priceClean, 10) || 0;

        // Image Logic with Override
        let imgFilename = imageOverrides[modelName.toLowerCase()];

        if (!imgFilename) {
            const normalizedModel = modelName.toLowerCase().replace(/ /g, '_');
            const searchName = `apple_${normalizedModel}.png`;
            imgFilename = fileMap.get(searchName) || `Apple_${modelName.replace(/ /g, '_')}.png`;
        }

        const imgPath = `/models/apple/${imgFilename}`;
        const priority = calculatePriority(modelName);

        let model;

        if (!processedModels.has(modelName)) {
            const existingModel = await prisma.model.findFirst({
                where: {
                    brandId: 'apple',
                    name: { equals: modelName, mode: 'insensitive' }
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
                console.log(`Updated Model: ${modelName} (Priority: ${priority}, Img: ${imgFilename})`);
            } else {
                model = await prisma.model.create({
                    data: {
                        brandId: 'apple',
                        name: modelName,
                        img: imgPath,
                        category: 'smartphone',
                        priority: priority
                    }
                });
                console.log(`Created Model: ${modelName} (Priority: ${priority})`);
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
                name: storage,
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
