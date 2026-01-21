import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const expenses = await prisma.expense.findMany({
            orderBy: { date: 'desc' },
            include: { category: true }
        });
        return NextResponse.json(expenses);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error fetching expenses' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        // Generate Expense Number (G-XXX/YY)
        const year = new Date().getFullYear();
        const yearShort = year.toString().slice(-2);
        const prefix = `G`;
        const suffix = `/${yearShort}`;

        const lastExpense = await prisma.expense.findFirst({
            where: {
                expenseNumber: {
                    startsWith: prefix,
                    endsWith: suffix
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        let nextSequence = 1;
        if (lastExpense && lastExpense.expenseNumber) {
            const parts = lastExpense.expenseNumber.split('-');
            if (parts.length === 2) {
                const subParts = parts[1].split('/');
                if (subParts.length === 2) {
                    const num = parseInt(subParts[0], 10);
                    if (!isNaN(num)) nextSequence = num + 1;
                }
            }
        }

        const expenseNumber = `${prefix}-${nextSequence.toString().padStart(3, '0')}${suffix}`;

        const expense = await prisma.expense.create({
            data: {
                ...data,
                expenseNumber,
                date: new Date(data.date),
            },
            include: { category: true }
        });
        return NextResponse.json(expense);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error creating expense' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const data = await request.json();
        const { id, ...updateData } = data;
        if (updateData.date) updateData.date = new Date(updateData.date);

        const expense = await prisma.expense.update({
            where: { id },
            data: updateData,
            include: { category: true }
        });
        return NextResponse.json(expense);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error updating expense' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        // Auth Check
        const role = request.headers.get('x-user-role');
        if (role !== 'Admin') {
            return NextResponse.json({ error: 'Acceso denegado. Solo administradores pueden eliminar.' }, { status: 403 });
        }

        await prisma.expense.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error deleting expense' }, { status: 500 });
    }
}
