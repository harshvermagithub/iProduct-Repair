import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const PRIORITY_MAP: Record<string, number> = {
    'apple': 10,
    'samsung': 20,
    'oneplus': 30,
    'vivo': 40,
    'motorola': 50,
    'oppo': 60,
    'nothing': 70,
    'xiaomi': 80,
    'realme': 90,
    'nokia': 100, // example
    'google': 110
};

async function main() {
    console.log("Seeding brand priorities...");
    for (const [key, priority] of Object.entries(PRIORITY_MAP)) {
        // Try exact ID match
        try {
            // First try updating by ID (assumes slugs are used)
            const id = key.toLowerCase().replace(/\s+/g, '-');
            await prisma.brand.update({
                where: { id },
                data: { priority }
            });
            console.log(`Updated ID ${id} priority to ${priority}`);
        } catch (e) {
            // If ID not found, try finding by Name
            try {
                const brand = await prisma.brand.findFirst({
                    where: { name: { equals: key, mode: 'insensitive' } }
                });
                if (brand) {
                    await prisma.brand.update({
                        where: { id: brand.id },
                        data: { priority }
                    });
                    console.log(`Updated Name ${brand.name} priority to ${priority}`);
                } else {
                    console.log(`Brand ${key} not found via ID or Name`);
                }
            } catch (err) {
                console.error(`Error updating ${key}:`, err);
            }
        }
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
