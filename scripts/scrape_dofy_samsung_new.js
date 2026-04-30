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

async function run() {
    const html = await fetchJson('https://www.dofy.in/in-en/india/sell-old-phone/samsung');

    // We expect HTML
    const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
    if (match) {
        const data = JSON.parse(match[1]);
        const buildId = data.buildId;
        console.log("buildId:", buildId);

        fs.writeFileSync('temp_samsung.json', JSON.stringify(data.props.pageProps, null, 2));
        console.log('Saved props to temp_samsung.json');

        let models = data.props.pageProps.selectModel;
        console.log(`Found ${models.length} models`);

        // Let's print the first 50 model names to see if S23 Ultra is there
        models.slice(0, 50).forEach(m => console.log(m.Name));
    } else {
        console.log("No NEXT DATA");
    }
}
run();
