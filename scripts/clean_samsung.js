const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function getYearAndType(name) {
    let year = 2019; // Default old
    let type = 99;   // Default other

    const n = name.toLowerCase();

    // S-series
    const sMatch = n.match(/s(\d{2})/);
    if (sMatch) {
        const gen = parseInt(sMatch[1]);
        if (gen >= 20) year = 2020 + (gen - 20); // S20=2020, S24=2024, S25=2025

        if (n.includes('ultra')) type = 20;
        else if (n.includes('plus') || n.includes('+')) type = 40;
        else if (n.includes('fe')) type = 60;
        else type = 50;
    }

    // Z Fold
    const foldMatch = n.match(/fold\s*(\d*)/);
    if (foldMatch && foldMatch[1]) {
        const gen = parseInt(foldMatch[1]); // Fold 6
        year = 2018 + gen; // Fold 3 = 2021, Fold 4 = 2022, Fold 5 = 2023, Fold 6 = 2024
        type = 10;
    } else if (n.includes('fold')) {
        year = 2019; type = 10;
    }

    // Z Flip
    const flipMatch = n.match(/flip\s*(\d*)/);
    if (flipMatch && flipMatch[1]) {
        const gen = parseInt(flipMatch[1]);
        year = 2018 + gen;
        type = 30;
    } else if (n.includes('flip')) {
        year = 2020; type = 30;
    }

    // Note series
    if (n.includes('note')) {
        const noteMatch = n.match(/note\s*(\d+)/);
        if (noteMatch) {
            const gen = parseInt(noteMatch[1]);
            if (gen === 20) year = 2020;
            else if (gen === 10) year = 2019;
        }
        type = 70;
    }

    // A series
    const aMatch = n.match(/a(\d)(\d)/);
    if (aMatch) {
        const firstDigit = parseInt(aMatch[1]);
        const secondDigit = parseInt(aMatch[2]);
        year = 2019 + secondDigit; // A55 -> year 2024
        type = 80 - firstDigit; // A5x -> type 75, A1x -> type 79
    }

    // M / F series
    const mfMatch = n.match(/[mf](\d)(\d)/);
    if (mfMatch) {
        const firstDigit = parseInt(mfMatch[1]);
        const secondDigit = parseInt(mfMatch[2]);
        year = 2019 + secondDigit;
        type = 90 - firstDigit;
    }

    return { year, type };
}

function calculateSamsungPriority(name) {
    const { year, type } = getYearAndType(name);
    return Math.max(0, (2030 - year) * 100) + type;
}

function normalizeSamsungName(name) {
    let clean = name.trim();

    // Remove "Samsung " prefix if exists
    if (clean.toLowerCase().startsWith('samsung ')) {
        clean = clean.substring(8).trim();
    }

    // Remove " 5G" or "-5G" suffix
    clean = clean.replace(/\s*5g$/i, '').trim();

    // Standardize "Z Fold6" -> "Z Fold 6"
    clean = clean.replace(/z fold\s*(\d+)/i, 'Z Fold $1');
    clean = clean.replace(/z flip\s*(\d+)/i, 'Z Flip $1');

    // Standardize "S25+" -> "S25 Plus"
    clean = clean.replace(/\+$/, ' Plus');

    return clean;
}

async function run() {
    const models = await prisma.model.findMany({
        where: { brandId: 'samsung', category: 'smartphone' },
        include: { variants: true }
    });

    const toDelete = [];
    const toUpdate = [];
    const nameMap = new Map();

    for (const m of models) {
        // Delete all S26 entries
        if (m.name.toLowerCase().includes('s26')) {
            toDelete.push(m.id);
            continue;
        }

        const normName = normalizeSamsungName(m.name);

        if (nameMap.has(normName)) {
            const existing = nameMap.get(normName);
            const existingVarCount = existing.variants.length;
            const currentVarCount = m.variants.length;

            if (currentVarCount > existingVarCount) {
                toDelete.push(existing.id);
                nameMap.set(normName, m);
            } else if (currentVarCount < existingVarCount) {
                toDelete.push(m.id);
            } else {
                if (m.name.length < existing.name.length) {
                    toDelete.push(existing.id);
                    nameMap.set(normName, m);
                } else {
                    toDelete.push(m.id);
                }
            }
        } else {
            nameMap.set(normName, m);
        }
    }

    console.log(`Deleting ${toDelete.length} duplicates / S26 models...`);
    for (const id of toDelete) {
        await prisma.variant.deleteMany({ where: { modelId: id } });
        await prisma.model.delete({ where: { id } });
    }

    console.log(`Updating remaining models for name and priority...`);
    for (const m of nameMap.values()) {
        const normName = normalizeSamsungName(m.name);
        const priority = calculateSamsungPriority(normName);
        console.log(`- ${m.name} -> ${normName} (Priority: ${priority})`);
        toUpdate.push({ id: m.id, name: normName, priority });
    }

    for (const item of toUpdate) {
        await prisma.model.update({
            where: { id: item.id },
            data: { name: item.name, priority: item.priority }
        });
    }

    console.log("Samsung cleanup and organization complete!");
}

run().finally(() => prisma.$disconnect());
