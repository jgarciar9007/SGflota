import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const refunds = await prisma.refund.findMany({
            orderBy: { date: 'desc' },
            include: {
                client: true,
                invoice: true,
            }
        });
        return NextResponse.json(refunds);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error fetching refunds' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        // Generate Refund Number (R-XXX/YY)
        const year = new Date().getFullYear();
        const yearShort = year.toString().slice(-2);
        const prefix = `R`;
        const suffix = `/${yearShort}`;

        const lastRefund = await prisma.refund.findFirst({
            where: {
                refundNumber: {
                    startsWith: prefix,
                    endsWith: suffix
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        let nextSequence = 1;
        if (lastRefund && lastRefund.refundNumber) {
            const parts = lastRefund.refundNumber.split('-');
            if (parts.length === 2) {
                const subParts = parts[1].split('/');
                if (subParts.length === 2) {
                    const num = parseInt(subParts[0], 10);
                    if (!isNaN(num)) nextSequence = num + 1;
                }
            }
        }

        const refundNumber = `${prefix}-${nextSequence.toString().padStart(3, '0')}${suffix}`;

        const refund = await prisma.refund.create({
            data: {
                ...data,
                refundNumber,
                date: new Date(data.date),
            },
        });
        return NextResponse.json(refund);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error creating refund' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const data = await request.json();
        const { id, ...updateData } = data;

        const result = await prisma.$transaction(async (tx) => {
            const current = await tx.refund.findUnique({ where: { id } });
            if (!current) throw new Error("Refund not found");

            const updated = await tx.refund.update({
                where: { id },
                data: updateData,
            });

            // If it was NOT Reembolsado and now it IS
            if (current.status !== "Reembolsado" && updateData.status === "Reembolsado") {
                // Find or create category
                let category = await tx.expenseCategory.findFirst({
                    where: { name: "Reembolsos" }
                });

                if (!category) {
                    category = await tx.expenseCategory.create({
                        data: {
                            name: "Reembolsos",
                            type: "Gasto",
                            description: "Reembolsos y devoluciones a clientes"
                        }
                    });
                }

                await tx.expense.create({
                    data: {
                        date: new Date(),
                        amount: updated.amount,
                        description: `Reembolso Cliente: ${updated.id.slice(-8)} (Motivo: ${updated.reason})`,
                        categoryId: category.id,
                        status: "Pagado"
                    }
                });
            }

            return updated;
        });

        return NextResponse.json(result);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message || 'Error updating refund' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await prisma.refund.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error deleting refund' }, { status: 500 });
    }
}
