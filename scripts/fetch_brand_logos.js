const https = require('https');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function fetchJson(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return resolve(fetchJson(res.headers.location.startsWith('http') ? res.headers.location : 'https://www.dofy.in' + res.headers.location));
            }
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch (e) { try { resolve(data); } catch (ex) { resolve(null); } }
            });
        }).on('error', reject);
    });
}

function fetchImage(url, dest) {
    return new Promise((resolve) => {
        if (fs.existsSync(dest) && fs.statSync(dest).size > 0) return resolve(true);

        const dir = path.dirname(dest);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        const file = fs.createWriteStream(dest);
        https.get(url, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                file.close();
                return resolve(fetchImage(res.headers.location, dest));
            }
            if (res.statusCode !== 200) {
                file.close();
                fs.unlinkSync(dest);
                return resolve(false);
            }
            res.pipe(file);
            file.on('finish', () => { file.close(); resolve(true); });
        }).on('error', (err) => {
            fs.unlink(dest, () => { });
            resolve(false);
        });
    });
}

const categories = ['laptop', 'smartwatch', 'gaming-console', 'tv', 'desktop', 'camera', 'earbuds'];

async function getLogos() {
    let mapping = {}; // EnumName -> ThumbnailPath

    for (const cat of categories) {
        const html = await fetchJson(`https://www.dofy.in/in-en/india/sell-old-${cat}`);
        if (!html) continue;

        const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
        if (match) {
            const data = JSON.parse(match[1]);
            const brands = data.props?.pageProps?.selectBrand || [];
            brands.forEach(b => {
                const dbBrandId = b.EnumName ? b.EnumName.toLowerCase().replace(/[^a-z0-9]/g, '') : null;
                if (dbBrandId && b.ThumbnailPath) {
                    mapping[dbBrandId] = b.ThumbnailPath;
                }
            });
        }
    }

    const dbBrands = await prisma.brand.findMany();

    for (const b of dbBrands) {
        const localPathPng = path.join(__dirname, '..', 'public', 'models', b.id, 'logo.png');
        const localPathJpg = path.join(__dirname, '..', 'public', 'models', b.id, 'logo.jpg');

        if (!fs.existsSync(localPathPng) && !fs.existsSync(localPathJpg)) {
            console.log(`Missing logo for: ${b.id}`);

            // Try matching from the mapping
            let thumbnailPath = mapping[b.id] || mapping[b.id.replace('sony', 'sonytv')];

            // Or try guessing
            if (!thumbnailPath) {
                // capitalize first letter
                const cap = b.id.charAt(0).toUpperCase() + b.id.slice(1);
                thumbnailPath = `brand/${cap}.png`;
            }

            const url = `https://cdn.dofy.in/v2//${thumbnailPath}`;
            console.log(`Trying to download from ${url}`);

            let success = await fetchImage(url, localPathPng);
            if (!success) {
                // Fallback to jpeg/jpg attempt
                const urlJpg = url.replace('.png', '.jpg');
                success = await fetchImage(urlJpg, localPathJpg);
                if (success) {
                    await prisma.brand.update({
                        where: { id: b.id },
                        data: { logo: `/models/${b.id}/logo.jpg` }
                    });
                    console.log(`Saved as jpg instead for ${b.id}`);
                }
            } else {
                console.log(`Successfully downloaded ${b.id} logo`);
            }
        }
    }
}

getLogos().then(() => prisma.$disconnect());
