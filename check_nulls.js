const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const brand = await prisma.model.findMany({
        where: { name: null }
    });
    console.log(JSON.stringify(brand, null, 2));
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
