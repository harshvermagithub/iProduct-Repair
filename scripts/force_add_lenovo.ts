
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Force re-adding Lenovo to Tablet category...');

    // 1. Force update Brand to have 'tablet' category
    const brand = await prisma.brand.findUnique({ where: { id: 'lenovo' } });
    if (!brand) {
        // Create if missing?
        console.log('Lenovo brand missing, creating...');
        await prisma.brand.create({
            data: {
                id: 'lenovo',
                name: 'Lenovo',
                logo: 'https://cdn.simpleicons.org/lenovo',
                categories: ['tablet', 'laptop'], // Assume laptop too
                priority: 50
            }
        });
    } else {
        if (!brand.categories.includes('tablet')) {
            const newCats = [...brand.categories, 'tablet'];
            await prisma.brand.update({
                where: { id: 'lenovo' },
                data: { categories: newCats }
            });
            console.log('Updated Lenovo categories:', newCats);
        }
    }

    // 2. Add Tab M10 model explicitly
    const modelId = 'lenovo-tab-m10';
    await prisma.model.upsert({
        where: { id: modelId },
        update: { category: 'tablet' },
        create: {
            id: modelId,
            brandId: 'lenovo',
            name: 'Tab M10',
            category: 'tablet',
            img: '',
            priority: 50
        }
    });

    // 3. Add variants for Tab M10
    await prisma.variant.createMany({
        data: [
            { modelId, name: 'WiFi - 32GB', basePrice: 7000 },
            { modelId, name: 'LTE - 32GB', basePrice: 8500 },
            { modelId, name: 'WiFi - 64GB', basePrice: 9000 },
            { modelId, name: 'LTE - 64GB', basePrice: 10500 }
        ],
        skipDuplicates: true
    });

    console.log('Lenovo Tab M10 forced.');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
