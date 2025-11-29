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
    endDate: string | null;
    dailyRate: number;
    status: "Activo" | "Finalizado";
    totalAmount?: number;
}

export interface Invoice {
    id: string;
    rentalId: string;
    clientId: string;
    amount: number;
    paidAmount: number;
    date: string;
    status: "Pagado" | "Pendiente" | "Parcial";
    payments: Payment[];
}

export interface Payment {
    id: string;
    receiptId: string; // Grouping ID for multi-invoice payments
    clientId: string;
    invoiceId: string;
    amount: number;
    date: string;
    method: string;
}

export interface Maintenance {
    id: string;
    vehicleId: string;
    description: string;
    date: string;
    cost: number;
    status: "Programado" | "En Proceso" | "Completado";
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
    role: "Admin" | "User" | "Creator";
    status: "Active" | "Inactive";
    avatar?: string;
}

interface DataContextType {
    vehicles: Vehicle[];
    clients: Client[];
    rentals: Rental[];
    invoices: Invoice[];
    maintenances: Maintenance[];
    companySettings: CompanySettings;
    users: User[];
    payments: Payment[]; // Global payments list
    addVehicle: (vehicle: Omit<Vehicle, "id">) => void;
    updateVehicle: (id: string, vehicle: Partial<Vehicle>) => void;
    deleteVehicle: (id: string) => void;
    addClient: (client: Omit<Client, "id">) => void;
    updateClient: (id: string, client: Partial<Client>) => void;
    deleteClient: (id: string) => void;
    addRental: (rental: Omit<Rental, "id">) => void;
    endRental: (id: string, endDate: string) => void;
    addInvoice: (invoice: Omit<Invoice, "id" | "payments" | "paidAmount">) => void;
    updateInvoice: (id: string, invoice: Partial<Invoice>) => void;
    addPayment: (clientId: string, allocations: { invoiceId: string; amount: number }[], method: string) => string; // Returns receiptId
    addMaintenance: (maintenance: Omit<Maintenance, "id">) => void;
    updateMaintenance: (id: string, maintenance: Partial<Maintenance>) => void;
    updateCompanySettings: (settings: Partial<CompanySettings>) => void;
    addUser: (user: Omit<User, "id">) => void;
    updateUser: (id: string, user: Partial<User>) => void;
    deleteUser: (id: string) => void;
    currentUser: User | null;
    login: (email: string) => boolean;
    logout: () => void;
    canEdit: (user: User | null) => boolean;
    canDelete: (user: User | null) => boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEY = "sgflota_data";

const initialVehicles: Vehicle[] = [
    {
        id: "1",
        name: "Tesla Model 3",
        type: "Eléctrico",
        range: "500 km",
        price: 120,
        image: "https://images.unsplash.com/photo-1536700503339-1e4b06520771?q=80&w=2693&auto=format&fit=crop",
        status: "Disponible",
        plate: "ABC-123",
        year: 2023,
    },
    {
        id: "2",
        name: "BMW M4 Competition",
        type: "Gasolina",
        range: "600 km",
        price: 250,
        image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=2670&auto=format&fit=crop",
        status: "Disponible",
        plate: "XYZ-789",
        year: 2024,
    },
    {
        id: "3",
        name: "Mercedes AMG GT",
        type: "Gasolina",
        range: "450 km",
        price: 300,
        image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=2670&auto=format&fit=crop",
        status: "Disponible",
        plate: "DEF-456",
        year: 2023,
    },
];

const initialClients: Client[] = [
    {
        id: "1",
        name: "Juan Pérez",
        email: "juan@example.com",
        phone: "+34 600 123 456",
        address: "Calle Mayor 1, Madrid",
        dni: "12345678A",
    },
];

const initialCompanySettings: CompanySettings = {
    name: "SGFlota - Sistema de Gestión de Flota",
    logo: "",
    address: "Calle Principal 123, Madrid, España",
    phone: "+34 900 123 456",
    email: "info@sgflota.com",
    taxId: "B12345678",
    website: "www.sgflota.com",
};

const initialUsers: User[] = [
    {
        id: "1",
        name: "Admin User",
        email: "admin@sgflota.com",
        role: "Admin",
        status: "Active",
    }
];

export function DataProvider({ children }: { children: ReactNode }) {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [rentals, setRentals] = useState<Rental[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
    const [companySettings, setCompanySettings] = useState<CompanySettings>(initialCompanySettings);
    const [users, setUsers] = useState<User[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    // Load data from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const data = JSON.parse(stored);
            setVehicles(data.vehicles || initialVehicles);
            setClients(data.clients || initialClients);
            setRentals(data.rentals || []);
            setInvoices(data.invoices || []);
            setMaintenances(data.maintenances || []);
            setCompanySettings(data.companySettings || initialCompanySettings);
            setUsers(data.users || initialUsers);
            setPayments(data.payments || []);
        } else {
            setVehicles(initialVehicles);
            setClients(initialClients);
            setCompanySettings(initialCompanySettings);
            setUsers(initialUsers);
        }

        // Load current user
        const storedUser = localStorage.getItem("currentUser");
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        }
    }, []);

    // Save data to localStorage whenever it changes
    useEffect(() => {
        if (vehicles.length > 0 || clients.length > 0) {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({ vehicles, clients, rentals, invoices, maintenances, companySettings, users, payments })
            );
        }
    }, [vehicles, clients, rentals, invoices, maintenances, companySettings, users, payments]);

    // Vehicle operations
    const addVehicle = (vehicle: Omit<Vehicle, "id">) => {
        const newVehicle = { ...vehicle, id: Date.now().toString() };
        setVehicles((prev) => [...prev, newVehicle]);
    };

    const updateVehicle = (id: string, vehicle: Partial<Vehicle>) => {
        setVehicles((prev) => prev.map((v) => (v.id === id ? { ...v, ...vehicle } : v)));
    };

    const deleteVehicle = (id: string) => {
        setVehicles((prev) => prev.filter((v) => v.id !== id));
    };

    // Client operations
    const addClient = (client: Omit<Client, "id">) => {
        const newClient = { ...client, id: Date.now().toString() };
        setClients((prev) => [...prev, newClient]);
    };

    const updateClient = (id: string, client: Partial<Client>) => {
        setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...client } : c)));
    };

    const deleteClient = (id: string) => {
        setClients((prev) => prev.filter((c) => c.id !== id));
    };

    // Rental operations
    const addRental = (rental: Omit<Rental, "id">) => {
        const newRental = { ...rental, id: Date.now().toString() };
        setRentals((prev) => [...prev, newRental]);
        // Update vehicle status
        updateVehicle(rental.vehicleId, { status: "Rentado" });
    };

    const endRental = (id: string, endDate: string) => {
        const rental = rentals.find((r) => r.id === id);
        if (rental) {
            const days = Math.ceil(
                (new Date(endDate).getTime() - new Date(rental.startDate).getTime()) / (1000 * 60 * 60 * 24)
            );
            const totalAmount = days * rental.dailyRate;

            setRentals((prev) =>
                prev.map((r) => (r.id === id ? { ...r, endDate, status: "Finalizado", totalAmount } : r))
            );

            // Update vehicle status
            updateVehicle(rental.vehicleId, { status: "Disponible" });

            // Create invoice
            addInvoice({
                rentalId: id,
                clientId: rental.clientId,
                amount: totalAmount,
                date: endDate,
                status: "Pendiente",
            });
        }
    };

    // Invoice operations
    const addInvoice = (invoice: Omit<Invoice, "id" | "payments" | "paidAmount">) => {
        const newInvoice = {
            ...invoice,
            id: Date.now().toString(),
            payments: [],
            paidAmount: 0
        };
        setInvoices((prev) => [...prev, newInvoice]);
    };

    const updateInvoice = (id: string, invoice: Partial<Invoice>) => {
        setInvoices((prev) => prev.map((i) => (i.id === id ? { ...i, ...invoice } : i)));
    };

    const addPayment = (clientId: string, allocations: { invoiceId: string; amount: number }[], method: string) => {
        const receiptId = Date.now().toString();
        const date = new Date().toISOString().split("T")[0];
        const newPayments: Payment[] = [];

        // Process each allocation
        allocations.forEach((allocation) => {
            const invoice = invoices.find((i) => i.id === allocation.invoiceId);
            if (!invoice) return;

            const payment: Payment = {
                id: Math.random().toString(36).substr(2, 9),
                receiptId,
                clientId,
                invoiceId: allocation.invoiceId,
                amount: allocation.amount,
                date,
                method,
            };

            newPayments.push(payment);

            // Update invoice
            const currentPayments = invoice.payments || [];
            const currentPaidAmount = invoice.paidAmount || 0;
            const newPaidAmount = currentPaidAmount + allocation.amount;
            const newStatus: "Pagado" | "Pendiente" | "Parcial" =
                newPaidAmount >= invoice.amount ? "Pagado" :
                    newPaidAmount > 0 ? "Parcial" : "Pendiente";

            updateInvoice(allocation.invoiceId, {
                payments: [...currentPayments, payment],
                paidAmount: newPaidAmount,
                status: newStatus,
            });
        });

        // Update global payments state
        setPayments((prev) => [...prev, ...newPayments]);

        return receiptId;
    };

    // Maintenance operations
    const addMaintenance = (maintenance: Omit<Maintenance, "id">) => {
        const newMaintenance = { ...maintenance, id: Date.now().toString() };
        setMaintenances((prev) => [...prev, newMaintenance]);
        // Update vehicle status
        updateVehicle(maintenance.vehicleId, { status: "Mantenimiento" });
    };

    const updateMaintenance = (id: string, maintenance: Partial<Maintenance>) => {
        setMaintenances((prev) => prev.map((m) => (m.id === id ? { ...m, ...maintenance } : m)));
        // If completed, update vehicle status
        if (maintenance.status === "Completado") {
            const maintenanceRecord = maintenances.find((m) => m.id === id);
            if (maintenanceRecord) {
                updateVehicle(maintenanceRecord.vehicleId, { status: "Disponible" });
            }
        }
    };

    // Company settings operations
    const updateCompanySettings = (settings: Partial<CompanySettings>) => {
        setCompanySettings((prev) => ({ ...prev, ...settings }));
    };

    // User operations
    const addUser = (user: Omit<User, "id">) => {
        const newUser = { ...user, id: Date.now().toString() };
        setUsers((prev) => [...prev, newUser]);
    };

    const updateUser = (id: string, user: Partial<User>) => {
        setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...user } : u)));
    };

    const deleteUser = (id: string) => {
        setUsers((prev) => prev.filter((u) => u.id !== id));
    };

    // Auth operations
    const login = (email: string) => {
        const user = users.find(u => u.email === email);
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
        return user.role !== "Creator";
    };

    const canDelete = (user: User | null) => {
        if (!user) return false;
        return user.role !== "Creator";
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
                addVehicle,
                updateVehicle,
                deleteVehicle,
                addClient,
                updateClient,
                deleteClient,
                addRental,
                endRental,
                addInvoice,
                updateInvoice,
                addPayment,
                addMaintenance,
                updateMaintenance,
                updateCompanySettings,
                users,
                payments,
                addUser,
                updateUser,
                deleteUser,
                currentUser,
                login,
                logout,
                canEdit,
                canDelete,
            }}
        >
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error("useData must be used within a DataProvider");
    }
    return context;
}
