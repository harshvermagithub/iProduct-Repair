const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const brandId = 'apple';
    const category = 'watch';

    const appleWatches = [
        { name: 'Apple Watch Ultra 2 (S9 Chip)', img: 'https://s3n.cashify.in/cashify/product/img/xhdpi/dfd16378-d59d.jpg' },
        { name: 'Apple Watch Ultra (S8 Chip)', img: 'https://s3n.cashify.in/cashify/product/img/xhdpi/dfd16378-d59d.jpg' },
        { name: 'Apple Watch Series 10 (S10 Chip)', img: 'https://s3n.cashify.in/cashify/product/img/xhdpi/dc9091c5-45f5.jpg' },
        { name: 'Apple Watch Series 9 (S9 Chip)', img: 'https://s3n.cashify.in/cashify/product/img/xhdpi/dc9091c5-45f5.jpg' },
        { name: 'Apple Watch Series 8 (S8 Chip)', img: 'https://s3n.cashify.in/cashify/product/img/xhdpi/dc9091c5-45f5.jpg' },
        { name: 'Apple Watch Series 7 (S7 Chip)', img: 'https://s3n.cashify.in/cashify/product/img/xhdpi/dc9091c5-45f5.jpg' },
        { name: 'Apple Watch Series 6 (S6 Chip)', img: 'https://s3n.cashify.in/cashify/product/img/xhdpi/dc9091c5-45f5.jpg' },
        { name: 'Apple Watch SE 2nd Gen (S8 Chip)', img: 'https://s3n.cashify.in/cashify/product/img/xhdpi/dc9091c5-45f5.jpg' },
        { name: 'Apple Watch Series 5 (S5 Chip)', img: 'https://s3n.cashify.in/cashify/product/img/xhdpi/dc9091c5-45f5.jpg' },
        { name: 'Apple Watch Series 4 (S4 Chip)', img: 'https://s3n.cashify.in/cashify/product/img/xhdpi/dc9091c5-45f5.jpg' },
        { name: 'Apple Watch SE 1st Gen (S5 Chip)', img: 'https://s3n.cashify.in/cashify/product/img/xhdpi/dc9091c5-45f5.jpg' },
        { name: 'Apple Watch Series 3 (S3 Chip)', img: 'https://s3n.cashify.in/cashify/product/img/xhdpi/dc9091c5-45f5.jpg' },
        { name: 'Apple Watch Series 2 (S2 Chip)', img: 'https://s3n.cashify.in/cashify/product/img/xhdpi/dc9091c5-45f5.jpg' },
        { name: 'Apple Watch Series 1 (S1P Chip)', img: 'https://s3n.cashify.in/cashify/product/img/xhdpi/dc9091c5-45f5.jpg' }
    ];

    console.log('Seeding Apple Watch models...');

    for (const watch of appleWatches) {
        // Upsert based on name
        await prisma.model.upsert({
            where: {
                // Since name is not unique in Model, we'll find first or create
                // But for a seed script, it's safer to check first
                id: `apple-watch-${watch.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
            },
            update: {
                name: watch.name,
                img: watch.img,
                category: category,
                brandId: brandId
            },
            create: {
                id: `apple-watch-${watch.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
                name: watch.name,
                img: watch.img,
                category: category,
                brandId: brandId,
                priority: 10
            }
        });

        // Add variants for each (Standard variants: GPS and GPS + Cellular)
        const modelId = `apple-watch-${watch.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
        const basePrices = {
            'Series 10': 18000,
            'Series 9': 15000,
            'Series 8': 12000,
            'Series 7': 10000,
            'Series 6': 8500,
            'Series 5': 7000,
            'Series 4': 5500,
            'SE 2nd Gen': 9000,
            'SE 1st Gen': 6000,
            'Ultra 2': 35000,
            'Ultra': 28000,
            'Series 3': 3000,
            'Series 2': 2000,
            'Series 1': 1500
        };

        const key = Object.keys(basePrices).find(k => watch.name.includes(k)) || 'Series 1';
        const price = basePrices[key];

        const variants = [
            { name: 'GPS Only', price: price },
            { name: 'GPS + Cellular', price: price + 2000 }
        ];

        for (const variant of variants) {
            await prisma.variant.upsert({
                where: {
                    id: `${modelId}-${variant.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
                },
                update: {
                    basePrice: variant.price
                },
                create: {
                    id: `${modelId}-${variant.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
                    modelId: modelId,
                    name: variant.name,
                    basePrice: variant.price
                }
            });
        }
    }

    console.log('Seeding completed!');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
