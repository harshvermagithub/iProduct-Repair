import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Client } from 'ssh2';

const prisma = new PrismaClient();

async function execSSH(cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    conn.on('ready', () => {
      conn.exec(cmd, (err, stream) => {
        if (err) {
          conn.end();
          return reject(err);
        }
        let out = '';
        stream.on('close', (code: any, signal: any) => {
          conn.end();
          resolve(out);
        }).on('data', (data: any) => {
          out += data;
        }).stderr.on('data', (data: any) => {
          out += data;
        });
      });
    }).on('error', (err) => {
      reject(err);
    }).connect({
      host: '82.208.22.226',
      port: 22,
      username: 'root',
      password: process.env.SSH_PASSWORD || process.env.SMTP_PASSWORD || ''
    });
  });
}

export async function GET() {
  try {
    const accounts = await prisma.emailAccount.findMany({
      select: { email: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ accounts });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password required' }, { status: 400 });
    }

    if (!email.includes('@')) {
      email = `${email}@fonzkart.in`;
    }

    // 1. Create locally in our db
    await prisma.emailAccount.create({
      data: {
        email,
        password,
      }
    });

    // 2. SSH into VPS and configure docker-mailserver account
    try {
      await execSSH(`docker exec $(docker ps -q -f "ancestor=ghcr.io/docker-mailserver/docker-mailserver:latest") setup email add ${email} '${password}'`);
    } catch (e) {
      console.warn("SSH command failed, likely because of SSH creds or mailserver container missing, but account saved locally:", e);
    }

    return NextResponse.json({ success: true, email });
  } catch (e: any) {
    return NextResponse.json({ message: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ message: 'Email query parameter required' }, { status: 400 });
    }

    // 1. Delete from LOCAL DB
    const deleted = await prisma.emailAccount.delete({
      where: { email }
    }).catch(e => {
        console.error("Local DB Deletion failed:", e.message);
        return null;
    });

    if (!deleted) {
        return NextResponse.json({ message: 'Account not found in local database. It may have already been removed.' }, { status: 404 });
    }

    // 2. SSH into VPS and remove account from mailserver
    let vpsStatus = 'skipped';
    try {
      await execSSH(`docker exec $(docker ps -q -f "ancestor=ghcr.io/docker-mailserver/docker-mailserver:latest") setup email del ${email}`);
      vpsStatus = 'success';
    } catch (e: any) {
      console.warn("SSH removal failed, but continued with local purge.", e);
      vpsStatus = 'failed: ' + e.message;
    }

    // 3. Clear associated messages
    const msgStats = await prisma.emailMessage.deleteMany({
      where: {
        OR: [ { from: email }, { to: email } ]
      }
    });

    return NextResponse.json({ 
        success: true, 
        message: `Account ${email} purged.`,
        vpsStatus,
        messagesCleared: msgStats.count
    });
  } catch (e: any) {
    return NextResponse.json({ message: e.message }, { status: 500 });
  }
}
