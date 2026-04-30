
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TV_MODELS = [
    {
        brandName: 'OnePlus',
        brandId: 'oneplus',
        models: [
            { name: 'TV Q2 Pro', img: '/models/oneplus/oneplus_tv_q2_pro.png' },
            { name: 'TV U1S', img: '/models/oneplus/oneplus_tv_u1s.png' },
            { name: 'TV Y1S Pro', img: '/models/oneplus/oneplus_tv_y1s_pro.png' },
            { name: 'TV Y1S', img: '/models/oneplus/oneplus_tv_y1s.png' }
        ]
    },
    {
        brandName: 'Xiaomi',
        brandId: 'xiaomi',
        models: [
            { name: 'Smart TV X Series', img: '/models/xiaomi/xiaomi_smart_tv_x_series.png' },
            { name: 'Smart TV 5A', img: '/models/xiaomi/xiaomi_smart_tv_5a.png' },
            { name: 'OLED Vision TV', img: '/models/xiaomi/xiaomi_oled_vision_tv.png' },
            { name: 'Mi TV 4X', img: '/models/xiaomi/mi_tv_4x.png' }
        ]
    },
    {
        brandName: 'Realme',
        brandId: 'realme',
        models: [
            { name: 'Smart TV SLED 4K', img: '/models/realme/realme_smart_tv_sled_4k.png' },
            { name: 'Smart TV Neo', img: '/models/realme/realme_smart_tv_neo.png' },
            { name: 'Smart TV Full HD', img: '/models/realme/realme_smart_tv_full_hd.png' },
            { name: 'Smart TV 4K', img: '/models/realme/realme_smart_tv_4k.png' }
        ]
    },
    {
        brandName: 'Motorola',
        brandId: 'motorola',
        models: [
            { name: 'Revou-Q', img: '/models/motorola/motorola_revou_q.png' },
            { name: 'Revou 2', img: '/models/motorola/motorola_revou_2.png' },
            { name: 'Envision', img: '/models/motorola/motorola_envision.png' }
        ]
    },
    {
        brandName: 'Nokia',
        brandId: 'nokia',
        models: [
            { name: 'Smart TV JBL Audio', img: '/models/nokia/nokia_smart_tv_jbl.png' },
            { name: 'Smart TV Ultra Bright', img: '/models/nokia/nokia_smart_tv_ultra_bright.png' }
        ]
    }
];

async function main() {
    console.log('Starting Smart TV seeding for other brands...');

    for (const group of TV_MODELS) {
        console.log(`Processing ${group.brandName}...`);
        
        // Ensure brand has the category
        const brand = await prisma.brand.findUnique({
            where: { id: group.brandId }
        });

        if (brand) {
            const categories = brand.categories || [];
            let updated = false;
            if (!categories.includes('smarttv')) {
                categories.push('smarttv');
                updated = true;
            }
            if (!categories.includes('tv')) {
                categories.push('tv');
                updated = true;
            }

            if (updated) {
                await prisma.brand.update({
                    where: { id: group.brandId },
                    data: { categories }
                });
                console.log(`  Updated categories for ${group.brandName}`);
            }
        } else {
            console.log(`  Warning: Brand ${group.brandName} (${group.brandId}) not found!`);
            continue;
        }

        for (const m of group.models) {
            const existing = await prisma.model.findFirst({
                where: {
                    brandId: group.brandId,
                    name: m.name,
                    category: 'smarttv'
                }
            });

            let modelId = '';
            if (existing) {
                await prisma.model.update({
                    where: { id: existing.id },
                    data: { img: m.img }
                });
                console.log(`  Updated model: ${m.name}`);
                modelId = existing.id;
            } else {
                const created = await prisma.model.create({
                    data: {
                        brandId: group.brandId,
                        name: m.name,
                        category: 'smarttv',
                        img: m.img,
                        priority: 100
                    }
                });
                console.log(`  Created model: ${m.name}`);
                modelId = created.id;
            }

            // Seed variants
            const variantSizes = ['32 inch', '43 inch', '50 inch', '55 inch', '65 inch'];
            for (const size of variantSizes) {
                const variantName = `${m.name} ${size}`;
                const basePrice = 20000 + Math.floor(Math.random() * 50000); // Random base price for seeding
                
                const existingVariant = await prisma.variant.findFirst({
                    where: { modelId, name: size }
                });

                if (!existingVariant) {
                    await prisma.variant.create({
                        data: {
                            modelId,
                            name: size,
                            basePrice
                        }
                    });
                }
            }
            console.log(`    Added 5 variants for ${m.name}`);
        }
    }

    console.log('Seeding completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
