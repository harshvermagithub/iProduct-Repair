const xlsx = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const SOURCE_FILE = './imgs/Smartphone Buyback Prices.xlsx';
const SHEET_NAME = 'Samsung Galaxy';
const SOURCE_IMG_DIR = './imgs/Samsung';
const PUBLIC_IMG_DIR = './public/models/samsung';

// Ensure public directory exists
if (!fs.existsSync(PUBLIC_IMG_DIR)) {
    fs.mkdirSync(PUBLIC_IMG_DIR, { recursive: true });
}

// Map files for normalized lookup
const fileMap = new Map();
try {
    const files = fs.readdirSync(SOURCE_IMG_DIR);
    files.forEach(f => {
        // Remove extensions (handle .png.webp, etc.)
        const nameNoExt = f.replace(/(\.png|\.jpeg|\.jpg|\.webp)+$/i, '');

        // Normalize: samsung_galaxy_s23_ultra -> s23ultra
        // Remove samsung, galaxy, 5g, 4g, space, _, -
        const norm = nameNoExt.toLowerCase()
            .replace(/samsung/g, '')
            .replace(/galaxy/g, '')
            .replace(/5g/g, '')
            .replace(/4g/g, '')
            .replace(/[^a-z0-9]/g, '');
        // Store mapping from normalized name to actual filename
        // Prefer shorter filenames or those without 'copy'? Usually exact match unique.
        fileMap.set(norm, f);
    });
    console.log(`Mapped ${fileMap.size} images from source directory.`);
} catch (e) {
    console.warn("Could not read source image directory:", e.message);
}

function calculatePriority(name) {
    let score = 900; // Default (Low priority)
    const n = name.toLowerCase();

    // Series Base Scores (Lower is Better/First)
    if (n.includes('z fold') || n.includes('fold')) score = 100;
    else if (n.includes('z flip') || n.includes('flip')) score = 150;
    else if (n.includes('s series') || n.match(/\bs\d+/)) score = 200; // S24, S23...
    else if (n.includes('note')) score = 300;
    else if (n.includes('a series') || n.match(/\ba\d+/)) score = 400;
    else if (n.includes('m series') || n.match(/\bm\d+/)) score = 500;
    else if (n.includes('f series') || n.match(/\bf\d+/)) score = 600;

    // Extract Number to subtract (Newer = Lower Score)
    const match = n.match(/(\d+)/);
    if (match) {
        const num = parseInt(match[1], 10);
        // Cap subtraction to avoid negatives or crossover overlap too much
        // e.g. S24 -> -24. S10 -> -10.
        score -= num;
    }

    // Modifier for Variant Hierarchy (Ultra > Plus > Base > FE > Lite)
    if (n.includes('ultra')) score -= 5;
    else if (n.includes('plus') || n.includes('+') || n.includes('pro')) score -= 3;
    else if (n.includes('fe')) score += 5;
    else if (n.includes('lite') || n.includes('core')) score += 10;

    return Math.max(1, score); // Ensure min 1
}

function cleanPrice(priceRaw) {
    if (!priceRaw) return 0;
    if (typeof priceRaw === 'number') return Math.round(priceRaw);
    return parseInt(priceRaw.toString().replace(/[^0-9]/g, ''), 10) || 0;
}

async function main() {
    console.log(`Reading ${SHEET_NAME} from ${SOURCE_FILE}...`);
    const wb = xlsx.readFile(SOURCE_FILE);
    const sheet = wb.Sheets[SHEET_NAME];
    if (!sheet) {
        console.error(`Sheet ${SHEET_NAME} not found!`);
        return;
    }

    const data = xlsx.utils.sheet_to_json(sheet);
    console.log(`Found ${data.length} rows.`);

    // Upsert Brand (Find by name first since name is not unique constraint)
    let brand = await prisma.brand.findFirst({ where: { name: 'Samsung' } });

    if (!brand) {
        console.log("Creating new brand: Samsung");
        brand = await prisma.brand.create({
            data: {
                id: 'samsung',
                name: 'Samsung',
                priority: 3,
                logo: '/brands/samsung.png',
                categories: ['smartphone']
            }
        });
    } else {
        console.log(`Found existing brand: ${brand.name} (${brand.id})`);
        // Ensure smartphone category exists
        let cats = brand.categories || [];
        if (!cats.includes('smartphone')) {
            cats.push('smartphone');
            await prisma.brand.update({
                where: { id: brand.id },
                data: { categories: cats }
            });
            console.log("Added 'smartphone' category to Samsung.");
        }
    }

    // Group by Model Name
    const modelGroups = {};
    data.forEach(row => {
        const modelName = row['Model']; // Column Name from sheet
        const variantName = row['Storage Variant']; // "8GB/256GB" or "256GB"
        const price = row['New Price (+5%) (₹)'];

        if (!modelName) return;

        // Clean Model Name
        let name = modelName.trim();
        // Remove "Samsung" prefix if repeated in model name?
        // Sheet likely has "Galaxy S23". Brand is Samsung. So Model Name "Galaxy S23" is fine.
        // Or "Samsung Galaxy S23".
        // Let's strip "Samsung" from model name to be cleaner?
        // "Samsung Galaxy S24 Ultra" -> "Galaxy S24 Ultra"
        name = name.replace(/^Samsung\s+/i, '');

        if (!modelGroups[name]) {
            modelGroups[name] = [];
        }
        modelGroups[name].push({ variantName, price });
    });

    console.log(`Processing ${Object.keys(modelGroups).length} unique models...`);

    for (const [modelName, variants] of Object.entries(modelGroups)) {
        // Image Matching
        // Sheet: "Galaxy S24 Ultra" -> Norm: "galaxys24ultra" -> "s24ultra"?
        // My fileMap norm removed 'galaxy'.
        // So I should clean row model name similarly for matching.
        const normModel = modelName.toLowerCase()
            .replace(/samsung/g, '')
            .replace(/galaxy/g, '')
            .replace(/5g/g, '')
            .replace(/4g/g, '')
            .replace(/[^a-z0-9]/g, '');

        let imgFilename = fileMap.get(normModel);

        // Fallback: try partial match? S24 Ultra matching S24 Ultra 5G?
        if (!imgFilename) {
            // keys are like s23ultra.
            // normModel s23ultra.
            // Maybe file has extra?
            // Maybe try iterating keys?
            for (const [key, val] of fileMap.entries()) {
                if (key.includes(normModel) || normModel.includes(key)) {
                    // Check length diff to avoid S23 matching S23 Ultra
                    if (Math.abs(key.length - normModel.length) < 3) {
                        imgFilename = val;
                        break;
                    }
                }
            }
        }

        let imgPath = '/placeholder.png';
        if (imgFilename) {
            // Copy file
            try {
                fs.copyFileSync(path.join(SOURCE_IMG_DIR, imgFilename), path.join(PUBLIC_IMG_DIR, imgFilename));
                imgPath = `/models/samsung/${imgFilename}`;
            } catch (e) {
                console.warn(`Failed to copy image for ${modelName}:`, e.message);
            }
        } else {
            console.warn(`No image found for ${modelName} (Norm: ${normModel})`);
        }

        const priority = calculatePriority(modelName);

        // Upsert Model
        const modelSlug = modelName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        // Collision check? "Galaxy S23" vs "S23".
        // I'll prepend 'samsung-' to slug to avoid collision with other brands if names overlap (unlikely for "Galaxy").
        // But iPhone checks ID uniqueness.
        const id = `samsung-${modelSlug}`;

        const model = await prisma.model.upsert({
            where: { id },
            update: {
                img: imgPath,
                priority: priority,
                brandId: brand.id
            },
            create: {
                id,
                name: modelName,
                img: imgPath,
                brandId: brand.id,
                priority: priority
            }
        });

        // Clear existing variants to prevent stale/duplicate data
        await prisma.variant.deleteMany({ where: { modelId: model.id } });

        // Add Variants
        for (const v of variants) {
            if (!v.variantName) continue; // Skip if no variant info
            const p = cleanPrice(v.price);

            await prisma.variant.create({
                data: {
                    name: v.variantName.toString(),
                    basePrice: p,
                    modelId: model.id
                }
            });
        }
        process.stdout.write('.');
    }
    console.log('\nDone!');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => await prisma.$disconnect());
