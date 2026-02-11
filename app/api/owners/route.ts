import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const owners = await prisma.owner.findMany();
        return NextResponse.json(owners);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error fetching owners' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const owner = await prisma.owner.create({
            data,
        });
        return NextResponse.json(owner);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error creating owner' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const data = await request.json();
        const { id, ...updateData } = data;
        const owner = await prisma.owner.update({
            where: { id },
            data: updateData,
        });
        return NextResponse.json(owner);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error updating owner' }, { status: 500 });
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

        await prisma.owner.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error deleting owner' }, { status: 500 });
    }
}
