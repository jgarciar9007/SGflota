
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const body = await request.json();
        const { status } = body;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updatedMessage = await (prisma as any).contactMessage.update({
            where: { id },
            data: { status }
        });

        return NextResponse.json(updatedMessage);
    } catch (error) {
        console.error('Error updating message:', error);
        return NextResponse.json({ error: 'Error updating message' }, { status: 500 });
    }
}
