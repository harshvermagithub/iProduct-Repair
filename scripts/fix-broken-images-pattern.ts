
import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const prisma = new PrismaClient();

function clean(str: string): string {
    return str.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/\./g, '-')
        .replace(/[()]/g, '')
        .replace(/-+/g, '-');
}

async function checkUrl(url: string) {
    try {
        const { stdout } = await execAsync(`curl -I -s -o /dev/null -w "%{http_code}" ${url}`);
        return parseInt(stdout) === 200;
    } catch {
        return false;
    }
}

async function main() {
    const models = await prisma.model.findMany({
        where: {
            OR: [
                { img: '' },
                { img: { contains: 'placehold' } },
                { img: { contains: 'undefined' } }
            ]
        },
        include: { brand: true }
    });

    console.log(`Found ${models.length} missing/broken images to fix.`);

    for (const m of models) {
        const brand = clean(m.brand.name);
        const model = clean(m.name);

        // Remove brand from model name if repeated
        const modelSimple = model.replace(new RegExp(`^${brand}-`), '');

        const candidates: string[] = [];

        // Brand specific logic
        if (brand === 'oneplus') {
            candidates.push(`oneplus-${modelSimple}`); // oneplus-12
            candidates.push(`${brand}-${modelSimple}`); // oneplus-oneplus-12
        } else if (brand === 'poco' || m.brand.name.toLowerCase() === 'poco') {
            // Poco is usually xiaomi-poco-...
            candidates.push(`xiaomi-poco-${modelSimple}`);
            candidates.push(`xiaomi-poco-${modelSimple}-pro`); // sometimes -pro suffix if model has it
            candidates.push(`xiaomi-poco-${modelSimple}-5g`);
        } else if (brand === 'iqoo' || m.brand.name.toLowerCase() === 'iqoo') {
            // iQOO is usually vivo-iqoo-...
            candidates.push(`vivo-iqoo-${modelSimple}`);
            candidates.push(`vivo-iqoo-${modelSimple}-pro`);
        } // For Realme, Moto, Oppo, standard brand-model usually works
        else {
            candidates.push(`${brand}-${modelSimple}`);
            candidates.push(`${brand}-${modelSimple}-5g`);
            // Try removing brand prefix from result just in case? Usually GSMArena needs brand.

            // Xiaomi might contain 'redmi' or 'mi' quirks, but let's try standard first.
            // If brand is 'xiaomi' and model is 'redmi note 13', we get 'xiaomi-redmi-note-13'. Correct.
        }

        let found = false;
        for (const slug of candidates) {
            const url = `https://fdn2.gsmarena.com/vv/bigpic/${slug}.jpg`;
            // console.log(`Checking ${url}...`);
            if (await checkUrl(url)) {
                console.log(`Fixing ${m.name} -> ${url}`);
                await prisma.model.update({ where: { id: m.id }, data: { img: url } });
                found = true;
                break;
            }
        }

        if (!found) {
            console.log(`Failed to guess image for ${m.name} (Tried: ${candidates.join(', ')})`);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
