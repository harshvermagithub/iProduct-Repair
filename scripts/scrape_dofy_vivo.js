const fs = require('fs');
const path = require('path');
const https = require('https');

const modelNames = [
    "Vivo X200T",
    "Vivo Y19s 5G",
    "Vivo X300 Pro",
    "Vivo X300",
    "Vivo V60e",
    "Vivo Y400 5G",
    "Vivo T4R 5G",
    "Vivo T4 Pro 5G",
    "Vivo Y31 Pro 5G",
    "Vivo Y31 5G",
    "Vivo V60 5G",
    "Vivo X Fold 5",
    "Vivo Y19 5G",
    "Vivo Y400 Pro 5G",
    "Vivo T4 Lite 5G",
    "Vivo X200 FE",
    "Vivo V50e 5G",
    "Vivo T4 Ultra",
    "Vivo Y39 5G",
    "Vivo T4 5G",
    "Vivo Y18t",
    "Vivo Y19e",
    "Vivo V50 5G",
    "Vivo T4x 5G",
    "Vivo Y29 5G",
    "Vivo X200 Pro 5G",
    "Vivo X200 5G",
    "Vivo Y300 Plus 5G",
    "Vivo Y300 5G",
    "Vivo V40e",
    "Vivo T3 Ultra 5G",
    "Vivo T3 Pro 5G",
    "Vivo X Fold 3 Pro",
    "Vivo Y200 Pro 5G",
    "Vivo Y58 5G",
    "Vivo V30 Pro 5G",
    "Vivo V30 5G",
    "Vivo Y200e 5G",
    "Vivo T3X 5G",
    "Vivo Y18e",
    "Vivo Y18",
    "Vivo V30e",
    "Vivo T3 5G",
    "Vivo V40 Pro 5G",
    "Vivo V40 5G",
    "Vivo T3 Lite 5G",
    "Vivo Y28s 5G",
    "Vivo Y28e 5G",
    "Vivo Y18i",
    "Vivo X100 Pro 5G",
    "Vivo X100 5G",
    "Vivo Y28 5G",
    "Vivo V29 Pro",
    "Vivo V29",
    "Vivo T2 Pro 5G",
    "Vivo V29e",
    "Vivo Y01A",
    "Vivo Y27",
    "Vivo Y36 4G",
    "Vivo Y17s",
    "Vivo Y200 5G",
    "Vivo Y02t",
    "Vivo Y100A",
    "Vivo T2X 5G",
    "Vivo T2 5G",
    "Vivo X90 Pro Plus 5G",
    "Vivo X90 Pro 5G",
    "Vivo X90 5G",
    "Vivo Y75 4G",
    "Vivo V27 Pro",
    "Vivo V27",
    "Vivo Y100",
    "Vivo Y56 5G",
    "Vivo Y35",
    "Vivo Y22 2022",
    "Vivo Y16",
    "Vivo V25",
    "Vivo V25 Pro",
    "Vivo T1X",
    "Vivo Y21G",
    "Vivo Y15s 2021",
    "Vivo Y33T",
    "Vivo Y15c",
    "Vivo V21e 5G",
    "Vivo X80 Pro",
    "Vivo X80",
    "Vivo T1 Pro",
    "Vivo T1",
    "Vivo Y01",
    "Vivo T1 5G",
    "Vivo NEX",
    "Vivo Y21a",
    "Vivo Y21e",
    "Vivo Y21T",
    "Vivo Y20T",
    "Vivo Y72 5G",
    "Vivo Y73",
    "Vivo Y75 5G",
    "Vivo Y3s 2021",
    "Vivo X70 Pro",
    "Vivo X60 Pro Plus",
    "Vivo X60 Pro",
    "Vivo X60",
    "Vivo X50 Pro",
    "Vivo X50",
    "Vivo X70 Pro Plus",
    "Vivo V20 2021",
    "Vivo V20 SE",
    "Vivo V20",
    "Vivo V23e 5G",
    "Vivo V23 Pro",
    "Vivo V23 5G",
    "Vivo V21 5G",
    "Vivo V20 Pro",
    "Vivo V19",
    "Vivo V17 Pro",
    "Vivo U20",
    "Vivo U10",
    "Vivo S1 Pro",
    "Vivo S1",
    "Vivo Z1x",
    "Vivo Z1 Pro",
    "Vivo Z10",
    "Vivo Y21 2021",
    "Vivo Y33s",
    "Vivo Y20G",
    "Vivo Y30",
    "Vivo Y11 2019",
    "Vivo Y19",
    "Vivo Y90",
    "Vivo Y12",
    "Vivo Y15 2019",
    "Vivo Y91i",
    "Vivo Y95",
    "Vivo Y12G",
    "Vivo Y53s",
    "Vivo Y1s",
    "Vivo Y12s",
    "Vivo Y31 2021",
    "Vivo Y20A",
    "Vivo Y51A",
    "Vivo Y51 2020",
    "Vivo Y20",
    "Vivo Y20i",
    "Vivo Y50",
    "Vivo Y17",
    "Vivo Y91",
    "Vivo Y93",
    "Vivo Y81",
    "Vivo X21",
    "Vivo V17",
    "Vivo V15",
    "Vivo V15 Pro",
    "Vivo V11",
    "Vivo V11 Pro"
];

const buildId = '8PllrAnLvFbw-iTwWuQnu';
const imageDir = path.join(__dirname, '../imgs/Vivo');
const outputTsv = path.join(__dirname, 'vivo_data.tsv');

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
    // Normalization rules:
    // Strip extension (png, jpg, jpeg, webp)
    // Strip 'vivo'
    // Keep numbers and letters
    const normalize = (s) => s.toLowerCase()
        .replace(/\.png|\.jpeg|\.jpg|\.webp/g, '') // Must replace extension first
        .replace(/[^a-z0-9]/g, '')
        .replace(/vivo/g, '');

    const target = normalize(modelName);

    for (const file of imageFiles) {
        if (file.startsWith('.')) continue;

        const fName = normalize(file);
        if (fName === target) return file;
    }

    return null;
}

async function scrape() {
    let tsvContent = "Brand\tModel\tVariant\tPrice\tImage\n";

    for (const name of modelNames) {
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        const url = `https://www.dofy.in/_next/data/${buildId}/in-en/india/sell-old-phone/vivo/${slug}.json`;

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
            const imagePath = localImage ? `/models/vivo/${localImage}` : '';

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
                tsvContent += `Vivo\t${name}\t${variantName}\t${price}\t${imagePath}\n`;
            }
        } catch (e) {
            console.error(`Error ${name}: ${e.message}`);
        }
    }

    fs.writeFileSync(outputTsv, tsvContent);
    console.log(`Saved ${outputTsv}`);
}

scrape();
