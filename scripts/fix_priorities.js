const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function calculatePriority(name) {
    const n = name.toLowerCase();

    if (n.includes('iphone se')) return 9000; // SE at bottom

    let gen = 0;
    // Extract Generation
    const match = n.match(/iphone\s+(\d+)/);
    if (match) {
        gen = parseInt(match[1]);
    } else {
        // Handle Roman Numerals
        if (n.includes('iphone x')) gen = 10; // X, XS, XR
    }

    if (gen === 0) return 9999; // Fallback

    // Determine Variant Rank (Lower is Higher Priority in Ascending Sort)
    // Order: Pro Max (1) > Pro (2) > Plus (3) > Base (4) > E (4.5) > Air (5) > Mini (6)
    let rank = 4; // Default to Base

    if (n.includes('pro max')) rank = 1;
    else if (n.includes('xs max')) rank = 1; // XS Max
    else if (n.includes('pro')) {
        rank = 2;
        if (n.includes('xs') && !n.includes('max')) rank = 2; // XS is pro-tier
    }
    else if (n.includes('plus')) rank = 3;
    else if (n.includes('xr')) rank = 3.5; // XR is mid tier
    else if (n.includes('mini')) rank = 6;
    else if (n.includes('air')) rank = 5;
    else if (n.match(/\b\d+\s?e\b/)) rank = 4.5;

    // Formula: (30 - Gen) * 10 + Rank.
    // 17 -> 130s.
    // 14 -> 160s.
    // 10 (X) -> 200s.
    return (30 - gen) * 10 + rank;
}

async function main() {
    console.log("Fixing priorities for all Apple models...");
    const models = await prisma.model.findMany({
        where: { brandId: 'apple' }
    });

    for (const m of models) {
        const p = calculatePriority(m.name);
        if (m.priority !== p) {
            await prisma.model.update({
                where: { id: m.id },
                data: { priority: p }
            });
            console.log(`Updated ${m.name}: ${m.priority} -> ${p}`);
        } else {
            // console.log(`Skipped ${m.name} (Correct)`);
        }
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => await prisma.$disconnect());
