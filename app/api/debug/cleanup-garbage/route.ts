
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const key = searchParams.get('key');
        if (key !== process.env.INTERNAL_API_KEY && process.env.NODE_ENV === 'production') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const brands = await prisma.brand.findMany();
        const deleted = [];
        const failed = [];

        const SAFE_SHORT_BRANDS = ['LG', 'HP', 'Mi'];

        for (const brand of brands) {
            const nameLower = brand.name.toLowerCase();
            const shouldDelete =
                (brand.name.length < 3 && !SAFE_SHORT_BRANDS.includes(brand.name)) ||
                ['as', 'nn', 'test', 'temp', 'garbage'].includes(nameLower);

            if (shouldDelete) {
                try {
                    // Start transaction to potentially delete relations if needed? 
                    // For now just try delete brand. 
                    // To handle orphans with models, we might need to delete models first.
                    // But for now, just delete brand.
                    // Check if it has models first to be safe.
                    const models = await prisma.model.findMany({ where: { brandId: brand.id } });
                    if (models.length > 0) {
                        // Cascade delete models? 
                        // Let's assume junk brands have junk models.
                        await prisma.variant.deleteMany({
                            where: { model: { brandId: brand.id } }
                        });
                        await prisma.model.deleteMany({
                            where: { brandId: brand.id }
                        });
                    }

                    await prisma.brand.delete({ where: { id: brand.id } });
                    deleted.push(brand.name);
                } catch (err) {
                    console.error(`Failed to delete ${brand.name}:`, err);
                    failed.push({ name: brand.name, error: String(err) });
                }
            }
        }

        return NextResponse.json({ deleted, failed });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
