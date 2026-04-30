
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Map of partial model names to their intended priority (Lower number = Higher Priority)
// 1 = Top of list. 100 = Default.
const PRIORITIES: Record<string, number> = {
    // Apple 16 Series (Hypothetical or future)
    'iphone 16': 1,
    'iphone 16 pro': 2,
    'iphone 16 pro max': 3,
    'iphone 16 plus': 4,

    // Apple 15 Series
    'iphone 15': 10,
    'iphone 15 pro': 11,
    'iphone 15 pro max': 12,
    'iphone 15 plus': 13,

    // Apple 14 Series
    'iphone 14': 20,
    'iphone 14 pro': 21,
    'iphone 14 pro max': 22,
    'iphone 14 plus': 23,

    // Apple 13 Series
    'iphone 13': 30,
    'iphone 13 pro': 31,
    'iphone 13 pro max': 32,
    'iphone 13 mini': 33,

    // Apple 12 Series
    'iphone 12': 40,
    'iphone 12 pro': 41,

    // Apple 11
    'iphone 11': 50,

    // Samsung S24
    'galaxy s24': 1,
    'galaxy s24 ultra': 2,

    // Samsung S23
    'galaxy s23': 10,

    // Xiaomi/Redmi (Newer first)
    'note 13': 1,
    'note 12': 10,
    'note 10': 20,
    'note 6': 50,
};

async function main() {
    console.log('Seeding model priorities...');
    const models = await prisma.model.findMany();

    for (const model of models) {
        const lowerName = model.name.toLowerCase();
        let assignedPriority = 100; // Default

        // Check for matches
        for (const [key, priority] of Object.entries(PRIORITIES)) {
            if (lowerName.includes(key)) {
                assignedPriority = priority;
                // If it's a "Pro Max" and we matched "Pro", we might have an issue if order isn't specific.
                // But the keys above are fairly specific. We should probably sort keys by length desc to match most specific first?
                // Or just loop.
            }
        }

        // Better logic: Find the best match (longest string match)
        const matches = Object.entries(PRIORITIES).filter(([key]) => lowerName.includes(key));
        if (matches.length > 0) {
            // Sort by key length descending to match "iPhone 15 Pro Max" before "iPhone 15"
            matches.sort((a, b) => b[0].length - a[0].length);
            assignedPriority = matches[0][1];
        }

        if (assignedPriority !== 100) {
            console.log(`Setting priority ${assignedPriority} for ${model.name}`);
            await prisma.model.update({
                where: { id: model.id },
                data: { priority: assignedPriority }
            });
        }
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
