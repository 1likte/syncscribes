import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, message } = body;

        // In a real application, you would send an email or save to a database here.
        console.log('Support request received:', { name, email, message });

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 800));

        return NextResponse.json({
            success: true,
            message: 'Support request received successfully'
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: 'Failed to process request'
        }, { status: 500 });
    }
}
