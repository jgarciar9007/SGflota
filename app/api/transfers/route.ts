import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    const transfers = await prisma.transfer.findMany({
        orderBy: { date: "desc" },
        take: 50,
    });
    return NextResponse.json(transfers);
}

export async function POST(request: Request) {
    const data = await request.json();
    // type: "BancoABanco" | "CajaABanco" | "BancoACaja"
    // BancoABanco: sourceBankAccountId, destBankAccountId, amount, date, description
    // CajaABanco:  pettyCashId, destBankAccountId, amount, date, description
    // BancoACaja:  sourceBankAccountId, pettyCashId, amount, date, description

    const result = await prisma.$transaction(async (tx) => {
        const transfer = await tx.transfer.create({
            data: {
                type: data.type,
                amount: data.amount,
                date: new Date(data.date),
                description: data.description,
                sourceBankAccountId: data.sourceBankAccountId || null,
                destBankAccountId: data.destBankAccountId || null,
                pettyCashId: data.pettyCashId || null,
            },
        });

        if (data.type === "BancoABanco") {
            // Retiro en cuenta origen
            await tx.bankTransaction.create({
                data: {
                    bankAccountId: data.sourceBankAccountId,
                    type: "Transferencia",
                    amount: data.amount,
                    date: new Date(data.date),
                    description: `Transferencia saliente: ${data.description}`,
                    transferId: transfer.id,
                },
            });
            await tx.bankAccount.update({
                where: { id: data.sourceBankAccountId },
                data: { currentBalance: { decrement: data.amount } },
            });

            // Depósito en cuenta destino
            await tx.bankTransaction.create({
                data: {
                    bankAccountId: data.destBankAccountId,
                    type: "Transferencia",
                    amount: data.amount,
                    date: new Date(data.date),
                    description: `Transferencia entrante: ${data.description}`,
                    transferId: transfer.id,
                },
            });
            await tx.bankAccount.update({
                where: { id: data.destBankAccountId },
                data: { currentBalance: { increment: data.amount } },
            });
        } else if (data.type === "CajaABanco") {
            // Egreso en caja
            await tx.cashTransaction.create({
                data: {
                    pettyCashId: data.pettyCashId,
                    type: "Egreso",
                    category: "Depósito a Banco",
                    amount: data.amount,
                    date: new Date(data.date),
                    description: `Depósito a banco: ${data.description}`,
                    transferId: transfer.id,
                },
            });
            await tx.pettyCash.update({
                where: { id: data.pettyCashId },
                data: { currentBalance: { decrement: data.amount } },
            });

            // Depósito en cuenta bancaria
            await tx.bankTransaction.create({
                data: {
                    bankAccountId: data.destBankAccountId,
                    type: "Deposito",
                    amount: data.amount,
                    date: new Date(data.date),
                    description: `Depósito desde caja: ${data.description}`,
                    transferId: transfer.id,
                },
            });
            await tx.bankAccount.update({
                where: { id: data.destBankAccountId },
                data: { currentBalance: { increment: data.amount } },
            });
        } else if (data.type === "BancoACaja") {
            // Retiro en cuenta bancaria origen
            await tx.bankTransaction.create({
                data: {
                    bankAccountId: data.sourceBankAccountId,
                    type: "Retiro",
                    amount: data.amount,
                    date: new Date(data.date),
                    description: `Transferencia a caja: ${data.description}`,
                    transferId: transfer.id,
                },
            });
            await tx.bankAccount.update({
                where: { id: data.sourceBankAccountId },
                data: { currentBalance: { decrement: data.amount } },
            });

            // Ingreso en caja destino
            await tx.cashTransaction.create({
                data: {
                    pettyCashId: data.pettyCashId,
                    type: "Ingreso",
                    category: "Transferencia desde Banco",
                    amount: data.amount,
                    date: new Date(data.date),
                    description: `Recepción desde banco: ${data.description}`,
                    transferId: transfer.id,
                },
            });
            await tx.pettyCash.update({
                where: { id: data.pettyCashId },
                data: { currentBalance: { increment: data.amount } },
            });
        }

        return transfer;
    });

    return NextResponse.json(result);
}
