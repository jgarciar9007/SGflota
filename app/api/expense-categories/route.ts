import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const categories = await prisma.expenseCategory.findMany();
        return NextResponse.json(categories);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error fetching expense categories' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const category = await prisma.expenseCategory.create({
            data,
        });
        return NextResponse.json(category);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error creating expense category' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const data = await request.json();
        const { id, ...updateData } = data;
        const category = await prisma.expenseCategory.update({
            where: { id },
            data: updateData,
        });
        return NextResponse.json(category);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error updating expense category' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        // 1. Auth Check
        const role = request.headers.get('x-user-role');
        if (role !== 'Admin') {
            return NextResponse.json({ error: 'Acceso denegado. Solo administradores pueden eliminar.' }, { status: 403 });
        }

        // 2. Integrity Check
        const expensesCount = await prisma.expense.count({ where: { categoryId: id } });
        if (expensesCount > 0) {
            return NextResponse.json({
                error: `No se puede eliminar la categoría. Tiene ${expensesCount} gastos asociados.`
            }, { status: 400 });
        }

        await prisma.expenseCategory.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error deleting expense category' }, { status: 500 });
    }
}
