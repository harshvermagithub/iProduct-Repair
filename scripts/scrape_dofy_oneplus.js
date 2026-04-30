const fs = require('fs');
const path = require('path');

const models = [
    { name: "Oneplus 15R", slug: "oneplus-15r" },
    { name: "OnePlus 15", slug: "oneplus-15" },
    { name: "OnePlus Nord CE 5 5G", slug: "oneplus-nord-ce-5-5g" },
    { name: "OnePlus Nord 5", slug: "oneplus-nord-5" },
    { name: "Oneplus 13S", slug: "oneplus-13s" },
    { name: "OnePlus 13R", slug: "oneplus-13r" },
    { name: "OnePlus 13", slug: "oneplus-13" },
    { name: "OnePlus Nord CE 4 5G", slug: "oneplus-nord-ce-4-5g" },
    { name: "OnePlus 12R", slug: "oneplus-12r" },
    { name: "OnePlus Nord 4", slug: "oneplus-nord-4" },
    { name: "OnePlus Nord CE4 Lite 5G", slug: "oneplus-nord-ce4-lite-5g" },
    { name: "OnePlus 12", slug: "oneplus-12" },
    { name: "OnePlus Open", slug: "oneplus-open" },
    { name: "Oneplus Nord CE 3 5G", slug: "oneplus-nord-ce-3-5g" },
    { name: "Oneplus Nord 3 5G", slug: "oneplus-nord-3-5g" },
    { name: "OnePlus Nord N20 SE", slug: "oneplus-nord-n20-se" },
    { name: "Oneplus Nord CE 3 Lite 5G", slug: "oneplus-nord-ce-3-lite-5g" },
    { name: "OnePlus 11R 5G", slug: "oneplus-11r-5g" },
    { name: "OnePlus 11 5G", slug: "oneplus-11-5g" },
    { name: "Oneplus Nord 2T 5G", slug: "oneplus-nord-2t-5g" },
    { name: "OnePlus Nord CE 2 lite", slug: "oneplus-nord-ce-2-lite" },
    { name: "OnePlus Nord CE 2 5G", slug: "oneplus-nord-ce-2-5g" },
    { name: "OnePlus 10r 5G", slug: "oneplus-10r-5g" },
    { name: "OnePlus 10 Pro 5G", slug: "oneplus-10-pro-5g" },
    { name: "Oneplus 10T", slug: "oneplus-10t" },
    { name: "OnePlus 9", slug: "oneplus-9" },
    { name: "OnePlus 9RT 5G", slug: "oneplus-9rt-5g" },
    { name: "OnePlus 8T", slug: "oneplus-8t" },
    { name: "OnePlus Nord 2 5G", slug: "oneplus-nord-2-5g" },
    { name: "OnePlus Nord CE 5G", slug: "oneplus-nord-ce-5g" },
    { name: "OnePlus 9 Pro 5G", slug: "oneplus-9-pro-5g" },
    { name: "OnePlus 9R 5G", slug: "oneplus-9r-5g" },
    { name: "OnePlus Nord", slug: "oneplus-nord" },
    { name: "OnePlus 7T Pro McLaren Edition", slug: "oneplus-7t-pro-mclaren-edition" },
    { name: "OnePlus 8 Pro", slug: "oneplus-8-pro" },
    { name: "OnePlus 8", slug: "oneplus-8" },
    { name: "OnePlus 7T Pro", slug: "oneplus-7t-pro" },
    { name: "OnePlus 7T", slug: "oneplus-7t" },
    { name: "OnePlus 7 Pro", slug: "oneplus-7-pro" },
    { name: "OnePlus 7", slug: "oneplus-7" },
    { name: "OnePlus 6T McLaren", slug: "oneplus-6t-mclaren" },
    { name: "OnePlus 5", slug: "oneplus-5" },
    { name: "OnePlus 5T", slug: "oneplus-5t" },
    { name: "OnePlus 6", slug: "oneplus-6" },
    { name: "OnePlus 6T", slug: "oneplus-6t" }
];

const buildId = "8PllrAnLvFbw-iTwWuQnu";
const baseUrl = `https://www.dofy.in/_next/data/${buildId}/in-en/india/sell-old-phone/oneplus`;

// Local images
const imgDir = path.join(__dirname, '../imgs/Oneplus');
const localImages = fs.readdirSync(imgDir);

// Simple fuzzy matcher
function matchImage(modelName) {
    // Normalize model name: remove special chars, lowercase
    const nModel = modelName.toLowerCase().replace(/[^a-z0-9]/g, '');

    // Try to find exact match first (ignoring case and underscores)
    let bestMatch = null;
    let maxScore = 0;

    for (const img of localImages) {
        if (!img.endsWith('.png') && !img.endsWith('.jpg')) continue;
        const nImg = img.toLowerCase().replace(/[^a-z0-9]/g, '').replace('png', '').replace('jpg', '');

        if (nImg === nModel) return img;
        if (nImg.includes(nModel) || nModel.includes(nImg)) {
            // longer match is better
            const score = Math.min(nImg.length, nModel.length);
            if (score > maxScore) {
                maxScore = score;
                bestMatch = img;
            }
        }
    }
    return bestMatch || '';
}

async function scrape() {
    const output = [];
    console.log(`Starting scrape for ${models.length} models...`);

    for (const m of models) {
        const url = `${baseUrl}/${m.slug}.json`;
        try {
            console.log(`Fetching ${m.slug}...`);
            const res = await fetch(url);
            if (!res.ok) {
                console.error(`Failed to fetch ${m.slug}: ${res.status}`);
                continue;
            }
            const data = await res.json();
            const variants = data.pageProps?.selectVariant || [];

            const matchedImage = matchImage(m.name);
            const imagePath = matchedImage ? `/models/oneplus/${matchedImage}` : '';

            for (const v of variants) {
                output.push({
                    Brand: 'OnePlus',
                    Model: m.name,
                    Variant: v.Name,
                    Price: v.MaximumValue,
                    Image: imagePath
                });
            }
        } catch (error) {
            console.error(`Error processing ${m.slug}:`, error.message);
        }
        // polite delay
        await new Promise(r => setTimeout(r, 200));
    }

    // Convert to TSV string
    const tsvHeader = "Brand\tModel\tVariant\tPrice\tImage\n";
    const tsvBody = output.map(r => `${r.Brand}\t${r.Model}\t${r.Variant}\t${r.Price}\t${r.Image}`).join('\n');

    fs.writeFileSync(path.join(__dirname, 'oneplus_data.tsv'), tsvHeader + tsvBody);
    console.log(`Saved ${output.length} records to oneplus_data.tsv`);
}

scrape();
