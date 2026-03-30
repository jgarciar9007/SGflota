import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const records = await prisma.ivaRecord.findMany({
            orderBy: { paymentDate: 'desc' },
            include: { invoice: { select: { invoiceNumber: true, clientId: true } } },
        });
        return NextResponse.json(records);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error al obtener registros de IVA' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const data = await request.json();
        const { id, ...updateData } = data;
        const record = await prisma.ivaRecord.update({
            where: { id },
            data: updateData,
            include: { invoice: { select: { invoiceNumber: true, clientId: true } } },
        });
        return NextResponse.json(record);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error al actualizar registro de IVA' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'Admin') {
            return NextResponse.json({ error: 'Acceso denegado. Solo administradores pueden eliminar.' }, { status: 403 });
        }

        await prisma.ivaRecord.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error al eliminar registro de IVA' }, { status: 500 });
    }
}
