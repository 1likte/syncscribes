import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;
        const type = formData.get('type') as string; // 'cover' or 'pdf'

        if (!file) {
            return NextResponse.json({ message: 'No file provided' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadDir = type === 'cover' ? 'covers' : 'books';
        const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;

        // Ensure path is absolute for fs operations, but relative for public access
        const publicDir = join(process.cwd(), 'public', 'uploads', uploadDir);

        // Try to create directory if it doesn't exist
        try {
            await mkdir(publicDir, { recursive: true });
        } catch (e) {
            // Directory might already exist
        }

        const filePath = join(publicDir, fileName);
        await writeFile(filePath, buffer);

        const publicUrl = `/uploads/${uploadDir}/${fileName}`;

        return NextResponse.json({ url: publicUrl });
    } catch (error: any) {
        console.error('[UPLOAD_ERROR]', error);
        return NextResponse.json({ message: error.message || 'Upload failed' }, { status: 500 });
    }
}
