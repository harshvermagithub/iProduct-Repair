const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Only map exactly the display names from Temp JSON
const modelNames = [
    "Samsung Galaxy S23 FE 5G",
    "Samsung Galaxy S23 Ultra 5G",
    "Samsung Galaxy S23 Plus 5G",
    "Samsung Galaxy S23 5G"
];

const buildId = '8PllrAnLvFbw-iTwWuQnu'; // Need dynamic but assuming current build ID is same
const tempJsonPath = path.join(__dirname, '..', 'temp_samsung.json');

// Re-using same logic to find correct image
function findImage(modelInfo) {
    if (modelInfo && modelInfo.ThumbnailPath) {
        return `/models/samsung/${modelInfo.ThumbnailPath.split('/').pop()}`;
    }
    return null; // Fallback handled later
}

function calculatePriority(name) {
    // Basic priority just to slot them in correctly around S24 and S22
    // Lower number is higher priority.
    let priority = 800;
    const n = name.toLowerCase();

    if (n.includes('s23')) {
        priority = 760; // Just below S24 (750-760) and above S22 (770-780)
        if (n.includes('ultra')) priority -= 4; // 756
        else if (n.includes('plus')) priority -= 3; // 757
        else if (n.includes('fe')) priority -= 1; // 759
        else priority -= 2; // base 758
    }

    return priority;
}

// Function to fetch variant details from Dofy
function fetchJson(url) {
    const https = require('https');
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

async function scrapeMissing() {
    console.log("Adding missing Samsung S23 models back...");
    const tempJson = JSON.parse(fs.readFileSync(tempJsonPath, 'utf8'));

    for (const name of modelNames) {
        // Find inside temp_samsung
        const modelInfo = tempJson.selectModel.find(m => m.Name === name);
        if (!modelInfo) {
            console.error(`Could not find info for ${name}`);
            continue;
        }

        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        const url = `https://www.dofy.in/_next/data/${buildId}/in-en/india/sell-old-phone/samsung/${slug}.json`;

        console.log(`Scraping variants for ${name} (${slug})...`);

        let variants = [];
        try {
            const data = await fetchJson(url);
            await new Promise(r => setTimeout(r, 100)); // Be nice
            if (data && data.pageProps && data.pageProps.selectVariant) {
                variants = data.pageProps.selectVariant;
            } else {
                console.warn(`No variants found for ${name}`);
            }
        } catch (e) {
            console.error(`Error scraping ${name}: ${e.message}`);
        }

        if (variants.length === 0) continue;

        const imgPath = findImage(modelInfo) || `/models/samsung/Samsung_${slug.replace(/\-/g, '_')}.png`;
        let cleanName = name.replace(/^Samsung /i, '').replace(/ 5G$/i, '').trim();
        const priority = calculatePriority(cleanName);

        // Does it exist?
        let dbModel = await prisma.model.findFirst({
            where: {
                brandId: 'samsung',
                name: { equals: cleanName, mode: 'insensitive' },
                category: 'smartphone'
            }
        });

        if (!dbModel) {
            dbModel = await prisma.model.create({
                data: {
                    brandId: 'samsung',
                    category: 'smartphone',
                    name: cleanName,
                    img: imgPath,
                    priority: priority
                }
            });
            console.log(`Created model: ${cleanName}`);
        } else {
            console.log(`Model already exists, updating variants: ${cleanName}`);
            await prisma.variant.deleteMany({ where: { modelId: dbModel.id } });
        }

        for (const v of variants) {
            const price = v.MaximumValue || 0;
            const variantName = v.Name || "Base";

            await prisma.variant.create({
                data: {
                    modelId: dbModel.id,
                    name: variantName,
                    basePrice: price
                }
            });
        }
    }

    console.log("Done adding missing S23 models!");
}

scrapeMissing().finally(() => prisma.$disconnect());
