'use server';

import { db } from '@/lib/store';

export async function fetchBrands(category?: string) {
    return await db.getBrands(category);
}

export async function fetchModels(brandId: string, category?: string) {
    return await db.getModels(brandId, category);
}

export async function searchGlobalModels(query: string) {
    if (!query || query.length < 2) return [];
    return await db.searchModels(query);
}

export async function fetchVariants(modelId: string, category: string = 'smartphone') {
    // Fetch variants from DB
    return await db.getVariants(modelId);
}

export async function findVariantByName(deviceName: string) {
    // deviceName is usually "Model Name (Variant Name)"
    const match = deviceName.match(/(.+)\s\((.+)\)/);
    if (!match) return null;

    const name = match[1];
    const variant = match[2];

    const { prisma } = await import('@/lib/db');
    const found = await prisma.variant.findFirst({
        where: {
            name: variant,
            model: {
                name: name
            }
        }
    });
    return found;
}
