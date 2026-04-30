const fs = require('fs');
const path = require('path');
const https = require('https');

// Model list extracted from subagent
const models = [
    { "name": "Google Pixel 10 Pro Fold", "slug": "Google_pixel_10_Pro_Fold" },
    { "name": "Google Pixel 10", "slug": "Google_Pixel_10" },
    { "name": "Google Pixel 10 Pro XL", "slug": "Google_Pixel_10_Pro_XL" },
    { "name": "Google Pixel 10 Pro", "slug": "Google_Pixel_10_Pro" },
    { "name": "Google Pixel 9A", "slug": "Google_Pixel_9A" },
    { "name": "Google Pixel 9 Pro", "slug": "Google_Pixel_9_Pro" },
    { "name": "Google Pixel 9 Pro XL", "slug": "Google_Pixel_9_Pro_XL" },
    { "name": "Google Pixel 9", "slug": "Google_Pixel_9" },
    { "name": "Google Pixel 9 Pro Fold", "slug": "Google_Pixel_9_Pro_Fold" },
    { "name": "Google Pixel 8A", "slug": "Google_Pixel_8A" },
    { "name": "Google Pixel Fold Porcelain", "slug": "Google_Pixel_Fold_Porcelain" },
    { "name": "Google Pixel 8 Pro", "slug": "Google_Pixel_8_pro" },
    { "name": "Google Pixel 8", "slug": "Google_Pixel_8" },
    { "name": "Google Pixel 7A", "slug": "Google_Pixel_7A" },
    { "name": "Google Pixel 7 Pro", "slug": "Google_Pixel_7_Pro" },
    { "name": "Google Pixel 7", "slug": "Google_Pixel_7" },
    { "name": "Google Pixel 4 XL", "slug": "Google_Pixel_4_XL" },
    { "name": "Google Pixel 4", "slug": "Google_Pixel_4" },
    { "name": "Google Pixel 5 5G", "slug": "Google_Pixel_5_5G" },
    { "name": "Google Pixel 5A 5G", "slug": "Google_Pixel_5A_5G" },
    { "name": "Google Pixel 6 Pro 5G", "slug": "Google_Pixel_6_Pro_5G" },
    { "name": "Google Pixel 6 5G", "slug": "Google_Pixel_6_5G" },
    { "name": "Google Pixel 6A", "slug": "Google_Pixel_6A" },
    { "name": "Google Pixel 4A", "slug": "Google_Pixel_4A" }
];

const imageDir = path.join(__dirname, '../imgs/Google');
const outputTsv = path.join(__dirname, 'google_data.tsv');
const buildId = '8PllrAnLvFbw-iTwWuQnu';

let imageFiles = [];
try {
    imageFiles = fs.readdirSync(imageDir);
} catch (e) {
    console.error("Image dir not found:", e.message);
}

function findLocalImage(modelName) {
    if (!imageFiles.length) return null;

    // Normalize: lowercase, remove non-alphanumeric except maybe numbers
    // Remove "google", "pixel", "5g"
    const normalize = (s) => s.toLowerCase().replace(/google|pixel|5g|\s|-|_|\.png|\.jpeg|\.jpg/g, '');
    const target = normalize(modelName);

    // Exact Match
    for (const file of imageFiles) {
        if (file.startsWith('.')) continue; // skip .DS_Store
        const fName = normalize(path.parse(file).name);
        if (fName === target) return file;
    }

    // StartsWith (e.g. "Pixel 10 Pro XL" -> "10proxl" matches "10proxl"?)
    // But verify length to avoid prefix match like "10" matching "10pro"
    for (const file of imageFiles) {
        if (file.startsWith('.')) continue;
        const fName = normalize(path.parse(file).name);
        if (fName === target) return file;
    }

    // Contains?
    // "Google_Pixel_Fold_Porcelain.png" -> "foldporcelain"
    // Model "Google Pixel Fold Porcelain" -> "foldporcelain"
    // Match found.

    return null;
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
                    resolve(null); // Return null on parse error (HTML response likely)
                }
            });
        }).on('error', reject);
    });
}

async function scrape() {
    let tsvContent = "Brand\tModel\tVariant\tPrice\tImage\n";

    for (const model of models) {
        console.log(`Scraping ${model.name}...`);
        const url = `https://www.dofy.in/_next/data/${buildId}/in-en/india/sell-old-phone/google-pixel/${model.slug}.json`;

        try {
            const data = await fetchJson(url);
            if (!data || !data.pageProps) {
                console.error(`Failed to get data for ${model.name}`);
                continue;
            }

            const variants = data.pageProps.selectVariant || [];

            // Find Image
            let localImage = findLocalImage(model.name);
            if (!localImage) localImage = findLocalImage(model.slug);

            let imagePath = '';
            if (localImage) {
                imagePath = `/models/google/${localImage}`; // Will move file later
                // Verify existence later
            } else {
                console.warn(`Image NOT FOUND for ${model.name}`);
            }

            if (variants.length === 0) {
                console.log(`No variants found for ${model.name}`);
                continue;
            }

            for (const v of variants) {
                const price = v.MaximumValue || 0;
                let variantName = v.Name || "Base";
                // Sometimes Name is "128 GB". Sometimes "8 GB/128 GB".

                tsvContent += `Google\t${model.name}\t${variantName}\t${price}\t${imagePath}\n`;
            }

        } catch (e) {
            console.error(`Error scraping ${model.name}:`, e.message);
        }
    }

    fs.writeFileSync(outputTsv, tsvContent);
    console.log(`Saved to ${outputTsv}`);
}

scrape();
