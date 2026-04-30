const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Checking for duplicate models...");

    // Fetch all models
    const models = await prisma.model.findMany({
        where: { brandId: 'apple' },
        include: { variants: true }
    });

    const grouped = {};
    models.forEach(m => {
        const name = m.name.trim(); // normalization
        if (!grouped[name]) grouped[name] = [];
        grouped[name].push(m);
    });

    for (const name in grouped) {
        if (grouped[name].length > 1) {
            console.log(`Duplicate found for: ${name} (${grouped[name].length} copies)`);
            const copies = grouped[name];

            // Heuristic: Keep the one with '/models/apple/' image path (Standardized by us)
            // If multiple have it, keep the one with most recent update?
            // Or Keep the one with variants?

            // Map to score
            const scored = copies.map(m => {
                let score = 0;
                if (m.img && m.img.startsWith('/models/apple/')) score += 10;
                if (m.variants && m.variants.length > 0) score += 5;
                // Prefer recently updated
                score += (new Date(m.updatedAt).getTime() / 10000000000000);
                return { m, score };
            });

            // Sort descending by score
            scored.sort((a, b) => b.score - a.score);

            const keeper = scored[0].m;
            const toDelete = scored.slice(1).map(s => s.m);

            console.log(`  Keeping ID: ${keeper.id} (Img: ${keeper.img}, Variants: ${keeper.variants.length})`);

            for (const d of toDelete) {
                console.log(`  Deleting ID: ${d.id} (Img: ${d.img}, Variants: ${d.variants.length})`);
                await prisma.model.delete({
                    where: { id: d.id }
                });
            }
        }
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => await prisma.$disconnect());
