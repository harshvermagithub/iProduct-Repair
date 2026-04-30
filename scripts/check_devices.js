const https = require('https');

function fetchJson(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => {
                data += chunk;
            });
            res.on('end', () => {
                resolve(data);
            });
        }).on('error', reject);
    });
}

async function check() {
    const html = await fetchJson('https://www.dofy.in/in-en/india/sell-old-device');
    const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
    if (match) {
        const data = JSON.parse(match[1]);
        console.log("Next data available keys:", Object.keys(data.props.pageProps));
        if (data.props.pageProps.categories || data.props.pageProps.deviceTypes) {
            console.log(data.props.pageProps.categories || data.props.pageProps.deviceTypes);
        } else {
            console.log(JSON.stringify(data.props.pageProps).substring(0, 1000));
        }
    } else {
        console.log("No NEXT_DATA found!");
    }
}
check();
