const sharp = require('sharp');
const path = require('path');

async function processImage() {
    try {
        const originalPath = process.argv[2]; // Path to the 1024x1024 raw 1:1 image
        const outputPath = path.join(process.cwd(), 'public', 'ad_square_standard.png');

        // Since the generated image is already 1:1 (1024x1024), we just resize to standard 1080x1080
        await sharp(originalPath)
            .resize(1080, 1080)
            .toFile(outputPath);

        console.log('Successfully created standard square ad: public/ad_square_standard.png');

        // Just in case they wanted the square logo again, it was already generated in public/ad_logo_square.png 
        // We'll regenerate it just to be sure.
        const logoPath = path.join(process.cwd(), 'public', 'logo_final_v3.png');
        const logoOutputPath = path.join(process.cwd(), 'public', 'ad_logo_square_standard.png');
        if (require('fs').existsSync(logoPath)) {
            await sharp(logoPath)
                .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
                .toFile(logoOutputPath);
            console.log('Successfully created square logo: public/ad_logo_square_standard.png');
        }

    } catch (e) {
        console.log('Error:', e);
    }
}

processImage();
