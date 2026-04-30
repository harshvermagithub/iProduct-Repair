const https = require('https');

function fetchJson(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve(data);
            });
        }).on('error', reject);
    });
}

async function getTabletBrands() {
    const html = await fetchJson('https://www.dofy.in/in-en/india/sell-old-tablet');
    const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
    if (match) {
        const data = JSON.parse(match[1]);
        if (data.props && data.props.pageProps && data.props.pageProps.brands) {
            console.log("Found brands:");
            console.log(data.props.pageProps.brands.map(b => b.Name));
        } else {
            console.log("Brands not found in parsed data", data.props.pageProps);
        }
    } else {
        console.log("__NEXT_DATA__ not found");
    }
}
getTabletBrands();
