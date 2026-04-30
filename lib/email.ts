import nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function sendSystemEmail(to: string, subject: string, htmlContent: string) {
    try {
        const systemAccount = await prisma.emailAccount.findFirst();
        const smtpUser = process.env.SMTP_USER || systemAccount?.email;
        const smtpPass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS || systemAccount?.password;

        if (!smtpUser || !smtpPass) {
            console.error('No system email accounts exist.');
            return false;
        }

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || '82.208.22.226',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
            tls: { rejectUnauthorized: false }
        });

        const from = process.env.SMTP_FROM || smtpUser;

        await transporter.sendMail({
            from: from,
            to: to,
            subject: subject,
            html: htmlContent,
        });

        console.log(`[SYSTEM EMAIL] Successfully sent email to ${to}`);
        return true;
    } catch (error) {
        console.error(`[SYSTEM EMAIL] Failed to send email to ${to}`, error);
        return false;
    }
}
