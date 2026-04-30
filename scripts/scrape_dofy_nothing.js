const fs = require('fs');
const path = require('path');
const https = require('https');

const modelNames = [
    "Nothing Phone 3a Lite",
    "Nothing Phone 3",
    "Nothing Phone 3a",
    "Nothing Phone 3a Pro",
    "Nothing Phone 2a",
    "Nothing Phone 2a Plus",
    "Nothing Phone 2",
    "Nothing Phone 1"
];

const buildId = '8PllrAnLvFbw-iTwWuQnu';
const imageDir = path.join(__dirname, '../imgs/Nothing');
const outputTsv = path.join(__dirname, 'nothing_data.tsv');

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
    // Strip brand prefixes (nothing)
    // Strip extension

    const clean = (s) => s.toLowerCase()
        .replace(/\.png|\.jpeg|\.jpg|\.webp/g, '')
        .replace(/[^a-z0-9]/g, '')
        .replace(/nothing/g, '');

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
        // "Nothing Phone 2a" -> "nothing-phone-2a"
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        const url = `https://www.dofy.in/_next/data/${buildId}/in-en/india/sell-old-phone/nothing/${slug}.json`;

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
            const imagePath = localImage ? `/models/nothing/${localImage}` : '';

            if (!localImage) {
                console.warn(`Image NOT FOUND for ${name}`);
            }

            if (variants.length === 0) {
                continue;
            }

            for (const v of variants) {
                const price = v.MaximumValue || 0;
                let variantName = v.Name || "Base";
                tsvContent += `Nothing\t${name}\t${variantName}\t${price}\t${imagePath}\n`;
            }
        } catch (e) {
            console.error(`Error ${name}: ${e.message}`);
        }
    }

    fs.writeFileSync(outputTsv, tsvContent);
    console.log(`Saved ${outputTsv}`);
}

scrape();
