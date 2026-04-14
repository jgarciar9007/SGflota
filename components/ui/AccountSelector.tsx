"use client";

import { BankAccount, PettyCash } from "@/context/DataContext";
import { Building2, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface AccountSelectorProps {
    bankAccounts: BankAccount[];
    pettyCashes: PettyCash[];
    type: "bank" | "cash" | "";
    accountId: string;
    onTypeChange: (type: "bank" | "cash") => void;
    onAccountChange: (id: string) => void;
    radioName?: string;
    label?: string;
}

export default function AccountSelector({
    bankAccounts,
    pettyCashes,
    type,
    accountId,
    onTypeChange,
    onAccountChange,
    radioName = "accountType",
    label = "Medio de Pago",
}: AccountSelectorProps) {
    const activeBanks = bankAccounts.filter(a => a.active);
    const activeCash = pettyCashes.filter(p => p.active);
    const hasAccounts = activeBanks.length > 0 || activeCash.length > 0;

    if (!hasAccounts) {
        return (
            <div className="border border-amber-200 bg-amber-50 rounded-lg p-3 text-sm text-amber-700">
                No hay cuentas configuradas. Ve a{" "}
                <a href="/settings" className="underline font-medium">Configuración &gt; Bancos</a>{" "}
                para agregar cuentas bancarias o cajas chicas.
            </div>
        );
    }

    return (
        <div className="border border-border rounded-lg p-4 bg-muted/30 space-y-3">
            <p className="text-sm font-semibold text-foreground">
                {label} <span className="text-red-500">*</span>
            </p>
            <div className="flex flex-wrap gap-2">
                {activeBanks.length > 0 && (
                    <label className={`flex items-center gap-2 cursor-pointer text-sm px-3 py-1.5 rounded border transition-colors ${type === "bank" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-border text-muted-foreground hover:border-blue-300"}`}>
                        <input
                            type="radio"
                            name={radioName}
                            value="bank"
                            checked={type === "bank"}
                            onChange={() => { onTypeChange("bank"); onAccountChange(""); }}
                            className="sr-only"
                        />
                        <Building2 className="h-3.5 w-3.5" />
                        Cuenta Bancaria
                    </label>
                )}
                {activeCash.length > 0 && (
                    <label className={`flex items-center gap-2 cursor-pointer text-sm px-3 py-1.5 rounded border transition-colors ${type === "cash" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-border text-muted-foreground hover:border-emerald-300"}`}>
                        <input
                            type="radio"
                            name={radioName}
                            value="cash"
                            checked={type === "cash"}
                            onChange={() => { onTypeChange("cash"); onAccountChange(""); }}
                            className="sr-only"
                        />
                        <Wallet className="h-3.5 w-3.5" />
                        Caja Chica
                    </label>
                )}
            </div>
            {type === "" && (
                <p className="text-xs text-red-500">Selecciona el medio de pago</p>
            )}
            {type === "bank" && (
                <select
                    value={accountId}
                    onChange={(e) => onAccountChange(e.target.value)}
                    className="w-full h-10 px-3 rounded-md bg-background border border-input text-foreground text-sm"
                    required
                >
                    <option value="">Seleccionar cuenta bancaria...</option>
                    {activeBanks.map(a => (
                        <option key={a.id} value={a.id}>
                            {a.bank?.name ? `${a.bank.name} — ` : ""}{a.name} (Saldo: {formatCurrency(a.currentBalance)})
                        </option>
                    ))}
                </select>
            )}
            {type === "cash" && (
                <select
                    value={accountId}
                    onChange={(e) => onAccountChange(e.target.value)}
                    className="w-full h-10 px-3 rounded-md bg-background border border-input text-foreground text-sm"
                    required
                >
                    <option value="">Seleccionar caja chica...</option>
                    {activeCash.map(p => (
                        <option key={p.id} value={p.id}>
                            {p.name} (Saldo: {formatCurrency(p.currentBalance)})
                        </option>
                    ))}
                </select>
            )}
        </div>
    );
}
