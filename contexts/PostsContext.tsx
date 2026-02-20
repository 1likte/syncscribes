'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface LocalPost {
    id: string;
    content: string;
    color?: string;
    font?: string;
    link?: string;
    image?: string;
    mediaName?: string;
    createdAt: string;
    author: {
        username: string;
        avatar?: string;
        level: number;
    };
}

interface PostsContextType {
    localPosts: LocalPost[];
    addPost: (post: Omit<LocalPost, 'id' | 'createdAt'>) => void;
    refreshPosts: () => void;
}

const PostsContext = createContext<PostsContextType | undefined>(undefined);

const STORAGE_KEY = 'syncscribes_local_posts_v2';

export function PostsProvider({ children }: { children: ReactNode }) {
    const [localPosts, setLocalPosts] = useState<LocalPost[]>([]);

    // Load posts from localStorage on mount and cleanup "Unknown" posts
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                // Filter out legacy "Unknown" posts
                const cleaned = parsed.filter((p: LocalPost) => p.author?.username && p.author.username !== 'Unknown');
                setLocalPosts(cleaned);
                if (cleaned.length !== parsed.length) {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
                }
            } catch (e) {
                console.error('Failed to parse stored posts:', e);
            }
        }
    }, []);

    // Save posts to localStorage when they change
    useEffect(() => {
        if (localPosts.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(localPosts));
        }
    }, [localPosts]);

    const addPost = (post: Omit<LocalPost, 'id' | 'createdAt'>) => {
        const newPost: LocalPost = {
            ...post,
            id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
        };
        setLocalPosts(prev => [newPost, ...prev]);
    };

    const refreshPosts = () => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setLocalPosts(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to parse stored posts:', e);
            }
        }
    };

    return (
        <PostsContext.Provider value={{ localPosts, addPost, refreshPosts }}>
            {children}
        </PostsContext.Provider>
    );
}

export function usePosts() {
    const context = useContext(PostsContext);
    if (context === undefined) {
        throw new Error('usePosts must be used within a PostsProvider');
    }
    return context;
}
