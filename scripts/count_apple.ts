import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const appleModels = await prisma.model.findMany({
        where: { brandId: 'apple' }
    });

    const categoryCounts: Record<string, number> = {};
    for (const m of appleModels) {
        categoryCounts[m.category] = (categoryCounts[m.category] || 0) + 1;
    }

    console.log("=== APPLE MODEL CATEGORIES IN DB ===");
    console.log(categoryCounts);

    console.log("=== DETAIL BY CATEGORY ===");
    for (const cat of Object.keys(categoryCounts)) {
        const sample = appleModels.filter(m => m.category === cat).slice(0, 5).map(m => m.name);
        console.log(`- ${cat} (${categoryCounts[cat]}):`, sample.join(", "), "... ");
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
