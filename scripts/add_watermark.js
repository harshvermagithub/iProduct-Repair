const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const os = require('os');

async function main() {
    console.log('Watermarking Ramadan Image...');

    const downloadsDir = path.join(os.homedir(), 'Downloads');

    // Find files matching pattern
    const files = fs.readdirSync(downloadsDir)
        .filter(f => f.match(/^WhatsApp Image .*21\.58\.23\.jpeg$/i));

    let inputImageStr = '';
    if (files.length > 0) {
        inputImageStr = files[0];
    } else {
        // Fallback to latest
        const allFiles = fs.readdirSync(downloadsDir)
            .filter(f => f.toLowerCase().endsWith('.jpeg') || f.toLowerCase().endsWith('.png'))
            .map(f => ({ name: f, time: fs.statSync(path.join(downloadsDir, f)).mtime.getTime() }))
            .sort((a, b) => b.time - a.time);

        if (allFiles.length > 0) {
            inputImageStr = allFiles[0].name;
        } else {
            console.error('No image found.');
            return;
        }
    }

    const inputPath = path.join(downloadsDir, inputImageStr);
    console.log(`Using input: ${inputPath}`);

    const logoRelPath = '../imgs/logo_final_v3.png';
    const logoPath = path.resolve(__dirname, logoRelPath);
    const outputPath = path.resolve(__dirname, '../public/ramadan_branded.png');

    try {
        const bgMeta = await sharp(inputPath).metadata();

        // Scale logo to 20% width
        const width = Math.round(bgMeta.width * 0.2);
        const resizedLogoBuffer = await sharp(logoPath)
            .resize({ width: width })
            .toBuffer();

        const logoMeta = await sharp(resizedLogoBuffer).metadata();

        const left = 30;
        const top = bgMeta.height - logoMeta.height - 30;

        console.log(`Placing logo at ${left}, ${top} (Logo: ${logoMeta.width}x${logoMeta.height})`);

        await sharp(inputPath)
            .composite([{
                input: resizedLogoBuffer,
                top: top,
                left: left
            }])
            .toFile(outputPath);

        console.log(`Saved branded image to ${outputPath}`);
    } catch (e) {
        console.error(e);
    }
}

main();
