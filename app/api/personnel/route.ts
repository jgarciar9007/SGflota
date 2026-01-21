
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const personnel = await prisma.personnel.findMany({
            orderBy: { name: 'asc' },
        });
        return NextResponse.json(personnel);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error fetching personnel' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const person = await prisma.personnel.create({
            data: {
                ...data,
                status: 'Activo'
            }
        });
        return NextResponse.json(person);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error creating personnel' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const data = await request.json();
        const { id, ...updateData } = data;
        const person = await prisma.personnel.update({
            where: { id },
            data: updateData
        });
        return NextResponse.json(person);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error updating personnel' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        await prisma.personnel.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error deleting personnel' }, { status: 500 });
    }
}
