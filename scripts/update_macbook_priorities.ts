import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Fetching Apple laptop models...');
    const brand = await prisma.brand.findFirst({
        where: { name: 'Apple', categories: { has: 'laptop' } }
    });

    if (!brand) {
        console.log('No Apple laptop brand found.');
        return;
    }

    const models = await prisma.model.findMany({
        where: { brandId: brand.id, category: 'laptop' }
    });

    console.log(`Found ${models.length} models.`);

    // Extract year and determine priority
    // Sort logic: largest year first (e.g., 2024, 2023, 2022)
    // We assign priority starting at 10, incrementing by 10

    const parsedModels = models.map(m => {
        // Look for 4 consecutive digits
        const match = m.name.match(/\b(20\d{2})\b/);
        const year = match ? parseInt(match[1]) : 0;
        return { ...m, year };
    });

    // Sort descending by year, then alphabetically
    parsedModels.sort((a, b) => {
        if (b.year !== a.year) {
            return b.year - a.year; // newest year first
        }
        return a.name.localeCompare(b.name);
    });

    let currentPriority = 10;
    for (const model of parsedModels) {
        console.log(`Updating ${model.name} (Year: ${model.year}) -> Priority: ${currentPriority}`);
        await prisma.model.update({
            where: { id: model.id },
            data: { priority: currentPriority }
        });
        currentPriority += 10;
    }

    console.log('Successfully updated MacBook priorities!');
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
