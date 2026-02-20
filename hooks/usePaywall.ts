'use client';

import { useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useSession } from 'next-auth/react';

export function usePaywall() {
    const { isSubscribed, isLoading } = useSubscription();
    const { data: session } = useSession();
    const router = useRouter();
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const triggerPaywall = useCallback((delaySeconds: number = 0) => {
        // If already subscribed, do nothing
        if (isSubscribed) return;

        // Clear existing timer if any
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        if (delaySeconds > 0) {
            timerRef.current = setTimeout(() => {
                router.push('/subscription');
            }, delaySeconds * 1000);
        } else {
            router.push('/subscription');
        }
    }, [isSubscribed, router]);

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);

    return { triggerPaywall, isSubscribed, isLoading };
}
