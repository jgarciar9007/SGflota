import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function computeInsuranceStatus(expiryDate: Date): string {
    const diffDays = Math.ceil((expiryDate.getTime() - Date.now()) / 86400000);
    if (diffDays < 0) return "Vencido";
    if (diffDays <= 30) return "Próximo a Vencer";
    return "Vigente";
}

export async function GET() {
    try {
        const insurances = await prisma.vehicleInsurance.findMany({
            orderBy: { expiryDate: 'asc' },
            include: { vehicle: true, category: true },
        });
        return NextResponse.json(insurances);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error al obtener seguros vehiculares' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const expiryDate = new Date(data.expiryDate);
        const status = computeInsuranceStatus(expiryDate);

        const insurance = await prisma.vehicleInsurance.create({
            data: {
                vehicleId: data.vehicleId,
                categoryId: data.categoryId || null,
                insurer: data.insurer,
                policyNumber: data.policyNumber,
                coverageType: data.coverageType,
                amount: Number(data.amount),
                startDate: new Date(data.startDate),
                expiryDate,
                status,
                paymentStatus: data.paymentStatus || 'Pagado',
                notes: data.notes || null,
            },
            include: { vehicle: true, category: true },
        });
        return NextResponse.json(insurance);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error al crear seguro vehicular' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const data = await request.json();
        const { id, ...updateData } = data;

        if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
        if (updateData.expiryDate) {
            updateData.expiryDate = new Date(updateData.expiryDate);
            updateData.status = computeInsuranceStatus(updateData.expiryDate);
        }
        if (updateData.amount !== undefined) updateData.amount = Number(updateData.amount);
        if (updateData.categoryId === '') updateData.categoryId = null;

        const insurance = await prisma.vehicleInsurance.update({
            where: { id },
            data: updateData,
            include: { vehicle: true, category: true },
        });
        return NextResponse.json(insurance);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error al actualizar seguro vehicular' }, { status: 500 });
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

        await prisma.vehicleInsurance.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error al eliminar seguro vehicular' }, { status: 500 });
    }
}
