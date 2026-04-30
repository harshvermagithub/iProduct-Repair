'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import nodemailer from 'nodemailer';

// Ensure the NodeMailer transport uses standard SMTP environment variables
// This completely unhooks the application from Resend.
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: process.env.SMTP_SECURE === 'true' || true, // true for 465, false for 587/25
    auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
    },
});

export async function getEmails() {
    return await prisma.emailMessage.findMany({
        orderBy: {
            receivedAt: 'desc'
        }
    });
}

export async function sendEmail(prevState: { error?: string, success?: string } | null, formData: FormData) {
    const to = formData.get('to') as string;
    const subject = formData.get('subject') as string;
    const bodyText = formData.get('bodyText') as string;

    // Uses standard SMTP variables
    const fromAddress = process.env.SMTP_FROM || 'support@fonzkart.in';
    const fromName = process.env.SMTP_FROM_NAME || 'Fonzkart Support';
    const from = `"${fromName}" <${fromAddress}>`;

    if (!to || !subject || !bodyText) {
        return { error: 'Please fill all fields.' };
    }

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        return { error: 'Your custom Mail Server is not hooked up yet. Please provide SMTP_HOST, SMTP_USER, and SMTP_PASS in the Vercel variables.' };
    }

    try {
        await transporter.sendMail({
            from,
            to,
            subject,
            text: bodyText,
        });

        // Save to Database
        await prisma.emailMessage.create({
            data: {
                from,
                to,
                subject,
                bodyText,
                isOutbound: true,
                status: 'sent',
            }
        });

        revalidatePath('/admin/email');
        return { success: 'Email successfully routed through custom Mail Server!' };
    } catch (e: unknown) {
        return { error: e instanceof Error ? e.message : 'Failed to connect to SMTP server.' };
    }
}
