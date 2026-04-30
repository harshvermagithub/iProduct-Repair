const fs = require('fs');
const path = require('path');
const https = require('https');

const modelNames = [
    "Poco M8 5G",
    "POCO C85",
    "Poco M7 Plus 5G",
    "Poco F7",
    "Poco C71",
    "Poco M7 5G",
    "Poco M7 Pro 5G",
    "Poco X7 Pro 5G",
    "Poco X7 5G",
    "Poco C75 5G",
    "Poco M6 Plus 5G",
    "Poco F6 5G",
    "Poco X6 Neo",
    "Poco C61",
    "Poco M6 5G",
    "Poco X6 5G",
    "Poco X6 Pro 5G",
    "Poco C65",
    "Poco M6 Pro 5G",
    "Poco F5",
    "Poco C51",
    "Poco X5",
    "Poco C55",
    "Poco X5 Pro 5G",
    "Poco M5",
    "Poco C50",
    "Poco M4 5G",
    "Poco X4 Pro 5G",
    "Poco M4 Pro",
    "Poco F4",
    "Poco M4 Pro 5G",
    "Poco C31",
    "Poco M2 Reloaded",
    "Poco F3 GT",
    "Poco M3 Pro 5G",
    "Poco X3 Pro",
    "Poco X3",
    "Poco C3",
    "Poco M2 Pro",
    "Poco X2",
    "Poco F1"
];

const buildId = '8PllrAnLvFbw-iTwWuQnu';
const imageDir = path.join(__dirname, '../imgs/Poco');
const outputTsv = path.join(__dirname, 'poco_data.tsv');

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
    // Strip brand prefixes (Poco)
    // Strip extension

    const clean = (s) => s.toLowerCase()
        .replace(/\.png|\.jpeg|\.jpg|\.webp/g, '')
        .replace(/[^a-z0-9]/g, '')
        .replace(/poco/g, '');

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
        // "Poco M8 5G" -> "poco-m8-5g"
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        const url = `https://www.dofy.in/_next/data/${buildId}/in-en/india/sell-old-phone/poco/${slug}.json`;

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
            const imagePath = localImage ? `/models/poco/${localImage}` : '';

            if (!localImage) {
                console.warn(`Image NOT FOUND for ${name}`);
            }

            if (variants.length === 0) {
                continue;
            }

            for (const v of variants) {
                const price = v.MaximumValue || 0;
                let variantName = v.Name || "Base";
                tsvContent += `Poco\t${name}\t${variantName}\t${price}\t${imagePath}\n`;
            }
        } catch (e) {
            console.error(`Error ${name}: ${e.message}`);
        }
    }

    fs.writeFileSync(outputTsv, tsvContent);
    console.log(`Saved ${outputTsv}`);
}

scrape();
