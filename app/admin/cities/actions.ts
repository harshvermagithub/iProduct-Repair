'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function updateCityPincodes(cityId: string, pincodes: string[]) {
    await prisma.city.update({
        where: { id: cityId },
        data: { pincodes }
    });
    revalidatePath('/admin/cities');
}

export async function toggleCityActive(cityId: string, isActive: boolean) {
    await prisma.city.update({
        where: { id: cityId },
        data: { isActive }
    });
    revalidatePath('/admin/cities');
}

export async function updatePartnerPincodes(partnerId: string, pincodes: string[]) {
    await prisma.user.update({
        where: { id: partnerId },
        data: { pincodes }
    });
    revalidatePath('/admin/cities');
}

export async function removePartnerFromCity(partnerId: string) {
    await prisma.user.update({
        where: { id: partnerId },
        data: { cityId: null, pincodes: [] }
    });
    revalidatePath('/admin/cities');
}
