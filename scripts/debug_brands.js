const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Debugging Brands...");

    const brands = await prisma.brand.findMany({
        where: {
            name: { in: ['Apple', 'Samsung', 'OnePlus', 'Vivo'] }
        },
        select: { id: true, name: true, priority: true, categories: true }
    });

    console.log("Current Data:");
    brands.forEach(b => {
        console.log(`${b.name}: Priority=${b.priority}, Categories=[${b.categories.join(', ')}]`);
    });

}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => await prisma.$disconnect());
