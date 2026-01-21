import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const agents = await prisma.commercialAgent.findMany();
        return NextResponse.json(agents);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error fetching agents' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const agent = await prisma.commercialAgent.create({
            data,
        });
        return NextResponse.json(agent);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error creating agent' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const data = await request.json();
        const { id, ...updateData } = data;
        const agent = await prisma.commercialAgent.update({
            where: { id },
            data: updateData,
        });
        return NextResponse.json(agent);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error updating agent' }, { status: 500 });
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

        await prisma.commercialAgent.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error deleting agent' }, { status: 500 });
    }
}
