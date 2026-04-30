
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || !['SUPER_ADMIN', 'ADMIN', 'ZONAL_HEAD'].includes(session.user?.role || '')) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const body = await request.json();
        const { action, ids, reason } = body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return new NextResponse('No IDs provided', { status: 400 });
        }

        if (action === 'bulk_fail') {
            const orders = await prisma.order.findMany({
                where: { id: { in: ids } }
            });

            const updates = orders.map(async (order) => {
                let answersObj: any = {};
                if (order.answers && typeof order.answers === 'string') {
                    try { answersObj = JSON.parse(order.answers); } catch (e) { }
                }

                if (!answersObj.failLog) answersObj.failLog = [];
                answersObj.failLog.push({ 
                    date: new Date().toISOString(), 
                    reason: reason || 'Bulk failure' 
                });

                return prisma.order.update({
                    where: { id: order.id },
                    data: {
                        status: 'failed',
                        answers: JSON.stringify(answersObj)
                    }
                });
            });

            await Promise.all(updates);
            return NextResponse.json({ success: true, count: ids.length });
        }

        if (action === 'bulk_delete') {
            await prisma.order.deleteMany({
                where: { id: { in: ids } }
            });
            return NextResponse.json({ success: true, count: ids.length });
        }

        return new NextResponse('Invalid action', { status: 400 });
    } catch (error: any) {
        console.error('Bulk Order API error:', error);
        return new NextResponse('Internal error', { status: 500 });
    }
}
