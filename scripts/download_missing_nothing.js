const https = require('https');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const MODEL_MAP = {
    'Nothing Phone 1': 'Nothing_Phone_1.png',
    'Nothing Phone 2': 'Nothing_Phone_2.png',
    'Nothing Phone 2a': 'Nothing_Phone_2a.png',
    'Nothing Phone 2a Plus': 'Nothing_Phone_2a_Plus.png',
    'Nothing Phone 3': 'Nothing_Phone_3.png',
    'Nothing Phone 3a': 'Nothing_Phone_3a.png',
    'Nothing Phone 3a Pro': 'Nothing_Phone_3a_Pro.png',
    'Nothing Phone 3a Lite': 'Nothing_Phone_3a_Lite.png',
    'Nothing Phone 4a': 'Nothing_Phone_4a.png',
    'Nothing Phone 4a Pro': 'Nothing_Phone_4a_Pro.png',
    'CMF Phone 1': 'CMF_Phone_1.png',
    'CMF Phone 2': 'CMF_Phone_2.png',
    'CMF Phone 2 Pro': 'CMF_Phone_2_Pro.png',
};

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

async function downloadImage(url, dest) {
    return new Promise((resolve, reject) => {
        let file = fs.createWriteStream(dest);
        let request = https.get(url, function (response) {
            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', function () {
                    file.close(resolve(true));
                });
            } else {
                file.close();
                fs.unlinkSync(dest);
                resolve(false);
            }
        }).on('error', function (err) {
            fs.unlink(dest, () => resolve(false));
        });
    });
}

async function main() {
    console.log("Updating Priorities and standardizing names...");

    const groups = {};
    const models = await prisma.model.findMany({ where: { brandId: 'nothing' }, include: { variants: true } });

    // Group duplicates by our standardized mapping
    for (const m of models) {
        let std = m.name;
        // Strip out parenthesis
        std = std.replace(/\((\d+[a-zA-Z\+]*)\)/g, '$1').replace(/\s+/g, ' ').trim();
        if (std.includes('2a+')) std = 'Nothing Phone 2a Plus';
        if (std.includes('CMF')) std = std.replace(/cmf/i, 'CMF');

        if (!groups[std]) groups[std] = [];
        groups[std].push(m);
    }

    for (const [name, duplicates] of Object.entries(groups)) {
        if (!priorities.includes(name)) continue; // ignore others temporarily

        if (duplicates.length > 1) {
            console.log(`Merging ${name}...`);
            duplicates.sort((a, b) => (a.img && a.img !== '/generic_phone.png' ? -1 : 1));
            const primary = duplicates[0];
            const toDelete = duplicates.slice(1);

            for (const m of toDelete) {
                for (const v of m.variants) {
                    await prisma.variant.update({
                        where: { id: v.id },
                        data: { modelId: primary.id }
                    });
                }
                await prisma.model.delete({ where: { id: m.id } });
            }
        }
    }

    // Now set priorities exactly
    for (const [index, pName] of priorities.entries()) {
        const priorityScore = (index + 1) * 10;
        await prisma.model.updateMany({
            where: {
                name: { contains: pName.replace(' Plus', ''), mode: 'insensitive' },
                brandId: 'nothing',
            },
            data: { priority: priorityScore, name: pName } // Set perfect name & priority
        });
    }

    const updated = await prisma.model.findMany({ where: { brandId: 'nothing' } });

    // Create folders
    const pubDir = path.join(__dirname, '../public/models/nothing');
    if (!fs.existsSync(pubDir)) fs.mkdirSync(pubDir, { recursive: true });

    console.log("Downloading missing images from Dofy S3...");

    for (const model of updated) {
        const imgName = MODEL_MAP[model.name];
        if (!imgName) continue;

        const imgPath = `/models/nothing/${imgName}`;
        const absolutePath = path.join(pubDir, imgName);

        // ALWAYS TRY TO RE-DOWNLOAD if generic or missing
        if (!fs.existsSync(absolutePath) || model.img === '/generic_phone.png' || !model.img) {
            const dofyUrl = `https://s3.ap-south-1.amazonaws.com/dev.dofy.in/model/${imgName}`;
            console.log(`Downloading ${dofyUrl}...`);

            const success = await downloadImage(dofyUrl, absolutePath);
            if (success) {
                console.log(`Successfully downloaded ${imgName}`);
            } else {
                console.log(`Failed to download ${imgName}. Will use a placeholder/copy.`);
                // Fallback to Nothing Phone 2a if not on S3
                const fallback = path.join(pubDir, 'Nothing_Phone_2a.png');
                if (fs.existsSync(fallback)) {
                    fs.copyFileSync(fallback, absolutePath);
                }
            }
        }

        // Update DB
        await prisma.model.update({
            where: { id: model.id },
            data: { img: imgPath }
        });
    }

    console.log("Done fixing Nothing models and fetching missing images!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
