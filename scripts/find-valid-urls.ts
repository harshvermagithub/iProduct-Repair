
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const candidates = [
    // Samsung S24 Ultra
    'samsung-galaxy-s24-ultra',
    'samsung-galaxy-s24-ultra-5g',
    'samsung-galaxy-s24-ultra-5g-sm-s928',
    // iPhone 11 Pro
    'apple-iphone-11-pro',
    'apple-iphone-11-pro-max',
    // OnePlus 11
    'oneplus-11',
    'oneplus-11-5g',
    'oneplus-oneplus-11',
    // OnePlus 12R
    'oneplus-12r',
    'oneplus-ace-3', // 12R is Ace 3 in China, sometimes image is shared
    // Google Pixel 7
    'google-pixel-7',
    'google-pixel-7-5g',
    'google-pixel-7-pro',
];

async function checkUrl(slug: string) {
    const url = `https://fdn2.gsmarena.com/vv/bigpic/${slug}.jpg`;
    try {
        const { stdout } = await execAsync(`curl -I -s -o /dev/null -w "%{http_code}" ${url}`);
        return { slug, status: parseInt(stdout) };
    } catch (e) {
        return { slug, status: 0 };
    }
}

async function main() {
    console.log('Checking URLs...');
    for (const slug of candidates) {
        const res = await checkUrl(slug);
        console.log(`${slug}: ${res.status}`);
    }
}

main();
