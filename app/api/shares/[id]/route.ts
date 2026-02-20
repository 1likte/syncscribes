import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const post = await prisma.sharePost.findUnique({
            where: { id: params.id },
        });

        if (!post || post.isHidden) {
            return NextResponse.json({ message: 'Not found' }, { status: 404 });
        }

        return NextResponse.json(post);
    } catch (error: any) {
        console.error('[SHARES_GET_ONE]', error);
        return NextResponse.json({ message: error.message || 'Failed to fetch' }, { status: 500 });
    }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
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

        const updateData: Record<string, unknown> = {};
        if (type !== undefined) updateData.type = type;
        if (title !== undefined) updateData.title = title;
        if (content !== undefined) updateData.content = content;
        if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
        if (videoUrl !== undefined) updateData.videoUrl = videoUrl;
        if (linkUrl !== undefined) updateData.linkUrl = linkUrl;
        if (isHidden !== undefined) updateData.isHidden = isHidden;
        if (order !== undefined) updateData.order = order;

        const post = await prisma.sharePost.update({
            where: { id: params.id },
            data: updateData,
        });

        return NextResponse.json(post);
    } catch (error: any) {
        console.error('[SHARES_PATCH]', error);
        return NextResponse.json({ message: error.message || 'Failed to update' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const isOwner = (session.user as any).role === 'OWNER' || (session.user as any).role === 'ADMIN';
        if (!isOwner) {
            return NextResponse.json({ message: 'Forbidden - Owner only' }, { status: 403 });
        }

        await prisma.sharePost.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[SHARES_DELETE]', error);
        return NextResponse.json({ message: error.message || 'Failed to delete' }, { status: 500 });
    }
}
