import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const vehicles = await prisma.vehicle.findMany();
        return NextResponse.json(vehicles);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error fetching vehicles' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const vehicle = await prisma.vehicle.create({
            data: {
                name: data.name,
                type: data.type,
                range: data.range,
                price: data.price,
                image: data.image,
                images: data.images || [],
                status: data.status,
                plate: data.plate,
                year: data.year,
                ownership: data.ownership,
                seats: data.seats || 5,
                ownerName: data.ownerName,
                ownerDni: data.ownerDni,
            },
        });
        return NextResponse.json(vehicle);
    } catch (error) {
        return NextResponse.json({ error: 'Error creating vehicle', details: error }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const data = await request.json();
        const { id, ...updateData } = data;
        const vehicle = await prisma.vehicle.update({
            where: { id },
            data: {
                ...updateData,
                seats: updateData.seats ? parseInt(updateData.seats.toString()) : undefined
            },
        });
        return NextResponse.json(vehicle);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error updating vehicle' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID required' }, { status: 400 });
        }

        // 1. Auth Check
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'Admin') {
            return NextResponse.json({ error: 'Acceso denegado. Solo administradores pueden eliminar.' }, { status: 403 });
        }

        // 2. Integrity Check (Strict Order Request)
        const rentalsCount = await prisma.rental.count({ where: { vehicleId: id } });
        if (rentalsCount > 0) {
            return NextResponse.json({
                error: `No se puede eliminar el vehículo. Tiene ${rentalsCount} rentas (historial) asociadas. Para mantener la integridad, elimine las rentas primero.`
            }, { status: 400 });
        }

        await prisma.vehicle.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error deleting vehicle' }, { status: 500 });
    }
}
