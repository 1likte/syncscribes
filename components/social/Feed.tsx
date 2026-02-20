import { prisma as db } from '@/lib/prisma';
import PostCard from './PostCard';
import CreatePost from './CreatePost';

export default async function Feed() {
    const posts = await db.post.findMany({
        orderBy: {
            createdAt: 'desc',
        },
        include: {
            author: {
                select: {
                    username: true,
                    firstName: true,
                    lastName: true,
                    avatar: true,
                },
            },
            _count: {
                select: {
                    likes: true,
                    comments: true,
                },
            },
        },
    });

    return (
        <div className="flex-1 max-w-2xl min-h-screen">
            <h1 className="text-xl font-bold text-white p-4 sticky top-0 bg-slate-950/50 backdrop-blur z-10">
                Home
            </h1>
            <CreatePost />
            <div className="space-y-4">
                {posts.map((post) => (
                    // @ts-ignore - Date serialization issue workaround in server component for now
                    <PostCard key={post.id} post={post} />
                ))}
                {posts.length === 0 && (
                    <div className="p-8 text-center text-slate-500">
                        No posts yet. Be the first to say something!
                    </div>
                )}
            </div>
        </div>
    );
}
