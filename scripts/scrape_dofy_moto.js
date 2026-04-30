const fs = require('fs');
const path = require('path');
const https = require('https');

const modelNames = [
    "Moto Edge 70", "Moto G67 Power", "Moto G57 Power", "Moto G86 Power 5G", "Moto Edge 60 Stylus",
    "Moto G96 5G", "Moto Razr 60 Ultra", "Moto Razr 60", "Moto Edge 60", "Moto Edge 60 Fusion",
    "Moto Edge 60 Pro", "Moto G35 5G", "Moto G05", "Moto Razr 50", "Moto Edge 50 Neo",
    "Moto G45 5G", "Moto G04s", "Moto Razr 50 Ultra", "Motorola Edge 50 Ultra 5G", "Moto Edge 50 Fusion",
    "Moto G04", "Moto G24 Power", "Moto G64 5G", "Moto Edge 50 Pro 5G", "Moto Edge 50 5G",
    "Moto G85 5G", "Moto G34 5G", "Moto G54 5G", "Moto G84 5G", "Moto G14",
    "Moto Edge 40 Neo", "Moto Razr 40", "Moto Razr 40 Ultra", "Moto Edge 40", "Moto G13",
    "Moto G73", "Moto E22S", "Moto E32", "Moto G72 5G", "Moto G62 5G",
    "Moto E13", "Moto Edge 30 Ultra", "Moto Edge 30 Fusion", "MOTO G32", "Moto G31",
    "Moto Edge 30 Pro", "Moto Edge 30", "Moto E32S", "Moto G22", "Moto G52",
    "Moto G51 5G", "Moto G82 5G", "Moto G71 5G", "Moto G42", "Moto E40",
    "Moto Razr 5G", "Moto Razr", "Moto Edge 20", "Moto Edge 20 Fusion", "Moto Edge 20 Pro",
    "Moto Edge Plus", "Moto One Fusion Plus", "Moto One Macro", "Moto One Action", "Moto One Vision",
    "Moto G8 Plus", "Moto G40 Fusion", "Moto G60", "Moto G10 Power", "Moto G30",
    "Moto G 5G", "Moto G9 Power", "Moto G9", "Moto G8 Power Lite", "Moto G7",
    "Moto G7 Power", "Moto E7 Plus", "Moto E6s", "Moto E5 Plus"
];

const buildId = '8PllrAnLvFbw-iTwWuQnu';
const imageDir = path.join(__dirname, '../imgs/Motorola');
const outputTsv = path.join(__dirname, 'moto_data.tsv');

let imageFiles = [];
try {
    imageFiles = fs.readdirSync(imageDir);
} catch (e) {
    console.error("Image dir not found:", e.message);
}

function fetchJson(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    resolve(null);
                }
            });
        }).on('error', reject);
    });
}

function findExampleImage(modelName) {
    // Strip brand prefixes (motorola, moto)
    // Strip extension

    const clean = (s) => s.toLowerCase()
        .replace(/\.png|\.jpeg|\.jpg|\.webp/g, '')
        .replace(/[^a-z0-9]/g, '')
        .replace(/(motorola|moto)/g, '');

    const target = clean(modelName);

    for (const file of imageFiles) {
        if (file.startsWith('.')) continue;

        const fName = clean(file);
        if (fName === target) return file;
    }
    return null;
}

async function scrape() {
    let tsvContent = "Brand\tModel\tVariant\tPrice\tImage\n";

    for (const name of modelNames) {
        // Slug creation: Motorola pages on Dofy typically use hyphens
        // "Moto G34 5G" -> "moto-g34-5g"
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        const url = `https://www.dofy.in/_next/data/${buildId}/in-en/india/sell-old-phone/motorola/${slug}.json`;

        console.log(`Scraping ${name} (${slug})...`);

        try {
            const data = await fetchJson(url);
            await new Promise(r => setTimeout(r, 100)); // Be nice

            let variants = [];
            if (data && data.pageProps && data.pageProps.selectVariant) {
                variants = data.pageProps.selectVariant;
            } else {
                console.warn(`No variants object for ${name}.`);
            }

            const localImage = findExampleImage(name);
            const imagePath = localImage ? `/models/motorola/${localImage}` : '';

            if (!localImage) {
                console.warn(`Image NOT FOUND for ${name}`);
            }

            if (variants.length === 0) {
                continue;
            }

            for (const v of variants) {
                const price = v.MaximumValue || 0;
                let variantName = v.Name || "Base";
                tsvContent += `Motorola\t${name}\t${variantName}\t${price}\t${imagePath}\n`;
            }
        } catch (e) {
            console.error(`Error ${name}: ${e.message}`);
        }
    }

    fs.writeFileSync(outputTsv, tsvContent);
    console.log(`Saved ${outputTsv}`);
}

scrape();
