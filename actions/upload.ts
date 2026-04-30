
'use server';

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function uploadImage(formData: FormData) {
    const file = formData.get('file') as File;
    if (!file) {
        throw new Error('No file uploaded');
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename to prevent overwrites
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const safeName = (file.name || 'image.jpg').replace(/[^a-zA-Z0-9.-]/g, '');
    const filename = uniqueSuffix + '-' + safeName;

    const uploadDir = join(process.cwd(), 'public', 'uploads');

    // Ensure directory exists
    try {
        await mkdir(uploadDir, { recursive: true });
    } catch (e) {
        console.error("Failed to make uploads dir:", e);
    }

    const path = join(uploadDir, filename);
    await writeFile(path, buffer);

    return `/uploads/${filename}`;
}
