import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const maintenances = await prisma.maintenance.findMany({
            orderBy: { date: 'desc' },
            include: { vehicle: true },
        });
        return NextResponse.json(maintenances);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error fetching maintenance records' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const maintenance = await prisma.maintenance.create({
            data: {
                ...data,
                date: new Date(data.date),
            },
        });

        // Update vehicle status to "Mantenimiento"
        if (maintenance.status === "En Proceso") {
            await prisma.vehicle.update({
                where: { id: maintenance.vehicleId },
                data: { status: "Mantenimiento" }
            });
        }

        return NextResponse.json(maintenance);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error creating maintenance' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const data = await request.json();
        const { id, ...updateData } = data;
        if (updateData.date) updateData.date = new Date(updateData.date);

        const maintenance = await prisma.maintenance.update({
            where: { id },
            data: updateData,
        });

        // Sync vehicle status based on maintenance status
        if (updateData.status === "En Proceso") {
            await prisma.vehicle.update({
                where: { id: maintenance.vehicleId },
                data: { status: "Mantenimiento" }
            });
        } else if (updateData.status === "Completado") {
            await prisma.vehicle.update({
                where: { id: maintenance.vehicleId },
                data: { status: "Disponible" }
            });
        }

        return NextResponse.json(maintenance);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error updating maintenance' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        // Auth Check
        const role = request.headers.get('x-user-role');
        if (role !== 'Admin') {
            return NextResponse.json({ error: 'Acceso denegado. Solo administradores pueden eliminar.' }, { status: 403 });
        }

        await prisma.maintenance.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error deleting maintenance' }, { status: 500 });
    }
}
