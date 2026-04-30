
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CATEGORY_MAP: Record<string, string[]> = {
    'apple': ['smartphone', 'tablet', 'laptop', 'smartwatch'],
    'samsung': ['smartphone', 'tablet', 'smartwatch', 'tv', 'laptop'],
    'xiaomi': ['smartphone', 'tablet', 'tv', 'smartwatch'],
    'oneplus': ['smartphone', 'tablet', 'smartwatch'],
    'realme': ['smartphone', 'tablet', 'laptop', 'smartwatch'],
    'oppo': ['smartphone', 'tablet', 'smartwatch'],
    'vivo': ['smartphone'],
    'motorola': ['smartphone', 'tablet'],
    'google': ['smartphone', 'smartwatch'],
    'nothing': ['smartphone', 'smartwatch'],
    'asus': ['smartphone', 'laptop'],
    'honor': ['smartphone', 'tablet', 'laptop'],
    'huawei': ['smartphone', 'tablet', 'smartwatch'],
    'sony': ['smartphone', 'tv', 'console'],
    'lg': ['smartphone', 'tv'],
    'nokia': ['smartphone'],
    'lenovo': ['smartphone', 'tablet', 'laptop'],
    'microsoft': ['laptop', 'console'],
    'nintendo': ['console']
};

async function main() {
    console.log('Assigning categories to brands...');
    for (const [id, categories] of Object.entries(CATEGORY_MAP)) {
        try {
            const existing = await prisma.brand.findUnique({ where: { id } });
            if (existing) {
                console.log(`Updating ${existing.name} (${id}) -> [${categories.join(', ')}]`);
                await prisma.brand.update({
                    where: { id },
                    data: { categories }
                });
            } else {
                console.log(`Brand ${id} not found.`);
            }
        } catch (e) {
            console.error(`Error updating ${id}:`, e);
        }
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
