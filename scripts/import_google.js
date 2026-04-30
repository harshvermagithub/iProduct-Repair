const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

function calculatePriority(name) {
    const n = name.toLowerCase();

    let gen = 0;
    // Match "Pixel 10", "Pixel 9", "Pixel 4A" -> 10, 9, 4
    let match = n.match(/pixel (\d+)/);
    if (match) gen = parseInt(match[1]);
    else if (n.includes('fold')) gen = 7; // Original Pixel Fold ~ Gen 7 era

    // Rank within Gen
    // Fold > XL > Pro > Base > A
    let rank = 3;
    if (n.includes('fold')) rank = 0;
    else if (n.includes('xl')) rank = 1;
    else if (n.includes('pro')) rank = 2;
    else if (n.includes('a') && !n.includes('fold')) rank = 5; // A series lowest

    // Newer Gen = Lower Score (First)
    let genScore = (30 - gen) * 100;

    return 3000 + genScore + rank;
    // Offset 3000 to place Google after OnePlus (2500...)?
    // OnePlus Priority ~ 2500.
    // User wants Brands ordered: Apple, Samsung, OnePlus, Google.
    // If Model list is mixed, Google should be after OnePlus.
    // OnePlus 15 (2501).
    // Google Pixel 10 (2003 + offset).
    // If offset is 0, Pixel 10 (2003) < OnePlus 15 (2501).
    // Google appears BEFORE OnePlus.
    // If user wants Google AFTER OnePlus, I should add offset.
    // OnePlus range: ~2500 (Gen 15) to ~5000 (Nord).
    // Google range: ~2000 (Gen 10) to ~2600 (Gen 4).
    // To put Google AFTER OnePlus, I should add 2000? 
    // New Google Range: 4000+.
    // But `OnePlus Nord` is 5000.
    // Maybe just align Generations?
    // Apple 1. Samsung 2. OnePlus 3. Google 4.
    // If filtering by Brand, model priority doesn't matter across brands.
    // If showing "All Brands", we usually group by Brand Priority.
    // But typically Model Priority is used for sorting within the brand page.
    // So I don't need to offset heavily.
    // I will use 3000 base to distinguish slightly.
    // (OnePlus base 1000/2000).
    // Pixel base 3000.
    // But honestly, the user explicitly asked for "Google Pixel" now.
    // I'll stick to logic: (30 - gen)*100.
}

async function main() {
    console.log('Starting Google Import...');

    const tsvPath = path.join(__dirname, 'google_data.tsv');
    const tsvContent = fs.readFileSync(tsvPath, 'utf-8');
    const rows = tsvContent.split('\n').slice(1).filter(r => r.trim());

    const validModelNames = new Set();

    // Ensure Google Brand (Do NOT change logo)
    // Priority 4 (from user list)
    await prisma.brand.upsert({
        where: { id: 'google' },
        update: {
            name: 'Google',
            priority: 4
            // logo: NO CHANGE
        },
        create: {
            id: 'google',
            name: 'Google',
            priority: 4,
            logo: '/brands/google.svg', // Default if created new
            categories: ['smartphone']
        }
    });

    // Group variants
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
                brandId: 'google',
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
            // Clear old variants
            await prisma.variant.deleteMany({ where: { modelId: modelId } });
        } else {
            const newM = await prisma.model.create({
                data: {
                    brandId: 'google',
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
    const allGoogleModels = await prisma.model.findMany({
        where: { brandId: 'google' }
    });

    for (const m of allGoogleModels) {
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

    console.log('Google import complete.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
