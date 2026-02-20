import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const includeHidden = searchParams.get('admin') === 'true';

        const where = includeHidden ? {} : { isHidden: false };

        const posts = await prisma.sharePost.findMany({
            where,
            orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        });

        return NextResponse.json(posts);
    } catch (error: any) {
        console.error('[SHARES_GET]', error);
        return NextResponse.json({ message: error.message || 'Failed to fetch' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const isOwner = (session.user as any).role === 'OWNER' || (session.user as any).role === 'ADMIN';
        if (!isOwner) {
            return NextResponse.json({ message: 'Forbidden - Owner only' }, { status: 403 });
        }

        const body = await req.json();
        const { type, title, content, imageUrl, videoUrl, linkUrl, isHidden, order } = body;

        if (!type || !content) {
            return NextResponse.json({ message: 'Type and content required' }, { status: 400 });
        }

        const validTypes = ['TEXT', 'IMAGE', 'VIDEO', 'LINK'];
        if (!validTypes.includes(type)) {
            return NextResponse.json({ message: 'Invalid type' }, { status: 400 });
        }

        const post = await prisma.sharePost.create({
            data: {
                type,
                title: title || null,
                content,
                imageUrl: imageUrl || null,
                videoUrl: videoUrl || null,
                linkUrl: linkUrl || null,
                isHidden: isHidden ?? false,
                order: order ?? 0,
            },
        });

        return NextResponse.json(post);
    } catch (error: any) {
        console.error('[SHARES_POST]', error);
        return NextResponse.json({ message: error.message || 'Failed to create' }, { status: 500 });
    }
}
