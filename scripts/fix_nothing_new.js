const puppeteer = require('puppeteer');
const fs = require('fs');
const https = require('https');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function downloadImage(url, dest) {
    return new Promise((resolve, reject) => {
        let file = fs.createWriteStream(dest);
        let request = https.get(url, function (response) {
            response.pipe(file);
            file.on('finish', function () {
                file.close(resolve);
            });
        }).on('error', function (err) {
            fs.unlink(dest, () => reject(err));
        });
    });
}

function standardizeName(name) {
    // Nothing Phone (1) -> Nothing Phone 1
    let s = name.replace(/\((\d+[a-zA-Z\+]*)\)/g, '$1');
    return s.trim();
}

const priorities = [
    'CMF Phone 1',
    'Nothing Phone 1',
    'Nothing Phone 2a',
    'Nothing Phone 2a Plus',
    'Nothing Phone 2',
    'CMF Phone 2',
    'CMF Phone 2 Pro',
    'Nothing Phone 3a Lite',
    'Nothing Phone 3a',
    'Nothing Phone 3a Pro',
    'Nothing Phone 3',
    'Nothing Phone 4a',
    'Nothing Phone 4a Pro'
];

async function main() {
    console.log("Fetching Nothing models...");
    const models = await prisma.model.findMany({
        where: { brandId: 'nothing' },
        include: { variants: true }
    });

    const groups = {};
    for (const m of models) {
        const std = standardizeName(m.name);
        if (!groups[std]) groups[std] = [];
        groups[std].push(m);
    }

    console.log("Merging duplicate models...");
    for (const [name, duplicates] of Object.entries(groups)) {
        if (duplicates.length > 1) {
            console.log(`Merging ${name}...`);
            // Sort to keep the one that has an image, or lowest priority
            duplicates.sort((a, b) => (a.img && a.img !== '/generic_phone.png' ? -1 : 1));
            const primary = duplicates[0];
            const toDelete = duplicates.slice(1);

            for (const m of toDelete) {
                // Move variants to primary
                for (const v of m.variants) {
                    await prisma.variant.update({
                        where: { id: v.id },
                        data: { modelId: primary.id }
                    });
                }
                // Delete duplicate model
                await prisma.model.delete({ where: { id: m.id } });
            }
        }

        // Update name and priority
        const existing = await prisma.model.findFirst({
            where: { id: groups[name][0].id }
        });

        const prioIndex = priorities.indexOf(name);
        let score = prioIndex !== -1 ? (prioIndex + 1) * 10 : 999;

        await prisma.model.update({
            where: { id: existing.id },
            data: {
                name: name,
                priority: score
            }
        });
    }

    // Now find any missing images for Nothing models
    const updatedModels = await prisma.model.findMany({ where: { brandId: 'nothing' } });

    console.log("Launching Puppeteer to fetch missing images (e.g. CMF Phone)...");
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    for (const model of updatedModels) {
        if (!model.img || model.img === '/generic_phone.png') {
            const fileName = model.name.replace(/[^a-zA-Z0-9]+/g, '_') + '.png';
            const imgPath = '/models/nothing/' + fileName;
            const absolutePath = path.join(__dirname, '../public', imgPath);

            console.log(`Missing image for ${model.name}. Searching web...`);

            // Go to google images
            const query = encodeURIComponent(`"${model.name}" smartphone transparent png`);
            await page.goto(`https://www.google.com/search?tbm=isch&q=${query}`, { waitUntil: 'domcontentloaded' });

            // Wait for images to load
            await page.waitForSelector('img');

            // Extract the first good image
            const imgUrl = await page.evaluate(() => {
                const imgs = document.querySelectorAll('img');
                for (let img of imgs) {
                    if (img.src && img.src.startsWith('http') && img.width > 50) {
                        return img.src;
                    }
                }
                return null;
            });

            if (imgUrl) {
                console.log(`Found image: ${imgUrl.substring(0, 30)}... Downloading...`);
                try {
                    await downloadImage(imgUrl, absolutePath);
                    await prisma.model.update({
                        where: { id: model.id },
                        data: { img: imgPath }
                    });
                    console.log(`Success! Fixed image for ${model.name}`);
                } catch (e) {
                    console.error("Failed to download", e.message);
                }
            } else {
                console.log(`Could not find a valid image for ${model.name}`);
            }
        }
    }

    await browser.close();
    console.log("Done fixing Nothing models!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
