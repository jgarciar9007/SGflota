import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    const pettyCashes = await prisma.pettyCash.findMany({
        orderBy: { name: "asc" },
    });
    return NextResponse.json(pettyCashes);
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (session?.user.role !== "Admin") {
        return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }
    const data = await request.json();
    const pettyCash = await prisma.pettyCash.create({
        data: {
            name: data.name,
            openingBalance: data.openingBalance || 0,
            currentBalance: data.openingBalance || 0,
            active: data.active ?? true,
        },
    });
    return NextResponse.json(pettyCash);
}

export async function PUT(request: Request) {
    const session = await getServerSession(authOptions);
    if (session?.user.role !== "Admin") {
        return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }
    const { id, ...data } = await request.json();
    const pettyCash = await prisma.pettyCash.update({
        where: { id },
        data: {
            name: data.name,
            active: data.active ?? true,
        },
    });
    return NextResponse.json(pettyCash);
}

export async function DELETE(request: Request) {
    const session = await getServerSession(authOptions);
    if (session?.user.role !== "Admin") {
        return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    const hasTransactions = await prisma.cashTransaction.count({ where: { pettyCashId: id } });
    if (hasTransactions > 0) {
        return NextResponse.json(
            { error: "No se puede eliminar una caja que tiene movimientos registrados." },
            { status: 400 }
        );
    }

    await prisma.pettyCash.delete({ where: { id } });
    return NextResponse.json({ success: true });
}
