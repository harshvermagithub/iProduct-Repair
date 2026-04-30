const fs = require('fs');
const path = require('path');
const https = require('https');

const modelNames = [
    "Realme P4 Power 5G",
    "Realme C73 5G",
    "Realme C85 5G",
    "Realme Narzo 90x 5G",
    "Realme Narzo 90 5G",
    "Realme 16 Pro Plus 5G",
    "Realme 16 Pro 5G",
    "Realme Narzo 80 Lite 5G",
    "Realme P4x 5G",
    "Realme 15X 5G",
    "Realme GT 8 Pro",
    "Realme C71",
    "Realme P4 5G",
    "Realme P4 Pro 5G",
    "Realme Narzo 80 Lite",
    "Realme P3 Lite 5G",
    "Realme 14T 5G",
    "Realme 15T",
    "Realme 15 Pro 5G",
    "Realme 15 5G",
    "Realme Narzo 80X 5G",
    "Realme Narzo 80 Pro 5G",
    "Realme C75 5G",
    "Realme GT 7",
    "Realme GT 7T",
    "Realme 14 Pro Lite 5G",
    "Realme P3X 5G",
    "Realme P3 Pro 5G",
    "Realme P3 Ultra 5G",
    "Realme P3 5G",
    "Realme GT 7 Pro 5G",
    "Realme 14 Pro Plus 5G",
    "Realme 14X 5G",
    "Realme 14 Pro 5G",
    "Realme P1 Speed 5G",
    "Realme P2 Pro 5G",
    "Realme Narzo 70 Turbo 5G",
    "Realme C63 5G",
    "Realme C61",
    "Realme 13 5G",
    "Realme 13 Plus 5G",
    "Realme Narzo N65 5G",
    "Realme Narzo N63",
    "Realme GT 6",
    "Realme GT 6T",
    "Realme 12 Plus 5G",
    "Realme Narzo 70 pro 5G",
    "Realme C65 5G",
    "Realme P1 Pro 5G",
    "Realme P1 5G",
    "Realme Narzo 70X 5G",
    "Realme 12",
    "Realme Narzo 70 5G",
    "Realme 12 Pro Plus",
    "Realme 12X",
    "Realme 12 Pro 5G",
    "Realme NARZO N61",
    "Realme C63",
    "Realme 13 Pro 5G",
    "Realme 13 Pro Plus 5G",
    "Realme Narzo 60X",
    "Realme 11x 5G",
    "Realme 11 5G",
    "Realme C53",
    "Realme Narzo 60 Pro 5G",
    "Realme Narzo 60 5G",
    "Realme C67 5G",
    "Realme C51",
    "Realme 11 Pro Plus 5G",
    "Realme 11 Pro 5G",
    "Realme Narzo N53",
    "Realme Narzo N55",
    "Realme C55",
    "Realme Gt Neo 3T",
    "Realme Narzo 50i Prime",
    "Realme 9i 5G",
    "REALME C33",
    "REALME C30S",
    "Realme Narzo 50A Prime",
    "Realme Narzo 50 Pro 5G",
    "Realme Narzo 50 5G",
    "Realme 10 Pro Plus 5G",
    "Realme 10 Pro 5G",
    "Realme 10",
    "Realme Gt Neo 3 150W",
    "realme 9 5G",
    "realme 9 5G Speed Edition",
    "realme GT 2",
    "realme GT Neo 3",
    "realme GT 2 Pro",
    "Realme C31",
    "Realme C30",
    "Realme 9 Pro Plus 5G",
    "Realme 9 Pro 5G",
    "Realme 9i",
    "Realme 8s 5G",
    "Realme Narzo 50",
    "Realme C35",
    "Realme GT Neo 2",
    "Realme GT Master Edition",
    "Realme GT 5G",
    "Realme 8i",
    "Realme 8 5G",
    "Realme 8 Pro",
    "Realme 8",
    "Realme 7i",
    "Realme 7",
    "Realme 7 Pro",
    "Realme Narzo 50i",
    "Realme Narzo 50A",
    "Realme Narzo 30 5G",
    "Realme Narzo 30",
    "Realme Narzo 30 Pro 5G",
    "Realme Narzo 30A",
    "Realme Narzo 20A",
    "Realme Narzo 20",
    "Realme Narzo 20 Pro",
    "Realme Narzo 10A",
    "Realme Narzo 10",
    "Realme U 1",
    "Realme X7 Max 5G",
    "Realme X7 Pro",
    "Realme X7",
    "Realme X3 SuperZoom",
    "Realme X3",
    "Realme X50 Pro",
    "Realme X2",
    "Realme X2 Pro",
    "Realme XT",
    "Realme X",
    "Realme 6i",
    "Realme 6 Pro",
    "Realme 6",
    "Realme 5i",
    "Realme 5s",
    "Realme 5 Pro",
    "Realme 5",
    "Realme 3i",
    "Realme 3 Pro",
    "Realme 3",
    "Realme C25Y",
    "Realme C21Y",
    "Realme C11 2021",
    "Realme C25s",
    "Realme C25",
    "Realme C20",
    "Realme C21",
    "Realme C15 Qualcomm Edition",
    "Realme C15",
    "Realme C12",
    "Realme C11",
    "Realme C3",
    "Realme C2",
    "Realme C1",
    "Realme C1 2019",
    "Realme 1",
    "Realme 2",
    "Realme 2 Pro"
];

const buildId = '8PllrAnLvFbw-iTwWuQnu';
const imageDir = path.join(__dirname, '../imgs/Realme');
const outputTsv = path.join(__dirname, 'realme_data.tsv');

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
    // Strip brand prefixes (Realme)
    // Strip extension

    const clean = (s) => s.toLowerCase()
        .replace(/\.png|\.jpeg|\.jpg|\.webp/g, '')
        .replace(/[^a-z0-9]/g, '')
        .replace(/realme/g, '');

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
        // "Realme GT 6" -> "realme-gt-6"
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        const url = `https://www.dofy.in/_next/data/${buildId}/in-en/india/sell-old-phone/realme/${slug}.json`;

        console.log(`Scraping ${name} (${slug})...`);

        try {
            const data = await fetchJson(url);
            await new Promise(r => setTimeout(r, 100));

            let variants = [];
            if (data && data.pageProps && data.pageProps.selectVariant) {
                variants = data.pageProps.selectVariant;
            } else {
                console.warn(`No variants object for ${name}.`);
            }

            const localImage = findExampleImage(name);
            const imagePath = localImage ? `/models/realme/${localImage}` : '';

            if (!localImage) {
                console.warn(`Image NOT FOUND for ${name}`);
            }

            if (variants.length === 0) {
                // Skip
                continue;
            }

            for (const v of variants) {
                const price = v.MaximumValue || 0;
                let variantName = v.Name || "Base";
                tsvContent += `Realme\t${name}\t${variantName}\t${price}\t${imagePath}\n`;
            }
        } catch (e) {
            console.error(`Error ${name}: ${e.message}`);
        }
    }

    fs.writeFileSync(outputTsv, tsvContent);
    console.log(`Saved ${outputTsv}`);
}

scrape();
