'use server';

import { db } from '@/lib/store';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/session';

export async function loginExecutive(phone: string, password?: string) {
    const riders = await db.getRiders();
    const executive = riders.find(r => r.phone === phone);

    if (!executive) {
        return { success: false, error: 'Phone number not found. Access denied.' };
    }

    // Check if onboarding is needed
    if (!executive.password) {
        return { success: true, needsOnboarding: true, id: executive.id };
    }

    // If already onboarded, verify password
    if (!password) {
        return { success: false, error: 'Password required' };
    }

    if (executive.password !== password) {
        return { success: false, error: 'Invalid password' };
    }

    // Set session
    const cookieStore = await cookies();
    cookieStore.set('executive_id', executive.id, { httpOnly: true, path: '/' });

    redirect('/admin/orders');
}

export async function onboardExecutive(id: string, password: string) {
    const riders = await db.getRiders();
    const executive = riders.find(r => r.id === id);

    if (!executive) return { success: false, error: 'Executive not found' };

    await db.updateRiderPassword(id, password);

    const cookieStore = await cookies();
    cookieStore.set('executive_id', executive.id, { httpOnly: true, path: '/' });

    redirect('/admin/orders');
}

export async function logoutExecutive() {
    const cookieStore = await cookies();
    cookieStore.delete('executive_id');
    redirect('/login');
}

export async function getExecutiveSession() {
    const cookieStore = await cookies();
    const executiveId = cookieStore.get('executive_id')?.value;
    
    if (executiveId) {
        const riders = await db.getRiders();
        return riders.find(r => r.id === executiveId) || null;
    }

    // Try main session
    const session = await getSession();
    if (session?.user?.role === 'FIELD_EXECUTIVE') {
        const riders = await db.getRiders();
        
        // 1. Try to find user record to get phone
        const { prisma } = await import('@/lib/db');
        const prismaUser = await prisma.user.findUnique({ where: { id: session.user.id } });
        if (prismaUser?.phone) {
            const executive = riders.find(r => r.phone === prismaUser.phone);
            if (executive) return executive;
        }

        // 2. Fallback to ID match
        const executiveById = riders.find(r => r.id === session.user.id);
        if (executiveById) return executiveById;
    }
    
    return null;
}

export async function getExecutiveOrders() {
    const executive = await getExecutiveSession();
    if (!executive) return [];

    const allOrders = await db.getAllOrders();
    // Filter orders assigned to this executive
    return allOrders.filter(o => o.riderId === executive.id);
}

export async function updateOrderStatus(orderId: string, status: string, reason?: string) {
    const executive = await getExecutiveSession();
    if (!executive) throw new Error('Unauthorized');

    if (status === 'failed') {
        const { prisma } = await import('@/lib/db');
        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (order) {
            let answersObj: any = {};
            if (order.answers && typeof order.answers === 'string') {
                try { answersObj = JSON.parse(order.answers); } catch (e) { }
            }
            if (!answersObj.failLog) answersObj.failLog = [];
            answersObj.failLog.push({ 
                date: new Date().toISOString(), 
                reason: reason || 'Handled by executive', 
                by: 'executive' 
            });

            await prisma.order.update({
                where: { id: orderId },
                data: {
                    status: 'failed',
                    answers: JSON.stringify(answersObj)
                }
            });
            revalidatePath('/pickup/dashboard');
            revalidatePath('/admin/orders');
            return { success: true };
        }
    }

    await db.updateOrderStatus(orderId, status);
    revalidatePath('/admin/orders');
    return { success: true };
}

export async function submitVerification(orderId: string, payload: { riderAnswers: any, verificationImages: string[], offeredPrice: number }) {
    const executive = await getExecutiveSession();
    if (!executive) throw new Error('Unauthorized');

    // Make Prisma raw update for new fields
    const { prisma } = await import('@/lib/db');
    await prisma.order.update({
        where: { id: orderId },
        data: {
            status: 'pending_verification',
            riderAnswers: JSON.stringify(payload.riderAnswers),
            verificationImages: payload.verificationImages,
            offeredPrice: payload.offeredPrice
        }
    });

    revalidatePath('/admin/orders');
    return { success: true };
}
