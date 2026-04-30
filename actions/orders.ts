
'use server';

import { db } from '@/lib/store';
import { getSession } from '@/lib/session';
import { sendSystemEmail } from '@/lib/email';
// import { redirect } from 'next/navigation';

export async function placeOrder(
    device: string,
    variant: string,
    price: number,
    address: string,
    pincode: string,
    location: { lat: number; lng: number } | null,
    answers: unknown
) {
    const session = await getSession();
    if (!session || !session.user) {
        throw new Error('Unauthorized');
    }

    const order = {
        id: crypto.randomUUID(),
        userId: session.user.id,
        device: `${device} (${variant})`,
        price,
        date: new Date().toISOString(),
        status: 'Pending Pickup',
        address,
        pincode,
        location,
        answers
    };

    await db.addOrder(order);

    const user = await db.findUserById(session.user.id);
    if (user?.email) {
        const orderHtml = `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #10b981; border-radius: 10px;">
            <h2 style="color: #10b981;">Order Confirmed!</h2>
            <p>Dear ${session.user.name}, your request to sell your <b>${device} (${variant})</b> has been successfully recorded.</p>
            <div style="background-color: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><b>Estimated Value:</b> ₹${price}</p>
                <p><b>Status:</b> Pending Pickup</p>
            </div>
            <p>Our team will review your order and allocate a dedicated executive to your address for pickup shortly.</p>
            <p style="color: #888; font-size: 12px; margin-top: 20px;">Fonzkart Logistics</p>
          </div>
        `;
        sendSystemEmail(user.email, 'Fonzkart: Order Confirmed', orderHtml);
    }

    return { success: true };
}

export async function getUserOrders() {
    const session = await getSession();
    if (!session || !session.user) return [];

    return await db.getOrders(session.user.id);
}
