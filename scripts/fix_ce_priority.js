const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    const models = await prisma.model.findMany({
        where: { brandId: 'oneplus', category: 'smartphone' }
    });

    for (const m of models) {
        if (m.name.toLowerCase() === 'oneplus nord ce 5g') {
            const newPri = 875; // CE 1 should be 2021
            await prisma.model.update({ where: { id: m.id }, data: { priority: newPri } });
            console.log(`Updated OnePlus Nord CE 5G to priority ${newPri}`);
        }
    }
}
run().finally(() => prisma.$disconnect());
