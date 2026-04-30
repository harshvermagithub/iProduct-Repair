const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedEarbuds() {
    console.log("Seeding default earbuds...");

    // Make sure Apple and Samsung support earbuds
    for (const brand of ['apple', 'samsung', 'oneplus']) {
        const b = await prisma.brand.findUnique({ where: { id: brand } });
        if (b && !b.categories.includes('earbuds')) {
            await prisma.brand.update({
                where: { id: brand },
                data: { categories: [...b.categories, 'earbuds'] }
            });
        } else if (!b) {
            await prisma.brand.create({
                data: {
                    id: brand,
                    name: brand.charAt(0).toUpperCase() + brand.slice(1),
                    logo: `/models/${brand}/logo.png`,
                    categories: ['earbuds']
                }
            });
        }
    }

    const earbuds = [
        { brandId: 'apple', name: 'AirPods Pro (2nd Gen)', priority: 10, img: '/models/apple-earbuds/airpods_pro_2.png', price: 8000 },
        { brandId: 'apple', name: 'AirPods Pro (1st Gen)', priority: 20, img: '/models/apple-earbuds/airpods_pro_1.png', price: 4000 },
        { brandId: 'apple', name: 'AirPods (3rd Gen)', priority: 30, img: '/models/apple-earbuds/airpods_3.png', price: 5000 },
        { brandId: 'apple', name: 'AirPods (2nd Gen)', priority: 40, img: '/models/apple-earbuds/airpods_2.png', price: 3000 },
        { brandId: 'samsung', name: 'Galaxy Buds2 Pro', priority: 10, img: '/models/samsung-earbuds/buds2_pro.png', price: 6000 },
        { brandId: 'samsung', name: 'Galaxy Buds2', priority: 20, img: '/models/samsung-earbuds/buds2.png', price: 3500 },
        { brandId: 'samsung', name: 'Galaxy Buds Pro', priority: 30, img: '/models/samsung-earbuds/buds_pro.png', price: 3000 },
        { brandId: 'oneplus', name: 'OnePlus Buds Pro 2', priority: 10, img: '/models/oneplus-earbuds/buds_pro_2.png', price: 4500 },
        { brandId: 'oneplus', name: 'OnePlus Buds Z2', priority: 20, img: '/models/oneplus-earbuds/buds_z2.png', price: 2000 }
    ];

    for (const item of earbuds) {
        const modelRecord = await prisma.model.upsert({
            where: { id: `earbud_${item.brandId}_${item.name.replace(/[^a-z0-9]/gi, '')}` },
            update: { priority: item.priority },
            create: {
                id: `earbud_${item.brandId}_${item.name.replace(/[^a-z0-9]/gi, '')}`,
                brandId: item.brandId,
                name: item.name,
                category: 'earbuds',
                img: item.img,
                priority: item.priority
            }
        });

        // Upsert 1 variant
        await prisma.variant.deleteMany({ where: { modelId: modelRecord.id } });
        await prisma.variant.create({
            data: {
                modelId: modelRecord.id,
                name: 'Base',
                basePrice: item.price
            }
        });
        console.log(`Added ${item.name}`);
    }

    console.log("Done seeding earbuds!");
}

seedEarbuds().finally(() => prisma.$disconnect());
