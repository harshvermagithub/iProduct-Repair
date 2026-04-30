'use server';

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { SessionPayload } from './auth-utils';

const secret = process.env.AUTH_SECRET;
if (!secret) {
    console.warn('⚠️ AUTH_SECRET is not set. Session features will not work correctly.');
}
const KEY = new TextEncoder().encode(secret || 'temporary_dev_key_change_me_in_production');

export async function encrypt(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('1 week')
        .sign(KEY);
}

export async function decrypt(input: string): Promise<SessionPayload> {
    const { payload } = await jwtVerify(input, KEY, {
        algorithms: ['HS256'],
    });
    return payload as unknown as SessionPayload;
}

export async function getSession(): Promise<SessionPayload | null> {
    const sessionCookie = (await cookies()).get('session')?.value;
    if (!sessionCookie) return null;
    try {
        return await decrypt(sessionCookie);
    } catch (e) {
        return null;
    }
}

export async function login(userData: { id: string; email: string; name: string; role: string }) {
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 1 week
    const session = await encrypt({ user: userData, expires });

    (await cookies()).set('session', session, { expires, httpOnly: true, sameSite: 'lax' });
}

export async function logout() {
    (await cookies()).set('session', '', { expires: new Date(0) });
}
