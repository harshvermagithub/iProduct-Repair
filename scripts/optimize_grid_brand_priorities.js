const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Optimizing Brand Priorities for Grid Layout...");

    // Target Visual Order (Top Row First): Apple, Samsung, Xiaomi, OnePlus
    // Grid Flow Column fills column first (Top-Down).
    // So Rank 1: Top-Left (Apple)
    // Rank 2: Bot-Left (Google) -> Less visible
    // Rank 3: Top-Right (Samsung) -> Highly visible (Samsung)
    // Rank 4: Bot-Right (Oppo)
    // Rank 5: Top-Right-2 (Xiaomi)
    // Rank 6: Bot-Right-2 (Vivo)
    // Rank 7: Top-Right-3 (OnePlus)

    const targetRanks = {
        'Apple': 1,
        'Samsung': 3,
        'Xiaomi': 5,
        'OnePlus': 7,
        'Google': 2,
        'Oppo': 4,
        'Vivo': 6,
        'Realme': 8,
        'Nothing': 9,
        'Motorola': 10
    };

    const brands = await prisma.brand.findMany();

    for (const b of brands) {
        let p = 100;
        if (targetRanks[b.name]) {
            p = targetRanks[b.name];
        }

        if (b.priority !== p) {
            await prisma.brand.update({
                where: { id: b.id },
                data: { priority: p }
            });
            console.log(`Updated ${b.name}: ${b.priority} -> ${p}`);
        }
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => await prisma.$disconnect());
