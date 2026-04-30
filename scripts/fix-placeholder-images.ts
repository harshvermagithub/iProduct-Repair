
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function cleanName(str: string): string {
    return str.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/\./g, '-')
        .replace(/[()]/g, '') // remove parens
        .replace(/-+/g, '-'); // collapse dashes
}

async function main() {
    const models = await prisma.model.findMany({
        where: {
            img: { contains: 'placehold.co' }
        },
        include: { brand: true }
    });

    console.log(`Found ${models.length} placeholder images.`);

    for (const m of models) {
        // Construct GSMArena style URL
        // Pattern seems to vary by brand.
        // Apple: apple-iphone-13.jpg (brand prefix)
        // Samsung: samsung-galaxy-s22 (brand prefix)
        // OnePlus: oneplus-oneplus-9 (double prefix sometimes?)

        // Let's try standard {brand}-{model}.jpg
        const brandName = cleanName(m.brand.name);
        const modelName = cleanName(m.name);

        // Some corrections for known brands
        let filename = `${brandName}-${modelName}`;

        if (brandName === 'oneplus') {
            // Check existing pattern: oneplus-oneplus-9-pro
            filename = `oneplus-${filename}`;
        }

        if (brandName === 'apple' && !modelName.startsWith('iphone')) {
            // e.g. "iPhone 13" -> "iphone-13". Result: "apple-iphone-13" (Correct)
            // But if model is "Watch Series 8", result "apple-watch-series-8" (Likely correct)
        }

        const url = `https://fdn2.gsmarena.com/vv/bigpic/${filename}.jpg`;

        console.log(`Updating ${m.name} -> ${url}`);

        await prisma.model.update({
            where: { id: m.id },
            data: { img: url }
        });
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
