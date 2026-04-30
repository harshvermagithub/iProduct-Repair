const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Starting Cleanup of Non-Phone items...');

    const keywords = ['Tab', 'Pad', 'Watch', 'Book', 'Laptop', 'TV', 'Band', 'Buds', 'Stick', 'Air'];
    const brands = ['google', 'oppo', 'vivo', 'xiaomi', 'motorola', 'realme'];

    for (const brand of brands) {
        console.log(`Checking ${brand}...`);
        const models = await prisma.model.findMany({
            where: {
                brandId: brand,
                OR: keywords.map(k => ({ name: { contains: k, mode: 'insensitive' } }))
            }
        });

        for (const m of models) {
            console.log(`Deleting ${brand} non-phone: ${m.name}`);
            await prisma.variant.deleteMany({ where: { modelId: m.id } });
            await prisma.model.delete({ where: { id: m.id } });
        }
    }

    // Also check for specific Xiaomi items mentioned
    const xiaomiExtras = ['TV', 'NoteBook', 'Stick'];
    const xiaomiModels = await prisma.model.findMany({
        where: {
            brandId: 'xiaomi',
            OR: xiaomiExtras.map(k => ({ name: { contains: k, mode: 'insensitive' } }))
        }
    });
    for (const m of xiaomiModels) {
        console.log(`Deleting Xiaomi extra: ${m.name}`);
        await prisma.variant.deleteMany({ where: { modelId: m.id } });
        await prisma.model.delete({ where: { id: m.id } });
    }

    console.log('Cleanup complete.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
