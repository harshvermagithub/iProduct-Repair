
function extractNumber(str: string, prefix: string = ''): number {
    const regex = new RegExp(`${prefix}\\s*(\\d+)`, 'i');
    const match = str.match(regex);
    return match ? parseInt(match[1]) : 0;
}

function getVariantWeight(name: string): number {
    const lower = name.toLowerCase();
    if (lower.includes('ultra') || lower.includes('pro max') || lower.includes('promax')) return 90;
    if (lower.includes('pro')) {
        if (lower.includes('plus') || lower.includes('+')) return 85;
        return 80;
    }
    if (lower.includes('plus') || lower.includes('+')) return 70;
    if (lower.includes('fold')) return 95;
    if (lower.includes('flip')) return 94;
    return 60;
}

function getSamsungScore(name: string): number {
    const lower = name.toLowerCase();
    if (lower.includes('fold') || lower.includes('flip')) {
        const generation = extractNumber(name, '(Fold|Flip)');
        return (2018 + generation) * 100 + getVariantWeight(name);
    }
    if (lower.includes('galaxy s')) {
        const num = extractNumber(name, 'S');
        return (num < 100 ? 2000 + num : num) * 100 + getVariantWeight(name);
    }
    return 0;
}

const names = [
    'Galaxy S25 Ultra',
    'Galaxy S25',
    'Galaxy S23 Ultra',
    'Galaxy S24 Ultra',
    'Galaxy Z Fold6'
];

names.forEach(n => {
    console.log(`${n}: ${getSamsungScore(n)}`);
});
