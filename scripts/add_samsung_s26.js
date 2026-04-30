const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Adding Samsung S26 models with Coming Soon placeholder...');

    const brandId = 'samsung';
    const models = [
        { name: 'Samsung Galaxy S26 Ultra', img: '/models/samsung/coming_soon.png', priority: 740 },
        { name: 'Samsung Galaxy S26+', img: '/models/samsung/coming_soon.png', priority: 750 },
        { name: 'Samsung Galaxy S26', img: '/models/samsung/coming_soon.png', priority: 760 },
        { name: 'Samsung Galaxy S26 FE', img: '/models/samsung/coming_soon.png', priority: 770 }
    ];

    for (const model of models) {
        // Upsert Model
        const existing = await prisma.model.findFirst({
            where: {
                brandId: brandId,
                name: { equals: model.name, mode: 'insensitive' }
            }
        });

        let modelId;
        if (existing) {
            console.log(`Updating ${model.name}`);
            const updated = await prisma.model.update({
                where: { id: existing.id },
                data: {
                    img: model.img, // Force update image
                    priority: model.priority
                }
            });
            modelId = updated.id;
        } else {
            console.log(`Creating ${model.name}`);
            const created = await prisma.model.create({
                data: {
                    brandId: brandId,
                    name: model.name,
                    img: model.img,
                    category: 'smartphone',
                    priority: model.priority
                }
            });
            modelId = created.id;
        }

        // Add dummy variants if none exist?
        // User didn't ask for variants but implied "sell old phone" flow requires variants usually.
        // I'll add a 'Base' variant with price 0 (Coming Soon).
        const variantCount = await prisma.variant.count({ where: { modelId: modelId } });
        if (variantCount === 0) {
            await prisma.variant.create({
                data: {
                    modelId: modelId,
                    name: 'Base', // Or 256GB?
                    basePrice: 0 // Price unknown
                }
            });
            console.log(`Added Base variant for ${model.name}`);
        }
    }

    console.log('Samsung S26 update complete.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
