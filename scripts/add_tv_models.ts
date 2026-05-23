import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TV_MODELS = [
  // --- SAMSUNG ---
  {
    brandId: 'samsung',
    name: 'Samsung Neo QLED 4K TV',
    img: 'https://images.samsung.com/is/image/samsung/p6pim/in/qa55qn90baklxl/gallery/in-neo-qled-qn90b-qa55qn90baklxl-531393673?$684_684_PNG$',
    category: 'tv',
    priority: 1,
    variants: [
      { name: '43 inch', basePrice: 35000 },
      { name: '55 inch', basePrice: 65000 },
      { name: '65 inch', basePrice: 95000 },
    ]
  },
  {
    brandId: 'samsung',
    name: 'Samsung Crystal 4K UHD TV',
    img: 'https://images.samsung.com/is/image/samsung/p6pim/in/ua43aue60aklxl/gallery/in-crystal-uhd-au7000-ua43aue60aklxl-532971271?$684_684_PNG$',
    category: 'tv',
    priority: 2,
    variants: [
      { name: '43 inch', basePrice: 26000 },
      { name: '50 inch', basePrice: 32000 },
      { name: '55 inch', basePrice: 38000 },
    ]
  },
  {
    brandId: 'samsung',
    name: 'Samsung The Frame QLED TV',
    img: 'https://images.samsung.com/is/image/samsung/p6pim/in/qa55ls03baklxl/gallery/in-the-frame-ls03b-qa55ls03baklxl-532975908?$684_684_PNG$',
    category: 'tv',
    priority: 3,
    variants: [
      { name: '43 inch', basePrice: 42000 },
      { name: '55 inch', basePrice: 68000 },
      { name: '65 inch', basePrice: 98000 },
    ]
  },

  // --- SONY ---
  {
    brandId: 'sony',
    name: 'Sony Bravia XR OLED TV',
    img: 'https://www.sony.co.in/image/5dca43e49661b177d5492429672d6228?fmt=pjpeg&wid=330&bgcolor=FFFFFF&bgc=FFFFFF',
    category: 'tv',
    priority: 1,
    variants: [
      { name: '55 inch', basePrice: 85000 },
      { name: '65 inch', basePrice: 135000 },
    ]
  },
  {
    brandId: 'sony',
    name: 'Sony Bravia 4K Google TV',
    img: 'https://www.sony.co.in/image/7d975a6c31bf538e12ffdb20228bb18d?fmt=pjpeg&wid=330&bgcolor=FFFFFF&bgc=FFFFFF',
    category: 'tv',
    priority: 2,
    variants: [
      { name: '43 inch', basePrice: 34000 },
      { name: '50 inch', basePrice: 42000 },
      { name: '55 inch', basePrice: 49000 },
    ]
  },
  {
    brandId: 'sony',
    name: 'Sony Bravia Master Series OLED',
    img: 'https://www.sony.co.in/image/3b1ad10471b4b5741639c0d64a2106e2?fmt=pjpeg&wid=330&bgcolor=FFFFFF&bgc=FFFFFF',
    category: 'tv',
    priority: 3,
    variants: [
      { name: '55 inch', basePrice: 110000 },
      { name: '65 inch', basePrice: 175000 },
    ]
  },

  // --- LG ---
  {
    brandId: 'lg',
    name: 'LG OLED C2 Series TV',
    img: 'https://www.lg.com/in/images/tvs/md07554868/gallery/OLED55C2PSC-D-01.jpg',
    category: 'tv',
    priority: 1,
    variants: [
      { name: '48 inch', basePrice: 62000 },
      { name: '55 inch', basePrice: 85000 },
      { name: '65 inch', basePrice: 140000 },
    ]
  },
  {
    brandId: 'lg',
    name: 'LG UHD Smart TV',
    img: 'https://www.lg.com/in/images/tvs/md07554900/gallery/43UQ7500PSF-D-01.jpg',
    category: 'tv',
    priority: 2,
    variants: [
      { name: '32 inch', basePrice: 15000 },
      { name: '43 inch', basePrice: 26000 },
      { name: '55 inch', basePrice: 38000 },
    ]
  },
  {
    brandId: 'lg',
    name: 'LG QNED MiniLED TV',
    img: 'https://www.lg.com/in/images/tvs/md08002431/gallery/55QNED81SRA-D-1.jpg',
    category: 'tv',
    priority: 3,
    variants: [
      { name: '55 inch', basePrice: 68000 },
      { name: '65 inch', basePrice: 105000 },
    ]
  },

  // --- XIAOMI ---
  {
    brandId: 'xiaomi',
    name: 'Mi TV 4A Smart TV',
    img: 'https://i01.appmifile.com/v1/MIBC/s/width/1000/height/1000/priority/1/2dd6fc82390a3de077b966cf13a96739.jpg',
    category: 'tv',
    priority: 1,
    variants: [
      { name: '32 inch', basePrice: 12000 },
      { name: '40 inch', basePrice: 18000 },
      { name: '43 inch', basePrice: 22000 },
    ]
  },
  {
    brandId: 'xiaomi',
    name: 'Xiaomi Smart TV X Series',
    img: 'https://i02.appmifile.com/565_operator_in/03/08/2023/34407871b6ad72a8c3d9a941efcfca3f.png',
    category: 'tv',
    priority: 2,
    variants: [
      { name: '43 inch', basePrice: 24000 },
      { name: '50 inch', basePrice: 30000 },
      { name: '55 inch', basePrice: 35000 },
      { name: '65 inch', basePrice: 55000 },
    ]
  },
  {
    brandId: 'xiaomi',
    name: 'Xiaomi OLED Vision TV',
    img: 'https://i01.appmifile.com/v1/MIBC/s/width/1000/height/1000/priority/1/9b82142d765e9167df3c961e68789d97.jpg',
    category: 'tv',
    priority: 3,
    variants: [
      { name: '55 inch', basePrice: 65000 },
    ]
  },

  // --- ONEPLUS ---
  {
    brandId: 'oneplus',
    name: 'OnePlus TV Y1S',
    img: 'https://static.digit.in/product/oneplus-tv-43-y1s-pro-smart-tv-f1d1ca4dfa.jpeg',
    category: 'tv',
    priority: 1,
    variants: [
      { name: '32 inch', basePrice: 13000 },
      { name: '43 inch', basePrice: 22000 },
    ]
  },
  {
    brandId: 'oneplus',
    name: 'OnePlus TV U1S',
    img: 'https://static.digit.in/product/oneplus-tv-55-u1s-smart-tv-e51c89be6f.jpeg',
    category: 'tv',
    priority: 2,
    variants: [
      { name: '50 inch', basePrice: 32000 },
      { name: '55 inch', basePrice: 38000 },
      { name: '65 inch', basePrice: 54000 },
    ]
  },
  {
    brandId: 'oneplus',
    name: 'OnePlus TV Q1 Pro',
    img: 'https://static.digit.in/product/oneplus-tv-55-q1-pro-smart-tv-5dbe5a585f.jpeg',
    category: 'tv',
    priority: 3,
    variants: [
      { name: '55 inch', basePrice: 65000 },
    ]
  },

  // --- MOTOROLA ---
  {
    brandId: 'motorola',
    name: 'Motorola Revou 2 4K TV',
    img: 'https://rukminim2.flixcart.com/image/416/416/xif0q/television/y/h/u/-original-imagpcdsqfzhhy3h.jpeg?q=70',
    category: 'tv',
    priority: 1,
    variants: [
      { name: '43 inch', basePrice: 22500 },
      { name: '55 inch', basePrice: 34500 },
    ]
  },
  {
    brandId: 'motorola',
    name: 'Motorola Envision 4K TV',
    img: 'https://rukminim2.flixcart.com/image/416/416/xif0q/television/b/q/d/-original-imagsyhzqhyey2cz.jpeg?q=70',
    category: 'tv',
    priority: 2,
    variants: [
      { name: '32 inch', basePrice: 11500 },
      { name: '43 inch', basePrice: 19500 },
      { name: '55 inch', basePrice: 29500 },
    ]
  },

  // --- NOKIA ---
  {
    brandId: 'nokia',
    name: 'Nokia Ultra HD 4K TV',
    img: 'https://rukminim2.flixcart.com/image/416/416/xif0q/television/h/k/q/-original-imaghgzcfhhzhy4g.jpeg?q=70',
    category: 'tv',
    priority: 1,
    variants: [
      { name: '43 inch', basePrice: 20500 },
      { name: '50 inch', basePrice: 26500 },
      { name: '55 inch', basePrice: 31500 },
    ]
  },
  {
    brandId: 'nokia',
    name: 'Nokia QLED Smart TV',
    img: 'https://rukminim2.flixcart.com/image/416/416/ku8pbbk0/television/h/n/p/55qled24-nokia-original-imag7eqpcyyybgyg.jpeg?q=70',
    category: 'tv',
    priority: 2,
    variants: [
      { name: '55 inch', basePrice: 42500 },
      { name: '65 inch', basePrice: 58500 },
    ]
  },

  // --- ACER ---
  {
    brandId: 'acer',
    name: 'Acer I Series 4K TV',
    img: 'https://rukminim2.flixcart.com/image/416/416/xif0q/television/a/l/j/-original-imaghgza5zfhhy9g.jpeg?q=70',
    category: 'tv',
    priority: 1,
    variants: [
      { name: '43 inch', basePrice: 19500 },
      { name: '50 inch', basePrice: 25500 },
      { name: '55 inch', basePrice: 29500 },
    ]
  },
  {
    brandId: 'acer',
    name: 'Acer Advanced I Series',
    img: 'https://rukminim2.flixcart.com/image/416/416/xif0q/television/w/n/e/-original-imagpcdszhhzhy1g.jpeg?q=70',
    category: 'tv',
    priority: 2,
    variants: [
      { name: '32 inch', basePrice: 11500 },
      { name: '43 inch', basePrice: 18500 },
    ]
  }
];

async function main() {
  console.log('Starting TV Seeding (Complete Premium Catalog)...');

  // Ensure TV category is present in Brand records
  const targetBrands = ['samsung', 'sony', 'lg', 'xiaomi', 'oneplus', 'motorola', 'nokia', 'acer'];
  for (const bId of targetBrands) {
    const brand = await prisma.brand.findUnique({ where: { id: bId } });
    if (brand) {
      const currentCats = brand.categories || [];
      const updatedCats = new Set([...currentCats]);
      updatedCats.add('tv');
      updatedCats.add('smarttv');
      
      const newCatsArray = Array.from(updatedCats);
      
      console.log(`Configuring category support for brand: ${brand.name} -> ${JSON.stringify(newCatsArray)}`);
      await prisma.brand.update({
        where: { id: bId },
        data: {
          categories: {
            set: newCatsArray
          }
        }
      });
    } else {
      console.warn(`Warning: Brand with ID '${bId}' not found in database!`);
    }
  }

  // Clear ALL existing TV/Smart TV models to ensure a clean slate
  console.log('\nCleaning up old/generic TV models from database...');
  const deleteResult = await prisma.model.deleteMany({
    where: {
      category: { in: ['tv', 'smarttv'] }
    }
  });
  console.log(`Deleted ${deleteResult.count} old TV models and their associated variants.`);

  // Seed Models and their corresponding Variants
  console.log('\nSeeding new premium TV models...');
  for (const item of TV_MODELS) {
    console.log(`Creating TV Model: ${item.name} for brand: ${item.brandId}`);
    
    const newModel = await prisma.model.create({
      data: {
        brandId: item.brandId,
        name: item.name,
        img: item.img,
        category: 'tv',
        priority: item.priority
      }
    });

    // Create Variants for this Model
    for (const vItem of item.variants) {
      console.log(`  - Creating Variant: ${vItem.name} (Base Price: ₹${vItem.basePrice})`);
      await prisma.variant.create({
        data: {
          modelId: newModel.id,
          name: vItem.name,
          basePrice: vItem.basePrice
        }
      });
    }
  }

  console.log('\nTV Seeding Completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
