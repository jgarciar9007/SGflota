
import prisma from "@/lib/prisma";
import { PublicFleet } from "@/components/landing/PublicFleet";

// Force dynamic rendering since vehicle availability changes
export const dynamic = 'force-dynamic';

export default async function Home() {
  const vehicles = await prisma.vehicle.findMany({
    where: {
      status: { in: ['Disponible', 'Rentado'] }
    },
    select: {
      id: true,
      name: true,
      type: true,
      range: true,
      price: true,
      image: true,
      images: true,
      status: true,
      plate: true,
      year: true,
      seats: true,
      rentals: {
        where: { status: 'Activo' },
        select: { endDate: true },
        take: 1,
        orderBy: { endDate: 'asc' }
      }
    },
    orderBy: { price: 'asc' }
  });

  const mapped = vehicles.map(({ rentals, ...v }) => ({
    ...v,
    availableFrom: v.status === 'Rentado' && rentals[0]?.endDate
      ? rentals[0].endDate.toISOString()
      : null,
  })).sort((a, b) => {
    if (a.status === 'Disponible' && b.status !== 'Disponible') return -1;
    if (a.status !== 'Disponible' && b.status === 'Disponible') return 1;
    return a.price - b.price;
  });

  return <PublicFleet vehicles={mapped} />;
}
