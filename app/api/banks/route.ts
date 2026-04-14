import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    const banks = await prisma.bank.findMany({
        orderBy: { name: "asc" },
    });
    return NextResponse.json(banks);
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (session?.user.role !== "Admin") {
        return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }
    const data = await request.json();
    const bank = await prisma.bank.create({
        data: {
            name: data.name,
            code: data.code || null,
            active: data.active ?? true,
        },
    });
    return NextResponse.json(bank);
}

export async function PUT(request: Request) {
    const session = await getServerSession(authOptions);
    if (session?.user.role !== "Admin") {
        return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }
    const { id, ...data } = await request.json();
    const bank = await prisma.bank.update({
        where: { id },
        data: {
            name: data.name,
            code: data.code || null,
            active: data.active ?? true,
        },
    });
    return NextResponse.json(bank);
}

export async function DELETE(request: Request) {
    const session = await getServerSession(authOptions);
    if (session?.user.role !== "Admin") {
        return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    const hasAccounts = await prisma.bankAccount.count({ where: { bankId: id } });
    if (hasAccounts > 0) {
        return NextResponse.json(
            { error: "No se puede eliminar un banco que tiene cuentas asociadas." },
            { status: 400 }
        );
    }

    await prisma.bank.delete({ where: { id } });
    return NextResponse.json({ success: true });
}
