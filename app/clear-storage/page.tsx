'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ClearStoragePage() {
    const router = useRouter();

    useEffect(() => {
        // Clear localStorage
        localStorage.clear();

        // Redirect to home
        setTimeout(() => {
            router.push('/');
        }, 1000);
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-transparent">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Clearing Storage...</h1>
                <p className="text-muted-foreground">Redirecting to home page...</p>
            </div>
        </div>
    );
}
