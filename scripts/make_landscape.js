const sharp = require('sharp');
const path = require('path');

async function processImage() {
    try {
        const originalPath = process.argv[2];
        const outputPath = path.join(process.cwd(), 'public', 'ramadan_landscape_proper.png');

        // Let's get the edge color from the top left corner to use for extending.
        const image = sharp(originalPath);
        const metadata = await image.metadata();
        const buffer = await image.raw().toBuffer();

        // top left pixel
        const r = buffer[0];
        const g = buffer[1];
        const b = buffer[2];
        // 16:9 of 1024 is 1820. 1820 - 1024 = 796. -> 398 left, 398 right

        await sharp(originalPath)
            .extend({
                top: 0,
                bottom: 0,
                left: 398,
                right: 398,
                background: { r, g, b, alpha: 1 }
            })
            .toFile(outputPath);

        console.log('Successfully created a true 16:9 landscape image: public/ramadan_landscape_proper.png');
    } catch (e) {
        console.log('Error:', e);
    }
}

processImage();
