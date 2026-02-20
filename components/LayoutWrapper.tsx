'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/social/Sidebar';
import AnimatedNav from '@/components/AnimatedNav';
import MobileNav from '@/components/MobileNav';
import Footer from '@/components/Footer';
import MouseWaveBackground from '@/components/MouseWaveBackground';
import GuardWrapper from '@/components/GuardWrapper';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isReader = pathname?.startsWith('/read');
    const isAdmin = pathname?.startsWith('/admin');
    const isMeet = pathname === '/meet';
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <div className="min-h-screen relative flex flex-col bg-background text-foreground overflow-x-hidden transition-colors duration-300">
            <MouseWaveBackground />

            {/* Global Decorative Layers - Unified and Seam-free */}
            {!isReader && !isAdmin && !isMeet && (
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[120px] animate-pulse" />
                </div>
            )}


            {!isReader && !isAdmin && !isMeet && (
                <>
                    {isMobile ? (
                        <MobileNav />
                    ) : (
                        <>
                            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
                            <AnimatedNav isSidebarOpen={isSidebarOpen} onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
                        </>
                    )}
                </>
            )}

            <main className={`flex-grow w-full ${isMobile && !isReader && !isAdmin && !isMeet ? 'pb-20' : ''}`}>
                <GuardWrapper>
                    {children}
                </GuardWrapper>
            </main>
            {!isReader && !isAdmin && !isMeet && <Footer />}
        </div>
    );
}
