
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const payrolls = await prisma.payroll.findMany({
            orderBy: [{ year: 'desc' }, { month: 'desc' }],
        });
        return NextResponse.json(payrolls);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error fetching payrolls' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        // data contains { month, year, details: stringified_json, totalAmount }

        const payroll = await prisma.payroll.create({
            data: {
                ...data,
                status: 'Pagado' // Auto-pay for now or Draft if implemented
            }
        });
        return NextResponse.json(payroll);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error creating payroll' }, { status: 500 });
    }
}
