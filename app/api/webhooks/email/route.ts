import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// This is the universal webhook endpoint for your self-hosted mail server (like Postal)
// Point your custom mail server to POST inbound emails to:
// https://www.fonzkart.in/api/webhooks/email
export async function POST(req: Request) {
    try {
        const payload = await req.json();

        // Adjust these field mappings dynamically based on what your custom Mail Server 
        // formats inbound webhooks as (Postal, Mailgun, Sendgrid, etc. all serialize slightly differently)
        const from = payload.from || payload.mail_from || 'Unknown';
        const to = payload.to || payload.rcpt_to || 'Unknown';
        const subject = payload.subject || 'No Subject';
        const bodyText = payload.text || payload.plain_body || '';
        const bodyHtml = payload.html || payload.html_body || '';

        // Avoid self-loops if somehow the outbound email is caught here
        if (from.includes('@fonzkart.in') && to.includes('@fonzkart.in')) {
            console.log('Detected internal loop, ignoring webhook for', subject);
            return NextResponse.json({ status: 'ignored' });
        }

        await prisma.emailMessage.create({
            data: {
                from,
                to,
                subject,
                bodyText,
                bodyHtml,
                isOutbound: false,
                status: 'delivered',
            }
        });

        console.log(`[CUSTOM MAIL SERVER INBOUND] Received email from ${from} to ${to}: ${subject}`);
        return NextResponse.json({ status: 'ok' });
    } catch (error) {
        console.error('Error handling email webhook from custom mail server', error);
        return NextResponse.json({ error: 'Failed to handle webhook' }, { status: 500 });
    }
}
