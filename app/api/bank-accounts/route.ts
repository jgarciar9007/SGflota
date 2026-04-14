import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    const accounts = await prisma.bankAccount.findMany({
        include: { bank: true },
        orderBy: { name: "asc" },
    });
    return NextResponse.json(accounts);
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (session?.user.role !== "Admin") {
        return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }
    const data = await request.json();
    const account = await prisma.bankAccount.create({
        data: {
            bankId: data.bankId,
            name: data.name,
            accountNumber: data.accountNumber || null,
            type: data.type || "Corriente",
            openingBalance: data.openingBalance || 0,
            currentBalance: data.openingBalance || 0,
            active: data.active ?? true,
        },
        include: { bank: true },
    });
    return NextResponse.json(account);
}

export async function PUT(request: Request) {
    const session = await getServerSession(authOptions);
    if (session?.user.role !== "Admin") {
        return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }
    const { id, ...data } = await request.json();
    const account = await prisma.bankAccount.update({
        where: { id },
        data: {
            name: data.name,
            accountNumber: data.accountNumber || null,
            type: data.type,
            active: data.active ?? true,
        },
        include: { bank: true },
    });
    return NextResponse.json(account);
}

export async function DELETE(request: Request) {
    const session = await getServerSession(authOptions);
    if (session?.user.role !== "Admin") {
        return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    const hasTransactions = await prisma.bankTransaction.count({ where: { bankAccountId: id } });
    if (hasTransactions > 0) {
        return NextResponse.json(
            { error: "No se puede eliminar una cuenta que tiene movimientos registrados." },
            { status: 400 }
        );
    }

    await prisma.bankAccount.delete({ where: { id } });
    return NextResponse.json({ success: true });
}
