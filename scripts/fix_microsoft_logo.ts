
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const b = await prisma.brand.findUnique({ where: { id: 'microsoft' } });
    console.log('Microsoft brand:', b);

    // Check if we need to fix it. 
    // If it's a simpleicon that is white, it might be invisible on white bg.
    // Let's update it to a colored one or local one.

    if (b) {
        // Use a colored Microsoft logo
        await prisma.brand.update({
            where: { id: 'microsoft' },
            data: { logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg' }
        });
        console.log('Updated Microsoft logo.');
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
