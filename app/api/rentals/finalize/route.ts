
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { rentalId, endDate } = body;

        console.log("Finalizing rental:", { rentalId, endDate });

        if (!rentalId || !endDate) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const actualEnd = new Date(endDate);
        if (isNaN(actualEnd.getTime())) {
            return NextResponse.json({ error: "Invalid endDate format" }, { status: 400 });
        }

        // Fetch Rental with Invoice and Vehicle
        const rental = await prisma.rental.findUnique({
            where: { id: rentalId },
            include: { invoice: true, vehicle: true }
        });

        if (!rental) return NextResponse.json({ error: "Rental not found" }, { status: 404 });
        if (rental.status === "Finalizado") return NextResponse.json({ error: "Rental already finalized" }, { status: 400 });

        const start = new Date(rental.startDate);
        // Calculate days difference
        const diffTime = actualEnd.getTime() - start.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        // Ensure at least 1 day charged if less than 24h but started
        const actualDays = diffDays < 1 ? 1 : diffDays;

        const dailyRate = rental.dailyRate;
        const actualTotal = actualDays * dailyRate;

        // Billed Amount logic
        const billedAmount = rental.invoice?.amount || 0;
        const diff = actualTotal - billedAmount;

        console.log("Calculation:", { start, actualEnd, actualDays, dailyRate, actualTotal, billedAmount, diff });

        const result = await prisma.$transaction(async (tx) => {
            // 1. Update Rental
            await tx.rental.update({
                where: { id: rentalId },
                data: {
                    endDate: actualEnd,
                    status: "Finalizado",
                    totalAmount: actualTotal
                }
            });

            // 2. Update Vehicle
            if (rental.vehicle) {
                await tx.vehicle.update({
                    where: { id: rental.vehicleId },
                    data: { status: "Disponible" }
                });
            }

            // 3. Handle Financials
            if (diff > 0) {
                // Extra Charge - Create New Invoice
                // Generate Invoice Number
                const year = new Date().getFullYear();
                const lastInvoice = await tx.invoice.findFirst({
                    where: { invoiceNumber: { startsWith: `FC/${year}/` } },
                    orderBy: { invoiceNumber: 'desc' }
                });
                let nextSequence = 1;
                if (lastInvoice) {
                    const parts = lastInvoice.invoiceNumber.split('/');
                    if (parts.length === 3) {
                        const num = parseInt(parts[2], 10);
                        if (!isNaN(num)) nextSequence = num + 1;
                    }
                }
                const invoiceNumber = `FC/${year}/${nextSequence.toString().padStart(4, '0')}`;

                await tx.invoice.create({
                    data: {
                        invoiceNumber,
                        clientId: rental.clientId,
                        amount: diff,
                        date: new Date(),
                        status: "Pendiente",
                        paidAmount: 0,
                        rentalDetails: JSON.stringify({
                            note: `${actualDays - (billedAmount / (rental.dailyRate || 1))} días excedidos de la renta ${rental.vehicle?.name || rentalId.slice(0, 8)}`,
                            daysAdded: actualDays - (billedAmount / (rental.dailyRate || 1)),
                            originalEndDate: rental.endDate,
                            actualEndDate: actualEnd
                        })
                    }
                });
            } else if (diff < 0) {
                // Refund Needed
                if (rental.invoice) {
                    await tx.refund.create({
                        data: {
                            invoiceId: rental.invoice.id,
                            clientId: rental.clientId,
                            amount: Math.abs(diff),
                            date: new Date(),
                            reason: "Devolución anticipada de vehículo"
                        }
                    });
                } else {
                    console.warn("Refund required but no original invoice found for rental:", rentalId);
                    // Cannot create refund without invoiceId? 
                    // Create a credit note or standalone refund if schema allows? 
                    // Schema requires invoiceId.
                    // We skip refund creation but log it. Or create a dummy invoice? 
                    // Skipping is safer than crashing.
                }
            }

            // 4. Update Pending Accounts Payable
            // Logic: Adjust pending APs based on new total.
            const pendingAPs = await tx.accountPayable.findMany({
                where: {
                    rentalId: rentalId,
                    OR: [{ status: "Pendiente" }, { status: "Retenido" }]
                }
            });

            for (const ap of pendingAPs) {
                let newAmount = ap.amount;
                if (ap.type === 'Propietario') {
                    newAmount = Math.round(actualTotal * 0.80);
                } else if (ap.type === 'Comercial') {
                    newAmount = Math.round(actualTotal * 0.10);
                }

                if (newAmount !== ap.amount) {
                    await tx.accountPayable.update({
                        where: { id: ap.id },
                        data: { amount: newAmount }
                    });
                }
            }

            return { success: true, diff, actualTotal };
        });

        return NextResponse.json(result);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error("Error finalizing rental FULL DETAIL:", error);
        return NextResponse.json({
            error: "Failed to finalize rental",
            details: error.message
        }, { status: 500 });
    }
}
