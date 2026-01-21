
const BASE_URL = 'http://localhost:3000/api';

async function request(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'x-user-role': 'Admin'
        }
    };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(`${BASE_URL}${endpoint}`, options);
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`${method} ${endpoint} failed: ${res.status} ${text}`);
    }
    return res.json();
}

async function verifyCRUD(entityName, endpoint, createPayload, updatePayload) {
    console.log(`\n--- Verifying CRUD for ${entityName} ---`);

    // 1. CREATE (To ensure we have something to update/delete)
    // We append a timestamp to ensure uniqueness if unique constraints exist
    const uniqueSuffix = Date.now();
    const payload = { ...createPayload };
    if (payload.dni) payload.dni = `${payload.dni}-${uniqueSuffix}`;
    if (payload.email) payload.email = `test.${uniqueSuffix}@example.com`;
    if (payload.plate) payload.plate = `TST-${uniqueSuffix.toString().slice(-4)}`;

    console.log(`1. Creating ${entityName}...`);
    const created = await request(endpoint, 'POST', payload);
    console.log(`   ✅ Created ID: ${created.id || created.name}`);

    // 2. UPDATE
    console.log(`2. Updating ${entityName}...`);
    const updateData = { id: created.id, ...updatePayload };
    // Handle specific ID location if not 'id' (e.g. some might use dni, but API usually uses ID for updates)
    // My previous checks suggest ID is standard.

    const updated = await request(endpoint, 'PUT', updateData);

    // Check if update reflected
    const checkField = Object.keys(updatePayload)[0];
    if (updated[checkField] !== updatePayload[checkField]) {
        throw new Error(`Update failed. Expected ${checkField}=${updatePayload[checkField]}, got ${updated[checkField]}`);
    }
    console.log(`   ✅ Updated ${checkField}: ${updated[checkField]}`);

    // 3. DELETE
    console.log(`3. Deleting ${entityName}...`);
    await request(`${endpoint}?id=${created.id}`, 'DELETE');

    // 4. VERIFY DELETION
    const list = await request(endpoint);
    const found = list.find(item => item.id === created.id);
    if (found) throw new Error("Item still exists after deletion");
    console.log(`   ✅ Deleted successfully`);
}

async function main() {
    try {
        // CLIENTS
        await verifyCRUD('Client', '/clients',
            { name: 'CRUD Test Client', dni: 'CRUD-001', email: 'crud@client.com', phone: '555-0000', address: 'Test St' },
            { name: 'CRUD Test Client UPDATED' }
        );

        // OWNERS
        await verifyCRUD('Owner', '/owners',
            { name: 'CRUD Test Owner', dni: 'CRUD-OWN-001', email: 'crud@owner.com', phone: '555-1111', status: 'Activo' },
            { name: 'CRUD Test Owner UPDATED' }
        );

        // AGENTS
        await verifyCRUD('Agent', '/agents',
            { name: 'CRUD Test Agent', dni: 'CRUD-AGT-001', email: 'crud@agent.com', phone: '555-2222', status: 'Activo' },
            { name: 'CRUD Test Agent UPDATED' }
        );

        // EXPENSE CATEGORIES
        await verifyCRUD('Expense Category', '/expense-categories',
            { name: `CRUD-Cat-${Date.now()}`, type: 'Gasto', description: 'Test Cat' },
            { description: 'Test Cat UPDATED' }
        );

        // PERSONNEL
        await verifyCRUD('Personnel', '/personnel',
            { name: 'CRUD Person', dni: 'CRUD-PER-001', phone: '555-3333', role: 'Conductor', status: 'Activo' },
            { name: 'CRUD Person UPDATED' }
        );

        // VEHICLES (Already tested, but good to have in suite)
        await verifyCRUD('Vehicle', '/vehicles',
            { name: 'CRUD Car', plate: 'CRUD-V', type: 'Sedan', range: 'Medio', price: 3000, year: 2022, ownership: 'Propia', status: 'Disponible', image: 'https://placehold.co/600x400' },
            { price: 3500 }
        );

        // USERS
        await verifyCRUD('User', '/users',
            { name: 'CRUD User', email: 'crud@user.com', role: 'User', status: 'Active', password: 'password123' },
            { status: 'Inactive' }
        );

        console.log('\n🎉 ALL ADMIN CRUDOPERATIONS VERIFIED SUCCESSFULLY!');

    } catch (error) {
        console.error('\n❌ CRUD VERIFICATION FAILED:', error.message);
        process.exit(1);
    }
}

main();
