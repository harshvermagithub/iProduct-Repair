
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to extract numeric part from string
function extractNumber(str: string, prefix: string = ''): number {
    // Regex looking for number after prefix
    // e.g. "Samsung Galaxy S23" -> look for 23
    const regex = new RegExp(`${prefix}\\s*(\\d+)`, 'i');
    const match = str.match(regex);
    return match ? parseInt(match[1]) : 0;
}

// Helper to assign variant weight
function getVariantWeight(name: string): number {
    const lower = name.toLowerCase();

    // Higher weight = Newer/Better (will invert for priority) or Higher Priority
    // Let's use numeric score where HIGHER is BETTER.

    // Ultra/Pro Max/Pro Plus = Top Tier
    if (lower.includes('ultra') || lower.includes('pro max') || lower.includes('promax')) return 90;

    // Pro
    if (lower.includes('pro')) {
        if (lower.includes('plus') || lower.includes('+')) return 85; // Pro Plus
        return 80; // Just Pro
    }

    // Plus (but not Pro Plus)
    if (lower.includes('plus') || lower.includes('+')) return 70;

    // Fold (Premium)
    if (lower.includes('fold')) return 95;
    // Flip (Premium but below Fold)
    if (lower.includes('flip')) return 94;

    // Titan/Special editions
    if (lower.includes('titan')) return 88;

    // Fan Edition / 'a' series / Lite / Neo / CE / i
    if (lower.includes(' fe') || lower.endsWith(' fe')) return 40;
    if (lower.match(/\s[a-z]($|\s)/) && !lower.includes('fold') && !lower.includes('flip')) return 30; // singular letter like 'Pixel 7a', 'Reno 8T'
    if (lower.includes('lite')) return 20;
    if (lower.includes('neo')) return 35;
    if (lower.includes('ce')) return 25; // OnePlus Nord CE
    if (lower.includes('prime')) return 15;
    if (lower.includes('go')) return 10;

    // Base model (default)
    return 60;
}

// Logic for Samsung
function getSamsungScore(name: string): number {
    const lower = name.toLowerCase();

    // Series Base Score
    let seriesScore = 0;

    // Z Series (Fold/Flip)
    if (lower.includes('fold') || lower.includes('flip')) {
        const generation = extractNumber(name, '(?:Fold|Flip)'); // Fold5, Flip5
        // Z Fold 5 ~ S23 era. Z Fold 6 ~ S24 era.
        // Let's map Generation to "Year Score"
        // Gen 6 -> 2024 -> Score 2400
        // Gen 5 -> 2023 -> Score 2300
        return (2018 + generation) * 100 + getVariantWeight(name);
    }

    // S Series
    if (lower.includes('galaxy s')) {
        const num = extractNumber(name, 'S');
        const score = (num < 100 ? 2000 + num : num) * 100 + getVariantWeight(name);
        console.log(`Samsung ${name}: Num ${num} -> Score ${score}`);
        return score;
    }

    // Note Series (Legacy high end)
    if (lower.includes('note')) {
        const num = extractNumber(name, 'Note');
        return (2000 + num) * 100 + getVariantWeight(name); // Note 20 -> 202000
    }

    // A Series
    if (lower.includes('galaxy a')) {
        const num = extractNumber(name, 'A'); // A55, A54
        // A55 -> mid range.
        // Structure: First digit = tier, Second digit = year.
        // A55 > A35 > A54.
        // Let's just use raw number: 55 > 54 > 35
        // Base score much lower than S series (e.g. 1000 range)
        return 100000 + (num * 10) + (getVariantWeight(name) / 10);
    }

    // M Series
    if (lower.includes('galaxy m')) {
        const num = extractNumber(name, 'M');
        return 90000 + (num * 10) + (getVariantWeight(name) / 10); // Below A series
    }

    // F Series
    if (lower.includes('galaxy f')) {
        const num = extractNumber(name, 'F');
        return 80000 + (num * 10);
    }

    return 0;
}

function getOnePlusScore(name: string): number {
    const lower = name.toLowerCase();

    // Nord
    if (lower.includes('nord')) {
        // Nord CE 4, Nord 3
        const num = extractNumber(name, '(Nord|CE)');
        return 100000 + (num * 100) + getVariantWeight(name);
    }

    // Number Series (OnePlus 12, 11R, etc)
    const num = extractNumber(name, 'OnePlus'); // OnePlus 12
    if (num > 0) {
        // High end
        // 12 -> 201200 equivalent
        // Weight: R is lower than base. Pro/T/Base logic.
        let w = getVariantWeight(name);
        if (lower.includes('r') && !lower.includes('pro')) w = 50; // 'R' models are usually budget flagships below base
        return 200000 + (num * 100) + w;
    }

    return 0;
}

function getXiaomiScore(name: string): number {
    const lower = name.toLowerCase();

    // Xiaomi 14, 13, etc
    if (lower.match(/xiaomi\s+\d/)) {
        const num = extractNumber(name, 'Xiaomi');
        return 200000 + (num * 100) + getVariantWeight(name);
    }

    // Redmi Note
    if (lower.includes('note')) {
        const num = extractNumber(name, 'Note');
        return 100000 + (num * 100) + getVariantWeight(name);
    }

    // Redmi Number
    if (lower.includes('redmi') && !lower.includes('note') && !lower.includes('k')) {
        const num = extractNumber(name, 'Redmi');
        return 50000 + (num * 100) + getVariantWeight(name);
    }

    // Poco
    if (lower.includes('poco')) {
        // X6, F6, M6
        const seriesChar = lower.match(/poco\s+([a-z])/)?.[1] || '';
        const num = extractNumber(name, `Poco\\s+${seriesChar}`);
        let seriesScore = 50000;
        if (seriesChar === 'f') seriesScore = 90000; // Flagship killer
        if (seriesChar === 'x') seriesScore = 70000; // Mid
        if (seriesChar === 'm') seriesScore = 60000; // Budget
        if (seriesChar === 'c') seriesScore = 40000; // Low

        return seriesScore + (num * 100) + getVariantWeight(name);
    }

    return 0;
}

function getPixelScore(name: string): number {
    const num = extractNumber(name, 'Pixel');
    let w = getVariantWeight(name);
    if (name.includes('a')) w = 30; // Pixel 7a is usually below 7
    return 200000 + (num * 100) + w;
}


function getModelScore(brandName: string, modelName: string): number {
    const b = brandName.toLowerCase();

    if (b.includes('samsung')) return getSamsungScore(modelName);
    if (b.includes('oneplus')) return getOnePlusScore(modelName);
    if (b.includes('xiaomi') || b.includes('redmi') || b.includes('poco') || b.includes('mi')) return getXiaomiScore(modelName);
    if (b.includes('google') || b.includes('pixel')) return getPixelScore(modelName);

    // Fallback: Just extract any number found and prioritize it.
    // e.g. Vivo V30 > V29
    const num = extractNumber(modelName);
    return num * 100 + getVariantWeight(modelName);
}

async function main() {
    console.log('Fetching brands...');
    const brands = await prisma.brand.findMany();

    // We already handled Apple in another script, but we can include it here or skip
    // Let's skip Apple if we want to preserve that specific script's work, 
    // OR just handle everything. Since the previous script was very specific, let's process NON-Apple brands here mostly.

    const targetBrands = brands.filter(b => b.name !== 'Apple');

    for (const brand of targetBrands) {
        console.log(`Processing ${brand.name}...`);
        const models = await prisma.model.findMany({
            where: { brandId: brand.id }
        });

        if (models.length === 0) continue;

        // Sort models by calculate Score (Descending)
        // Check Categories?
        // If mixed categories (Laptop + Phone), this regex might fail.
        // For now, let's assume Phones logic primarily. Laptops usually have numbers too (MacBook Pro 14, 16).

        const sorted = models.sort((a, b) => {
            const scoreA = getModelScore(brand.name, a.name);
            const scoreB = getModelScore(brand.name, b.name);

            if (scoreA !== scoreB) return scoreB - scoreA; // Descending score
            return a.name.localeCompare(b.name);
        });

        // Update Priorities
        // Note: Apple used 1..N.
        // If we restart counter at 1 for EVERY brand, that's fine 
        // because the "Sell" page usually views ONE brand at a time.
        // GLOBAL priority only matters if viewing "All Models" from mixed brands, 
        // in which case Apple will just mix with Samsung #1s. That is acceptable or even desired.

        for (let i = 0; i < sorted.length; i++) {
            await prisma.model.update({
                where: { id: sorted[i].id },
                data: { priority: i + 1 }
            });
        }
    }

    console.log('Reordering Done!');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
