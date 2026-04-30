const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const priorities = [
    'Nothing Phone 4a Pro',
    'Nothing Phone 4a',
    'Nothing Phone 3a Pro',
    'Nothing Phone 3a',
    'Nothing Phone 3a Lite',
    'Nothing Phone 3',
    'CMF Phone 2 Pro',
    'CMF Phone 2',
    'Nothing Phone 2a Plus',
    'Nothing Phone 2a',
    'CMF Phone 1',
    'Nothing Phone 2',
    'Nothing Phone 1'
];

async function main() {
    console.log("Fixing Nothing model order (Newest first)...");
    for (let i = 0; i < priorities.length; i++) {
        const priorityScore = (i + 1) * 10;
        await prisma.model.updateMany({
            where: { name: priorities[i], brandId: 'nothing' },
            data: { priority: priorityScore }
        });
        console.log(`Set ${priorities[i]} to priority ${priorityScore}`);
    }

    console.log("\nFixing Apple iPhone XS and XS Max tablet images...");
    await prisma.model.updateMany({
        where: { name: 'iPhone XS', brandId: 'apple' },
        data: { img: '/models/apple/Apple_iPhone_XS.png' }
    });
    console.log("Fixed iPhone XS image.");

    await prisma.model.updateMany({
        where: { name: 'iPhone XS Max', brandId: 'apple' },
        data: { img: '/models/apple/Apple_iPhone_XS_Max.png' }
    });
    console.log("Fixed iPhone XS Max image.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
