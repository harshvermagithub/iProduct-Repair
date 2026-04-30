import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const brand = await prisma.brand.findFirst({
        where: { name: 'Apple', categories: { has: 'laptop' } }
    });
    if (!brand) return console.log('no apple laptop brand');

    const models = await prisma.model.findMany({
        where: { brandId: brand.id, category: 'laptop' },
        include: { variants: true }
    });

    console.log(JSON.stringify(models.slice(0, 5), null, 2));
}

main().finally(() => prisma.$disconnect());
