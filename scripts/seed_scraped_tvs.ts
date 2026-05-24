import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

// Detailed Cashify Brand configuration with correct logo imageName mapping
const BRAND_LOGOS: Record<string, { name: string; imageName: string }> = {
  xiaomi: { name: 'Xiaomi', imageName: 'cb96df6e-080f.jpg' },
  samsung: { name: 'Samsung', imageName: '406a512d-e8dd.jpg' },
  oneplus: { name: 'OnePlus', imageName: 'dfb6c340-010f.jpg' },
  motorola: { name: 'Motorola', imageName: '1dcd7fda-0141.jpg' },
  nokia: { name: 'Nokia', imageName: 'fef4e5ae-6507.jpg' },
  sony: { name: 'Sony', imageName: '125aada5-a86f.jpg' },
  micromax: { name: 'Micromax', imageName: '7bdd775a-6d1e.jpg' },
  haier: { name: 'Haier', imageName: '01475b30-dee9.jpg' },
  lg: { name: 'LG', imageName: 'bdbdc48e-dd24.jpg' },
  onida: { name: 'Onida', imageName: 'ea1c6af5-ea74.jpg' },
  videocon: { name: 'Videocon', imageName: '573595fe96088.jpg' },
  sansui: { name: 'Sansui', imageName: 'fd603226-dbe3.jpg' },
  philips: { name: 'Philips', imageName: '9535df81-5a3c.jpg' },
  panasonic: { name: 'Panasonic', imageName: '45cf78a0-601e.jpg' },
  toshiba: { name: 'Toshiba', imageName: '99979e7c-a3e1.jpg' },
  intex: { name: 'Intex', imageName: '7d38aacc-176b.jpg' },
  tcl: { name: 'TCL', imageName: '986f2bc3-7006.jpg' },
  vu: { name: 'Vu', imageName: '35534ab1-0483.jpg' },
  bpl: { name: 'BPL', imageName: '865e9527-9762.jpg' },
  hisense: { name: 'Hisense', imageName: '9497e5b1-ecc6.jpg' },
  aoc: { name: 'AOC', imageName: 'f18f9a96-c06e.jpg' },
  belco: { name: 'Belco', imageName: 'b5fea7ce-e15a.jpg' },
  bravieo: { name: 'Bravieo', imageName: '92f89616-1fb7.jpg' },
  blaupunkt: { name: 'Blaupunkt', imageName: '8dc6c085-2250.jpg' },
  kodak: { name: 'Kodak', imageName: 'c521bcd2-e3a5.jpg' },
  lloyd: { name: 'Lloyd', imageName: 'fea79b86-cb5f.jpg' },
  iffalcon: { name: 'iFFalcon', imageName: '4698e113-166c.jpg' },
  thomson: { name: 'Thomson', imageName: 'dc594838-2bcc.jpg' },
  sanyo: { name: 'Sanyo', imageName: '4583ab70-38df.jpg' },
  polaroid: { name: 'Polaroid', imageName: '421353a5-6332.jpg' },
  oscar: { name: 'Oscar', imageName: 'fb01ac20-e308.jpg' },
  noble: { name: 'Noble', imageName: '02faaba1-c0e8.jpg' },
  mitashi: { name: 'Mitashi', imageName: 'e397c364-739c.jpg' },
  weston: { name: 'Weston', imageName: 'ffb71bdf-f731.jpg' },
  coocaa: { name: 'Coocaa', imageName: 'f4a76556-8fe1.jpg' },
  marq: { name: 'MarQ', imageName: '6e2f36d5-bf81.jpg' },
  infocus: { name: 'InFocus', imageName: '913e8e55-6051.jpg' }
};

// Brand Tier Multiplier for realistic base prices
function getBrandMultiplier(brandId: string): number {
  const premium = ['samsung', 'sony', 'lg', 'oneplus'];
  const value = ['xiaomi', 'motorola', 'nokia', 'tcl', 'hisense', 'blaupunkt', 'philips', 'panasonic', 'toshiba'];
  
  if (premium.includes(brandId.toLowerCase())) return 1.5;
  if (value.includes(brandId.toLowerCase())) return 1.0;
  return 0.7; // Budget/others
}

async function main() {
  console.log('--- STARTING SCRAPED TV DATABASE SEEDING ---');

  // Load scraped data
  const dataPath = 'scripts/scraped_tv_data.json';
  if (!fs.existsSync(dataPath)) {
    console.error(`Scraped data file not found at: ${dataPath}. Please run scraper first.`);
    process.exit(1);
  }

  const scrapedBrands = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  console.log(`Loaded ${scrapedBrands.length} brands from scraped dataset.`);

  // 1. Clear old TV models/variants
  console.log('\nClearing old TV models and variants from database...');
  const deleteResult = await prisma.model.deleteMany({
    where: {
      category: { in: ['tv', 'smarttv'] }
    }
  });
  console.log(`Wiped ${deleteResult.count} old TV models from database.`);

  // 2. Configure Brands and Seed TV Models
  for (const sBrand of scrapedBrands) {
    const brandId = sBrand.brandId.toLowerCase();
    const config = BRAND_LOGOS[brandId] || { name: sBrand.brandName, imageName: 'cb96df6e-080f.jpg' };
    const brandLogoUrl = `https://s3ng.cashify.in/cashify/brand/img/xhdpi/${config.imageName}`;
    const brandName = config.name;

    console.log(`\nConfiguring Brand: ${brandName} (ID: ${brandId})`);

    // Ensure Brand exists in database
    let dbBrand = await prisma.brand.findUnique({ where: { id: brandId } });
    if (!dbBrand) {
      console.log(`  - Brand does not exist. Creating Brand record: ${brandName}`);
      dbBrand = await prisma.brand.create({
        data: {
          id: brandId,
          name: brandName,
          logo: brandLogoUrl,
          categories: ['tv', 'smarttv'],
          priority: 100
        }
      });
    } else {
      // Update existing brand with TV categories and correct logo if necessary
      const currentCats = dbBrand.categories || [];
      const updatedCats = new Set([...currentCats, 'tv', 'smarttv']);
      await prisma.brand.update({
        where: { id: brandId },
        data: {
          name: brandName,
          logo: brandLogoUrl,
          categories: Array.from(updatedCats)
        }
      });
    }

    const multiplier = getBrandMultiplier(brandId);

    // Filter and seed models
    const cleanModels = sBrand.models.filter((m: any) => {
      return m.name && !m.name.includes('self.') && !m.name.includes('__next') && !m.name.includes('{');
    });

    console.log(`  - Seeding ${cleanModels.length} TV Models...`);

    for (const sModel of cleanModels) {
      console.log(`    * Creating Model: ${sModel.name}`);
      
      const newModel = await prisma.model.create({
        data: {
          brandId,
          name: sModel.name,
          img: sModel.img,
          category: 'tv',
          priority: 100
        }
      });

      // Generate size variants dynamically based on model name
      const variantsToCreate: { name: string; basePrice: number }[] = [];
      const name = sModel.name.toLowerCase();

      if (name.includes('32 to 35')) {
        variantsToCreate.push({ name: '32 inch', basePrice: Math.round(9000 * multiplier) });
      } else if (name.includes('36 to 40')) {
        variantsToCreate.push({ name: '39 inch', basePrice: Math.round(13000 * multiplier) });
        variantsToCreate.push({ name: '40 inch', basePrice: Math.round(14500 * multiplier) });
      } else if (name.includes('41 to 50')) {
        variantsToCreate.push({ name: '43 inch', basePrice: Math.round(18000 * multiplier) });
        variantsToCreate.push({ name: '48 inch', basePrice: Math.round(22000 * multiplier) });
        variantsToCreate.push({ name: '50 inch', basePrice: Math.round(25000 * multiplier) });
      } else if (name.includes('51 to 60')) {
        variantsToCreate.push({ name: '55 inch', basePrice: Math.round(30000 * multiplier) });
        variantsToCreate.push({ name: '58 inch', basePrice: Math.round(34000 * multiplier) });
        variantsToCreate.push({ name: '60 inch', basePrice: Math.round(38000 * multiplier) });
      } else if (name.includes('61 to 70')) {
        variantsToCreate.push({ name: '65 inch', basePrice: Math.round(48000 * multiplier) });
        variantsToCreate.push({ name: '70 inch', basePrice: Math.round(55000 * multiplier) });
      } else if (name.includes('71 to 80')) {
        variantsToCreate.push({ name: '75 inch', basePrice: Math.round(68000 * multiplier) });
        variantsToCreate.push({ name: '80 inch', basePrice: Math.round(85000 * multiplier) });
      } else {
        // Fallback standard sizes
        variantsToCreate.push({ name: '32 inch', basePrice: Math.round(9000 * multiplier) });
        variantsToCreate.push({ name: '43 inch', basePrice: Math.round(18000 * multiplier) });
        variantsToCreate.push({ name: '55 inch', basePrice: Math.round(30000 * multiplier) });
      }

      // Seed variants
      for (const vItem of variantsToCreate) {
        console.log(`      + Adding Variant: ${vItem.name} (Base Price: ₹${vItem.basePrice})`);
        await prisma.variant.create({
          data: {
            modelId: newModel.id,
            name: vItem.name,
            basePrice: vItem.basePrice
          }
        });
      }
    }
  }

  console.log('\n--- SEEDING COMPLETED SUCCESSFULLY ---');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
