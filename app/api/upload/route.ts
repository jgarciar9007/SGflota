import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
    try {
        const data = await request.formData();
        const file: File | null = data.get('file') as unknown as File;
        const type: string = data.get('type') as string; // 'logo' or 'vehicle'

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create unique filename
        const timestamp = Date.now();
        const extension = file.name.split('.').pop();
        const filename = `${timestamp}.${extension}`;

        // Determine upload path based on type
        const folder = type === 'logo' ? 'logos' : 'vehicles';
        const path = join(process.cwd(), 'public', 'uploads', folder, filename);

        // Write file
        await writeFile(path, buffer);

        // Return the public URL
        const url = `/uploads/${folder}/${filename}`;

        return NextResponse.json({ url }, { status: 200 });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
