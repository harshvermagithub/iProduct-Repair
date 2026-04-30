const fs = require('fs');
const path = require('path');
const https = require('https');

const modelNames = [
    "HMD Vibe 5G",
    "HMD Fusion",
    "Nokia HMD Skyline 5G",
    "Nokia HMD Crest Max 5G",
    "Nokia HMD Crest",
    "Nokia G42 5G",
    "Nokia C32",
    "Nokia C22",
    "Nokia C12 Pro",
    "Nokia C12",
    "Nokia X30 5G",
    "Nokia G11 Plus",
    "Nokia C31",
    "Nokia G60 5G",
    "Nokia C21 Plus",
    "Nokia XR20",
    "Nokia G21",
    "Nokia G10",
    "Nokia G20",
    "Nokia C30",
    "Nokia C01 Plus",
    "Nokia C20 Plus",
    "Nokia 9 PureView",
    "Nokia 4.2",
    "Nokia 7.2",
    "Nokia 6.2",
    "Nokia 6.1 Plus",
    "Nokia 5.4",
    "Nokia 5.3",
    "Nokia 5.1 Plus",
    "Nokia 3.4",
    "Nokia 3.2",
    "Nokia 3.1 Plus",
    "Nokia 2.4",
    "Nokia 2.3",
    "Nokia 2.2"
];

const buildId = '8PllrAnLvFbw-iTwWuQnu';
const imageDir = path.join(__dirname, '../imgs/Nokia');
const outputTsv = path.join(__dirname, 'nokia_data.tsv');

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
    // Strip brand prefixes (nokia, hmd)
    // Strip extension

    // Nokia HMD Skyline 5G -> "skyline5g" (if i strip nokia hmd)
    // Image: "Nokia_HMD_Skyline_5G.png" -> "skyline5g".
    // Match.

    const clean = (s) => s.toLowerCase()
        .replace(/\.png|\.jpeg|\.jpg|\.webp/g, '')
        .replace(/[^a-z0-9]/g, '')
        .replace(/nokia/g, '')
        .replace(/hmd/g, '');

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
        // "Nokia G42 5G" -> "nokia-g42-5g"
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        const url = `https://www.dofy.in/_next/data/${buildId}/in-en/india/sell-old-phone/nokia/${slug}.json`;

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
            const imagePath = localImage ? `/models/nokia/${localImage}` : '';

            if (!localImage) {
                console.warn(`Image NOT FOUND for ${name}`);
            }

            if (variants.length === 0) {
                continue;
            }

            for (const v of variants) {
                const price = v.MaximumValue || 0;
                let variantName = v.Name || "Base";
                tsvContent += `Nokia\t${name}\t${variantName}\t${price}\t${imagePath}\n`;
            }
        } catch (e) {
            console.error(`Error ${name}: ${e.message}`);
        }
    }

    fs.writeFileSync(outputTsv, tsvContent);
    console.log(`Saved ${outputTsv}`);
}

scrape();
