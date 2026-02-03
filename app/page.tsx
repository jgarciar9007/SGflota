
import prisma from "@/lib/prisma";
import { PublicFleet } from "@/components/landing/PublicFleet";

// Force dynamic rendering since vehicle availability changes
export const dynamic = 'force-dynamic';

export default async function Home() {
  // Fetch available vehicles
  const vehicles = await prisma.vehicle.findMany({
    where: {
      status: 'Disponible'
    },
    orderBy: {
      price: 'asc'
    }
  });

  return <PublicFleet vehicles={vehicles} />;
}
