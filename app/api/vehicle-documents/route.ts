import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function computeDocStatus(expiryDate: Date): string {
    const diffDays = Math.ceil((expiryDate.getTime() - Date.now()) / 86400000);
    if (diffDays < 0) return "Vencido";
    if (diffDays <= 30) return "Próximo a Vencer";
    return "Vigente";
}

export async function GET() {
    try {
        const docs = await prisma.vehicleDocument.findMany({
            orderBy: { expiryDate: 'asc' },
            include: { vehicle: true, category: true },
        });
        return NextResponse.json(docs);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error al obtener documentos vehiculares' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const expiryDate = new Date(data.expiryDate);
        const status = computeDocStatus(expiryDate);

        const doc = await prisma.vehicleDocument.create({
            data: {
                vehicleId: data.vehicleId,
                categoryId: data.categoryId || null,
                documentType: data.documentType,
                description: data.description,
                amount: Number(data.amount),
                issueDate: new Date(data.issueDate),
                expiryDate,
                status,
                paymentStatus: data.paymentStatus || 'Pagado',
                notes: data.notes || null,
            },
            include: { vehicle: true, category: true },
        });
        return NextResponse.json(doc);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error al crear documento vehicular' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const data = await request.json();
        const { id, ...updateData } = data;

        if (updateData.issueDate) updateData.issueDate = new Date(updateData.issueDate);
        if (updateData.expiryDate) {
            updateData.expiryDate = new Date(updateData.expiryDate);
            updateData.status = computeDocStatus(updateData.expiryDate);
        }
        if (updateData.amount !== undefined) updateData.amount = Number(updateData.amount);
        if (updateData.categoryId === '') updateData.categoryId = null;

        const doc = await prisma.vehicleDocument.update({
            where: { id },
            data: updateData,
            include: { vehicle: true, category: true },
        });
        return NextResponse.json(doc);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error al actualizar documento vehicular' }, { status: 500 });
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

        await prisma.vehicleDocument.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error al eliminar documento vehicular' }, { status: 500 });
    }
}
