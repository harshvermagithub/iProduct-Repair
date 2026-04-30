
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Fetching iPhone models...');
    const allModels = await prisma.model.findMany({
        where: { name: { contains: 'iPhone', mode: 'insensitive' } }
    });

    // Define strict rank for variant types
    const variantRank: Record<string, number> = {
        'Pro Max': 1,
        'Pro': 2,
        'Plus': 3,
        'Base': 4, // Default if no suffix
        'mini': 5,
        'SE': 6
    };

    // Helper to parse model name
    function parseModel(name: string) {
        // Remove "Apple" prefix if present
        const cleanName = name.replace(/^Apple\s+/i, '').trim();

        // Extract number (e.g. 15, 14, 13, 6s)
        const versionMatch = cleanName.match(/iPhone\s+(\d+s?|X[S|R]?|SE)(\s+|$)/i);
        let version = versionMatch ? versionMatch[1] : '0';

        // Handle special cases for numbering
        let versionNum = parseFloat(version);
        if (version.toUpperCase() === 'X') versionNum = 10;
        if (version.toUpperCase() === 'XS') versionNum = 10.5;
        if (version.toUpperCase() === 'XR') versionNum = 10.1;
        if (version.toUpperCase().startsWith('SE')) {
            // Treat SE as older/lower than numbered series generally, 
            // or assign specific year based logic if possible. 
            // For simplicity, let's treat SE as version 9 (between 8 and X) or check generation.
            // Usually SE is budget, so lower priority than main lines.
            versionNum = 9;
        }

        // Determine variant
        let variant = 'Base';
        if (cleanName.includes('Pro Max')) variant = 'Pro Max';
        else if (cleanName.includes('Pro')) variant = 'Pro';
        else if (cleanName.includes('Plus')) variant = 'Plus';
        else if (cleanName.includes('mini')) variant = 'mini';

        return {
            id: versionNum, // Higher is newer
            variantRank: variantRank[variant],
            originalName: name
        };
    }

    const sortedModels = allModels.sort((a, b) => {
        const pA = parseModel(a.name);
        const pB = parseModel(b.name);

        // 1. Sort by Version (Descending: 15 BEFORE 14)
        if (pA.id !== pB.id) {
            return pB.id - pA.id;
        }

        // 2. Sort by Variant Rank (Ascending: Pro Max (1) BEFORE Base (4))
        return pA.variantRank - pB.variantRank;
    });

    console.log('New Order Preview:');
    sortedModels.forEach((m, i) => console.log(`${i + 1}. ${m.name}`));

    console.log('Updating database...');
    // Update simple priority: 1, 2, 3...
    // To leave room for future "iPhone 16", maybe start at 10? 
    // User asked for "iPhone 17 then 16..." so strictly following the list is best.

    // Using transaction for speed
    for (let i = 0; i < sortedModels.length; i++) {
        const model = sortedModels[i];
        await prisma.model.update({
            where: { id: model.id },
            data: { priority: i + 1 } // 1-based index
        });
    }

    console.log('Done!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
