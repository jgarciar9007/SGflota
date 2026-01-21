
const BASE_URL = 'http://localhost:3000/api';

async function request(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            // Mocking Admin role for permissions if needed (e.g. for creating Personnel/Users)
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

async function verifyClients() {
    console.log('--- Verifying Clients ---');
    const client = {
        name: 'Empresa ABC S.R.L.',
        dni: '101-00000-1',
        email: 'contacto@empresaabc.com',
        phone: '809-555-0301',
        address: 'Calle Industria 5, Zona Industrial',
    };
    // Check if exists first to avoid duplicate errors in repeated runs
    const existing = await request('/clients');
    if (!existing.find(c => c.dni === client.dni)) {
        const created = await request('/clients', 'POST', client);
        console.log('✅ Client Created:', created.name);
    } else {
        console.log('ℹ️ Client already exists.');
    }
}

async function verifyOwners() {
    console.log('--- Verifying Owners ---');
    const owner = {
        name: 'Juan Perez',
        dni: '001-0000000-1',
        phone: '809-555-0101',
        email: 'juan.perez@email.com',
        status: 'Activo',
    };
    const existing = await request('/owners');
    if (!existing.find(o => o.dni === owner.dni)) {
        const created = await request('/owners', 'POST', owner);
        console.log('✅ Owner Created:', created.name);
    } else {
        console.log('ℹ️ Owner already exists.');
    }
}

async function verifyAgents() {
    console.log('--- Verifying Agents ---');
    const agent = {
        name: 'Carlos Ventas',
        dni: '001-0000000-3',
        phone: '809-555-0201',
        email: 'carlos.ventas@empresa.com',
        status: 'Activo',
    };
    const existing = await request('/agents');
    if (!existing.find(a => a.dni === agent.dni)) {
        const created = await request('/agents', 'POST', agent);
        console.log('✅ Agent Created:', created.name);
    } else {
        console.log('ℹ️ Agent already exists.');
    }
}

async function verifyExpenseCategories() {
    console.log('--- Verifying Expense Categories ---');
    const categories = [
        { name: 'Mantenimiento', type: 'Gasto' },
        { name: 'Combustible', type: 'Gasto' },
        { name: 'Seguro', type: 'Gasto' },
        { name: 'Servicio de Chofer', type: 'Ingreso' }
    ];

    const existing = await request('/expense-categories');

    for (const cat of categories) {
        if (!existing.find(c => c.name === cat.name)) {
            const created = await request('/expense-categories', 'POST', {
                ...cat,
                description: `Created via API verification`
            });
            console.log(`✅ Category Created: ${created.name} (${created.type})`);
        } else {
            console.log(`ℹ️ Category ${cat.name} already exists.`);
        }
    }
}

async function verifyPersonnel() {
    console.log('--- Verifying Personnel ---');
    const person = {
        name: 'Pedro El Conductor',
        dni: '001-1111111-1',
        phone: '809-555-9001',
        role: 'Conductor',
        licenseNumber: 'LIC-998877',
        status: 'Activo'
    };

    const existing = await request('/personnel');
    if (!existing.find(p => p.dni === person.dni)) {
        const created = await request('/personnel', 'POST', person);
        console.log('✅ Personnel Created:', created.name);
    } else {
        console.log('ℹ️ Personnel already exists.');
    }
}

async function main() {
    try {
        await verifyClients();
        await verifyOwners();
        await verifyAgents();
        await verifyExpenseCategories();
        await verifyPersonnel();
        console.log('\n🎉 ALL VERIFICATIONS PASSED: Nomenclators populated and verified.');
    } catch (error) {
        console.error('\n❌ VERIFICATION FAILED:', error.message);
        process.exit(1);
    }
}

main();
