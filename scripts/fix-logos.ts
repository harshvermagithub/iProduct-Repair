import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Using SimpleIcons CDN for reliable, consistent SVG logos
// These are whitelisted in next.config.ts
const LOGOS: Record<string, string> = {
    'apple': 'https://cdn.simpleicons.org/apple',
    'samsung': 'https://cdn.simpleicons.org/samsung',
    'google': 'https://cdn.simpleicons.org/google',
    'oneplus': 'https://cdn.simpleicons.org/oneplus',
    'xiaomi': 'https://cdn.simpleicons.org/xiaomi',
    'oppo': 'https://cdn.simpleicons.org/oppo',
    'vivo': 'https://cdn.simpleicons.org/vivo',
    'realme': 'https://upload.wikimedia.org/wikipedia/commons/1/15/Realme_logo.svg',
    'motorola': 'https://cdn.simpleicons.org/motorola',
    'nothing': 'https://upload.wikimedia.org/wikipedia/commons/e/e9/Nothing_%28computer_company%29_logo.svg',
    'asus': 'https://cdn.simpleicons.org/asus',
    'sony': 'https://cdn.simpleicons.org/sony',
    'lg': 'https://cdn.simpleicons.org/lg',
    'nokia': 'https://cdn.simpleicons.org/nokia',
    'huawei': 'https://cdn.simpleicons.org/huawei',
    'honor': 'https://cdn.simpleicons.org/honor',
    'lenovo': 'https://cdn.simpleicons.org/lenovo',
    'htc': 'https://cdn.simpleicons.org/htc',
    'zte': 'https://cdn.simpleicons.org/zte',
    'blackberry': 'https://cdn.simpleicons.org/blackberry',
};

async function main() {
    console.log('Fetching brands...');
    const brands = await prisma.brand.findMany();
    console.log(`Found ${brands.length} brands.`);

    for (const brand of brands) {
        // Normalize name: key should be lowercase.
        // Some might be "Samsung Galaxy" etc? Usually just "Samsung".
        const key = brand.name.toLowerCase().trim();

        let newLogo = LOGOS[key];

        // Manual mapping for specific cases if needed
        if (!newLogo) {
            if (key === 'mi') newLogo = LOGOS['xiaomi'];
            if (key === 'moto') newLogo = LOGOS['motorola'];
        }

        if (newLogo) {
            console.log(`Updating ${brand.name} -> ${newLogo}`);
            await prisma.brand.update({
                where: { id: brand.id },
                data: { logo: newLogo }
            });
        } else {
            console.log(`Skipping ${brand.name} (No preset found)`);
        }
    }
    console.log('Logo update complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
