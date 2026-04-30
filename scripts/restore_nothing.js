const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const TSV_FILE = path.join(__dirname, 'nothing_data.tsv');

const order = [
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
    console.log("Emptying Nothing models...");
    await prisma.variant.deleteMany({
        where: { model: { brandId: 'nothing' } }
    });
    await prisma.model.deleteMany({
        where: { brandId: 'nothing' }
    });

    console.log("Restoring from TSV...");
    const content = fs.readFileSync(TSV_FILE, 'utf-8');
    const rows = content.split('\n').slice(1).filter(r => r.trim() !== '');

    const map = {};
    for (const row of rows) {
        const parts = row.split('\t');
        if (parts.length < 5) continue;
        const [brand, mName, vName, priceStr, img] = parts;

        const stdName = mName.replace(/\((\d+.*)\)/g, '$1').trim();
        if (!map[stdName]) {
            map[stdName] = { img, variants: [] };
        }
        map[stdName].variants.push({ name: vName, price: parseInt(priceStr) || 0 });
    }

    // Insert TSV models
    for (const [mName, data] of Object.entries(map)) {
        let priority = (order.indexOf(mName) + 1) * 10;
        if (priority === 0) priority = 999;

        const dbModel = await prisma.model.create({
            data: {
                brandId: 'nothing',
                name: mName,
                priority: priority,
                img: data.img,
                category: 'smartphone'
            }
        });

        for (const v of data.variants) {
            await prisma.variant.create({
                data: {
                    modelId: dbModel.id,
                    name: v.name,
                    basePrice: v.price
                }
            });
        }
    }

    // Insert manually requested models not in TSV
    const existingNames = Object.keys(map);
    const pubDir = path.join(__dirname, '../public/models/nothing');

    for (const [index, pName] of order.entries()) {
        if (!existingNames.includes(pName)) {
            let imgName = pName.replace(/[^a-zA-Z0-9]+/g, '_') + '.png';
            let imgDbPath = `/models/nothing/${imgName}`;
            let diskPath = path.join(pubDir, imgName);

            // If we don't have the image, copy a placeholder (Nothing Phone 2a is a good phone lookalike for now)
            if (!fs.existsSync(diskPath)) {
                let fallback = path.join(pubDir, 'Nothing_Phone_2a.png');
                if (fs.existsSync(fallback)) {
                    fs.copyFileSync(fallback, diskPath);
                }
            }

            const dbModel = await prisma.model.create({
                data: {
                    brandId: 'nothing',
                    name: pName,
                    priority: (index + 1) * 10,
                    img: imgDbPath,
                    category: 'smartphone'
                }
            });

            // Create generic variant for manual models
            await prisma.variant.create({
                data: {
                    modelId: dbModel.id,
                    name: 'Base Variant',
                    basePrice: 15000
                }
            });
        }
    }

    console.log("Checking duplicates carefully...");
    const fin = await prisma.model.findMany({ where: { brandId: 'nothing' }, orderBy: { priority: 'asc' } });
    for (const f of fin) {
        console.log(`${f.name} - ${f.img} (${f.priority})`);
    }

    console.log("Database perfectly restored.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
