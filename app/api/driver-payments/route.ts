
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const payments = await prisma.driverPayment.findMany({
            orderBy: { date: 'desc' },
            include: { personnel: true }
        });
        return NextResponse.json(payments);
    } catch (error) {
        console.error("Error fetching driver payments:", error);
        return NextResponse.json({ error: 'Error fetching driver payments' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { personnelId, amount, date, concept, notes } = body;

        if (!personnelId || !amount || !date || !concept) {
            return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
        }

        const payment = await prisma.driverPayment.create({
            data: {
                personnelId,
                amount: Number(amount),
                date: new Date(date),
                concept,
                notes
            }
        });

        return NextResponse.json(payment);
    } catch (error) {
        console.error("Error creating driver payment:", error);
        return NextResponse.json({ error: 'Error creating driver payment' }, { status: 500 });
    }
}
