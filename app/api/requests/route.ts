
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { vehicleId, vehicleName, clientName, clientEmail, clientPhone, clientAddress, startDate, endDate, services } = data;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const newRequest = await (prisma as any).bookingRequest.create({
            data: {
                vehicleId,
                vehicleName,
                clientName,
                clientEmail,
                clientPhone,
                clientAddress,
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : null,
                services: JSON.stringify(services),
                status: 'Pendiente'
            }
        });

        return NextResponse.json(newRequest);
    } catch (error) {
        console.error('Error creating booking request:', error);
        return NextResponse.json({ error: 'Error processing request' }, { status: 500 });
    }
}

export async function GET() {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const requests = await (prisma as any).bookingRequest.findMany({
            orderBy: { createdAt: 'desc' },
            include: { vehicle: true }
        });
        return NextResponse.json(requests);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error fetching requests' }, { status: 500 });
    }
}
