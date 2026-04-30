
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Reordering brands based on user preference...');

    // Default priority is usually 100 or 50. Let's set the preferred ones to lower numbers (higher priority).
    // Order: Apple, Samsung, Vivo, OnePlus, Nothing, iQOO, ...others

    const priorities: Record<string, number> = {
        'apple': 10,
        'samsung': 20,
        'vivo': 30,
        'oneplus': 40,
        'nothing': 50,
        'iqoo': 60,
        // Others will stay at default (likely 100) or we can force them to 100.
    };

    // First ensure everyone is at a baseline (optional, but good for cleanliness)
    // Actually, let's just update the specific ones to be "top of the list".
    // If we assume default is >= 100, these will float to the top.

    // We'll update others to 100 just in case some random brand has a low priority 
    // from a previous seed/script.
    await prisma.brand.updateMany({
        data: { priority: 100 }
    });

    for (const [id, priority] of Object.entries(priorities)) {
        // Find brand first to avoid error if ID is slightly different (case sensitive DBs)
        // But our IDs are usually lowercase 'apple', 'samsung'.
        try {
            await prisma.brand.update({
                where: { id: id },
                data: { priority: priority }
            });
            console.log(`Set ${id} priority to ${priority}`);
        } catch (e) {
            console.warn(`Could not update priority for ${id} (brand might not exist or ID mismatch)`);
        }
    }

    console.log('Reorder complete.');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
