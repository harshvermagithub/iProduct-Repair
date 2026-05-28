import nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Creates a nodemailer transporter using environment variables.
 * Supports any SMTP provider (Brevo, Gmail, self-hosted, etc.)
 * Configure via: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_SECURE
 */
function createTransporter() {
    const host = process.env.SMTP_HOST || 'smtp-relay.brevo.com';
    const port = parseInt(process.env.SMTP_PORT || '587');
    const secure = process.env.SMTP_SECURE === 'true'; // true only for port 465

    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS;

    if (!user || !pass) return null;

    return nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
        tls: { rejectUnauthorized: false },
    });
}

export async function sendSystemEmail(to: string, subject: string, htmlContent: string) {
    try {
        // Try env-based transporter first (Brevo / external SMTP)
        let transporter = createTransporter();
        let fromAddress = process.env.SMTP_FROM
            || `${process.env.SMTP_FROM_NAME || 'iProduct Repair'} <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`;

        // Fallback: use database-stored email account
        if (!transporter) {
            const systemAccount = await prisma.emailAccount.findFirst();
            const smtpUser = systemAccount?.email;
            const smtpPass = systemAccount?.password;

            if (!smtpUser || !smtpPass) {
                console.error('[EMAIL] No SMTP credentials found in env or database.');
                return false;
            }

            transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST || '89.116.27.217',
                port: parseInt(process.env.SMTP_PORT || '25'),
                secure: false,
                auth: { user: smtpUser, pass: smtpPass },
                tls: { rejectUnauthorized: false },
            });

            fromAddress = smtpUser;
        }

        await transporter.sendMail({
            from: fromAddress,
            to,
            subject,
            html: htmlContent,
        });

        console.log(`[EMAIL] Successfully sent to ${to}`);
        return true;
    } catch (error) {
        console.error(`[EMAIL] Failed to send to ${to}:`, error);
        return false;
    }
}
