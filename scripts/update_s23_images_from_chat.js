const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    // S23 Ultra
    await prisma.model.updateMany({
        where: { name: 'Galaxy S23 Ultra' },
        data: { img: '/models/samsung/81061f00-de48-4cb1-97b7-5d0b9804b40f.jpg' }
    });

    // S23 Plus
    await prisma.model.updateMany({
        where: { name: 'Galaxy S23 Plus' },
        data: { img: '/models/samsung/964860b7-f418-4061-91ea-6cff11ce716a.png' }
    });

    // S23 Base
    await prisma.model.updateMany({
        where: { name: 'Galaxy S23' },
        data: { img: '/models/samsung/af26da4b-57d6-4444-934d-1784ca39b83f.png' }
    });

    console.log("Updated S23 images to prompt attachments.");
}

run().finally(() => prisma.$disconnect());
