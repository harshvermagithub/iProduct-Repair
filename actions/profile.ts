'use server';

import { db } from '@/lib/store';
import { getSession } from '@/lib/session';

export async function updateProfile(prevState: { error?: string, success?: boolean } | null, formData: FormData) {
    const session = await getSession();
    if (!session?.user) {
        return { error: 'Unauthorized' };
    }

    const name = formData.get('name') as string;
    let phone = formData.get('phone') as string;

    if (!name) {
        return { error: 'Name cannot be empty' };
    }

    if (phone && !phone.startsWith('+91')) {
        phone = `+91${phone}`;
    }

    try {
        await db.updateProfile(session.user.email, { name, phone });
        return { success: true };
    } catch (e: any) {
        return { error: 'Failed to update profile' };
    }
}
