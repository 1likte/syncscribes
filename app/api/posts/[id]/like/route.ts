import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const postId = params.id;
        const userId = session.user.id;

        // Check if already liked
        const existingLike = await prisma.like.findFirst({
            where: {
                postId,
                userId
            }
        });

        if (existingLike) {
            // Unlike
            await prisma.like.delete({
                where: { id: existingLike.id }
            });
            return NextResponse.json({ liked: false });
        } else {
            // Like
            await prisma.like.create({
                data: {
                    postId,
                    userId
                }
            });

            // Award XP (2 points for liking)
            await prisma.user.update({
                where: { id: userId },
                data: {
                    xp: { increment: 2 }
                }
            });

            // Create Activity
            await prisma.activity.create({
                data: {
                    userId,
                    type: 'POST_LIKED',
                    message: 'liked a post.',
                    metadata: JSON.stringify({ postId })
                }
            });

            return NextResponse.json({ liked: true });
        }
    } catch (error) {
        return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 });
    }
}
