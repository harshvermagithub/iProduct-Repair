
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { randomUUID } from 'crypto';

// Data derived from provided images
const IPHONE_DATA = [
    { name: 'iPhone X', variants: [{ name: '64GB', price: 9280 }, { name: '256GB', price: 9770 }] },
    { name: 'iPhone XR', variants: [{ name: '64GB', price: 9460 }, { name: '128GB', price: 9700 }, { name: '256GB', price: 9950 }] },
    { name: 'iPhone XS', variants: [{ name: '64GB', price: 10200 }, { name: '256GB', price: 11250 }, { name: '512GB', price: 11580 }] },
    { name: 'iPhone XS Max', variants: [{ name: '64GB', price: 11760 }, { name: '256GB', price: 12040 }, { name: '512GB', price: 12440 }] },
    { name: 'iPhone 11', variants: [{ name: '64GB', price: 13390 }, { name: '128GB', price: 13910 }, { name: '256GB', price: 14450 }] },
    { name: 'iPhone 11 Pro', variants: [{ name: '64GB', price: 16230 }, { name: '256GB', price: 16950 }, { name: '512GB', price: 17440 }] },
    { name: 'iPhone 11 Pro Max', variants: [{ name: '64GB', price: 17050 }, { name: '256GB', price: 19040 }, { name: '512GB', price: 19520 }] },
    { name: 'iPhone SE 2020', variants: [{ name: '64GB', price: 7420 }, { name: '128GB', price: 7710 }, { name: '256GB', price: 7910 }] },
    { name: 'iPhone 12', variants: [{ name: '64GB', price: 16210 }, { name: '128GB', price: 17610 }, { name: '256GB', price: 18070 }] },
    { name: 'iPhone 12 Mini', variants: [{ name: '64GB', price: 14090 }, { name: '128GB', price: 14770 }, { name: '256GB', price: 15020 }] },
    { name: 'iPhone 12 Pro', variants: [{ name: '128GB', price: 23350 }, { name: '256GB', price: 23840 }, { name: '512GB', price: 24320 }] },
    { name: 'iPhone 12 Pro Max', variants: [{ name: '128GB', price: 24820 }, { name: '256GB', price: 26760 }, { name: '512GB', price: 27170 }] },
    { name: 'iPhone 13', variants: [{ name: '128GB', price: 29960 }, { name: '256GB', price: 30860 }, { name: '512GB', price: 31680 }] },
    { name: 'iPhone 13 Mini', variants: [{ name: '128GB', price: 25440 }, { name: '256GB', price: 26880 }, { name: '512GB', price: 27260 }] },
    { name: 'iPhone 13 Pro', variants: [{ name: '128GB', price: 42830 }, { name: '256GB', price: 43510 }, { name: '512GB', price: 44000 }, { name: '1TB', price: 44880 }] },
    { name: 'iPhone 13 Pro Max', variants: [{ name: '128GB', price: 44790 }, { name: '256GB', price: 45960 }, { name: '512GB', price: 48270 }, { name: '1TB', price: 49000 }] },
    { name: 'iPhone 14', variants: [{ name: '128GB', price: 34330 }, { name: '256GB', price: 35000 }, { name: '512GB', price: 36480 }] },
    { name: 'iPhone 14 Pro', variants: [{ name: '128GB', price: 53070 }, { name: '256GB', price: 55970 }, { name: '512GB', price: 57230 }, { name: '1TB', price: 57910 }] },
    { name: 'iPhone 14 Pro Max', variants: [{ name: '128GB', price: 57040 }, { name: '256GB', price: 60630 }, { name: '512GB', price: 61600 }, { name: '1TB', price: 62370 }] },
    { name: 'iPhone 14 Plus', variants: [{ name: '128GB', price: 36990 }, { name: '256GB', price: 37470 }, { name: '512GB', price: 38590 }] },
    { name: 'iPhone 15', variants: [{ name: '128GB', price: 38040 }, { name: '256GB', price: 42700 }, { name: '512GB', price: 44590 }] },
    { name: 'iPhone 15 Pro', variants: [{ name: '128GB', price: 62400 }, { name: '256GB', price: 65520 }, { name: '512GB', price: 66110 }, { name: '1TB', price: 66790 }] },
    { name: 'iPhone 15 Pro Max', variants: [{ name: '256GB', price: 74980 }, { name: '512GB', price: 76440 }, { name: '1TB', price: 77030 }] },
    { name: 'iPhone 15 Plus', variants: [{ name: '128GB', price: 44410 }, { name: '256GB', price: 46660 }, { name: '512GB', price: 47330 }] },
    { name: 'iPhone 16', variants: [{ name: '128GB', price: 47430 }, { name: '256GB', price: 49200 }, { name: '512GB', price: 50290 }] },
    { name: 'iPhone 16 Plus', variants: [{ name: '128GB', price: 49780 }, { name: '256GB', price: 51250 }, { name: '512GB', price: 53460 }] },
    { name: 'iPhone 16 Pro', variants: [{ name: '128GB', price: 70000 }, { name: '256GB', price: 72600 }, { name: '512GB', price: 74100 }, { name: '1TB', price: 75400 }] },
    { name: 'iPhone 16 Pro Max', variants: [{ name: '256GB', price: 87100 }, { name: '512GB', price: 89700 }, { name: '1TB', price: 91000 }] },
    { name: 'iPhone 16e', variants: [{ name: '128GB', price: 36000 }, { name: '256GB', price: 38500 }, { name: '512GB', price: 43000 }] },
    { name: 'iPhone 17', variants: [{ name: '256GB', price: 58500 }, { name: '512GB', price: 67000 }] },
    { name: 'iPhone 17 Pro', variants: [{ name: '256GB', price: 89000 }, { name: '512GB', price: 93000 }, { name: '1TB', price: 105000 }] },
    { name: 'iPhone Air', variants: [{ name: '256GB', price: 77000 }, { name: '512GB', price: 86500 }, { name: '1TB', price: 95500 }] },
    { name: 'iPhone 17 Pro Max', variants: [{ name: '256GB', price: 98000 }, { name: '512GB', price: 106000 }, { name: '1TB', price: 114000 }, { name: '2TB', price: 125000 }] },
];

export async function GET(req: Request) {
    try {
        // Protect this heavy route from unauthorized calls
        const { searchParams } = new URL(req.url);
        const key = searchParams.get('key');
        if (key !== process.env.INTERNAL_API_KEY && process.env.NODE_ENV === 'production') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let log = '';
        const apple = await prisma.brand.findUnique({ where: { id: 'apple' } });
        if (!apple) {
            // Need to handle apple not existing? Unlikely.
            log += 'Error: Apple brand missing. Cannot sync.\n';
            return NextResponse.json({ error: 'Apple brand missing', log });
        }

        log += `--- Starting iPhone Price Sync ---\n`;

        for (const item of IPHONE_DATA) {
            // 1. Find or Create Model
            let model = await prisma.model.findFirst({
                where: {
                    brandId: 'apple',
                    name: { equals: item.name, mode: 'insensitive' }
                }
            });

            if (!model) {
                log += `Creating Model: ${item.name}\n`;
                model = await prisma.model.create({
                    data: {
                        id: randomUUID(),
                        brandId: 'apple',
                        name: item.name,
                        category: 'smartphone',
                        img: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
                        priority: 100
                    }
                });
            } else {
                // log += `Found Model: ${item.name}\n`;
            }

            // 2. Find or Create Variants
            for (const v of item.variants) {
                const vName = v.name.toUpperCase();
                let variant = await prisma.variant.findFirst({
                    where: {
                        modelId: model.id,
                        name: { equals: vName, mode: 'insensitive' }
                    }
                });

                if (variant) {
                    // Check if price changed
                    if (variant.basePrice !== v.price) {
                        await prisma.variant.update({
                            where: { id: variant.id },
                            data: { basePrice: v.price }
                        });
                        log += `Updated ${item.name} ${vName} price: ${variant.basePrice} -> ${v.price}\n`;
                    }
                } else {
                    await prisma.variant.create({
                        data: {
                            id: randomUUID(),
                            modelId: model.id,
                            name: vName,
                            basePrice: v.price
                        }
                    });
                    log += `Created ${item.name} ${vName} at ${v.price}\n`;
                }
            }
        }

        log += `--- Sync Complete ---\n`;
        revalidatePath('/');
        revalidatePath('/sell');

        return NextResponse.json({ success: true, log });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
