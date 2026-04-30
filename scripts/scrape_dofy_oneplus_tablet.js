const https = require('https');
const fs = require('fs');

function fetchJson(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    try { resolve(data); } catch (ex) { resolve(null); }
                }
            });
        }).on('error', reject);
    });
}

const buildId = '8PllrAnLvFbw-iTwWuQnu'; // Assuming this is still the build ID
const brand = 'oneplus';

async function scrapeTablets() {
    const html = await fetchJson(`https://www.dofy.in/in-en/india/sell-old-tablet/${brand}`);
    const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
    let models = [];

    if (match) {
        const data = JSON.parse(match[1]);
        if (data.props && data.props.pageProps && data.props.pageProps.selectModel) {
            models = data.props.pageProps.selectModel;
        }
    } else {
        console.error("No NEXT_DATA found!");
        return;
    }

    console.log(`Found ${models.length} tablet models. Let's fetch their pricing...`);
    let tsv = "Brand\tModel\tVariant\tPrice\tImage\n";

    for (const m of models) {
        const name = m.Name;
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        const url = `https://www.dofy.in/_next/data/${buildId}/in-en/india/sell-old-tablet/${brand}/${slug}.json`;

        console.log(`Scraping ${name}...`);
        try {
            const dataStr = await fetchJson(url);
            let data = typeof dataStr === 'string' ? JSON.parse(dataStr) : dataStr;
            await new Promise(r => setTimeout(r, 100));

            let variants = [];
            if (data && data.pageProps && data.pageProps.selectVariant) {
                variants = data.pageProps.selectVariant;
            }

            const imgPath = m.ThumbnailPath ? `/models/oneplus-tablet/${m.ThumbnailPath.split('/').pop()}` : '';

            if (variants.length === 0) continue;

            for (const v of variants) {
                const price = v.MaximumValue || 0;
                let variantName = v.Name || "Base";
                tsv += `OnePlus\t${name}\t${variantName}\t${price}\t${imgPath}\n`;
            }

        } catch (e) {
            console.error(`Error with ${name}`);
        }
    }

    fs.writeFileSync('oneplus_tablets.tsv', tsv);
    console.log("Written to oneplus_tablets.tsv");
}

scrapeTablets();
