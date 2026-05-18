import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const accountEmail = req.nextUrl.searchParams.get('account');
  if (!accountEmail) return NextResponse.json({ message: 'Account required' }, { status: 400 });

  try {
    const account = await prisma.emailAccount.findUnique({ where: { email: accountEmail } });
    if (!account) return NextResponse.json({ message: 'Account not found in local db' }, { status: 404 });

    const client = new ImapFlow({
      host: process.env.SMTP_HOST || '89.116.27.217',
      port: 143,
      secure: false,
      auth: {
        user: account.email,
        pass: account.password
      },
      tls: {
        rejectUnauthorized: false
      },
      logger: false
    });

    await client.connect();
    
    let lock = await client.getMailboxLock('INBOX');
    const emails: any[] = [];
    try {
      const mailbox = client.mailbox as any;
      if (mailbox && mailbox.exists > 0) {
        // Fetch last 50 emails
        const seq = mailbox.exists > 50 ? `${mailbox.exists - 49}:*` : '1:*';
        for await (let msg of client.fetch(seq, { source: true, envelope: true })) {
          if (msg.source) {
            const parsed = await simpleParser(msg.source);
            emails.push({
              id: msg.uid,
              subject: parsed.subject,
              from: parsed.from?.text,
              date: parsed.date,
              text: parsed.text || (typeof parsed.html === 'string' ? parsed.html.replace(/<[^>]+>/g, '') : ''),
            });
          }
        }
      }
    } finally {
      lock.release();
    }
    
    await client.logout();
    
    // Return newest first
    return NextResponse.json({ emails: emails.reverse() });
  } catch (e: any) {
    console.error("IMAP Error:", e);
    return NextResponse.json({ message: e.message }, { status: 500 });
  }
}
