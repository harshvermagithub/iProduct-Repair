
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
    const key = req.nextUrl.searchParams.get('key');
    if (key !== process.env.INTERNAL_API_KEY && process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const email = req.nextUrl.searchParams.get('email');
    if (!email) return NextResponse.json({ error: 'Email required' });

    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });
        return NextResponse.json({ user });
    } catch (e) {
        return NextResponse.json({ error: String(e) });
    }
}
