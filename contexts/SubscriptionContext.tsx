'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

interface SubscriptionContextType {
    isSubscribed: boolean;
    isLoading: boolean;
    refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
    const { data: session, status } = useSession();
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const checkSubscription = async () => {
        if (!session) {
            setIsSubscribed(false);
            setIsLoading(false);
            return;
        }

        // Trust the session status if it's already set to ACTIVE
        if (session.user && (session.user as any).subscriptionStatus === 'ACTIVE') {
            setIsSubscribed(true);
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/subscription/check');
            if (response.ok) {
                const data = await response.json();
                setIsSubscribed(data.hasActiveSubscription);
            } else {
                setIsSubscribed(false);
            }
        } catch (error) {
            console.error('Error checking subscription:', error);
            setIsSubscribed(false);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (status !== 'loading') {
            checkSubscription();
        }
    }, [session, status]);

    return (
        <SubscriptionContext.Provider value={{ isSubscribed, isLoading, refreshSubscription: checkSubscription }}>
            {children}
        </SubscriptionContext.Provider>
    );
}

export function useSubscription() {
    const context = useContext(SubscriptionContext);
    if (context === undefined) {
        throw new Error('useSubscription must be used within a SubscriptionProvider');
    }
    return context;
}
