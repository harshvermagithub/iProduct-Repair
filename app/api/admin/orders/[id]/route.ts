import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const session = await getSession();
        if (!session || !['SUPER_ADMIN', 'ADMIN', 'ZONAL_HEAD', 'PARTNER'].includes(session.user?.role || '')) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // Wait for context params resolution
        const resolvedParams = await context.params;
        const id = resolvedParams.id;

        const body = await request.json();
        const { action, overridePrice } = body;

        if (action === 'approve_verification') {
            const order = await prisma.order.findUnique({ where: { id } });
            if (!order) return new NextResponse('Not found', { status: 404 });

            await prisma.order.update({
                where: { id },
                data: {
                    status: 'picked_up',
                    // @ts-ignore
                    price: overridePrice ? Number(overridePrice) : (order.offeredPrice || order.price) // Commit the offered or overridden price
                }
            });
            return NextResponse.json({ success: true });
        } else if (action === 'reject_verification') {
            const { reason } = body;
            const order = await prisma.order.findUnique({ where: { id } });
            if (!order) return new NextResponse('Not found', { status: 404 });

            let answersObj: any = {};
            if (order.answers && typeof order.answers === 'string') {
                try { answersObj = JSON.parse(order.answers); } catch (e) { }
            }

            if (reason) {
                if (!answersObj.adminRejectionLog) answersObj.adminRejectionLog = [];
                answersObj.adminRejectionLog.push({ date: new Date().toISOString(), reason });
            }

            // Send back to the rider
            await prisma.order.update({
                where: { id },
                data: {
                    status: 'assigned',
                    verificationImages: { set: [] },
                    offeredPrice: null,
                    riderAnswers: null,
                    answers: JSON.stringify(answersObj)
                }
            });
            return NextResponse.json({ success: true });
        } else if (action === 'fail_order') {
            const { reason } = body;
            const order = await prisma.order.findUnique({ where: { id } });
            if (!order) return new NextResponse('Not found', { status: 404 });

            let answersObj: any = {};
            if (order.answers && typeof order.answers === 'string') {
                try { answersObj = JSON.parse(order.answers); } catch (e) { }
            }

            if (reason) {
                if (!answersObj.failLog) answersObj.failLog = [];
                answersObj.failLog.push({ date: new Date().toISOString(), reason });
            }

            await prisma.order.update({
                where: { id },
                data: {
                    status: 'failed',
                    answers: JSON.stringify(answersObj)
                }
            });
            return NextResponse.json({ success: true });
        }

        return new NextResponse('Invalid action', { status: 400 });
    } catch (error: any) {
        console.error('Order API error:', error);
        return new NextResponse('Internal error', { status: 500 });
    }
}
