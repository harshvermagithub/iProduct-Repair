
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Ensuring Nokia models exist (based on screenshot)...');

    const brandId = 'nokia';
    const models = ['Nokia G42 5G', 'Nokia C32', 'Nokia C12', 'Nokia X30 5G'];

    // Ensure brand exists (it was in "unwanted" before, so might be gone or category-less)
    let brand = await prisma.brand.findUnique({ where: { id: brandId } });
    if (!brand) {
        console.log('Creating Nokia brand...');
        brand = await prisma.brand.create({
            data: {
                id: brandId,
                name: 'Nokia',
                logo: 'https://cdn.simpleicons.org/nokia',
                categories: ['smartphone'],
                priority: 60
            }
        });
    } else {
        if (!brand.categories.includes('smartphone')) {
            await prisma.brand.update({
                where: { id: brandId },
                data: { categories: { push: 'smartphone' } }
            });
        }
    }

    for (const name of models) {
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const mkId = `${brandId}-${slug}`;

        await prisma.model.upsert({
            where: { id: mkId },
            update: { category: 'smartphone' }, // ensure visible
            create: {
                id: mkId,
                brandId: brandId,
                name: name,
                category: 'smartphone',
                img: '',
                priority: 50
            }
        });

        // Variants
        await prisma.variant.createMany({
            data: [
                { modelId: mkId, name: '4 GB / 64 GB', basePrice: 5000 },
                { modelId: mkId, name: '6 GB / 128 GB', basePrice: 7000 }
            ],
            skipDuplicates: true
        });
        console.log(`Ensured ${name}`);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
