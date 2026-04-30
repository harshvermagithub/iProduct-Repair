
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const TV_DATA = [
    {
        brandId: 'samsung',
        brandName: 'Samsung',
        models: [
            { name: 'Crystal 4K Vivid Pro', img: '/models/samsung/tv-crystal-4k.png' },
            { name: 'Neo QLED 8K QN900D', img: '/models/samsung/tv-neo-qled-8k.png' },
            { name: 'QLED 4K Q60D', img: '/models/samsung/tv-qled-q60d.png' },
            { name: 'The Frame LS03D', img: '/models/samsung/tv-the-frame.png' }
        ]
    },
    {
        brandId: 'sony',
        brandName: 'Sony',
        models: [
            { name: 'Bravia 2', img: '/models/sony/tv-bravia-2.png' },
            { name: 'Bravia 3', img: '/models/sony/tv-bravia-3.png' },
            { name: 'Bravia 7', img: '/models/sony/tv-bravia-7.png' },
            { name: 'Bravia 8', img: '/models/sony/tv-bravia-8.png' }
        ]
    },
    {
        brandId: 'lg',
        brandName: 'LG',
        models: [
            { name: 'UHD TV UT80', img: '/models/lg/tv-uhd-ut80.png' },
            { name: 'NanoCell NANO81', img: '/models/lg/tv-nanocell-81.png' },
            { name: 'QNED 82', img: '/models/lg/tv-qned-82.png' },
            { name: 'OLED evo C4', img: '/models/lg/tv-oled-c4.png' }
        ]
    },
    {
        brandId: 'oneplus',
        brandName: 'OnePlus',
        models: [
            { name: 'TV Q2 Pro', img: '/models/oneplus/oneplus_tv_q2_pro.png' },
            { name: 'TV U1S', img: '/models/oneplus/oneplus_tv_u1s.png' },
            { name: 'TV Y1S Pro', img: '/models/oneplus/oneplus_tv_y1s_pro.png' },
            { name: 'TV Y1S', img: '/models/oneplus/oneplus_tv_y1s.png' }
        ]
    },
    {
        brandId: 'xiaomi',
        brandName: 'Xiaomi',
        models: [
            { name: 'Smart TV X Series', img: '/models/xiaomi/xiaomi_smart_tv_x_series.png' },
            { name: 'Smart TV 5A', img: '/models/xiaomi/xiaomi_smart_tv_5a.png' },
            { name: 'OLED Vision TV', img: '/models/xiaomi/xiaomi_oled_vision_tv.png' },
            { name: 'Mi TV 4X', img: '/models/xiaomi/mi_tv_4x.png' }
        ]
    },
    {
        brandId: 'realme',
        brandName: 'Realme',
        models: [
            { name: 'Smart TV SLED 4K', img: '/models/realme/realme_smart_tv_sled_4k.png' },
            { name: 'Smart TV Neo', img: '/models/realme/realme_smart_tv_neo.png' },
            { name: 'Smart TV Full HD', img: '/models/realme/realme_smart_tv_full_hd.png' },
            { name: 'Smart TV 4K', img: '/models/realme/realme_smart_tv_4k.png' }
        ]
    },
    {
        brandId: 'motorola',
        brandName: 'Motorola',
        models: [
            { name: 'Revou-Q', img: '/models/motorola/motorola_revou_q.png' },
            { name: 'Revou 2', img: '/models/motorola/motorola_revou_2.png' },
            { name: 'Envision', img: '/models/motorola/motorola_envision.png' },
            { name: 'Revou 3', img: '/models/motorola/motorola_revou_3.png' }
        ]
    },
    {
        brandId: 'nokia',
        brandName: 'Nokia',
        models: [
            { name: 'Smart TV JBL Audio', img: '/models/nokia/nokia_smart_tv_jbl.png' },
            { name: 'Smart TV Ultra Bright', img: '/models/nokia/nokia_smart_tv_ultra_bright.png' },
            { name: 'Smart TV QLED', img: '/models/nokia/nokia_smart_tv_qled.png' },
            { name: 'Smart TV 4K', img: '/models/nokia/nokia_smart_tv_4k.png' }
        ]
    }
];

async function main() {
    console.log('--- Cleaning up existing TV models ---');
    
    // 1. Delete all models with category 'tv' or 'smarttv'
    const deletedModels = await prisma.model.deleteMany({
        where: {
            OR: [
                { category: 'tv' },
                { category: 'smarttv' }
            ]
        }
    });
    console.log(`Deleted ${deletedModels.count} old TV models.`);

    // 2. Setup images for placeholders (due to quota)
    console.log('--- Setting up image placeholders ---');
    const placeholders = [
        { src: 'public/models/oneplus/oneplus_tv_u1s.png', dst: 'public/models/motorola/motorola_revou_2.png' },
        { src: 'public/models/xiaomi/xiaomi_smart_tv_x_series.png', dst: 'public/models/motorola/motorola_envision.png' },
        { src: 'public/models/realme/realme_smart_tv_sled_4k.png', dst: 'public/models/motorola/motorola_revou_3.png' },
        { src: 'public/models/sony/tv-bravia-2.png', dst: 'public/models/nokia/nokia_smart_tv_jbl.png' },
        { src: 'public/models/lg/tv-qned-82.png', dst: 'public/models/nokia/nokia_smart_tv_ultra_bright.png' },
        { src: 'public/models/samsung/tv-qled-q60d.png', dst: 'public/models/nokia/nokia_smart_tv_qled.png' },
        { src: 'public/models/oneplus/oneplus_tv_y1s_pro.png', dst: 'public/models/nokia/nokia_smart_tv_4k.png' }
    ];

    for (const p of placeholders) {
        if (fs.existsSync(p.src)) {
            fs.copyFileSync(p.src, p.dst);
            console.log(`Copied ${p.src} to ${p.dst}`);
        }
    }

    // 3. Seed models and brands
    console.log('--- Seeding premium TV catalog ---');
    for (const group of TV_DATA) {
        console.log(`Processing ${group.brandName}...`);

        // Ensure brand has 'smarttv' category
        const brand = await prisma.brand.findUnique({ where: { id: group.brandId } });
        if (brand) {
            const cats = new Set(brand.categories);
            cats.delete('tv'); // Clean up old category
            cats.add('smarttv');
            await prisma.brand.update({
                where: { id: group.brandId },
                data: { categories: Array.from(cats) }
            });
        }

        for (const m of group.models) {
            const createdModel = await prisma.model.create({
                data: {
                    brandId: group.brandId,
                    name: m.name,
                    category: 'smarttv',
                    img: m.img,
                    priority: 50 // High priority for uniform display
                }
            });

            // Add variants
            const sizes = ['32 inch', '43 inch', '50 inch', '55 inch', '65 inch'];
            for (const size of sizes) {
                await prisma.variant.create({
                    data: {
                        modelId: createdModel.id,
                        name: size,
                        basePrice: 15000 + (sizes.indexOf(size) * 8000) + Math.floor(Math.random() * 5000)
                    }
                });
            }
            console.log(`  Added ${m.name} with 5 variants.`);
        }
    }

    console.log('--- Uniform Seeding Completed ---');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
