const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const models = await prisma.model.findMany({
        where: { brandId: 'samsung', category: 'smartphone' },
        orderBy: { priority: 'asc' }
    });

    console.log(`Found ${models.length} Samsung models:`);
    models.forEach(m => {
        console.log(`- [${m.id}] ${m.name} (Priority: ${m.priority})`);
    });
}
main().finally(() => prisma.$disconnect());
