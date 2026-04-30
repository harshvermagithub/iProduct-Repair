const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    const models = await prisma.model.findMany({
        where: { brandId: 'oneplus', category: 'smartphone' },
        orderBy: { priority: 'asc' }
    });

    console.log(`Remaining OnePlus models:`);
    models.forEach(m => console.log(`- ${m.name} | Priority: ${m.priority}`));
}

run().finally(() => prisma.$disconnect());
