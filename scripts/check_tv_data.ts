import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking TV Brands and Models in Database...');

  const brands = await prisma.brand.findMany();
  console.log(`\nTotal brands in DB: ${brands.length}`);
  
  const tvBrands = brands.filter(b => b.categories.includes('tv') || b.categories.includes('smarttv'));
  console.log(`TV Brands (having 'tv' or 'smarttv' category):`);
  tvBrands.forEach(b => {
    console.log(`- ID: ${b.id}, Name: ${b.name}, Categories: ${JSON.stringify(b.categories)}`);
  });

  const tvModels = await prisma.model.findMany({
    where: {
      category: { in: ['tv', 'smarttv'] }
    },
    include: {
      variants: true
    }
  });

  console.log(`\nTotal TV Models in DB: ${tvModels.length}`);
  tvModels.forEach(m => {
    console.log(`- Brand: ${m.brandId}, Name: ${m.name}, Category: ${m.category}, Variants: ${m.variants.map(v => `${v.name} (₹${v.basePrice})`).join(', ')}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
