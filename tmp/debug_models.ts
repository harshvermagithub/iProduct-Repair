import { prisma } from './lib/db';
import { db } from './lib/store';

async function debug() {
    console.log('--- DB getModels Debug ---');
    const brandId = 'samsung';
    const category = 'smarttv';
    
    const brands = await db.getBrands(category);
    console.log('Brands found for', category, ':', brands.map(b => b.id));
    
    const models = await db.getModels(brandId, category);
    console.log('Models found for', brandId, 'and', category, ':', models.length);
    models.forEach(m => console.log(' -', m.name, '(cat:', m.category, ')'));
}

debug().finally(() => prisma.$disconnect());
