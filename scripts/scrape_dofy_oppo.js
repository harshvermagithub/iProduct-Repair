const fs = require('fs');
const path = require('path');
const https = require('https');

const modelNames = [
    "Oppo K14x 5G", "Oppo A6 Pro 5G", "Oppo A6x 5G", "Oppo A6x", "Oppo A6 5G", "Oppo A5x", "Oppo Reno 15C", "Oppo Reno 15 Pro 5G", "Oppo Reno 15 Pro Mini 5G", "Oppo Reno 15 5G", "Oppo Find X9 Pro", "Oppo Find X9", "Oppo F31 5G", "Oppo K13 Turbo 5G", "Oppo K13 Turbo Pro 5G", "Oppo F31 Pro 5G", "Oppo F31 Pro Plus 5G", "Oppo A5 5G", "Oppo K13x 5G", "Oppo Reno 14 5G", "Oppo Reno 14 Pro 5G", "Oppo A5 Pro 5G", "Oppo A5x 5G", "Oppo K13", "OPPO F29 Pro 5G", "Oppo F29 5G", "Oppo Reno 13 Pro 5G", "Oppo Reno 13 5G", "Oppo Find X8 Pro", "Oppo Find X8", "Oppo A3x 4G", "Oppo F27 5G", "Oppo A3 5G", "Oppo A3 Pro 5G", "Oppo F27 Pro Plus 5G", "Oppo F25 Pro 5G", "OPPO Reno 11 Pro", "OPPO Reno 11", "Oppo K12x 5G", "Oppo A3x 5G", "Oppo Reno12 Pro 5G", "Oppo Reno12 5G", "Oppo A59 5G", "Oppo Find N3 Flip", "Oppo A78 4G", "Oppo A79 5G", "Oppo A18", "Oppo A38", "Oppo Reno 10 Pro Plus", "Oppo Reno 10 Pro", "Oppo Reno 10", "Oppo A58 4G", "Oppo F23", "Oppo Find N2 Flip", "Oppo Reno 8T 5G", "Oppo A78 5G", "Oppo A77 2022", "Oppo A17", "Oppo A17K", "Oppo A77S", "Oppo F21S Pro 5G", "Oppo F21S Pro 4G", "Oppo Reno 8 Pro 5G", "Oppo Reno 8 5G", "Oppo A16E", "Oppo A16K", "Oppo A76", "Oppo A96", "Oppo F21 Pro 5G", "Oppo F21 Pro", "Oppo Reno 7 5G", "Oppo Reno 7 Pro 5G", "Oppo K10 5G", "Oppo K10", "Oppo A57 2022", "Oppo Find X2", "Oppo Find X", "Oppo Reno6 Pro 5G", "Oppo Reno5 Pro 5G", "Oppo Reno 2", "Oppo Reno6 5G", "Oppo Reno4 Pro", "Oppo Reno3 Pro", "Oppo Reno2 F", "Oppo Reno 2Z", "Oppo Reno 10X Zoom", "Oppo Reno", "Oppo K3", "Oppo K1", "Oppo A5 2020", "Oppo A1K", "Oppo A33", "Oppo A16", "Oppo A55", "Oppo A74 5G", "Oppo A53S 5G", "Oppo A54", "Oppo A15S", "Oppo A15", "Oppo A33 2020", "Oppo A53", "Oppo A11K", "Oppo A52", "Oppo A12", "Oppo A31", "Oppo A9 2020", "Oppo A9", "Oppo A3S", "Oppo A7", "Oppo R17", "Oppo R17 Pro", "Oppo F11 Pro Avenger Edition", "Oppo F19S", "Oppo F19", "Oppo F19 Pro Plus 5G", "Oppo F19 Pro", "Oppo F17", "Oppo F17 Pro", "Oppo F15", "Oppo F11", "Oppo F11 Pro", "Oppo F9", "Oppo F9 Pro"
];

const buildId = '8PllrAnLvFbw-iTwWuQnu';
const imageDir = path.join(__dirname, '../imgs/Oppo');
const outputTsv = path.join(__dirname, 'oppo_data.tsv');

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
    // Normalization that handles .png.jpeg and other quirks
    const normalize = (s) => s.toLowerCase()
        .replace(/\.png|\.jpeg|\.jpg/g, '') // Must replace extension first
        .replace(/[^a-z0-9]/g, '')
        .replace(/oppo/g, ''); // Remove all upp/lower "oppo"

    const target = normalize(modelName);

    for (const file of imageFiles) {
        if (file.startsWith('.')) continue; // skip .DS_Store

        // Use full filename to ensure normalization handles extensions
        const fName = normalize(file);

        if (fName === target) return file;
    }

    return null;
}

async function scrape() {
    let tsvContent = "Brand\tModel\tVariant\tPrice\tImage\n";

    for (const name of modelNames) {
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        const url = `https://www.dofy.in/_next/data/${buildId}/in-en/india/sell-old-phone/oppo/${slug}.json`;

        console.log(`Scraping ${name} (${slug})...`);

        try {
            const data = await fetchJson(url);
            // Wait for 100ms
            await new Promise(r => setTimeout(r, 100));

            let variants = [];
            if (data && data.pageProps && data.pageProps.selectVariant) {
                variants = data.pageProps.selectVariant;
            } else {
                console.warn(`No variants object for ${name} at ${url}. Checking root data might be needed.`);
            }

            const localImage = findExampleImage(name);
            const imagePath = localImage ? `/models/oppo/${localImage}` : '';

            if (!localImage) {
                console.warn(`Image NOT FOUND for ${name}`);
            }

            if (variants.length === 0) {
                console.warn(`No variants found for ${name}`);
                continue;
            }

            for (const v of variants) {
                const price = v.MaximumValue || 0;
                let variantName = v.Name || "Base";
                tsvContent += `Oppo\t${name}\t${variantName}\t${price}\t${imagePath}\n`;
            }
        } catch (e) {
            console.error(`Error ${name}: ${e.message}`);
        }
    }

    fs.writeFileSync(outputTsv, tsvContent);
    console.log(`Saved ${outputTsv}`);
}

scrape();
