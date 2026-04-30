
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const MISSING_MODELS = [
    // Lenovo (Tablets)
    { brand: 'Lenovo', category: 'tablet', names: ['Tab M10 Plus (3rd Gen)', 'Tab M10 (3rd Gen)', 'Tab P11 Pro (2nd Gen)', 'Tab P12', 'Legion Tab', 'Tab M9', 'Tab M8 (4th Gen)'] },

    // OnePlus (Smartphones)
    { brand: 'OnePlus', category: 'smartphone', names: ['OnePlus 12', 'OnePlus 12R', 'OnePlus 11', 'OnePlus 11R', 'OnePlus 10 Pro', 'OnePlus 10T', 'OnePlus 10R', 'OnePlus Nord 4', 'OnePlus Nord CE 4', 'OnePlus Nord CE 4 Lite', 'OnePlus Open'] },

    // OnePlus (Tablets)
    { brand: 'OnePlus', category: 'tablet', names: ['OnePlus Pad', 'OnePlus Pad Go'] },

    // Microsoft (Consoles & Tablets)
    { brand: 'Microsoft', category: 'console', names: ['Xbox Series X', 'Xbox Series S', 'Xbox One X', 'Xbox One S'] },
    { brand: 'Microsoft', category: 'tablet', names: ['Surface Pro 9', 'Surface Pro 8', 'Surface Go 3'] },

    // Sony (Consoles)
    { brand: 'Sony', category: 'console', names: ['PlayStation 5', 'PlayStation 5 Digital', 'PlayStation 5 Slim', 'PlayStation 4 Pro', 'PlayStation 4 Slim'] },

    // Asus (Consoles) - ROG Ally
    { brand: 'Asus', category: 'console', names: ['ROG Ally', 'ROG Ally X'] },

    // Nintendo (Consoles)
    { brand: 'Nintendo', category: 'console', names: ['Switch OLED', 'Switch', 'Switch Lite'] },

    // Valve (Consoles)
    { brand: 'Valve', category: 'console', names: ['Steam Deck LCD', 'Steam Deck OLED'] },

    // Honor (Tablets)
    { brand: 'Honor', category: 'tablet', names: ['Honor Pad 9', 'Honor Pad X9', 'Honor Pad 8'] },

    // Huawei (Tablets)
    { brand: 'Huawei', category: 'tablet', names: ['MatePad 11.5', 'MatePad Pro 13.2'] },

    // Motorola (Smartphones)
    { brand: 'Motorola', category: 'smartphone', names: ['Edge 50 Ultra', 'Edge 50 Pro', 'Edge 50 Fusion', 'Razr 50 Ultra', 'Razr 50', 'Edge 40', 'Edge 40 Neo', 'G85 5G', 'G64 5G', 'G34 5G', 'G24 Power'] },

    // Realme 
    { brand: 'Realme', category: 'smartphone', names: ['GT 6', 'GT 6T', '12 Pro+ 5G', '12 Pro 5G', '12x 5G', '12 5G', 'Narzo 70 Pro 5G', 'P1 5G', 'P1 Pro 5G'] },

    // Vivo 
    { brand: 'Vivo', category: 'smartphone', names: ['X100', 'X100 Pro', 'V30 Pro', 'V30', 'V30e', 'T3 5G', 'T3x 5G', 'Y200', 'Y200e'] },

    // Oppo 
    { brand: 'Oppo', category: 'smartphone', names: ['Find X7 Ultra', 'Reno 11 Pro', 'Reno 11', 'F25 Pro', 'F23 5G', 'A79 5G', 'A59 5G'] },

    // Google 
    { brand: 'Google', category: 'smartphone', names: ['Pixel 8 Pro', 'Pixel 8', 'Pixel 8a', 'Pixel 7 Pro', 'Pixel 7', 'Pixel 7a', 'Pixel 6a'] }
];

async function main() {
    console.log('Seeding missing models (Robust Mode)...');

    // Fetch brands map for ease
    const allBrands = await prisma.brand.findMany();

    for (const group of MISSING_MODELS) {
        const searchName = group.brand.toLowerCase();
        const brand = allBrands.find(b => b.id === searchName || b.name.toLowerCase() === searchName);

        if (!brand) {
            console.log(`Skipping ${group.brand} (Brand not found in DB)`);
            continue;
        }

        // Add category to brand if missing
        if (!brand.categories.includes(group.category)) {
            console.log(`  ! Adding category '${group.category}' to ${brand.name}...`);
            // Update local object to avoid re-fetching
            brand.categories.push(group.category);
            await prisma.brand.update({
                where: { id: brand.id },
                data: { categories: brand.categories }
            });
        }

        for (const modelName of group.names) {
            const slug = modelName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
            const modelId = `${brand.id}-${slug}`;

            try {
                // Upsert model: Create if new, Update nothing if exists? 
                // Actually user said "update the models that are not present".
                // So if it exists, leave it.
                // We use upsert to ensure existence without failure.

                const model = await prisma.model.upsert({
                    where: { id: modelId },
                    update: {}, // No-op update
                    create: {
                        id: modelId,
                        brandId: brand.id,
                        name: modelName,
                        category: group.category,
                        img: '',
                        priority: 50
                    }
                });

                // If it was created (created specific check logic is hard with upsert, but we can assume success)
                // Just ensure variants exist.
                await createVariants(modelId, group.category);
                console.log(`  + Ensured: ${modelName} (${modelId})`);

            } catch (e) {
                console.error(`  X Failed to seed ${modelName}:`, e);
            }
        }
    }
    console.log('Done.');
}

async function createVariants(modelId, category) {
    try {
        const variantsData = [];
        if (category === 'smartphone') {
            variantsData.push(
                { modelId, name: '6 GB / 128 GB', basePrice: 10000 },
                { modelId, name: '8 GB / 128 GB', basePrice: 12000 },
                { modelId, name: '8 GB / 256 GB', basePrice: 15000 }
            );
        } else if (category === 'tablet') {
            variantsData.push(
                { modelId, name: 'WiFi - 64 GB', basePrice: 8000 },
                { modelId, name: 'WiFi - 128 GB', basePrice: 12000 }
            );
        } else if (category === 'console') {
            variantsData.push(
                { modelId, name: 'Standard', basePrice: 15000 }
            );
        }

        if (variantsData.length > 0) {
            await prisma.variant.createMany({
                data: variantsData,
                skipDuplicates: true
            });
        }
    } catch (e) {
        console.error(`    Error creating variants for ${modelId}:`, e);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
