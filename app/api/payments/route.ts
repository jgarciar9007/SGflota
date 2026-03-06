import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const payments = await prisma.payment.findMany({
            orderBy: { date: 'desc' },
            include: {
                invoice: true,
                client: true,
            }
        });
        return NextResponse.json(payments);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error fetching payments' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();

        // Transaction to create payment and update invoice
        const result = await prisma.$transaction(async (tx) => {
            // Generate Payment Number (P-XXX/YY)
            const year = new Date().getFullYear();
            const yearShort = year.toString().slice(-2);
            const prefix = `P`;
            const suffix = `/${yearShort}`;

            const lastPayment = await tx.payment.findFirst({
                where: {
                    paymentNumber: {
                        startsWith: prefix,
                        endsWith: suffix
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            let nextSequence = 1;
            if (lastPayment && lastPayment.paymentNumber) {
                const parts = lastPayment.paymentNumber.split('-');
                if (parts.length === 2) {
                    const subParts = parts[1].split('/');
                    if (subParts.length === 2) {
                        const num = parseInt(subParts[0], 10);
                        if (!isNaN(num)) nextSequence = num + 1;
                    }
                }
            }

            const paymentNumber = `${prefix}-${nextSequence.toString().padStart(3, '0')}${suffix}`;

            const payment = await tx.payment.create({
                data: {
                    ...data,
                    paymentNumber,
                    date: new Date(data.date),
                }
            });

            // Update Invoice Paid Amount
            const invoice = await tx.invoice.findUnique({
                where: { id: data.invoiceId },
                include: { rental: true } // Need rental to find APs
            });

            if (invoice) {
                const newPaidAmount = invoice.paidAmount + payment.amount;
                const newStatus = newPaidAmount >= invoice.amount ? "Pagado" : "Parcial";

                await tx.invoice.update({
                    where: { id: data.invoiceId },
                    data: {
                        paidAmount: newPaidAmount,
                        status: newStatus,
                    }
                });

                // If fully paid, release held Account Payables
                if (newStatus === "Pagado" && invoice.rentalId) {
                    await tx.accountPayable.updateMany({
                        where: {
                            rentalId: invoice.rentalId,
                            status: 'Retenido'
                        },
                        data: { status: 'Pendiente' }
                    });
                }
            }

            return payment;
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error creating payment' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    // Only allow deletion if strict control or implemented logic to revert invoice amount
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        // Auth Check
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'Admin') {
            return NextResponse.json({ error: 'Acceso denegado. Solo administradores pueden eliminar.' }, { status: 403 });
        }

        // Revert details
        await prisma.$transaction(async (tx) => {
            const payment = await tx.payment.findUnique({ where: { id } });
            if (!payment) throw new Error("Payment not found");

            await tx.payment.delete({ where: { id } });

            // Revert Invoice Amount
            const invoice = await tx.invoice.findUnique({ where: { id: payment.invoiceId } });
            if (invoice) {
                const newPaidAmount = invoice.paidAmount - payment.amount;
                const newStatus = newPaidAmount <= 0 ? "Pendiente" : (newPaidAmount >= invoice.amount ? "Pagado" : "Parcial");

                await tx.invoice.update({
                    where: { id: payment.invoiceId },
                    data: {
                        paidAmount: newPaidAmount,
                        status: newStatus,
                    }
                });
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error deleting payment' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const data = await request.json();
        const { id, amount, date, method } = data;

        if (!id || typeof amount !== 'number') {
            return NextResponse.json({ error: 'ID and amount required' }, { status: 400 });
        }

        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const result = await prisma.$transaction(async (tx) => {
            const oldPayment = await tx.payment.findUnique({ where: { id } });
            if (!oldPayment) throw new Error("Payment not found");

            const amountDiff = amount - oldPayment.amount;

            // Update payment
            const updatedPayment = await tx.payment.update({
                where: { id },
                data: {
                    amount,
                    date: date ? new Date(date) : oldPayment.date,
                    method: method || oldPayment.method
                }
            });

            // Update Invoice Paid Amount
            if (amountDiff !== 0) {
                const invoice = await tx.invoice.findUnique({ where: { id: oldPayment.invoiceId } });
                if (invoice) {
                    const newPaidAmount = invoice.paidAmount + amountDiff;
                    let newStatus = invoice.status;
                    if (newPaidAmount <= 0) newStatus = "Pendiente";
                    else if (newPaidAmount >= invoice.amount) newStatus = "Pagado";
                    else newStatus = "Parcial";

                    await tx.invoice.update({
                        where: { id: oldPayment.invoiceId },
                        data: {
                            paidAmount: newPaidAmount,
                            status: newStatus,
                        }
                    });
                }
            }

            return updatedPayment;
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error updating payment' }, { status: 500 });
    }
}
