
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const NEW_MODELS = [
    // Samsung
    { brand: 'Samsung', names: ['Galaxy S25 Ultra', 'Galaxy S25 Plus', 'Galaxy S25', 'Galaxy S24 FE', 'Galaxy Z Fold6', 'Galaxy Z Flip6'] },

    // OnePlus
    { brand: 'OnePlus', names: ['OnePlus 12', 'OnePlus 12R', 'OnePlus 13', 'OnePlus 13R', 'OnePlus 14', 'OnePlus 15', 'OnePlus Open'] },

    // Vivo
    { brand: 'Vivo', names: ['X100', 'X100 Pro', 'X200', 'X200 Pro', 'X200 Ultra', 'V30', 'V30 Pro', 'V40'] },

    // Google
    { brand: 'Google', names: ['Pixel 8', 'Pixel 8 Pro', 'Pixel 8a', 'Pixel 9', 'Pixel 9 Pro'] },

    // Xiaomi
    { brand: 'Xiaomi', names: ['Xiaomi 14', 'Xiaomi 14 Ultra', 'Xiaomi 15', 'Xiaomi 16'] },

    // Motorola (User said "No phone in Motorola", so add basics + latest)
    { brand: 'Motorola', names: ['Edge 50 Pro', 'Edge 50 Fusion', 'Edge 40', 'Edge 40 Neo', 'Razr 50 Ultra', 'Razr 40 Ultra', 'G84 5G', 'G54 5G'] },

    // Realme (User said "Nothing is there")
    { brand: 'Realme', names: ['GT 6', 'GT 6T', '12 Pro+', '12 Pro', '12x 5G', 'Narzo 70 Pro'] },

    // iQOO
    { brand: 'iQOO', names: ['iQOO 12', 'iQOO 13', 'iQOO Neo 9 Pro', 'iQOO Z9'] },

    // Poco
    { brand: 'Poco', names: ['Poco F6', 'Poco X6 Pro', 'Poco X6', 'Poco M6 Pro'] },

    // Oppo (User said "Nothing is there")
    { brand: 'Oppo', names: ['Find X7 Ultra', 'Reno 12 Pro', 'Reno 12', 'Reno 11 Pro'] }
];

async function main() {
    console.log('Fetching brands...');
    const brands = await prisma.brand.findMany();

    for (const group of NEW_MODELS) {
        // Fuzzy match brand name
        const brand = brands.find(b => b.name.toLowerCase().includes(group.brand.toLowerCase()));
        if (!brand) {
            console.log(`Warning: Brand ${group.brand} not found in DB. Skipping models.`);
            continue;
        }

        console.log(`Seeding models for ${brand.name}...`);

        for (const modelName of group.names) {
            // Check existence
            const existing = await prisma.model.findFirst({
                where: {
                    brandId: brand.id,
                    name: { equals: modelName, mode: 'insensitive' }
                }
            });

            if (!existing) {
                // Determine category (mostly smartphone)
                const category = 'smartphone';

                // Add with empty image for now (will fix in next step)
                await prisma.model.create({
                    data: {
                        brandId: brand.id,
                        name: modelName,
                        category: category,
                        img: '', // Intentional empty to trigger the "Missing Image" fixer later
                        priority: 100 // Default priority, will reorder later potentially
                    }
                });
                console.log(`  + Added ${modelName}`);
            } else {
                console.log(`  * ${modelName} already exists`);
            }
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
