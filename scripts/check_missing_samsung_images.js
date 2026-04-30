const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

async function run() {
    const models = await prisma.model.findMany({
        where: { brandId: 'samsung' } // Check both tablets and smartphones
    });

    let missing = [];
    for (const m of models) {
        const fullPath = path.join(__dirname, '..', 'public', m.img);
        if (!fs.existsSync(fullPath)) {
            missing.push({ name: m.name, img: m.img });
        }
    }

    console.log(`Missing ${missing.length} images out of ${models.length} Samsung models.`);
    if (missing.length > 0) {
        console.log("First 20 missing:");
        console.log(missing.slice(0, 20));
    }
}
run().finally(() => prisma.$disconnect());
