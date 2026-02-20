'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function GuardWrapper({ children }: { children: React.ReactNode }) {
    const { status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Public pages: Landing, Auth, Subscription, Legal
    const isPublicPage = pathname === '/' ||
        pathname.startsWith('/auth') ||
        pathname.startsWith('/subscription') ||
        pathname.startsWith('/about') ||
        pathname.startsWith('/terms') ||
        pathname.startsWith('/privacy') ||
        pathname.startsWith('/api/auth');

    useEffect(() => {
        if (!isMounted) return;
        if (isPublicPage) return;
        if (status === 'loading') return;

        // Redirect unauthenticated to login
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
            return;
        }
    }, [status, isPublicPage, router, isMounted]);

    if (!isMounted) return null;

    return <>{children}</>;
}
