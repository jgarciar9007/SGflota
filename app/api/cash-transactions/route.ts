import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    const transactions = await prisma.cashTransaction.findMany({
        include: { pettyCash: true },
        orderBy: { date: "desc" },
    });
    return NextResponse.json(transactions);
}

export async function POST(request: Request) {
    const data = await request.json();

    const result = await prisma.$transaction(async (tx) => {
        const transaction = await tx.cashTransaction.create({
            data: {
                pettyCashId: data.pettyCashId,
                type: data.type, // "Ingreso" | "Egreso"
                category: data.category,
                amount: data.amount,
                date: new Date(data.date),
                description: data.description,
                reference: data.reference || null,
                paymentId: data.paymentId || null,
                expenseId: data.expenseId || null,
                transferId: data.transferId || null,
            },
            include: { pettyCash: true },
        });

        // Update balance
        const balanceDelta = data.type === "Ingreso" ? data.amount : -data.amount;
        await tx.pettyCash.update({
            where: { id: data.pettyCashId },
            data: { currentBalance: { increment: balanceDelta } },
        });

        return transaction;
    });

    return NextResponse.json(result);
}

export async function DELETE(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    await prisma.$transaction(async (tx) => {
        const transaction = await tx.cashTransaction.findUnique({ where: { id } });
        if (!transaction) throw new Error("Movimiento no encontrado");

        // Revert balance
        const balanceDelta = transaction.type === "Ingreso" ? -transaction.amount : transaction.amount;
        await tx.pettyCash.update({
            where: { id: transaction.pettyCashId },
            data: { currentBalance: { increment: balanceDelta } },
        });

        await tx.cashTransaction.delete({ where: { id } });
    });

    return NextResponse.json({ success: true });
}
