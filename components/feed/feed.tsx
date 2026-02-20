'use client';

import React, { useState, useEffect } from "react";
import { useSession } from 'next-auth/react';
import { PostItem } from "./PostItem";
import CreatePost from "../social/CreatePost";
import { Loader2 } from "lucide-react";
import { usePosts, LocalPost } from "@/contexts/PostsContext";

export const Feed = () => {
  const [apiPosts, setApiPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();
  const { localPosts, refreshPosts } = usePosts();

  // Check if user has active subscription
  const hasActiveSubscription = session?.user?.subscriptionStatus === 'ACTIVE';

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts');
      const data = await res.json();
      if (Array.isArray(data)) {
        setApiPosts(data);
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPost = (newPost: any) => {
    setApiPosts([newPost, ...apiPosts]);
  };

  const handleRefresh = () => {
    fetchPosts();
    refreshPosts();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium italic">Loading community insights...</p>
      </div>
    );
  }

  // Combine local posts with API posts (local posts first)
  // Filter out local posts that already exist in apiPosts (to prevent duplicates after refresh)
  const apiPostContents = new Set(apiPosts.map(p => p.content?.trim()));

  const allPosts = [
    ...localPosts
      .filter((post: LocalPost) => !apiPostContents.has(post.content?.trim()))
      .map((post: LocalPost) => ({
        id: post.id,
        content: post.content,
        createdAt: post.createdAt,
        author: post.author,
        isLocal: true,
        color: post.color,
        font: post.font,
        link: post.link,
        image: post.image,
        _count: { likes: 0, comments: 0 }
      })),
    ...apiPosts
  ];

  return (
    <div className="space-y-4">

      <div className="relative group mb-12">
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-3xl opacity-10 group-hover:opacity-20 blur transition duration-500" />
        <div className="relative bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-2xl rounded-3xl p-3 md:p-4 border border-slate-200 dark:border-white/5 shadow-xl">
          <CreatePost />
        </div>
      </div>

      {allPosts.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/5">
          <p className="text-slate-500 dark:text-muted-foreground text-lg italic">No threads yet. Be the first to start one! ✨</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-200 dark:divide-white/5">
          {allPosts.map(post => (
            <PostItem
              key={post.id}
              id={post.id}
              user={post.author?.username || 'Unknown'}
              avatar={post.author?.avatar}
              userLevel={`Level ${post.author?.level || 1}`}
              content={post.content}
              image={post.image}
              timestamp={post.createdAt}
              likes={post._count?.likes || 0}
              dislikes={post._count?.dislikes || 0}
              comments={post._count?.comments || 0}
              reposts={post._count?.reposts || 0}
              isPremium={hasActiveSubscription}
              isVerified={post.author?.isVerified}
              verifiedTier={post.author?.verifiedTier}
              isLocal={post.isLocal}
              isLiked={post.isLiked}
              isDisliked={post.isDisliked}
              isSaved={post.isSaved}
              textColor={post.color}
              fontClass={post.font}
              link={post.link}
              authorId={post.authorId || post.author?.id}
              repostOf={post.repostOf}
            />
          ))}
        </div>
      )}
    </div>
  );
};

