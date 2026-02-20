import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const STORY_EXPIRY_HOURS = 24;

export async function GET() {
    try {
        const since = new Date(Date.now() - STORY_EXPIRY_HOURS * 60 * 60 * 1000);
        const stories = await prisma.story.findMany({
            where: { createdAt: { gte: since } },
            orderBy: { createdAt: 'desc' },
            take: 50,
            include: {
                user: { select: { id: true, username: true, avatar: true } },
            },
        });
        return NextResponse.json(stories);
    } catch (error: any) {
        console.error('[STORIES_GET]', error);
        return NextResponse.json({ message: error.message || 'Failed to fetch' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { imageUrl, text } = body;
        if (!imageUrl) {
            return NextResponse.json({ message: 'Image required' }, { status: 400 });
        }

        const story = await prisma.story.create({
            data: {
                userId: session.user.id,
                imageUrl,
                text: text || null,
            },
            include: {
                user: { select: { id: true, username: true, avatar: true } },
            },
        });
        return NextResponse.json(story);
    } catch (error: any) {
        console.error('[STORIES_POST]', error);
        return NextResponse.json({ message: error.message || 'Failed to create' }, { status: 500 });
    }
}
