import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

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
        if (!supabaseUrl || !supabaseServiceKey) {
            return NextResponse.json({ message: 'Storage not configured' }, { status: 503 });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        if (buffer.length === 0) {
            return NextResponse.json({ message: 'File is empty' }, { status: 400 });
        }

        const bucket = type === 'cover' ? 'book-covers' : 'book-files';
        const safeId = (session.user as any).id?.replace?.(/[^a-zA-Z0-9-_]/g, '') || 'uploads';
        const fileName = `${Date.now()}-${(file.name || 'file').replace(/\s+/g, '_').slice(-80)}`;
        const filePath = `${safeId}/${fileName}`;

        const contentType = file.type || (type === 'cover' ? 'image/jpeg' : 'application/pdf');

        const { error } = await supabase.storage
            .from(bucket)
            .upload(filePath, buffer, {
                contentType,
                upsert: false,
            });

        if (error) {
            console.error('[SUPABASE_UPLOAD_ERROR]', {
                bucket,
                filePath,
                contentType,
                error
            });
            return NextResponse.json({
                message: `Storage Error: ${error.message}`,
                details: error
            }, { status: 500 });
        }

        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

        return NextResponse.json({ url: publicUrl });
    } catch (error: any) {
        console.error('[UPLOAD_ERROR]', error);
        return NextResponse.json({ message: error.message || 'Upload failed' }, { status: 500 });
    }
}
