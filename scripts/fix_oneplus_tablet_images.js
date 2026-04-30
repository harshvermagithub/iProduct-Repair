const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

async function fixImages() {
    const dir = path.join(__dirname, '..', 'public', 'models', 'oneplus-tablet');

    // 1. Delete 0 byte files
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stats = fs.statSync(fullPath);
        if (stats.size === 0) {
            console.log(`Deleting 0-byte file: ${file}`);
            fs.unlinkSync(fullPath);
        }
    }

    // 2. Update DB with proper extensions or paths
    const models = await prisma.model.findMany({
        where: { brandId: 'oneplus', category: 'tablet' }
    });

    for (const m of models) {
        let imgPath = m.img;
        let localPath = path.join(__dirname, '..', 'public', imgPath);

        if (!fs.existsSync(localPath)) {
            // Check if .webp or .jpeg versions exist
            if (fs.existsSync(localPath + '.webp')) {
                imgPath = imgPath + '.webp';
            } else if (fs.existsSync(localPath + '.jpeg')) {
                imgPath = imgPath + '.jpeg';
            } else if (fs.existsSync(localPath + '.jpg')) {
                imgPath = imgPath + '.jpg';
            } else if (fs.existsSync(localPath.replace('.png', '.jpeg'))) {
                imgPath = imgPath.replace('.png', '.jpeg');
            } else if (fs.existsSync(localPath.replace('.png', '.webp'))) {
                imgPath = imgPath.replace('.png', '.webp');
            }

            // Re-check
            localPath = path.join(__dirname, '..', 'public', imgPath);
            if (fs.existsSync(localPath)) {
                console.log(`Updating ${m.name} from ${m.img} to ${imgPath}`);
                await prisma.model.update({
                    where: { id: m.id },
                    data: { img: imgPath }
                });
            } else {
                console.log(`Still cannot find image for ${m.name}: ${m.img}`);
            }
        }
    }
}

fixImages()
    .then(() => console.log('Done fixing images'))
    .catch(console.error)
    .finally(() => prisma.$disconnect());
