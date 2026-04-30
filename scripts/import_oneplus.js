const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Priority Calculation Logic
function calculatePriority(name) {
    const n = name.toLowerCase();

    // Foldables first
    if (n.includes('open') || n.includes('fold')) return 500;

    let isNord = n.includes('nord');
    let base = isNord ? 2000 : 1000;

    // Extract Generation Number
    // Handle "OnePlus 15", "Nord 5"
    let match = n.match(/(\d+)/);
    let gen = match ? parseInt(match[1]) : 0;

    // Variant Rank (Lower value = Higher Priority within same gen)
    let rank = 5;
    if (n.includes('pro')) rank = 0;
    else if (n.includes('ultra')) rank = 0;
    else if (n.includes('t') && !n.includes('lite') && !n.includes('ce') && !n.includes('nord')) rank = 2; // 10T
    else if (n.includes('r') && !n.includes('nord')) rank = 3; // 11R
    else if (!isNord && !n.includes('lite') && !n.includes('z')) rank = 1; // Base numeric (OnePlus 11)

    // Nord specific ranks
    if (isNord) {
        if (n.includes('ce')) rank = 6;
        else if (n.includes('n')) rank = 8; // N20
        else rank = 1; // Base Nord (Nord 4)
    }

    if (n.includes('lite')) rank += 1; // Lite pushes it down

    // Older generations get higher priority value (lower placement)
    // Max Gen assumption: 20
    // (20 - 15) * 100 = 500.
    // (20 - 13) * 100 = 700.
    // Result: 15 comes before 13.
    let genScore = (30 - gen) * 100;

    return base + genScore + rank;
}

async function main() {
    console.log('Starting OnePlus Import...');

    // Read TSV
    const tsvPath = path.join(__dirname, 'oneplus_data.tsv');
    const tsvContent = fs.readFileSync(tsvPath, 'utf-8');
    const rows = tsvContent.split('\n').slice(1).filter(r => r.trim()); // Skip header

    const validModelNames = new Set();

    // Ensure OnePlus Brand
    await prisma.brand.upsert({
        where: { id: 'oneplus' }, // Ensure ID is consistent (lowercase)
        update: { name: 'OnePlus', priority: 3, logo: '/brands/oneplus.svg' }, // Priority 3 per user
        create: {
            id: 'oneplus',
            name: 'OnePlus',
            logo: '/brands/oneplus.svg',
            categories: ['smartphone'],
            priority: 3
        }
    });

    // Efficient Variant Import: Group by Model
    const modelMap = {}; // name -> { variants: [], img: string }

    for (const row of rows) {
        const cols = row.split('\t');
        if (cols.length < 5) continue;
        const [brand, modelName, variantName, priceStr, imagePath] = cols;

        if (!imagePath || imagePath.trim() === '') continue;

        validModelNames.add(modelName);

        if (!modelMap[modelName]) {
            modelMap[modelName] = { variants: [], img: imagePath };
        }
        modelMap[modelName].variants.push({
            name: variantName,
            price: parseInt(priceStr) || 0
        });
    }

    // Process grouped models
    for (const [mName, data] of Object.entries(modelMap)) {
        // console.log(`Processing ${mName} (${data.variants.length} variants)...`);

        const priority = calculatePriority(mName);

        const existingModel = await prisma.model.findFirst({
            where: {
                brandId: 'oneplus',
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

            // Delete existing variants to replace with scraped ones
            await prisma.variant.deleteMany({ where: { modelId: modelId } });
        } else {
            const newM = await prisma.model.create({
                data: {
                    brandId: 'oneplus',
                    name: mName,
                    img: data.img,
                    category: 'smartphone',
                    priority: priority
                }
            });
            modelId = newM.id;
        }

        // Create variants
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

    // Remove Models NOT in our list (Cleanup)
    const allOnePlusModels = await prisma.model.findMany({
        where: { brandId: 'oneplus' }
    });

    for (const m of allOnePlusModels) {
        // Check if name is in validModelNames (case insensitive)
        const found = Array.from(validModelNames).some(v => v.toLowerCase() === m.name.toLowerCase());
        if (!found) {
            console.log(`Deleting orphan model: ${m.name}`);
            // Check for orders? catch error if constraint fails.
            try {
                await prisma.variant.deleteMany({ where: { modelId: m.id } });
                await prisma.model.delete({ where: { id: m.id } });
            } catch (e) {
                console.error(`Could not delete ${m.name}: ${e.message}`);
            }
        }
    }

    console.log('OnePlus import complete.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
