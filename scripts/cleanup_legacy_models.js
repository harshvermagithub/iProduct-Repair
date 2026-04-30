const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

async function cleanModels() {
    // Categories to clean
    const categoriesToScan = ['smartwatch', 'console', 'laptop', 'desktop', 'camera', 'tv'];

    const models = await prisma.model.findMany({
        where: {
            category: { in: categoriesToScan }
        }
    });

    let deleteCount = 0;

    for (const m of models) {
        let shouldDelete = false;

        if (!m.img || m.img === '') {
            shouldDelete = true;
        } else if (m.img.startsWith('http')) {
            // Delete legacy external links
            shouldDelete = true;
        } else {
            const localPath = path.join(__dirname, '..', 'public', m.img);
            if (!fs.existsSync(localPath)) {
                shouldDelete = true;
            }
        }

        if (shouldDelete) {
            console.log(`Deleting invalid/missing image model: ${m.brandId} - ${m.name} -> ${m.img}`);
            await prisma.variant.deleteMany({ where: { modelId: m.id } });
            await prisma.model.delete({ where: { id: m.id } });
            deleteCount++;
        }
    }

    console.log(`Deleted ${deleteCount} legacy/invalid models and matching variants.`);

    // Wait, are there any Nintendo models left? If there are no models for a brand, maybe clean the brand from the category array?
    const brands = await prisma.brand.findMany();
    for (const b of brands) {
        let updatedCategories = [];
        let changed = false;
        for (const cat of b.categories) {
            const count = await prisma.model.count({ where: { brandId: b.id, category: cat } });
            if (count > 0 || cat === 'smartwatch' || cat === 'console') {
                updatedCategories.push(cat);
            } else {
                changed = true;
            }
        }

        // Let's actually just ensure if a brand has NO models across all categories, we don't necessarily delete it,
        // but it's safe to just clean it if we want. But wait, I'll bypass brand deletion for now.
    }
}

cleanModels().then(() => prisma.$disconnect());
