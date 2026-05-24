import * as fs from 'fs';
import * as path from 'path';

const BRANDS = [
  'motorola', 'xiaomi',    'samsung',
  'oneplus',  'nokia',     'sony',
  'micromax', 'haier',     'lg',
  'onida',    'videocon',  'sansui',
  'philips',  'panasonic', 'toshiba',
  'intex',    'tcl',       'vu',
  'bpl',      'hisense',   'aoc',
  'belco',    'bravieo',   'Blaupunkt',
  'kodak',    'lloyd',     'iffalcon',
  'thomson',  'sanyo',     'polaroid',
  'oscar',    'noble',     'mitashi',
  'weston',   'coocaa',    'marq',
  'infocus'
];

interface ModelData {
  name: string;
  img: string;
}

interface BrandData {
  brandId: string;
  brandName: string;
  logo: string;
  models: ModelData[];
}

// Helper sleep function to avoid spamming the server
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function scrapeBrand(brandSlug: string): Promise<BrandData | null> {
  const url = `https://www.cashify.in/sell-old-television/sell-${brandSlug.toLowerCase()}`;
  console.log(`Scraping TV Brand page: ${url}...`);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
      }
    });
    if (!response.ok) {
      console.log(`Failed to fetch brand page for ${brandSlug}: HTTP ${response.status}`);
      return null;
    }

    const html = await response.text();

    // 1. Find the Brand Name (e.g. from Title or Canonical Title or metadata)
    let brandName = brandSlug.charAt(0).toUpperCase() + brandSlug.slice(1);
    const titleMatch = html.match(/<title>Sell Old ([A-Za-z0-9\s]+) Television/i);
    if (titleMatch && titleMatch[1]) {
      brandName = titleMatch[1].trim();
    }

    // 2. Find all product cards or specific model text containing "inches TV"
    // Cashify uses: [BrandName] [Size] inches TV
    const modelPattern = new RegExp(`>([^<]*?${brandName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\s+\\d+\\s+to\\s+\\d+\\s+inches\\s+TV[^<]*?)<`, 'gi');
    let match;
    const modelNames = new Set<string>();
    while ((match = modelPattern.exec(html)) !== null) {
      modelNames.add(match[1].trim());
    }

    // Fallback: If no exact brandName match, find any text containing "inches TV"
    if (modelNames.size === 0) {
      const fallbackPattern = />([^<]*?\d+\s+to\\s+\d+\\s+inches\s+TV[^<]*?)</gi;
      while ((match = fallbackPattern.exec(html)) !== null) {
        modelNames.add(match[1].trim());
      }
    }

    // Let's also search for images from cashify CDN
    const imgRegex = /https:\/\/s3ng\.cashify\.in\/cashify\/product\/img\/xhdpi\/[a-f0-9-]+\.(?:jpg|png|jpeg)/g;
    const imgUrls = Array.from(new Set(html.match(imgRegex) || []));

    // Find the Brand Logo
    let brandLogo = '';
    const logoRegex = new RegExp(`https://s3ng\\.cashify\\.in/cashify/brand/img/xhdpi/[a-f0-9-]+\\.(?:jpg|png|jpeg)`, 'g');
    const logoUrls = Array.from(new Set(html.match(logoRegex) || []));
    if (logoUrls.length > 0) {
      brandLogo = logoUrls[0];
    }

    const modelsList = Array.from(modelNames);
    console.log(`  - Found ${modelsList.length} models, logo: ${brandLogo}, product images: ${imgUrls.length}`);

    const models: ModelData[] = [];
    // Map models to corresponding images. If there are multiple models, they usually map 1:1 or we fall back.
    // Cashify renders them in order. Let's align them in order.
    for (let i = 0; i < modelsList.length; i++) {
      const mName = modelsList[i];
      // Find an image. If there are enough product images, match index, else use first one or fallback.
      const mImg = imgUrls[i] || imgUrls[0] || 'https://placehold.co/600x400/png?text=Smart+TV';
      models.push({
        name: mName,
        img: mImg
      });
    }

    // If we couldn't find models or images, return generic models
    if (models.length === 0) {
      // Create generic size models if not parsed
      const defaultSizes = ['32 to 35 inches TV', '36 to 40 inches TV', '41 to 50 inches TV', '51 to 60 inches TV', '61 to 70 inches TV', '71 to 80 inches TV'];
      const defaultImg = imgUrls[0] || 'https://placehold.co/600x400/png?text=Smart+TV';
      for (const size of defaultSizes) {
        models.push({
          name: `${brandName} ${size}`,
          img: defaultImg
        });
      }
    }

    return {
      brandId: brandSlug,
      brandName,
      logo: brandLogo,
      models
    };
  } catch (e: any) {
    console.error(`Error scraping ${brandSlug}:`, e.message);
    return null;
  }
}

async function main() {
  console.log('--- STARTING ALL-BRAND TV SCRAPING FLOW ---');
  const results: BrandData[] = [];

  for (const bSlug of BRANDS) {
    const data = await scrapeBrand(bSlug);
    if (data) {
      results.push(data);
    }
    // Sleep to avoid rate limiting
    await sleep(600);
  }

  // Save the scraped results
  const outPath = 'scripts/scraped_tv_data.json';
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`\nSuccessfully scraped ${results.length} brands! Saved to: ${outPath}`);
}

main().catch(console.error);
