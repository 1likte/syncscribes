import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/theme-provider'
import Providers from '@/components/providers/session-provider'
import LayoutWrapper from '@/components/LayoutWrapper'
import { PostsProvider } from '@/contexts/PostsContext'
import { SubscriptionProvider } from '@/contexts/SubscriptionContext'
import CookieConsent from '@/components/CookieConsent'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
    title: 'SyncScribes | Future of Reading',
    description: 'The Next Gen Premium Platform for Book Lovers. Discover, read, and connect in a futuristic digital library.',
    icons: {
        icon: '/images/icon.png',
    },
}

export const viewport = {
    themeColor: '#0c0c0e',
    width: 'device-width',
    initialScale: 1,
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
                {/* Google Analytics Consent Mode Initialization */}
                <Script id="ga-consent" strategy="beforeInteractive">
                    {`
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('consent', 'default', {
                          'analytics_storage': 'denied',
                          'ad_storage': 'denied',
                          'ad_user_data': 'denied',
                          'ad_personalization': 'denied',
                          'wait_for_update': 500
                        });
                    `}
                </Script>
            </head>
            <body className={inter.className}>
                <Providers>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="dark"
                        enableSystem={false}
                        disableTransitionOnChange
                    >
                        <PostsProvider>
                            <SubscriptionProvider>
                                <LayoutWrapper>
                                    {children}
                                </LayoutWrapper>
                            </SubscriptionProvider>
                        </PostsProvider>
                        <CookieConsent />
                    </ThemeProvider>
                </Providers>
            </body>
        </html>
    )
}
