const fs = require('fs');
const path = require('path');
const https = require('https');

const modelNames = [
    "Redmi 10",
    "Redmi 10 Power",
    "Redmi 10 Prime",
    "Redmi 10 Prime 2022",
    "Redmi 10A",
    "Redmi 10A Sport",
    "Redmi 11 Prime",
    "Redmi 11 Prime 5G",
    "Redmi 12 4G",
    "Redmi 12 5G",
    "Redmi 12C",
    "Redmi 13 5G",
    "Redmi 13C",
    "Redmi 13C 5G",
    "Redmi 14C 5G",
    "Redmi 15 5G",
    "Redmi 15C 5G",
    "Redmi 6",
    "Redmi 6 Pro",
    "Redmi 6A",
    "Redmi 7",
    "Redmi 7A",
    "Redmi 8",
    "Redmi 8A",
    "Redmi 8A Dual",
    "Redmi 9",
    "Redmi 9 Activ",
    "Redmi 9 Prime",
    "Redmi 9A",
    "Redmi 9i",
    "Redmi A1 2022",
    "Redmi A1 Plus",
    "Redmi A2",
    "Redmi A2 2023",
    "Redmi A2 Plus",
    "Redmi A3",
    "Redmi A3X",
    "Redmi A4 5G",
    "Redmi A5",
    "Redmi Go",
    "Redmi K20",
    "Redmi K20 Pro",
    "Redmi K50i",
    "Redmi Note 10",
    "Redmi Note 10 Lite",
    "Redmi Note 10 Pro",
    "Redmi Note 10 Pro Max",
    "Redmi Note 10S",
    "Redmi Note 10T 5G",
    "Redmi Note 11",
    "Redmi Note 11 Pro",
    "Redmi Note 11 Pro Plus 5G",
    "Redmi Note 11 Se",
    "Redmi Note 11S",
    "Redmi Note 11T 5G",
    "Redmi Note 12 4G",
    "Redmi Note 12 5G",
    "Redmi Note 12 Pro 5G",
    "Redmi Note 12 Pro Plus 5G",
    "Redmi Note 13 5G",
    "Redmi Note 13 Pro 5G",
    "Redmi Note 13 Pro Plus",
    "Redmi Note 14 5G",
    "Redmi Note 14 Pro 5G",
    "Redmi Note 14 Pro Plus 5G",
    "Redmi Note 14 SE 5G",
    "Redmi Note 15 5G",
    "Redmi Note 15 Pro 5G",
    "Redmi Note 15 Pro Plus 5G",
    "Redmi Note 5",
    "Redmi Note 5 Pro",
    "Redmi Note 6 Pro",
    "Redmi Note 7",
    "Redmi Note 7 Pro",
    "Redmi Note 7S",
    "Redmi Note 8",
    "Redmi Note 8 Pro",
    "Redmi Note 9",
    "Redmi Note 9 Pro",
    "Redmi Note 9 Pro Max",
    "Redmi Y2",
    "Redmi Y3",
    "Xiaomi 11 Lite NE 5G",
    "Xiaomi 14 CIVI",
    "Xiaomi 15",
    "Xiaomi 15 Ultra",
    "Xiaomi Mi 10",
    "Xiaomi Mi 10T",
    "Xiaomi Mi 10T Pro",
    "Xiaomi Mi 10i",
    "Xiaomi Mi 11 Lite",
    "Xiaomi Mi 11 Ultra",
    "Xiaomi Mi 11T Pro 5G",
    "Xiaomi Mi 11X",
    "Xiaomi Mi 11X Pro",
    "Xiaomi Mi 11i 5G",
    "Xiaomi Mi 11i HyperCharge 5G",
    "Xiaomi Mi 12 Pro 5G",
    "Xiaomi Mi 13 Pro",
    "Xiaomi Mi 14",
    "Xiaomi Mi 14 Ultra",
    "Xiaomi Mi Black Shark 2"
];

const buildId = '8PllrAnLvFbw-iTwWuQnu';
const imageDir = path.join(__dirname, '../imgs/Xiaomi');
const outputTsv = path.join(__dirname, 'xiaomi_data.tsv');

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
    // Strip extension, and strip brand prefixes (xiaomi, redmi, mi)
    // "Redmi Note 14" -> "note14"
    // "Xiaomi Mi 14" -> "14"

    const clean = (s) => s.toLowerCase()
        .replace(/\.png|\.jpeg|\.jpg|\.webp/g, '')
        .replace(/[^a-z0-9]/g, '')
        .replace(/(xiaomi|redmi|mi)/g, ''); // Remove brands

    const target = clean(modelName);

    for (const file of imageFiles) {
        if (file.startsWith('.')) continue;

        const fName = clean(file);
        if (fName === target) return file;
    }

    // Fallback: Check if file contains target? 
    // e.g. "Redmi Note 13 Pro Plus" vs "Redmi_Note_13_Pro_Plus.png.jpeg"
    // Clean: "note13proplus" vs "note13proplus". Match.

    return null;
}

async function scrape() {
    let tsvContent = "Brand\tModel\tVariant\tPrice\tImage\n";

    for (const name of modelNames) {
        // Create slug
        // Xiaomi usually uses hyphens.
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        const url = `https://www.dofy.in/_next/data/${buildId}/in-en/india/sell-old-phone/xiaomi/${slug}.json`;

        console.log(`Scraping ${name} (${slug})...`);

        try {
            const data = await fetchJson(url);
            await new Promise(r => setTimeout(r, 100)); // Be nice

            let variants = [];
            if (data && data.pageProps && data.pageProps.selectVariant) {
                variants = data.pageProps.selectVariant;
            } else {
                // Try 'redmi' in URL if 'xiaomi' failed?
                // But scraping list came from 'xiaomi' page.
                // URL structure should be predictable.
                // Maybe slugs are tricky.
                console.warn(`No variants object for ${name}.`);
            }

            const localImage = findExampleImage(name);
            const imagePath = localImage ? `/models/xiaomi/${localImage}` : '';

            if (!localImage) {
                console.warn(`Image NOT FOUND for ${name}`);
            }

            if (variants.length === 0) {
                // Skip if no variants
                continue;
            }

            for (const v of variants) {
                const price = v.MaximumValue || 0;
                let variantName = v.Name || "Base";
                tsvContent += `Xiaomi\t${name}\t${variantName}\t${price}\t${imagePath}\n`;
            }
        } catch (e) {
            console.error(`Error ${name}: ${e.message}`);
        }
    }

    fs.writeFileSync(outputTsv, tsvContent);
    console.log(`Saved ${outputTsv}`);
}

scrape();
