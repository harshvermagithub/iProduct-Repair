const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
    const m1 = await prisma.model.findFirst({ where: { name: 'Galaxy S23 Ultra' } });
    console.log("Ultra:", m1.img);
    const m2 = await prisma.model.findFirst({ where: { name: 'Galaxy S23 Plus' } });
    console.log("Plus:", m2.img);
    const m3 = await prisma.model.findFirst({ where: { name: 'Galaxy S23' } });
    console.log("Base:", m3.img);
}
run().finally(() => prisma.$disconnect());
