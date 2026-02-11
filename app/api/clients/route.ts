import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const clients = await prisma.client.findMany();
        return NextResponse.json(clients);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error fetching clients' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const client = await prisma.client.create({
            data,
        });
        return NextResponse.json(client);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error creating client' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const data = await request.json();
        const { id, ...updateData } = data;
        const client = await prisma.client.update({
            where: { id },
            data: updateData,
        });
        return NextResponse.json(client);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error updating client' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        // 1. Auth Check
        const role = request.headers.get('x-user-role');
        if (role !== 'Admin') {
            return NextResponse.json({ error: 'Acceso denegado. Solo administradores pueden eliminar.' }, { status: 403 });
        }

        // 2. Integrity Check
        const rentalsCount = await prisma.rental.count({ where: { clientId: id } });
        const invoicesCount = await prisma.invoice.count({ where: { clientId: id } });

        if (rentalsCount > 0 || invoicesCount > 0) {
            return NextResponse.json({
                error: `No se puede eliminar el cliente. Tiene ${rentalsCount} rentas y ${invoicesCount} facturas asociadas. Elimine los registros dependientes primero.`
            }, { status: 400 });
        }

        await prisma.client.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error deleting client' }, { status: 500 });
    }
}
