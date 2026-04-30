const https = require('https');
const fs = require('fs');

const buildId = '8PllrAnLvFbw-iTwWuQnu'; // Assuming valid for now
const modelSlug = 'Google_Pixel_9_Pro';
const url = `https://www.dofy.in/_next/data/${buildId}/in-en/india/sell-old-phone/google-pixel/${modelSlug}.json`;

https.get(url, (res) => {
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
        try {
            const data = JSON.parse(rawData);
            fs.writeFileSync('scripts/google_sample.json', JSON.stringify(data, null, 2));
            console.log('Saved to scripts/google_sample.json');
        } catch (e) {
            console.error('Error parsing JSON:', e);
        }
    });
}).on('error', (e) => {
    console.error(`Got error: ${e.message}`);
});
