const fs = require('fs');
const path = require('path');
const https = require('https');

const buildId = '8PllrAnLvFbw-iTwWuQnu';
const outputTsv = path.join(__dirname, 'apple_tablet_data.tsv');

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

async function scrape() {
    const tempJson = JSON.parse(fs.readFileSync('temp.json', 'utf8'));
    const models = tempJson.selectModel;

    let tsvContent = "Brand\tModel\tVariant\tPrice\n";

    for (const model of models) {
        const name = model.Name;
        // slug generation: usually lowercase, replace non alphanumeric to '-'
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        const url = `https://www.dofy.in/_next/data/${buildId}/in-en/india/sell-old-tablet/apple/${slug}.json`;

        console.log(`Scraping ${name} (${slug})...`);

        try {
            const data = await fetchJson(url);
            await new Promise(r => setTimeout(r, 100)); // Be nice

            let variants = [];
            if (data && data.pageProps && data.pageProps.selectVariant) {
                variants = data.pageProps.selectVariant;
            } else {
                console.warn(`No variants object for ${name}. (slug: ${slug})`);
                continue;
            }

            for (const v of variants) {
                const price = v.MaximumValue || 0;
                let variantName = v.Name || "Base";
                tsvContent += `Apple\t${name}\t${variantName}\t${price}\n`;
            }
        } catch (e) {
            console.error(`Error ${name}: ${e.message}`);
        }
    }

    fs.writeFileSync(outputTsv, tsvContent);
    console.log(`Saved ${outputTsv}`);
}

scrape();
