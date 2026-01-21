import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        let settings = await prisma.companySettings.findUnique({
            where: { id: 1 },
        });

        if (!settings) {
            settings = await prisma.companySettings.create({
                data: {
                    id: 1,
                    name: "Mi Empresa",
                    address: "",
                    phone: "",
                    email: "",
                    taxId: "",
                    website: "",
                    logo: "",
                }
            });
        }

        return NextResponse.json(settings);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error fetching settings' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const data = await request.json();
        // Prevent ID change
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...updateData } = data;

        // Upsert to be safe
        const settings = await prisma.companySettings.upsert({
            where: { id: 1 },
            update: updateData,
            create: {
                id: 1,
                ...updateData
            }
        });

        return NextResponse.json(settings);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error updating settings' }, { status: 500 });
    }
}
