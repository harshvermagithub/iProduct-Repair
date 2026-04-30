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
            if (response.statusCode === 301 || response.statusCode === 302) {
                return downloadImage(response.headers.location, dest).then(resolve).catch(reject);
            }
            response.pipe(file);
            file.on('finish', function () {
                file.close(resolve);
            });
        }).on('error', function (err) {
            fs.unlink(dest, () => reject(err));
        });
    });
}

const priorities = [
    'Nothing Phone 1',
    'Nothing Phone 2',
    'Nothing Phone 2a',
    'Nothing Phone 2a Plus',
    'Nothing Phone 3',
    'CMF Phone 1',
    'Nothing Phone 3a',
    'Nothing Phone 3a Pro',
    'Nothing Phone 3a Lite',
    'CMF Phone 2',
    'CMF Phone 2 Pro',
    'Nothing Phone 4a',
    'Nothing Phone 4a Pro'
];

async function main() {
    console.log("Updating Priorities...");

    // First apply priorities
    for (const [index, pName] of priorities.entries()) {
        const priorityScore = (index + 1) * 10;
        await prisma.model.updateMany({
            where: { name: pName, brandId: 'nothing' },
            data: { priority: priorityScore }
        });
        console.log(`Set ${pName} to priority ${priorityScore}`);
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

            console.log(`Missing image for ${model.name}. Searching DuckDuckGo...`);

            try {
                // DuckDuckGo Image Search
                const query = encodeURIComponent(`${model.name} smartphone transparent png`);
                await page.goto(`https://duckduckgo.com/?q=${query}&iax=images&ia=images`, { waitUntil: 'networkidle2' });

                await new Promise(r => setTimeout(r, 2000));

                // Extract the first real image
                const imgUrl = await page.evaluate(() => {
                    // find images that look like actual results
                    const imgs = document.querySelectorAll('.tile--img__img');
                    for (let img of imgs) {
                        if (img.src && img.src.startsWith('http') && !img.src.includes('duckduckgo')) {
                            return img.src;
                        } else if (img.getAttribute('data-src')) {
                            let src = img.getAttribute('data-src');
                            if (src.startsWith('//')) src = 'https:' + src;
                            return src;
                        }
                    }
                    return null;
                });

                if (imgUrl) {
                    console.log(`Found image: ${imgUrl.substring(0, 30)}... Downloading...`);
                    await downloadImage(imgUrl, absolutePath);
                    await prisma.model.update({
                        where: { id: model.id },
                        data: { img: imgPath }
                    });
                    console.log(`Success! Fixed image for ${model.name}`);
                } else {
                    console.log(`Could not find a valid image for ${model.name}`);
                }
            } catch (e) {
                console.error(`Failed to handle ${model.name}`, e.message);
            }
        }
    }

    await browser.close();
    console.log("Done fixing Nothing models and fetching missing images!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
