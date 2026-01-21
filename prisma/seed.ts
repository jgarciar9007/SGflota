
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');

    // 1. Company Settings
    await prisma.companySettings.upsert({
        where: { id: 1 },
        update: {},
        create: {
            name: 'Rent A Car Ejemplo',
            address: 'Av. Principal 123, Ciudad',
            phone: '+1 234 567 890',
            email: 'contacto@rentaejemplo.com',
            taxId: 'RNC-123456789',
            website: 'https://www.rentaejemplo.com',
            logo: '/assets/logo-placeholder.png',
        },
    });
    console.log('🏢 Company Settings ensured.');

    // 1.5 Admin User
    const adminEmail = 'admin@sgflota.com';
    await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            name: 'Admin Principal',
            email: adminEmail,
            role: 'Admin',
            status: 'Active',
            password: 'admin123',
        },
    });
    console.log('👤 Admin User created.');

    const staffEmail = 'vendedor@sgflota.com';
    await prisma.user.upsert({
        where: { email: staffEmail },
        update: {},
        create: {
            name: 'Vendedor Turno Mañana',
            email: staffEmail,
            role: 'User',
            status: 'Active',
            password: 'user123',
        },
    });

    // 2. Owners (Propietarios)
    const owner1 = await prisma.owner.upsert({
        where: { dni: '001-0000000-1' },
        update: {},
        create: {
            name: 'Juan Perez',
            dni: '001-0000000-1',
            phone: '809-555-0101',
            email: 'juan.perez@email.com',
            status: 'Activo',
        },
    });

    const owner2 = await prisma.owner.upsert({
        where: { dni: '001-0000000-2' },
        update: {},
        create: {
            name: 'Maria Lopez',
            dni: '001-0000000-2',
            phone: '809-555-0102',
            email: 'maria.lopez@email.com',
            status: 'Activo',
        },
    });
    console.log('👥 Owners created.');

    // 3. Commercial Agents (Agentes)
    await prisma.commercialAgent.upsert({
        where: { dni: '001-0000000-3' },
        update: {},
        create: {
            name: 'Carlos Ventas',
            dni: '001-0000000-3',
            phone: '809-555-0201',
            email: 'carlos.ventas@empresa.com',
            status: 'Activo',
        },
    });

    await prisma.commercialAgent.upsert({
        where: { dni: '001-0000000-4' },
        update: {},
        create: {
            name: 'Ana Comercial',
            dni: '001-0000000-4',
            phone: '809-555-0202',
            email: 'ana.comercial@empresa.com',
            status: 'Activo',
        },
    });
    console.log('🕵️ Commercial Agents created.');

    // 4. Expense Categories (Tipos de Gastos e Ingresos)
    const expenseCategories = [
        { name: 'Mantenimiento', type: 'Gasto' },
        { name: 'Combustible', type: 'Gasto' },
        { name: 'Seguro', type: 'Gasto' },
        { name: 'Limpieza', type: 'Gasto' },
        { name: 'Repuestos', type: 'Gasto' },
        { name: 'Publicidad', type: 'Gasto' },
        { name: 'Servicio de Chofer', type: 'Ingreso' },
        { name: 'Silla de Bebé', type: 'Ingreso' },
        { name: 'GPS Adicional', type: 'Ingreso' },
        { name: 'Entrega a Domicilio', type: 'Ingreso' },
    ];

    for (const cat of expenseCategories) {
        // Find by name to avoid duplicates
        const existing = await prisma.expenseCategory.findFirst({ where: { name: cat.name } });
        if (!existing) {
            await prisma.expenseCategory.create({
                data: {
                    name: cat.name,
                    description: `${cat.type} general de ${cat.name.toLowerCase()}`,
                    type: cat.type,
                },
            });
        }
    }
    console.log('📂 Expense Categories created.');

    // 5. Clients (Clientes)
    await prisma.client.upsert({
        where: { dni: '101-00000-1' },
        update: {},
        create: {
            name: 'Empresa ABC S.R.L.',
            dni: '101-00000-1',
            email: 'contacto@empresaabc.com',
            phone: '809-555-0301',
            address: 'Calle Industria 5, Zona Industrial',
        },
    });

    await prisma.client.upsert({
        where: { dni: '001-0000000-5' },
        update: {},
        create: {
            name: 'Cliente Particular XYZ',
            dni: '001-0000000-5',
            email: 'cliente@gmail.com',
            phone: '809-555-0302',
            address: 'Residencial Las Palmas, Apto 4B',
        },
    });
    console.log('🤝 Clients created.');

    // 6. Fleet (Vehículos)
    const vehicles = [
        { name: 'Kia Picanto 2023', type: 'Compacto', range: 'Económico', price: 2500, year: 2023, plate: 'A-0001', ownership: 'Propia' },
        { name: 'Hyundai Tucson 2022', type: 'SUV', range: 'Medio', price: 4500, year: 2022, plate: 'G-0002', ownership: 'Propia' },
        { name: 'Toyota Corolla 2021', type: 'Sedán', range: 'Medio', price: 3500, year: 2021, plate: 'A-0003', ownership: 'Tercero', ownerName: owner1.name, ownerDni: owner1.dni },
        { name: 'Honda CR-V 2020', type: 'SUV', range: 'Premium', price: 5500, year: 2020, plate: 'G-0004', ownership: 'Tercero', ownerName: owner2.name, ownerDni: owner2.dni },
        { name: 'Chevrolet Tahoe 2024', type: 'SUV', range: 'Lujo', price: 12000, year: 2024, plate: 'L-0005', ownership: 'Propia' }
    ];

    for (const v of vehicles) {
        // Using findFirst because plate might not be formally unique in Prisma, though logically it is.
        const existing = await prisma.vehicle.findFirst({ where: { plate: v.plate } });
        if (!existing) {
            await prisma.vehicle.create({
                data: {
                    ...v,
                    status: 'Disponible',
                    image: '', // Placeholder
                }
            });
        }
    }
    console.log('🚗 Fleet created.');

    // 7. Personnel (Personal)
    // 7.1 Drivers (Conductores)
    const drivers = [
        { name: 'Pedro El Conductor', dni: '001-1111111-1', phone: '809-555-9001', role: 'Conductor', licenseNumber: 'LIC-998877' },
        { name: 'Manuel Volante', dni: '001-1111111-2', phone: '809-555-9002', role: 'Conductor', licenseNumber: 'LIC-554433' },
    ];

    for (const d of drivers) {
        await prisma.personnel.upsert({
            where: { dni: d.dni }, // Assuming DNI is unique or good key
            update: {}, // No updates, just ensure existence
            create: {
                name: d.name,
                dni: d.dni,
                phone: d.phone,
                email: '',
                role: d.role,
                status: 'Activo',
                licenseNumber: d.licenseNumber,
                salary: undefined // Drivers don't have salary in this model logic (paid by trip/payment)
            }
        });
    }

    // 7.2 Staff (Administrativo/Mecánico)
    const staff = [
        { name: 'Laura Secretaria', dni: '001-2222222-1', phone: '809-555-8001', role: 'Administrativo', salary: 25000, email: 'laura@sgflota.com' },
        { name: 'Roberto Mecánico', dni: '001-2222222-2', phone: '809-555-8002', role: 'Mecánico', salary: 30000, email: 'taller@sgflota.com' },
    ];

    for (const s of staff) {
        await prisma.personnel.upsert({
            where: { dni: s.dni },
            update: {},
            create: {
                name: s.name,
                dni: s.dni,
                phone: s.phone,
                email: s.email,
                role: s.role,
                status: 'Activo',
                salary: s.salary
            }
        });
    }
    console.log('👷 Personnel created.');

    console.log('✅ Seed completed successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
