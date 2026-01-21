import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const rentals = await prisma.rental.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(rentals);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error fetching rentals' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();

        if (!data.vehicleId || !data.clientId || !data.startDate || !data.endDate || !data.dailyRate) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const start = new Date(data.startDate);
        const end = new Date(data.endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
        }

        if (end < start) {
            return NextResponse.json({ error: "End date must be after or same as start date" }, { status: 400 });
        }

        // Fetch vehicle and Agent to check details
        const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
        let agent = null;
        if (data.commercialAgent) {
            // Assuming commercialAgent field stores the ID. If it stores name, we need to find by name, but schema says String. 
            // Let's assume frontend sends ID if selected from list, or name? 
            // Logic: Check if it looks like uuid or just store as is. 
            // Users usually expect 'commercialAgent' to be linked. 
            // Schema: commercialAgent String? (Could be loose name). 
            // If loose name, we can't reliably get DNI without lookup.
            // But for calculation we just need existence.
            // Better: Lookup agent if it is an ID.
            agent = await prisma.commercialAgent.findFirst({
                where: { OR: [{ id: data.commercialAgent }, { name: data.commercialAgent }] }
            });
        }

        const rental = await prisma.$transaction(async (tx) => {
            // Calculate duration and total explicitly
            const start = new Date(data.startDate);
            const end = new Date(data.endDate);
            const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) || 1;
            const totalAmount = data.dailyRate * days;

            const createdRental = await tx.rental.create({
                data: {
                    ...data,
                    startDate: start,
                    endDate: end,
                    originalEndDate: data.originalEndDate ? new Date(data.originalEndDate) : null,
                    totalAmount: totalAmount, // Enforce calculated total
                },
            });

            // Calculate Accounts Payable
            // 1. Owner (Tercero) - 80%
            if (vehicle && vehicle.ownership === 'Tercero') {
                // Use the calculated total, not rental.totalAmount which implies fetch
                const ownerAmount = Math.round(totalAmount * 0.80);
                await tx.accountPayable.create({
                    data: {
                        rentalId: createdRental.id,
                        type: 'Propietario',
                        beneficiaryName: vehicle.ownerName || 'Dueño Desconocido',
                        beneficiaryDni: vehicle.ownerDni,
                        amount: ownerAmount,
                        date: new Date(),
                        status: 'Retenido'
                    }
                });
            }

            // 2. Commercial Agent - 10%
            if (data.commercialAgent) {
                const agentAmount = Math.round(totalAmount * 0.10);
                const beneficiaryName = agent?.name || data.commercialAgent;
                const beneficiaryDni = agent?.dni || null;

                await tx.accountPayable.create({
                    data: {
                        rentalId: createdRental.id,
                        type: 'Comercial',
                        beneficiaryName: beneficiaryName,
                        beneficiaryDni: beneficiaryDni,
                        amount: agentAmount,
                        date: new Date(),
                        status: 'Retenido'
                    }
                });
            }

            return createdRental;
        });

        // Update vehicle status to "Rentado"
        if (rental.status === "Activo") {
            await prisma.vehicle.update({
                where: { id: rental.vehicleId },
                data: { status: "Rentado" }
            });
        }

        return NextResponse.json(rental);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error creating rental' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const data = await request.json();
        const { id, ...updateData } = data;

        // Handle Date conversions if present
        if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
        if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);
        if (updateData.originalEndDate) updateData.originalEndDate = new Date(updateData.originalEndDate);


        const rental = await prisma.rental.update({
            where: { id },
            data: updateData,
        });

        // If status changed to Finalizado, update vehicle to Disponible
        if (updateData.status === "Finalizado") {
            await prisma.vehicle.update({
                where: { id: rental.vehicleId },
                data: { status: "Disponible" }
            });
        }

        return NextResponse.json(rental);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error updating rental' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        // Check dependencies
        const invoice = await prisma.invoice.findFirst({ where: { rentalId: id } });
        if (invoice) {
            return NextResponse.json({
                error: 'No se puede eliminar la renta porque tiene una factura generada. Por favor, elimine la factura primero.'
            }, { status: 400 });
        }

        await prisma.rental.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error deleting rental' }, { status: 500 });
    }
}
