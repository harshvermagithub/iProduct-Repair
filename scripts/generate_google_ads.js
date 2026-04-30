const sharp = require('sharp');
const fs = require('fs');

async function createAds() {
    try {
        console.log('Generating ad_landscape.png (1.91:1)...');
        // Original final_poster is 1024x1024.
        // 1.91:1 means Width = Height * 1.91 = 1024 * 1.91 = 1955.84 (we use 1956)
        // With extend, we add equal left and right padding.
        // 1956 - 1024 = 932 -> 466 left, 466 right.
        await sharp('public/final_poster.png')
            .extend({
                top: 0,
                bottom: 0,
                left: 466,
                right: 466,
                background: { r: 3, g: 21, b: 31, alpha: 1 }
            })
            .resize(1200, 628) // Final Google standard resize
            .toFile('public/ad_landscape.png');

        console.log('Generating ad_square.png (1:1)...');
        // We'll just resize it slightly to standard 1080x1080 sizes Google likes
        await sharp('public/final_poster.png')
            .resize(1080, 1080)
            .toFile('public/ad_square.png');

        console.log('Generating ad_logo_square.png (1:1)...');
        // Let's use logo_final_v3.png or if it has transparency, add a background just in case,
        // but Google allows transparent PNGs. We'll just shrink it to 512x512
        await sharp('public/logo_final_v3.png')
            .resize(512, 512, {
                fit: 'contain',
                background: { r: 255, g: 255, b: 255, alpha: 0 }
            })
            .toFile('public/ad_logo_square.png');

        console.log('All images generated successfully!');
    } catch (err) {
        console.error('Error generating images:', err);
    }
}

createAds();
