"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Types
export interface Vehicle {
    id: string;
    name: string;
    type: string;
    range: string;
    price: number;
    image: string;
    status: "Disponible" | "Rentado" | "Mantenimiento";
    plate: string;
    year: number;
    ownership: "Propia" | "Tercero";
    ownerName?: string;
    ownerDni?: string;
}

export interface Client {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    dni: string;
}

export interface Rental {
    id: string;
    vehicleId: string;
    clientId: string;
    startDate: string;
    endDate: string;
    originalEndDate?: string;
    dailyRate: number;
    status: "Activo" | "Finalizado";
    totalAmount?: number;
    commercialAgent?: string;
}

export interface AccountPayable {
    id: string;
    rentalId: string;
    type: "Propietario" | "Comercial";
    beneficiaryName: string;
    beneficiaryDni?: string;
    amount: number;
    date: string;
    status: "Pendiente" | "Pagado" | "Retenido";
}

export interface Invoice {
    id: string;
    invoiceNumber: string; // New field
    rentalId: string;
    clientId: string;
    amount: number;
    paidAmount: number;
    date: string;
    status: "Pagado" | "Pendiente" | "Parcial";
    payments: Payment[];
    rentalDetails?: {
        startDate?: string;
        endDate?: string;
        days?: number;
        note?: string;
        items?: { description: string; quantity: number; price: number }[]; // Added support for manual items
    };
}

export interface Payment {
    id: string;
    receiptId: string;
    clientId: string;
    invoiceId: string;
    amount: number;
    date: string;
    method: string;
    paymentNumber?: string;
}

export interface Refund {
    id: string;
    invoiceId: string;
    clientId: string;
    amount: number;
    date: string;
    reason: string;
    status: string; // "Pendiente" | "Reembolsado"
    refundNumber?: string;
}

export interface ExpenseCategory {
    id: string;
    name: string;
    description?: string;
    type: "Gasto" | "Ingreso";
}

export interface Personnel {
    id: string;
    name: string;
    dni: string;
    phone: string;
    email?: string;
    role: "Conductor" | "Administrativo" | "Mecánico" | "Otro";
    licenseNumber?: string;
    salary?: number;
    status: "Activo" | "Inactivo";
}

export interface DriverPayment {
    id: string;
    personnelId: string;
    amount: number;
    date: string;
    concept: string;
    notes?: string;
    personnel?: Personnel;
}

export interface Payroll {
    id: string;
    month: number;
    year: number;
    totalAmount: number;
    status: "Borrador" | "Pagado";
    details: string; // JSON
}

export interface Expense {
    id: string;
    date: string;
    amount: number;
    description: string;
    categoryId: string;
    invoiceId?: string;
    status: "Pagado" | "Pendiente";
    expenseNumber?: string;
}

export interface Maintenance {
    id: string;
    vehicleId: string;
    description: string;
    date: string;
    cost: number;
    status: "Programado" | "En Proceso" | "Completado";
    type?: string;
}

export interface CompanySettings {
    name: string;
    logo: string;
    address: string;
    phone: string;
    email: string;
    taxId: string;
    website: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: "Admin" | "User" | "Registrar";
    status: "Active" | "Inactive";
    password?: string;
    avatar?: string;
}

// ...

interface DataContextType {
    // ... items
    currentUser: User | null;
    login: (email: string) => boolean;
    logout: () => void;
    canEdit: (user: User | null) => boolean;
    canDelete: (user: User | null) => boolean;
    canAccessSettings: (user: User | null) => boolean; // New helper
    isLoading: boolean;
}

// ... inside DataProvider ...

const canEdit = (user: User | null) => {
    if (!user) return false;
    // Admin and Registrar can edit/write
    if (user.role === "Admin" || user.role === "Registrar") return true;
    // User is Read-Only
    return false;
};

const canDelete = (user: User | null) => {
    if (!user) return false;
    // Strict Admin only
    if (user.role === "Admin") return true;
    return false;
};

const canAccessSettings = (user: User | null) => {
    if (!user) return false;
    // "Registrador... no puede tocar los nomencladores" -> No settings access.
    // "Usuario solo lectura" -> Probably shouldn't mess with settings either.
    if (user.role === "Admin") return true;
    return false;
};

export interface CommercialAgent {
    id: string;
    name: string;
    dni: string;
    phone: string;
    email: string;
    status: "Activo" | "Inactivo";
}

export interface Owner {
    id: string;
    name: string;
    dni: string;
    phone: string;
    email: string;
    status: "Activo" | "Inactivo";
}

interface DataContextType {
    vehicles: Vehicle[];
    clients: Client[];
    rentals: Rental[];
    invoices: Invoice[];
    maintenances: Maintenance[];
    companySettings: CompanySettings;
    users: User[];
    payments: Payment[];
    refunds: Refund[];
    accountsPayable: AccountPayable[];
    commercialAgents: CommercialAgent[];
    owners: Owner[];
    expenses: Expense[];
    expenseCategories: ExpenseCategory[];
    personnel: Personnel[];
    driverPayments: DriverPayment[];
    payrolls: Payroll[];
    addVehicle: (vehicle: Omit<Vehicle, "id">) => void;
    updateVehicle: (id: string, updates: Partial<Vehicle>) => void;
    deleteVehicle: (id: string) => void;
    addClient: (client: Omit<Client, "id">) => void;
    updateClient: (id: string, updates: Partial<Client>) => void;
    deleteClient: (id: string) => void;
    addRental: (rental: Omit<Rental, "id">) => void;
    updateRental: (id: string, updates: Partial<Rental>) => void;
    endRental: (id: string, actualEndDate: string) => void;
    addInvoice: (invoice: Omit<Invoice, "id" | "invoiceNumber" | "status" | "paidAmount" | "payments"> & { date?: string }) => void;
    updateInvoice: (id: string, updates: Partial<Invoice>) => void;
    addPayment: (clientId: string, allocations: { invoiceId: string; amount: number }[], method: string) => Promise<string>; // Changed to Promise
    addRefund: (clientId: string, invoiceId: string, amount: number, reason: string) => void;
    updateRefund: (id: string, updates: Partial<Refund>) => void;
    addMaintenance: (maintenance: Omit<Maintenance, "id">) => void;
    updateMaintenance: (id: string, updates: Partial<Maintenance>) => void;
    deleteMaintenance: (id: string) => void;
    updateCompanySettings: (settings: Partial<CompanySettings>) => void;
    addUser: (user: Omit<User, "id">) => void;
    updateUser: (id: string, user: Partial<User>) => void;
    deleteUser: (id: string) => void;
    addAccountPayable: (ap: Omit<AccountPayable, "id" | "date" | "status">) => void;
    updateAccountPayable: (id: string, updates: Partial<AccountPayable>) => void;
    addCommercialAgent: (agent: Omit<CommercialAgent, "id">) => void;
    updateCommercialAgent: (id: string, updates: Partial<CommercialAgent>) => void;
    deleteCommercialAgent: (id: string) => void;
    addOwner: (owner: Omit<Owner, "id">) => void;
    updateOwner: (id: string, updates: Partial<Owner>) => void;
    deleteOwner: (id: string) => void;
    addExpense: (expense: Omit<Expense, "id">) => void;
    updateExpense: (id: string, updates: Partial<Expense>) => void;
    deleteExpense: (id: string) => void;
    addExpenseCategory: (category: Omit<ExpenseCategory, "id">) => void;
    updateExpenseCategory: (id: string, updates: Partial<ExpenseCategory>) => void;
    deleteExpenseCategory: (id: string) => void;
    addPersonnel: (person: Omit<Personnel, "id">) => void;
    updatePersonnel: (id: string, updates: Partial<Personnel>) => void;
    deletePersonnel: (id: string) => void;
    addDriverPayment: (payment: Omit<DriverPayment, "id">) => void;
    addPayroll: (payroll: Omit<Payroll, "id">) => void;
    currentUser: User | null;
    login: (email: string) => boolean;
    logout: () => void;
    canEdit: (user: User | null) => boolean;
    canDelete: (user: User | null) => boolean;
    isLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const initialCompanySettings: CompanySettings = {
    name: "SGFlota",
    logo: "",
    address: "",
    phone: "",
    email: "",
    taxId: "",
    website: "",
};

export function DataProvider({ children }: { children: ReactNode }) {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [rentals, setRentals] = useState<Rental[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
    const [companySettings, setCompanySettings] = useState<CompanySettings>(initialCompanySettings);
    const [users, setUsers] = useState<User[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [refunds, setRefunds] = useState<Refund[]>([]);
    const [accountsPayable, setAccountsPayable] = useState<AccountPayable[]>([]);
    const [commercialAgents, setCommercialAgents] = useState<CommercialAgent[]>([]);
    const [owners, setOwners] = useState<Owner[]>([]);

    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);
    const [personnel, setPersonnel] = useState<Personnel[]>([]);
    const [driverPayments, setDriverPayments] = useState<DriverPayment[]>([]);
    const [payrolls, setPayrolls] = useState<Payroll[]>([]);

    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [
                v, c, r, i, m, s, u, p, ref, exp, expCat, own, agt, ap, per, dp, pay
            ] = await Promise.all([
                fetch('/api/vehicles').then(res => res.json()),
                fetch('/api/clients').then(res => res.json()),
                fetch('/api/rentals').then(res => res.json()),
                fetch('/api/invoices').then(res => res.json()),
                fetch('/api/maintenance').then(res => res.json()),
                fetch('/api/settings').then(res => res.json()),
                fetch('/api/users').then(res => res.json()),
                fetch('/api/payments').then(res => res.json()),
                fetch('/api/refunds').then(res => res.json()),
                fetch('/api/expenses').then(res => res.json()),
                fetch('/api/expense-categories').then(res => res.json()),
                fetch('/api/owners').then(res => res.json()),
                fetch('/api/agents').then(res => res.json()),
                fetch('/api/accounts-payable').then(res => res.json()),
                fetch('/api/personnel').then(res => res.json()),
                fetch('/api/driver-payments').then(res => res.json()),
                fetch('/api/payroll').then(res => res.json())
            ]);

            setVehicles(v);
            setClients(c);
            setRentals(r);
            setInvoices(i);
            setMaintenances(m);
            setCompanySettings(s);
            setUsers(u);
            setPayments(p);
            setRefunds(ref);
            setExpenses(exp);
            setExpenseCategories(expCat);
            setOwners(own);
            setCommercialAgents(agt);
            setAccountsPayable(Array.isArray(ap) ? ap : []);
            setPersonnel(per);
            setDriverPayments(dp);
            setPayrolls(pay);



        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Load logged user from session storage or similar (simplified)
        const storedUser = localStorage.getItem("currentUser");
        if (storedUser) {
            try {
                setCurrentUser(JSON.parse(storedUser));
            } catch (e) {
                console.error(e);
            }
        }
    }, []);

    // Helper generic fetch
    const apiCall = async (endpoint: string, method: string, body?: any) => {
        const res = await fetch(endpoint, {
            method,
            cache: 'no-store',
            headers: {
                'Content-Type': 'application/json',
                'x-user-role': currentUser?.role || ''
            },
            body: body ? JSON.stringify(body) : undefined
        });
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || `API Error ${method} ${endpoint}`);
        }
        return res.json();
    };

    // --- Entity Operations ---

    const addVehicle = async (vehicle: Omit<Vehicle, "id">) => {
        const res = await apiCall('/api/vehicles', 'POST', vehicle);
        setVehicles(prev => [...prev, res]);
    };
    const updateVehicle = async (id: string, updates: Partial<Vehicle>) => {
        const res = await apiCall('/api/vehicles', 'PUT', { id, ...updates });
        setVehicles(prev => prev.map(v => v.id === id ? res : v));
    };
    const deleteVehicle = async (id: string) => {
        await apiCall(`/api/vehicles?id=${id}`, 'DELETE');
        setVehicles(prev => prev.filter(v => v.id !== id));
    };

    const addClient = async (client: Omit<Client, "id">) => {
        const res = await apiCall('/api/clients', 'POST', client);
        setClients(prev => [...prev, res]);
    };
    const updateClient = async (id: string, updates: Partial<Client>) => {
        const res = await apiCall('/api/clients', 'PUT', { id, ...updates });
        setClients(prev => prev.map(c => c.id === id ? res : c));
    };
    const deleteClient = async (id: string) => {
        await apiCall(`/api/clients?id=${id}`, 'DELETE');
        setClients(prev => prev.filter(c => c.id !== id));
    };

    const addRental = async (rental: Omit<Rental, "id">) => {
        const res = await apiCall('/api/rentals', 'POST', rental);
        setRentals(prev => [...prev, res]);
        // Refetch vehicles to update status
        const v = await apiCall('/api/vehicles', 'GET');
        setVehicles(v);
        // Invoices and APs are created server side or need separate calls if logic moved to backend?
        // Logic in API was: create rental. Logic for Auto-Invoice and AP was NOT in API. 
        // I should probably keep the frontend "business logic" orchestration if API is simple CRUD.
        // OR move that logic to API.
        // Given complexity, I kept API simple CRUD. I need to call other APIs here.
        if (rental.vehicleId && res.id) {
            // Logic for Invoice creation
            const days = Math.ceil((new Date(rental.endDate).getTime() - new Date(rental.startDate).getTime()) / (86400000));
            const totalAmount = Math.max(1, days) * rental.dailyRate;

            await addInvoice({
                rentalId: res.id,
                clientId: rental.clientId,
                amount: Math.round(totalAmount * 1.15), // Apply 15% VAT (IVA)
                rentalDetails: { startDate: rental.startDate, endDate: rental.endDate, days }
            });

            // Logic for APs is now handled entirely in the backend (POST /api/rentals).
            // No need to do anything here.
        }
    };

    const updateRental = async (id: string, updates: Partial<Rental>) => {
        const res = await apiCall('/api/rentals', 'PUT', { id, ...updates });
        setRentals(prev => prev.map(r => r.id === id ? res : r));
    };

    const endRental = async (id: string, actualEndDate: string) => {
        try {
            setIsLoading(true); // Show loading state
            await apiCall('/api/rentals/finalize', 'POST', {
                rentalId: id,
                endDate: actualEndDate
            });
            // Refetch all data to update invoices, refunds, APs, and vehicle status
            await fetchData();
        } catch (error) {
            console.error("Error ending rental:", error);
            alert("Error al finalizar la renta. Verifique la consola.");
        } finally {
            setIsLoading(false);
        }
    };

    const addInvoice = async (invoice: Omit<Invoice, "id" | "invoiceNumber" | "status" | "paidAmount" | "payments" | "date"> & { date?: string }) => {
        const res = await apiCall('/api/invoices', 'POST', {
            ...invoice,
            invoiceNumber: "PENDING", // Valid placeholder, backend replaces it.
            date: invoice.date || new Date().toISOString(), // Use provided date or default
            status: "Pendiente",
            paidAmount: 0
        });
        setInvoices(prev => [...prev, res]);
    };
    const updateInvoice = async (id: string, updates: Partial<Invoice>) => {
        const res = await apiCall('/api/invoices', 'PUT', { id, ...updates });
        setInvoices(prev => prev.map(i => i.id === id ? res : i));
    };

    const addPayment = async (clientId: string, allocations: { invoiceId: string; amount: number }[], method: string): Promise<string> => {
        // This should transactionally handle multiple payments. My API handles ONE payment per ONE invoice.
        // I will loop.
        const receiptId = Date.now().toString();
        for (const alloc of allocations) {
            const data = {
                receiptId,
                clientId,
                invoiceId: alloc.invoiceId,
                amount: alloc.amount,
                date: new Date().toISOString(),
                method
            };
            await apiCall('/api/payments', 'POST', data);
        }
        // Refetch invoices and payments
        const i = await apiCall('/api/invoices', 'GET');
        const p = await apiCall('/api/payments', 'GET');
        const ap = await apiCall('/api/accounts-payable', 'GET');
        setInvoices(i);
        setPayments(p);
        setAccountsPayable(ap);

        return receiptId;
    };

    const addRefund = async (clientId: string, invoiceId: string, amount: number, reason: string) => {
        const res = await apiCall('/api/refunds', 'POST', {
            clientId, invoiceId, amount, reason, date: new Date().toISOString()
        });
        setRefunds(prev => [...prev, res]);
    };
    const updateRefund = async (id: string, updates: Partial<Refund>) => {
        const res = await apiCall('/api/refunds', 'PUT', { id, ...updates });
        setRefunds(prev => prev.map(r => r.id === id ? res : r));
    };

    const addMaintenance = async (maintenance: Omit<Maintenance, "id">) => {
        const res = await apiCall('/api/maintenance', 'POST', maintenance);
        setMaintenances(prev => [...prev, res]);
        // Update vehicle status locally
        setVehicles(prev => prev.map(v => v.id === maintenance.vehicleId ? { ...v, status: "Mantenimiento" } : v));
    };
    const updateMaintenance = async (id: string, updates: Partial<Maintenance>) => {
        const res = await apiCall('/api/maintenance', 'PUT', { id, ...updates });
        setMaintenances(prev => prev.map(m => m.id === id ? res : m));
        // If completed, check vehicle status (handled in API but need local update)
        if (updates.status === "Completado") {
            const m = maintenances.find(x => x.id === id);
            if (m) {
                setVehicles(prev => prev.map(v => v.id === m.vehicleId ? { ...v, status: "Disponible" } : v));
            }
        }
    };
    const deleteMaintenance = async (id: string) => {
        await apiCall(`/api/maintenance?id=${id}`, 'DELETE');
        setMaintenances(prev => prev.filter(m => m.id !== id));
    };

    const updateCompanySettings = async (settings: Partial<CompanySettings>) => {
        const res = await apiCall('/api/settings', 'PUT', settings);
        setCompanySettings(res);
    };

    const addUser = async (user: Omit<User, "id">) => {
        const res = await apiCall('/api/users', 'POST', user);
        setUsers(prev => [...prev, res]);
    };
    const updateUser = async (id: string, user: Partial<User>) => {
        const res = await apiCall('/api/users', 'PUT', { id, ...user });
        setUsers(prev => prev.map(u => u.id === id ? res : u));
    };
    const deleteUser = async (id: string) => {
        await apiCall(`/api/users?id=${id}`, 'DELETE');
        setUsers(prev => prev.filter(u => u.id !== id));
    };

    // Other simple CRUDs
    const addAccountPayable = (ap: Omit<AccountPayable, "id" | "date" | "status">) => { console.warn("Auto-generated mainly"); };
    const updateAccountPayable = async (id: string, updates: Partial<AccountPayable>) => {
        const res = await apiCall('/api/accounts-payable', 'PUT', { id, ...updates });
        setAccountsPayable(prev => prev.map(ap => ap.id === id ? res : ap));
    };

    const addCommercialAgent = async (agent: Omit<CommercialAgent, "id">) => {
        const res = await apiCall('/api/agents', 'POST', agent);
        setCommercialAgents(prev => [...prev, res]);
    };
    const updateCommercialAgent = async (id: string, updates: Partial<CommercialAgent>) => {
        const res = await apiCall('/api/agents', 'PUT', { id, ...updates });
        setCommercialAgents(prev => prev.map(a => a.id === id ? res : a));
    };
    const deleteCommercialAgent = async (id: string) => {
        await apiCall(`/api/agents?id=${id}`, 'DELETE');
        setCommercialAgents(prev => prev.filter(a => a.id !== id));
    };

    const addOwner = async (owner: Omit<Owner, "id">) => {
        const res = await apiCall('/api/owners', 'POST', owner);
        setOwners(prev => [...prev, res]);
    };
    const updateOwner = async (id: string, updates: Partial<Owner>) => {
        const res = await apiCall('/api/owners', 'PUT', { id, ...updates });
        setOwners(prev => prev.map(o => o.id === id ? res : o));
    };
    const deleteOwner = async (id: string) => {
        await apiCall(`/api/owners?id=${id}`, 'DELETE');
        setOwners(prev => prev.filter(o => o.id !== id));
    };

    const addExpense = async (expense: Omit<Expense, "id">) => {
        const res = await apiCall('/api/expenses', 'POST', expense);
        setExpenses(prev => [...prev, res]);
    };
    const updateExpense = async (id: string, updates: Partial<Expense>) => {
        const res = await apiCall('/api/expenses', 'PUT', { id, ...updates });
        setExpenses(prev => prev.map(e => e.id === id ? res : e));
    };
    const deleteExpense = async (id: string) => {
        await apiCall(`/api/expenses?id=${id}`, 'DELETE');
        setExpenses(prev => prev.filter(e => e.id !== id));
    };

    const addExpenseCategory = async (category: Omit<ExpenseCategory, "id">) => {
        const res = await apiCall('/api/expense-categories', 'POST', category);
        setExpenseCategories(prev => [...prev, res]);
    };
    const updateExpenseCategory = (id: string, updates: Partial<ExpenseCategory>) => { console.warn("Not implemented"); };
    const deleteExpenseCategory = async (id: string) => {
        await apiCall(`/api/expense-categories?id=${id}`, 'DELETE');
        setExpenseCategories(prev => prev.filter(c => c.id !== id));
    };

    const addPersonnel = async (person: Omit<Personnel, "id">) => {
        const res = await apiCall('/api/personnel', 'POST', person);
        setPersonnel(prev => [...prev, res]);
    };

    const updatePersonnel = async (id: string, updates: Partial<Personnel>) => {
        const res = await apiCall('/api/personnel', 'PUT', { id, ...updates });
        setPersonnel(prev => prev.map(p => p.id === id ? res : p));
    };

    const deletePersonnel = async (id: string) => {
        await apiCall(`/api/personnel?id=${id}`, 'DELETE');
        setPersonnel(prev => prev.filter(p => p.id !== id));
    };

    const addDriverPayment = async (payment: Omit<DriverPayment, "id">) => {
        const res = await apiCall('/api/driver-payments', 'POST', payment);
        setDriverPayments(prev => [res, ...prev]);
    };

    const addPayroll = async (payroll: Omit<Payroll, "id">) => {
        const res = await apiCall('/api/payroll', 'POST', payroll);
        setPayrolls(prev => [res, ...prev]);
    };


    // Auth Methods
    const login = (email: string) => {
        const user = users.find(u => u.email === email && u.status === "Active");
        if (user) {
            setCurrentUser(user);
            localStorage.setItem("currentUser", JSON.stringify(user));
            return true;
        }
        return false;
    };

    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem("currentUser");
    };

    const canEdit = (user: User | null) => {
        if (!user) return false;
        return user.role === "Admin" || user.role === "Registrar";
    };

    const canDelete = (user: User | null) => {
        if (!user) return false;
        return user.role === "Admin";
    };

    const canAccessSettings = (user: User | null) => {
        if (!user) return false;
        return user.role === "Admin";
    };

    return (
        <DataContext.Provider
            value={{
                vehicles,
                clients,
                rentals,
                invoices,
                maintenances,
                companySettings,
                users,
                payments,
                refunds,
                accountsPayable,
                commercialAgents,
                owners,
                expenses,
                expenseCategories,
                personnel,
                driverPayments,
                payrolls,
                addVehicle,
                updateVehicle,
                deleteVehicle,
                addClient,
                updateClient,
                deleteClient,
                addRental,
                updateRental,
                endRental,
                addInvoice,
                updateInvoice,
                addPayment,
                addRefund,
                updateRefund,
                addMaintenance,
                updateMaintenance,
                deleteMaintenance,
                updateCompanySettings,
                addUser,
                updateUser,
                deleteUser,
                addAccountPayable,
                updateAccountPayable,
                addCommercialAgent,
                updateCommercialAgent,
                deleteCommercialAgent,
                addOwner,
                updateOwner,
                deleteOwner,
                addExpense,
                updateExpense,
                deleteExpense,
                addExpenseCategory,
                updateExpenseCategory,
                deleteExpenseCategory,
                addPersonnel,
                updatePersonnel,
                deletePersonnel,
                addDriverPayment,
                addPayroll,
                currentUser,
                login,
                logout,
                canEdit,
                canDelete,
                canAccessSettings,
                isLoading,
            }}
        >
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error("useData must be used within a DataProvider");
    }
    return context;
}
