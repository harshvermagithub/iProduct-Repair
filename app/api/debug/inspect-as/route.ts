
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
    try {
        const brands = await prisma.brand.findMany({
            select: { id: true, name: true, categories: true }
        });
        // Loose search
        const suspicious = brands.filter(b => b.name.toLowerCase().includes('as'));
        return NextResponse.json(suspicious);
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
