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

        // Check if already disliked
        const existingDislike = await prisma.dislike.findFirst({
            where: {
                postId,
                userId
            }
        });

        if (existingDislike) {
            // Remove dislike
            await prisma.dislike.delete({
                where: { id: existingDislike.id }
            });
            return NextResponse.json({ disliked: false });
        } else {
            // Dislike
            await prisma.dislike.create({
                data: {
                    postId,
                    userId
                }
            });

            // If user liked it, remove like
            const existingLike = await prisma.like.findFirst({
                where: { postId, userId }
            });
            if (existingLike) {
                await prisma.like.delete({ where: { id: existingLike.id } });
            }

            // Award XP (1 point for disliking)
            await prisma.user.update({
                where: { id: userId },
                data: {
                    xp: { increment: 1 }
                }
            });

            // Create Activity
            await prisma.activity.create({
                data: {
                    userId,
                    type: 'POST_DISLIKED',
                    message: 'disliked a post.',
                    metadata: JSON.stringify({ postId })
                }
            });

            return NextResponse.json({ disliked: true });
        }
    } catch (error) {
        return NextResponse.json({ error: 'Failed to toggle dislike' }, { status: 500 });
    }
}
