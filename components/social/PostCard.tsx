'use client';

import { Heart, MessageSquare, Share2, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PostProps {
    post: {
        id: string;
        content: string;
        createdAt: Date | string;
        author: {
            username: string;
            firstName: string | null;
            lastName: string | null;
            avatar: string | null;
        };
        _count: {
            likes: number;
            comments: number;
        };
    };
}

export default function PostCard({ post }: PostProps) {
    return (
        <div className="p-4 hover:bg-slate-900/30 rounded-2xl transition-all mx-2">
            <div className="flex space-x-3">
                <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold">
                        {post.author.avatar ? (
                            <img src={post.author.avatar} alt={post.author.username} className="w-full h-full rounded-full object-cover" />
                        ) : (
                            post.author.username[0].toUpperCase()
                        )}
                    </div>
                </div>
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <span className="font-semibold text-white">
                                {post.author.firstName} {post.author.lastName}
                            </span>
                            <span className="text-slate-500">@{post.author.username}</span>
                            <span className="text-slate-500">·</span>
                            <span className="text-slate-500 text-sm">
                                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                            </span>
                        </div>
                        <button className="text-slate-500 hover:text-white">
                            <MoreHorizontal className="w-5 h-5" />
                        </button>
                    </div>

                    <p className="text-slate-200 mt-1 whitespace-pre-wrap">{post.content}</p>

                    <div className="flex items-center justify-between mt-3 max-w-md text-slate-500">
                        <button className="flex items-center space-x-2 hover:text-blue-400 transition group">
                            <MessageSquare className="w-5 h-5 group-hover:bg-blue-400/10 rounded-full p-1 box-content" />
                            <span className="text-sm">{post._count.comments}</span>
                        </button>
                        <button className="flex items-center space-x-2 hover:text-red-400 transition group">
                            <Heart className="w-5 h-5 group-hover:bg-red-400/10 rounded-full p-1 box-content" />
                            <span className="text-sm">{post._count.likes}</span>
                        </button>
                        <button className="flex items-center space-x-2 hover:text-green-400 transition group">
                            <Share2 className="w-5 h-5 group-hover:bg-green-400/10 rounded-full p-1 box-content" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
