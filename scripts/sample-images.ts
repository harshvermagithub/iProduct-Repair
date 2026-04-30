
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const models = await prisma.model.findMany({ take: 50 });
    console.log('Sample Images:');
    models.forEach(m => console.log(`[${m.brandId}] ${m.name}: ${m.img}`));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
