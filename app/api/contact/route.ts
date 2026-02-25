
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { name, email, phone, message } = data;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const newContact = await (prisma as any).contactMessage.create({
            data: {
                name,
                email,
                phone,
                message,
                status: 'Pendiente'
            }
        });

        return NextResponse.json(newContact);
    } catch (error) {
        console.error('Error creating contact message:', error);
        return NextResponse.json({ error: 'Error processing message' }, { status: 500 });
    }
}

export async function GET() {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const messages = await (prisma as any).contactMessage.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(messages);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error fetching messages' }, { status: 500 });
    }
}
