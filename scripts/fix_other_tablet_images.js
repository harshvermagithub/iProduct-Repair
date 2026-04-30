const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

function normalizeFileName(name) {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function fixImages() {
    const brands = ['lenovo', 'motorola', 'nokia', 'oppo', 'poco', 'xiaomi'];

    for (const brand of brands) {
        const dir = path.join(__dirname, '..', 'public', 'models', `${brand}-tablet`);
        if (!fs.existsSync(dir)) continue;

        const localFiles = fs.readdirSync(dir);

        // Remove 0 byte files
        for (const file of localFiles) {
            const fullPath = path.join(dir, file);
            const stats = fs.statSync(fullPath);
            if (stats.size === 0) {
                console.log(`Deleting 0-byte file: ${file}`);
                fs.unlinkSync(fullPath);
            }
        }

        const validLocalFiles = fs.readdirSync(dir);

        const models = await prisma.model.findMany({
            where: { brandId: brand, category: 'tablet' }
        });

        for (const m of models) {
            let imgPath = m.img;
            let localPath = path.join(__dirname, '..', 'public', imgPath);

            if (!fs.existsSync(localPath)) {

                // Fuzzy match against valid local files
                const modelNameNormalized = normalizeFileName(m.name);
                const currentImgNameNormalized = normalizeFileName(path.basename(m.img, path.extname(m.img)));

                let matchedFile = null;

                for (const file of validLocalFiles) {
                    const fileNormalized = normalizeFileName(path.basename(file, path.extname(file)));
                    if (fileNormalized === currentImgNameNormalized || fileNormalized === modelNameNormalized || fileNormalized.includes(modelNameNormalized) || modelNameNormalized.includes(fileNormalized)) {
                        matchedFile = file;
                        break;
                    }
                }

                if (matchedFile) {
                    const newImgPath = `/models/${brand}-tablet/${matchedFile}`;
                    console.log(`Updating ${m.name} from ${m.img} to ${newImgPath}`);
                    await prisma.model.update({
                        where: { id: m.id },
                        data: { img: newImgPath }
                    });
                } else {
                    console.log(`Still cannot find image for ${brand} - ${m.name}: ${m.img}`);
                }
            }
        }
    }
}

fixImages()
    .then(() => console.log('Done fixing images'))
    .catch(console.error)
    .finally(() => prisma.$disconnect());
