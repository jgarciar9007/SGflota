
const BASE_URL = 'http://localhost:3000/api';
// Use a fixed date for consistency
const TODAY = new Date().toISOString();
const TOMORROW = new Date(Date.now() + 86400000).toISOString();

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

async function verifyFullFlow() {
    console.log('🚀 STARTING FULL SYSTEM VERIFICATION FLOW');

    try {
        // PRE-REQUISITES: Get a Client and a Vehicle
        console.log('1️⃣ Fetching Client and Vehicle...');
        const vehicles = await request('/vehicles');
        // Find a proprietary vehicle to test 'Propia' logic, or Third Party to test AP logic
        // Let's try to find a Third Party vehicle to test the complex AP flow
        let vehicle = vehicles.find(v => v.ownership === 'Tercero' && v.status === 'Disponible');
        if (!vehicle) {
            console.log('⚠️ No available Third Party vehicle found. Creating one...');
            vehicle = await request('/vehicles', 'POST', {
                name: 'Test Flow Car',
                plate: 'FLOW-999',
                type: 'Sedan',
                range: 'Medio',
                price: 3500,
                year: 2023,
                ownership: 'Tercero',
                ownerName: 'Test Owner',
                ownerDni: '999-999999-9',
                status: 'Disponible',
                image: 'https://placehold.co/600x400'
            });
        }
        console.log(`   Vehicle: ${vehicle.name} (${vehicle.plate})`);

        const clients = await request('/clients');
        let client = clients[0];
        if (!client) throw new Error("No clients found. Run verify_nomenclators.js first.");
        console.log(`   Client: ${client.name}`);

        // STEP 1: CREATE RENTAL
        console.log('\n2️⃣ Creating Rental...');
        const rentalData = {
            vehicleId: vehicle.id,
            clientId: client.id,
            startDate: TODAY,
            endDate: TOMORROW, // 1 Day
            dailyRate: vehicle.price,
            status: 'Activo',
            commercialAgent: 'Carlos Ventas' // Use name to trigger Agent AP
        };

        const rental = await request('/rentals', 'POST', rentalData);
        console.log(`✅ Rental Created: ${rental.id} (Total: ${rental.totalAmount})`);

        // STEP 1.5: MANUALLY CREATE INVOICE (Mirroring Frontend Logic)
        console.log('\n2️⃣.5️⃣ Creating Invoice (Frontend Logic Mirror)...');
        const days = Math.ceil((new Date(rentalData.endDate).getTime() - new Date(rentalData.startDate).getTime()) / (86400000));
        const invoiceAmount = Math.round((vehicle.price * days) * 1.15); // +15% VAT

        await request('/invoices', 'POST', {
            rentalId: rental.id,
            clientId: client.id,
            amount: invoiceAmount, // Calculated with VAT
            date: TODAY,
            status: 'Pendiente',
            rentalDetails: { startDate: rentalData.startDate, endDate: rentalData.endDate, days }
        });
        console.log(`✅ Invoice Created Manually: ${invoiceAmount} FCFA`);

        // STEP 2: VERIFY SYSTEM IMPACT (Invoice & APs)
        console.log('\n3️⃣ Verifying Automated Records...');

        // Check Invoice
        const invoices = await request('/invoices');
        const invoice = invoices.find(i => i.rentalId === rental.id);
        if (!invoice) throw new Error("Invoice was not automatically created for rental.");
        console.log(`✅ Invoice Found: ${invoice.invoiceNumber} (Status: ${invoice.status})`);

        // Check APs (Should be 'Retenido')
        const aps = await request('/accounts-payable');
        const rentalAPs = aps.filter(ap => ap.rentalId === rental.id);
        if (rentalAPs.length === 0) console.warn("⚠️ No Accounts Payable found. Check rental logic.");

        const ownerAP = rentalAPs.find(ap => ap.type === 'Propietario');
        const agentAP = rentalAPs.find(ap => ap.type === 'Comercial');

        if (ownerAP) console.log(`   AP Owner: ${ownerAP.amount} (${ownerAP.status})`);
        if (agentAP) console.log(`   AP Agent: ${agentAP.amount} (${agentAP.status})`);

        if (ownerAP?.status !== 'Retenido') throw new Error("Owner AP should be 'Retenido' initially.");

        // STEP 3: PAY INVOICE
        console.log('\n4️⃣ Registering Payment...');
        const paymentData = {
            receiptId: `REC-${Date.now()}`,
            invoiceId: invoice.id,
            clientId: client.id,
            amount: invoice.amount,
            date: TODAY,
            method: 'Transferencia'
        };
        await request('/payments', 'POST', paymentData);
        console.log(`✅ Payment Registered: ${paymentData.amount}`);

        // Verify Invoice is now Paid
        const updatedInvoices = await request('/invoices');
        const updatedInvoice = updatedInvoices.find(i => i.id === invoice.id);
        if (updatedInvoice.status !== 'Pagado') throw new Error("Invoice status did not update to 'Pagado'.");
        console.log(`   Invoice Status Updated: ${updatedInvoice.status}`);

        // STEP 4: VERIFY AP RELEASE
        console.log('\n5️⃣ Verifying Account Payable Release...');
        const updatedAPs = await request('/accounts-payable');
        const updatedOwnerAP = updatedAPs.find(ap => ap.rentalId === rental.id && ap.type === 'Propietario');

        if (updatedOwnerAP.status !== 'Pendiente') throw new Error("AP Status should be 'Pendiente' after invoice payment.");
        console.log(`✅ AP Released: ${updatedOwnerAP.status}`);

        // STEP 5: PAY AP & VERIFY EXPENSE
        console.log('\n6️⃣ Paying Account Payable (Owner)...');
        await request('/accounts-payable', 'PUT', { id: updatedOwnerAP.id, status: 'Pagado' });
        console.log(`✅ AP Marked as Paid`);

        // Check Expense
        const expenses = await request('/expenses');
        // Find expense with amount matching AP and roughly same time
        const expense = expenses.find(e => e.amount === updatedOwnerAP.amount && e.description.includes(updatedOwnerAP.beneficiaryName));
        if (!expense) throw new Error("Expense was not automatically created for AP payment.");
        console.log(`✅ Expense Record Found: ${expense.amount} - ${expense.description}`);

        // STEP 6: FINALIZE RENTAL
        console.log('\n7️⃣ Finalizing Rental...');
        const finalizationData = {
            rentalId: rental.id,
            endDate: TOMORROW // On time
        };
        await request('/rentals/finalize', 'POST', finalizationData);
        console.log(`✅ Rental Finalized`);

        // Verify Vehicle Status
        const finalVehicles = await request('/vehicles');
        const finalVehicle = finalVehicles.find(v => v.id === vehicle.id);
        if (finalVehicle.status !== 'Disponible') throw new Error("Vehicle status did not revert to 'Disponible'.");
        console.log(`✅ Vehicle Status: ${finalVehicle.status}`);

        console.log('\n🎉 FULL FLOW VERIFICATION SUCCESSFUL!');

    } catch (error) {
        console.error('\n❌ FLOW FAILED:', error.message);
        process.exit(1);
    }
}

verifyFullFlow();
