const sharp = require('sharp');
const path = require('path');

async function processImage() {
    try {
        const originalPath = process.argv[2];
        const outputPath = path.join(process.cwd(), 'public', 'ad_landscape_standard.png');

        // Let's get the edge color from the top left corner to use for extending.
        const image = sharp(originalPath);
        const metadata = await image.metadata();
        const buffer = await image.raw().toBuffer();

        // top left pixel for the solid green background
        const r = buffer[0];
        const g = buffer[1];
        const b = buffer[2];

        // 16:9 of 1024 is 1820. 1.91:1 of 1024 is 1956. 
        // 1956 - 1024 = 932 -> 466 left, 466 right

        await sharp(originalPath)
            .extend({
                top: 0,
                bottom: 0,
                left: 466,
                right: 466,
                background: { r, g, b, alpha: 1 }
            })
            .resize(1200, 628) // strictly 1.91:1 standard Google display ad
            .toFile(outputPath);

        console.log('Successfully created a true 1.91:1 landscape image: public/ad_landscape_standard.png');
    } catch (e) {
        console.log('Error:', e);
    }
}

processImage();
