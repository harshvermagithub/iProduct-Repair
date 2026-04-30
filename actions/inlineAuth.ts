
'use server';

import { db } from '@/lib/store';
import { login } from '@/lib/session';
import bcrypt from 'bcryptjs';

export async function quickRegister(formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string; // Optional in schema but we want to save it
    const password = formData.get('password') as string;

    if (!email || !password || !name) {
        return { error: 'Please fill name, email and password' };
    }

    const existingUser = await db.findUserByEmail(email);
    if (existingUser) {
        return { error: 'Email already registered. Please sign in instead.' };
    }

    const id = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = {
        id,
        email,
        passwordHash,
        name,
        phone: phone || null,
        role: 'USER'
    };

    await db.addUser(newUser);

    // Create session
    await login({ id, email, name, role: 'USER' });

    return { success: true, user: { id, email, name, role: 'USER', phone } };
}

export async function quickLogin(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
        return { error: 'Please fill email and password' };
    }

    const user = await db.findUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        return { error: 'Invalid email or password' };
    }

    await login({ id: user.id, email: user.email, name: user.name, role: user.role });

    return { success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone } };
}
