const fs = require('fs');
const path = require('path');
const https = require('https');

const modelNames = [
    "iQOO 15 5G",
    "iQOO Z10r 5G",
    "iQOO Z10 Lite 5G",
    "iQoo Z10x 5G",
    "iQOO Neo 10",
    "iQOO Z10 5G",
    "IQOO Neo 10R 5G",
    "iQOO 13 5G",
    "iQOO Z9s Pro 5G",
    "iQOO Z9s 5G",
    "IQOO Z9x 5G",
    "Iqoo Z9 5G",
    "Iqoo Neo 9 Pro 5G",
    "iQOO Z9 Lite 5G",
    "iQOO Z7 Pro",
    "IQOO Neo 7 Pro 5G",
    "iQOO 12 5G",
    "iQOO 11 5G",
    "IQOO Z7s 5G",
    "IQOO Z7 5G",
    "IQOO NEO 7 5G",
    "IQOO Z6 Lite 5G",
    "iQOO 9T 5G",
    "iQOO Z6",
    "iQOO Neo 6 5G",
    "iQOO Z6 5G",
    "iQOO Z6 Pro 5G",
    "iQOO 9 SE 5G",
    "iQOO 9 Pro 5G",
    "iQOO 9 5G",
    "iQOO Z5 5G",
    "iQOO Z3 5G",
    "iQOO 7 Legend 5G",
    "iQOO 7 5G",
    "iQOO 3"
];

const buildId = '8PllrAnLvFbw-iTwWuQnu';
const imageDir = path.join(__dirname, '../imgs/Iqoo');
const outputTsv = path.join(__dirname, 'iqoo_data.tsv');

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
    // Strip brand prefixes (iqoo)
    // Strip extension

    const clean = (s) => s.toLowerCase()
        .replace(/\.png|\.jpeg|\.jpg|\.webp/g, '')
        .replace(/[^a-z0-9]/g, '')
        .replace(/iqoo/g, '');

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
        // Slug creation: 
        // "iQOO 15 5G" -> "iqoo-15-5g"
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        const url = `https://www.dofy.in/_next/data/${buildId}/in-en/india/sell-old-phone/iqoo/${slug}.json`;

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
            const imagePath = localImage ? `/models/iqoo/${localImage}` : '';

            if (!localImage) {
                console.warn(`Image NOT FOUND for ${name}`);
            }

            if (variants.length === 0) {
                continue;
            }

            for (const v of variants) {
                const price = v.MaximumValue || 0;
                let variantName = v.Name || "Base";
                tsvContent += `iQOO\t${name}\t${variantName}\t${price}\t${imagePath}\n`;
            }
        } catch (e) {
            console.error(`Error ${name}: ${e.message}`);
        }
    }

    fs.writeFileSync(outputTsv, tsvContent);
    console.log(`Saved ${outputTsv}`);
}

scrape();
