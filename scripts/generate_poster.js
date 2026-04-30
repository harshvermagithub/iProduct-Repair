const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function generatePoster() {
    try {
        const bannerPath = path.join(__dirname, '../imgs/poster/fonzkart_ad_v2.png');
        const iconPath = path.join(__dirname, '../public/logo_f.png'); // Using the clean F icon
        const outputPath = path.join(__dirname, '../public/final_poster.png');

        if (!fs.existsSync(bannerPath)) throw new Error('Banner not found: ' + bannerPath);
        if (!fs.existsSync(iconPath)) throw new Error('Icon not found: ' + iconPath);

        console.log(`Using Banner: ${bannerPath}`);
        console.log(`Using Icon: ${iconPath}`);

        const bannerMeta = await sharp(bannerPath).metadata();
        const margin = Math.round(bannerMeta.width * 0.05);

        // 1. Prepare Icon
        // Resize icon to height ~ 10% of banner height? Or based on width?
        // Let's make it significant. 80px wide? 
        // Banner width ~1000px?
        const iconWidth = Math.round(bannerMeta.width * 0.08);

        const iconBuffer = await sharp(iconPath)
            .resize({ width: iconWidth })
            .toBuffer();

        const iconMeta = await sharp(iconBuffer).metadata();

        // 2. Prepare Text "onzkart"
        // Calculate fontsize proportional to icon height
        const fontSize = Math.round(iconMeta.height * 0.75);
        const textSvg = `
    <svg width="${iconWidth * 4}" height="${iconMeta.height * 1.5}">
      <text x="10" y="${iconMeta.height * 0.8}" 
            font-family="Arial, sans-serif" 
            font-weight="bold" 
            font-size="${fontSize}" 
            fill="white">onzkart</text>
    </svg>
    `;
        const textBuffer = Buffer.from(textSvg);

        // 3. Create Patch to cover old text
        // Needs to cover Icon + Text area
        const patchWidth = Math.round(iconWidth * 5);
        const patchHeight = Math.round(iconMeta.height * 1.5);
        const patchColor = { r: 6, g: 78, b: 59, alpha: 1 }; // #064e3b

        const patchBuffer = await sharp({
            create: {
                width: patchWidth,
                height: patchHeight,
                channels: 4,
                background: patchColor
            }
        })
            .png()
            .toBuffer();

        // 4. Composite
        await sharp(bannerPath)
            .composite([
                {
                    input: patchBuffer,
                    top: margin - 20,
                    left: margin - 20
                },
                {
                    input: iconBuffer,
                    top: margin,
                    left: margin
                },
                {
                    input: textBuffer,
                    top: margin, // Align text with icon top visually (SVG text y handles baseline)
                    left: margin + iconWidth + 10 // Right of icon
                }
            ])
            .toFile(outputPath);

        console.log(`Poster generated successfully at: ${outputPath}`);

    } catch (error) {
        console.error('Error generating poster:', error);
        process.exit(1);
    }
}

generatePoster();
