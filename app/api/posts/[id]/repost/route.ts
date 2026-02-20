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

        const originalPostId = params.id;
        const userId = session.user.id;

        // Check if original post exists
        const originalPost = await prisma.post.findUnique({
            where: { id: originalPostId }
        });

        if (!originalPost) {
            return NextResponse.json({ error: 'Original post not found' }, { status: 404 });
        }

        // Create the repost
        const repost = await prisma.post.create({
            data: {
                content: `Reposted: ${originalPost.content.substring(0, 50)}...`, // Placeholder content
                authorId: userId,
                repostOfId: originalPostId,
            }
        });

        // Award XP (5 points for reposting)
        await prisma.user.update({
            where: { id: userId },
            data: {
                xp: { increment: 5 }
            }
        });

        // Create Activity
        await prisma.activity.create({
            data: {
                userId,
                type: 'POST_REPOSTED',
                message: 'reshared a post.',
                metadata: JSON.stringify({ postId: originalPostId, repostId: repost.id })
            }
        });

        return NextResponse.json(repost);
    } catch (error) {
        console.error('Repost error:', error);
        return NextResponse.json({ error: 'Failed to repost' }, { status: 500 });
    }
}
