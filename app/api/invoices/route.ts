import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const invoices = await prisma.invoice.findMany({
            orderBy: { date: 'desc' },
            include: {
                client: true,
                rental: true,
            }
        });
        const parsedInvoices = invoices.map(inv => {
            let details = null;
            if (inv.rentalDetails) {
                try {
                    details = typeof inv.rentalDetails === 'string' ? JSON.parse(inv.rentalDetails) : inv.rentalDetails;
                } catch (e) {
                    console.error("Error parsing rentalDetails for invoice " + inv.id, e);
                }
            }
            return {
                ...inv,
                rentalDetails: details
            };
        });
        return NextResponse.json(parsedInvoices);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error fetching invoices' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        // Ensure rentalDetails is a string if present
        if (data.rentalDetails && typeof data.rentalDetails === 'object') {
            data.rentalDetails = JSON.stringify(data.rentalDetails);
        }

        // Generate Invoice Number (FC-XXX/YY)
        const year = new Date().getFullYear(); // 2026
        const yearShort = year.toString().slice(-2); // "26"
        const prefix = `FC`;
        const suffix = `/${yearShort}`; // "/26"

        // Find last invoice of this year to increment
        const lastInvoice = await prisma.invoice.findFirst({
            where: {
                invoiceNumber: { endsWith: suffix }
            },
            orderBy: {
                invoiceNumber: 'desc' // Depends on format length uniformity or createdAt
                // Ideally filter by regex but Prisma doesn't support easy regex.
                // Assuming uniform length FC-XXX/YY allows explicit sorting.
            }
        });

        // Better sort by createdAt to get the latest created, assuming sequential creation
        const lastInvoiceTimeSorted = await prisma.invoice.findFirst({
            where: {
                invoiceNumber: {
                    startsWith: prefix,
                    endsWith: suffix
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        let nextSequence = 1;
        if (lastInvoiceTimeSorted) {
            // Format: FC-001/26
            const parts = lastInvoiceTimeSorted.invoiceNumber.split('-'); // ["FC", "001/26"]
            if (parts.length === 2) {
                const subParts = parts[1].split('/'); // ["001", "26"]
                if (subParts.length === 2) {
                    const num = parseInt(subParts[0], 10);
                    if (!isNaN(num)) nextSequence = num + 1;
                }
            }
        }

        const invoiceNumber = `${prefix}-${nextSequence.toString().padStart(3, '0')}${suffix}`;

        const invoice = await prisma.invoice.create({
            data: {
                ...data,
                invoiceNumber,
                date: new Date(data.date),
            },
        });
        return NextResponse.json(invoice);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error("Error creating invoice:", error);

        if (error.code === 'P2003') {
            return NextResponse.json({
                error: 'Error de integridad referencial: El Cliente o la Renta especificados no existen. (P2003)'
            }, { status: 400 });
        }
        if (error.code === 'P2002') {
            return NextResponse.json({
                error: 'Error: Ya existe una factura duplicada (mismo número o misma renta).'
            }, { status: 400 });
        }

        return NextResponse.json({ error: 'Error creating invoice' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const data = await request.json();
        const { id, ...updateData } = data;

        if (updateData.date) updateData.date = new Date(updateData.date);

        const invoice = await prisma.invoice.update({
            where: { id },
            data: updateData,
        });
        return NextResponse.json(invoice);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error updating invoice' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        // Check dependencies
        const paymentsCount = await prisma.payment.count({ where: { invoiceId: id } });
        if (paymentsCount > 0) {
            return NextResponse.json({
                error: 'No se puede eliminar la factura porque tiene pagos asociados. Por favor, elimine los pagos primero para mantener la integridad de los datos.'
            }, { status: 400 });
        }

        await prisma.invoice.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error deleting invoice' }, { status: 500 });
    }
}
