const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function calculateOnePlusPriority(name) {
    let year = 2018; // Default to an old year
    let tier = 50;   // Default mid-tier

    const n = name.trim().toLowerCase();

    // --- 1. Identify the Series and Generation ---
    if (n.includes('open')) {
        year = 2023;
        tier = 90; // Top foldable
    } else if (n.includes('nord')) {
        tier = 30; // Nord runs lower than number series

        // Match numbers after Nord or Nord CE (e.g. Nord 4, Nord CE 4, Nord 2T)
        // Group 1: optional CE or CE Lite etc (ignore mostly for year generation)
        // Group 2: The actual number 1, 2, 3, 4, 5
        const numMatch = n.match(/nord\s*(ce\s*(?:lite)?\s*)?(\d+)/i);
        if (numMatch && numMatch[2]) {
            const gen = parseInt(numMatch[2]);
            // If it's a known mapping
            if (gen === 5) year = 2025;
            else if (gen === 4) year = 2024;
            else if (gen === 3) year = 2023;
            else if (gen === 2) year = 2021; // Nord 2
            else if (gen === 1) year = 2020;
            else year = 2020 + gen;
        } else {
            // Original Nord or un-numbered Nord
            if (n === 'oneplus nord') year = 2020;
            else if (n.includes('n20') || n.includes('ce')) year = 2021; // Fallback
            else year = 2020;
        }
    } else {
        // Flagship Number Series (12, 13, 11, 10, 9, 8, etc.)
        tier = 70;
        const numMatch = n.match(/oneplus\s*(\d+)/i);
        if (numMatch && numMatch[1]) {
            const gen = parseInt(numMatch[1]);
            year = 2012 + gen; // OnePlus 12 (gen=12) -> 2024. OnePlus 13 (gen=13) -> 2025.
        }
    }

    // --- 2. Adjust Tiers based on Modifiers ---
    if (n.includes('pro') || n.includes('ultra')) {
        tier += 10; // Boost pro/ultra above base models
    } else if (n.includes('r') || n.includes('t') || n.includes('s')) {
        tier -= 5; // Demote R, T, S versions slightly below base
    } else if (n.includes('ce')) {
        tier -= 5; // Nord CE is slightly below regular Nord
    }

    if (n.includes('lite')) {
        tier -= 5; // Lite is lowest in its tier group
    }

    // --- 3. Compute Priority Value ---
    // Lower priority number = Higher in list
    // Recent years should have LOWER numbers (higher priority)
    // Higher tier within a year should have LOWER numbers
    // Base Calculation: (2030 - year) * 100
    // Subtract tier so a Tier 80 (Pro) gets a lower number than Tier 70 (Base)
    const priority = Math.max(0, (2030 - year) * 100) - tier;
    return priority;
}

async function run() {
    const models = await prisma.model.findMany({
        where: { brandId: 'oneplus', category: 'smartphone' }
    });

    const toDelete = [];
    const toUpdate = [];

    // Series to remove: 5, 5T, 6, 6T, 6/6T McLaren, 7, 7T, 7 Pro, 7T Pro (and McLarens)
    const removeRegex = /oneplus\s*(5t?|6t?(?:\s*mclaren(?:\s*edition)?)?|7t?(?:\s*pro)?(?:\s*mclaren(?:\s*edition)?)?)\b/i;

    for (const m of models) {
        if (removeRegex.test(m.name)) {
            toDelete.push(m.id);
            continue;
        }

        let normName = m.name;
        // Fix weird "Oneplus" vs "OnePlus" casing
        normName = normName.replace(/^Oneplus/i, 'OnePlus');

        const priority = calculateOnePlusPriority(normName);
        toUpdate.push({ id: m.id, name: normName, priority });
    }

    if (toDelete.length > 0) {
        console.log(`Deleting ${toDelete.length} old OnePlus models...`);
        for (const id of toDelete) {
            await prisma.variant.deleteMany({ where: { modelId: id } });
            await prisma.model.delete({ where: { id } });
        }
    } else {
        console.log("No old OnePlus models found for deletion.");
    }

    console.log(`Updating ${toUpdate.length} remaining models for correct priority...`);
    for (const item of toUpdate) {
        await prisma.model.update({
            where: { id: item.id },
            data: { name: item.name, priority: item.priority }
        });
        console.log(`- ${item.name} | Year Approx: ${2030 - Math.floor((item.priority + 100) / 100)} | Priority: ${item.priority}`);
    }

    console.log("OnePlus cleanup and prioritization complete!");
}

run().finally(() => prisma.$disconnect());
