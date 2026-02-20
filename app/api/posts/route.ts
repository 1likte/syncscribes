import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const posts = await prisma.post.findMany({
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true,
                        level: true,
                        isVerified: true,
                        verifiedTier: true,
                        role: true,
                    }
                },
                _count: {
                    select: {
                        likes: true,
                        dislikes: true,
                        comments: true,
                        reposts: true,
                    }
                },
                repostOf: {
                    include: {
                        author: {
                            select: {
                                username: true,
                                avatar: true,
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 20
        });

        if (session?.user?.id) {
            const userLikes = await prisma.like.findMany({
                where: { userId: session.user.id },
                select: { postId: true }
            });
            const userDislikes = await prisma.dislike.findMany({
                where: { userId: session.user.id },
                select: { postId: true }
            });
            const userSaves = await prisma.savedPost.findMany({
                where: { userId: session.user.id },
                select: { postId: true }
            });
            const likedPostIds = new Set(userLikes.map(l => l.postId));
            const dislikedPostIds = new Set(userDislikes.map(d => d.postId));
            const savedPostIds = new Set(userSaves.map(s => s.postId));

            const postWithStatus = posts.map(post => ({
                ...post,
                isLiked: likedPostIds.has(post.id),
                isDisliked: dislikedPostIds.has(post.id),
                isSaved: savedPostIds.has(post.id),
            }));
            return NextResponse.json(postWithStatus);
        }

        return NextResponse.json(posts);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { content, image, color, font, link } = await req.json();

        if (!content && !image) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        }

        // Create post and update XP
        const post = await prisma.post.create({
            data: {
                content,
                image,
                color,
                font,
                link,
                authorId: session.user.id,
            }
        });

        // Award XP (10 points for posting)
        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                xp: { increment: 10 }
            }
        });

        // Calculate Level
        const newLevel = Math.floor(Math.sqrt(updatedUser.xp / 50)) + 1;
        if (newLevel > updatedUser.level) {
            await prisma.user.update({
                where: { id: session.user.id },
                data: { level: newLevel }
            });

            // Level Up Notification
            await prisma.notification.create({
                data: {
                    userId: session.user.id,
                    type: 'LEVEL_UP',
                    message: `Congratulations! You leveled up. New level: ${newLevel} ✨`,
                    link: '/profile'
                }
            });
        }

        // Create Activity
        await prisma.activity.create({
            data: {
                userId: session.user.id,
                type: 'POST_CREATED',
                message: 'shared a new post.',
                metadata: JSON.stringify({ postId: post.id })
            }
        });

        // Fetch the created post with author details
        const completePost = await prisma.post.findUnique({
            where: { id: post.id },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true,
                        level: true,
                        isVerified: true,
                        verifiedTier: true,
                    }
                },
                _count: {
                    select: {
                        likes: true,
                        dislikes: true,
                        comments: true,
                        reposts: true,
                    }
                }
            }
        });

        return NextResponse.json({ ...completePost, xpAwarded: 10, currentXp: updatedUser.xp });
    } catch (error) {
        console.error('Post creation error:', error);
        return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
    }
}
