
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const body = await request.json();
        const { status } = body;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updatedRequest = await (prisma as any).bookingRequest.update({
            where: { id },
            data: { status }
        });

        return NextResponse.json(updatedRequest);
    } catch (error) {
        console.error('Error updating request:', error);
        return NextResponse.json({ error: 'Error updating request' }, { status: 500 });
    }
}
