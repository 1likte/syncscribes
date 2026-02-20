import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const pathname = req.nextUrl.pathname;

        // 1. Admin Protections
        const isAdmin = token?.role === "ADMIN" || token?.role === "OWNER";
        if (pathname.startsWith("/admin") && !isAdmin) {
            return NextResponse.redirect(new URL("/", req.url));
        }

        // 2. Auth Requirement (withAuth already handles basic auth based on token)
        // If they are on a protected route without a token, withAuth will redirect them to signIn page
    },
    {
        secret: process.env.NEXTAUTH_SECRET || "fallback-secret-key-change-me-in-production",
        callbacks: {
            authorized: ({ token, req }) => {
                // TEMPORARY FIX: ALLOW EVERYTHING
                // This disables route protection to debug login issues
                return true;
            },
        },
    }
);

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ]
};
