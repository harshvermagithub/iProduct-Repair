const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const brandOrder = [
    'Apple', 'Samsung', 'OnePlus', 'Google', 'Oppo', 'Vivo',
    'Xiaomi', 'Motorola', 'Realme', 'Poco', 'iQOO', 'Nothing'
];

async function main() {
    console.log('Updating Brand Priorities...');

    // Set all to low priority first (e.g. 100)
    // Actually, just update the ones in the list.

    for (let i = 0; i < brandOrder.length; i++) {
        const brandName = brandOrder[i];
        // Priority: 1 is highest.
        const priority = i + 1;

        // Find brand by name (insensitive)
        const brand = await prisma.brand.findFirst({
            where: { name: { equals: brandName, mode: 'insensitive' } }
        });

        if (brand) {
            await prisma.brand.update({
                where: { id: brand.id },
                data: { priority: priority }
            });
            console.log(`Updated ${brand.name} to priority ${priority}`);
        } else {
            console.log(`Brand ${brandName} not found in DB.`);
            // Create it? Maybe not.
        }
    }

    console.log('Brand priorities updated.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
