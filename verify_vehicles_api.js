
// Using native fetch

const BASE_URL = 'http://localhost:3000/api/vehicles';

async function verifyVehicleCRUD() {
    console.log('🚗 Starting Vehicle CRUD Verification...');

    // 1. Create Vehicle
    const newVehicle = {
        name: 'Verification Truck',
        plate: 'KO-VERIFY-01',
        type: 'Pickup',
        range: 'Premium',
        price: 50000,
        image: 'https://placehold.co/600x400',
        year: 2024,
        ownership: 'Propia',
        status: 'Disponible'
    };

    console.log('TEST 1: Creating Vehicle...', newVehicle.plate);
    try {
        const createRes = await fetch(BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newVehicle)
        });

        if (!createRes.ok) {
            const err = await createRes.text();
            throw new Error(`Failed to create vehicle: ${createRes.status} ${err}`);
        }

        const createdVehicle = await createRes.json();
        console.log('✅ Vehicle Created:', createdVehicle.id);

        // 2. Verify Existence
        console.log('TEST 2: Verifying Existence...');
        const listRes = await fetch(BASE_URL);
        const vehicles = await listRes.json();
        const found = vehicles.find(v => v.id === createdVehicle.id);

        if (found) {
            console.log('✅ Vehicle found in list.');
        } else {
            throw new Error('Vehicle not found in list after creation.');
        }

        // 3. Delete Vehicle
        console.log('TEST 3: Deleting Vehicle...');
        const deleteRes = await fetch(`${BASE_URL}?id=${createdVehicle.id}`, {
            method: 'DELETE',
            headers: { 'x-user-role': 'Admin' } // Mocking header if needed, though local API might not enforce strict JWT in dev without middleware
        });

        if (!deleteRes.ok) {
            const err = await deleteRes.text();
            throw new Error(`Failed to delete vehicle: ${deleteRes.status} ${err}`);
        }
        console.log('✅ Delete request successful.');

        // 4. Verify Deletion
        console.log('TEST 4: Verifying Deletion...');
        const listRes2 = await fetch(BASE_URL);
        const vehicles2 = await listRes2.json();
        const found2 = vehicles2.find(v => v.id === createdVehicle.id);

        if (!found2) {
            console.log('✅ Vehicle successfully removed from list.');
        } else {
            throw new Error('Vehicle still exists after deletion.');
        }

        console.log('🎉 ALL TESTS PASSED: Vehicle CRUD is working correctly.');

    } catch (error) {
        console.error('❌ VALIDATION FAILED:', error.message);
        process.exit(1);
    }
}

verifyVehicleCRUD();
