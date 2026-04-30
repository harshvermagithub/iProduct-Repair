const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const brand = await prisma.model.findMany({
        where: { brandId: "apple" }
    });
    console.log(JSON.stringify(Array.from(new Set(models.map(m => m.category))), null, 2));
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
