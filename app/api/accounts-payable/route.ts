
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const payables = await prisma.accountPayable.findMany({
            orderBy: { date: 'desc' },
        });
        return NextResponse.json(payables);
    } catch (error) {
        console.error("Error fetching accounts payable:", error);
        return NextResponse.json({ error: 'Error fetching accounts payable' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const data = await request.json();
        const { id, ...updateData } = data;

        const result = await prisma.$transaction(async (tx) => {
            const current = await tx.accountPayable.findUnique({ where: { id } });
            if (!current) throw new Error("Payable not found");

            const updated = await tx.accountPayable.update({
                where: { id },
                data: updateData,
            });

            // If it was NOT paid and now it IS paid, create an Expense
            if (current.status !== "Pagado" && updateData.status === "Pagado") {
                // Find or create category
                let category = await tx.expenseCategory.findFirst({
                    where: { name: "Pagos a Terceros" }
                });

                if (!category) {
                    category = await tx.expenseCategory.create({
                        data: {
                            name: "Pagos a Terceros",
                            type: "Gasto",
                            description: "Pagos a propietarios y comisiones de agentes"
                        }
                    });
                }

                await tx.expense.create({
                    data: {
                        date: new Date(),
                        amount: updated.amount,
                        description: `Pago de ${updated.type}: ${updated.beneficiaryName} (Ref: ${updated.id.slice(-8)})`,
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
        return NextResponse.json({ error: error.message || 'Error updating account payable' }, { status: 500 });
    }
}
