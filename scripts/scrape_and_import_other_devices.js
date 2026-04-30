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
    return new Promise((resolve, reject) => {
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

const buildId = '8PllrAnLvFbw-iTwWuQnu';
const categories = [
    { name: 'laptop', dbName: 'laptop' },
    { name: 'smartwatch', dbName: 'smartwatch' },
    { name: 'gaming-console', dbName: 'console' },
    { name: 'tv', dbName: 'tv' },
    { name: 'desktop', dbName: 'desktop' },
    { name: 'camera', dbName: 'camera' },
    { name: 'earbuds', dbName: 'earbuds' }
];

function normalizeBrand(brandName) {
    let b = brandName.toLowerCase();
    if (b === 'mi') return 'xiaomi';
    return b.replace(/[^a-z0-9]/g, '');
}

async function scrapeAndImport() {
    for (const cat of categories) {
        console.log(`\n\n=== Fetching category: ${cat.name} ===`);
        const html = await fetchJson(`https://www.dofy.in/in-en/india/sell-old-${cat.name}`);
        if (!html) continue;

        const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
        let brands = [];

        if (match) {
            const data = JSON.parse(match[1]);
            if (data.props?.pageProps?.selectBrand) {
                brands = data.props.pageProps.selectBrand;
            } else if (data.props?.pageProps?.selectModel) {
                // Some categories might have models directly instead of brands (e.g. desktop)
                brands = [{ EnumName: 'unknown', Name: 'Unknown', isModelsDirect: true }];
            }
        }

        console.log(`Found ${brands.length} brand(s) for ${cat.name}`);

        for (const brand of brands) {
            const dbBrandId = normalizeBrand(brand.Name || brand.EnumName || 'unknown');
            const modelsEndpoint = brand.isModelsDirect
                ? `https://www.dofy.in/in-en/india/sell-old-${cat.name}`
                : `https://www.dofy.in/in-en/india/sell-old-${cat.name}/${brand.EnumName}`;

            const bHtml = await fetchJson(modelsEndpoint);
            if (!bHtml) continue;

            const bMatch = bHtml.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
            let models = [];
            if (bMatch) {
                const bData = JSON.parse(bMatch[1]);
                if (bData.props?.pageProps?.selectModel) {
                    models = bData.props.pageProps.selectModel;
                }
            }

            console.log(`  -> Brand ${dbBrandId}: found ${models.length} models`);

            // Ensure brand exists in DB
            if (models.length > 0 && !brand.isModelsDirect) {
                let dbBrand = await prisma.brand.findUnique({ where: { id: dbBrandId } });
                if (!dbBrand) {
                    await prisma.brand.create({
                        data: {
                            id: dbBrandId,
                            name: brand.Name,
                            logo: `/models/${dbBrandId}/logo.png`,
                            categories: [cat.dbName]
                        }
                    });
                } else if (!dbBrand.categories.includes(cat.dbName)) {
                    await prisma.brand.update({
                        where: { id: dbBrandId },
                        data: { categories: [...dbBrand.categories, cat.dbName] }
                    });
                }
            }

            let processedCount = 0;
            for (const m of models) {
                let actualBrandId = dbBrandId;

                // If it's direct models, the brand might be embedded in the model name (e.g., Apple Desktop)
                if (brand.isModelsDirect) {
                    // Quick guess
                    if (m.Name.toLowerCase().includes('apple') || m.Name.toLowerCase().includes('mac') || m.Name.toLowerCase().includes('imac')) actualBrandId = 'apple';
                    else if (m.Name.toLowerCase().includes('hp')) actualBrandId = 'hp';
                    else if (m.Name.toLowerCase().includes('dell')) actualBrandId = 'dell';
                    else actualBrandId = 'generic';

                    // Ensure this brand exists
                    let gBrand = await prisma.brand.findUnique({ where: { id: actualBrandId } });
                    if (!gBrand) {
                        await prisma.brand.create({
                            data: {
                                id: actualBrandId,
                                name: actualBrandId.toUpperCase(),
                                logo: `/models/${actualBrandId}/logo.png`,
                                categories: [cat.dbName]
                            }
                        });
                    } else if (!gBrand.categories.includes(cat.dbName)) {
                        await prisma.brand.update({
                            where: { id: actualBrandId },
                            data: { categories: [...gBrand.categories, cat.dbName] }
                        });
                    }
                }

                const name = m.Name;
                const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                const url = brand.isModelsDirect
                    ? `https://www.dofy.in/_next/data/${buildId}/in-en/india/sell-old-${cat.name}/${slug}.json`
                    : `https://www.dofy.in/_next/data/${buildId}/in-en/india/sell-old-${cat.name}/${brand.EnumName}/${slug}.json`;

                try {
                    const dataStr = await fetchJson(url);
                    let data = typeof dataStr === 'string' ? JSON.parse(dataStr) : dataStr;

                    let variants = [];
                    if (data && data.pageProps && data.pageProps.selectVariant) {
                        variants = data.pageProps.selectVariant;
                    }

                    if (variants.length === 0) continue;

                    // Image handling
                    let imgPath = `/models/${actualBrandId}-${cat.dbName}/coming_soon.png`;
                    if (m.ThumbnailPath) {
                        const filename = m.ThumbnailPath.split('/').pop().replace(/[^a-zA-Z0-9.\-_]/g, '_');
                        let cleanFilename = filename;
                        if (!cleanFilename.endsWith('.png') && !cleanFilename.endsWith('.jpg') && !cleanFilename.endsWith('.jpeg')) cleanFilename += '.png';

                        const remoteUrl = `https://cdn.dofy.in/v2//${m.ThumbnailPath}`;
                        const localPath = path.join(__dirname, '..', 'public', 'models', `${actualBrandId}-${cat.dbName}`, cleanFilename);

                        if (await fetchImage(remoteUrl, localPath)) {
                            imgPath = `/models/${actualBrandId}-${cat.dbName}/${cleanFilename}`;
                        }
                    }

                    // Priority handling
                    let priority = 100;

                    // Save model
                    const uniqueKey = `${actualBrandId}_${cat.dbName}_${name}`;
                    const existingModel = await prisma.model.findFirst({
                        where: {
                            brandId: actualBrandId,
                            category: cat.dbName,
                            name: { equals: name, mode: 'insensitive' }
                        }
                    });

                    let modelRecord;
                    if (existingModel) {
                        modelRecord = await prisma.model.update({
                            where: { id: existingModel.id },
                            data: { img: imgPath }
                        });
                        await prisma.variant.deleteMany({ where: { modelId: modelRecord.id } });
                    } else {
                        modelRecord = await prisma.model.create({
                            data: {
                                brandId: actualBrandId,
                                name: name,
                                img: imgPath,
                                category: cat.dbName,
                                priority: priority
                            }
                        });
                    }

                    // Save variants
                    const mappedVariants = variants.map(v => ({
                        modelId: modelRecord.id,
                        name: v.Name || "Base",
                        basePrice: v.MaximumValue || 0
                    }));

                    if (mappedVariants.length > 0) {
                        await prisma.variant.createMany({ data: mappedVariants });
                    }

                    processedCount++;

                } catch (e) {
                    console.error(`Error with ${name}: ${e.message}`);
                }
            }
            console.log(`    Saved ${processedCount} imported models with variants into database!`);
        }
    }
}

scrapeAndImport().then(() => {
    console.log("\nFinished completely!");
    prisma.$disconnect();
}).catch(e => {
    console.error(e);
    prisma.$disconnect();
});
