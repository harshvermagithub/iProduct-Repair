
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Fetching iPhone 17 Series models...');
    const iphone17s = await prisma.model.findMany({
        where: {
            name: { contains: 'iPhone 17' }
        }
    });

    if (iphone17s.length === 0) {
        console.log('No iPhone 17 models found. Please create them first or check the name.');
        return;
    }

    // Define Variant Logic
    const storages = [
        { name: '128 GB', priceMod: 0 },
        { name: '256 GB', priceMod: 3000 },
        { name: '512 GB', priceMod: 7000 },
        { name: '1 TB', priceMod: 12000 },
    ];

    // Base Price Baseline (approximate buyback value for perfect condition)
    const basePrices: Record<string, number> = {
        'Pro Max': 85000,
        'Pro': 75000,
        'Plus': 55000,
        'Air': 60000,
        'Base': 50000
    };

    for (const model of iphone17s) {
        console.log(`Adding variants for ${model.name}...`);

        let type = 'Base';
        if (model.name.includes('Pro Max')) type = 'Pro Max';
        else if (model.name.includes('Pro')) type = 'Pro';
        else if (model.name.includes('Plus')) type = 'Plus';
        else if (model.name.includes('Air')) type = 'Air';

        const startPrice = basePrices[type] || 50000;

        // Create variants
        for (const storage of storages) {
            // Skip 128GB for Pro Max if we want to follow recent trends (256 min), 
            // but let's just add all to be safe or standard.

            const variantName = storage.name;
            const price = startPrice + storage.priceMod;

            // Check if exists
            const existing = await prisma.variant.findFirst({
                where: {
                    modelId: model.id,
                    name: variantName
                }
            });

            if (!existing) {
                await prisma.variant.create({
                    data: {
                        modelId: model.id,
                        name: variantName,
                        basePrice: price
                    }
                });
                console.log(`  + Created ${variantName} @ ₹${price}`);
            } else {
                // Update price if exists
                await prisma.variant.update({
                    where: { id: existing.id },
                    data: { basePrice: price }
                });
                console.log(`  * Updated ${variantName} @ ₹${price}`);
            }
        }
    }

    console.log('Done!');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
