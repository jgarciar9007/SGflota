"use client";

import { useState } from "react";
import { useData, User } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Building2, Save, Upload, Loader2, Users, Plus, Pencil, Trash2, X } from "lucide-react";
import Image from "next/image";

export default function SettingsPage() {
    const { companySettings, updateCompanySettings, users, addUser, updateUser, deleteUser, currentUser, canEdit } = useData();
    const [activeTab, setActiveTab] = useState<"company" | "users">("company");

    // Company Settings State
    const [formData, setFormData] = useState(companySettings);
    const [saved, setSaved] = useState(false);
    const [uploading, setUploading] = useState(false);

    // User Management State
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [userForm, setUserForm] = useState<Omit<User, "id">>({
        name: "",
        email: "",
        role: "User",
        status: "Active"
    });

    // Company Handlers
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateCompanySettings(formData);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', 'logo');

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            setFormData(prev => ({ ...prev, logo: data.url }));
        } catch (error) {
            console.error('Upload error:', error);
            alert('Error al subir la imagen. Por favor intenta de nuevo.');
        } finally {
            setUploading(false);
        }
    };

    // User Handlers
    const handleOpenUserModal = (user?: User) => {
        if (user) {
            setEditingUser(user);
            setUserForm({
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status
            });
        } else {
            setEditingUser(null);
            setUserForm({
                name: "",
                email: "",
                role: "User",
                status: "Active"
            });
        }
        setIsUserModalOpen(true);
    };

    const handleSaveUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingUser) {
            updateUser(editingUser.id, userForm);
        } else {
            addUser(userForm);
        }
        setIsUserModalOpen(false);
    };

    const handleDeleteUser = (id: string) => {
        if (confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
            deleteUser(id);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-white">Configuración</h2>
                <p className="text-gray-300">Administra la configuración de la empresa y los usuarios</p>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-800/50 p-1 rounded-lg w-fit">
                <button
                    onClick={() => setActiveTab("company")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === "company"
                        ? "bg-blue-600 text-white"
                        : "text-gray-400 hover:text-white hover:bg-gray-700"
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Empresa
                    </div>
                </button>

                {currentUser?.role === "Admin" && (
                    <button
                        onClick={() => setActiveTab("users")}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === "users"
                            ? "bg-blue-600 text-white"
                            : "text-gray-400 hover:text-white hover:bg-gray-700"
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Usuarios
                        </div>
                    </button>
                )}
            </div>

            {activeTab === "company" ? (
                <>
                    <form onSubmit={handleSubmit}>
                        <Card className="border-gray-700 bg-gray-800/50">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-blue-400" />
                                    Información de la Empresa
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Logo Upload */}
                                <div>
                                    <label className="text-sm text-gray-300 font-medium">Logo de la Empresa</label>
                                    <div className="mt-2 flex items-center gap-4">
                                        {formData.logo && (
                                            <Image
                                                src={formData.logo}
                                                alt="Logo"
                                                width={80}
                                                height={80}
                                                className="h-20 w-20 object-contain bg-white rounded-lg p-2"
                                                unoptimized
                                            />
                                        )}
                                        <div className="flex-1 space-y-2">
                                            <div className="flex gap-2">
                                                <label className="flex-1">
                                                    <div className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md cursor-pointer transition-colors">
                                                        {uploading ? (
                                                            <>
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                                Subiendo...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Upload className="h-4 w-4" />
                                                                Subir desde PC
                                                            </>
                                                        )}
                                                    </div>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleFileUpload}
                                                        className="hidden"
                                                        disabled={uploading}
                                                    />
                                                </label>
                                            </div>
                                            <Input
                                                value={formData.logo}
                                                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                                                placeholder="O ingresa la URL del logo"
                                                className="bg-gray-800 border-gray-700 text-white"
                                            />
                                            <p className="text-xs text-gray-400">
                                                Sube una imagen desde tu PC o ingresa una URL. Se mostrará en las facturas.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Company Name */}
                                <div>
                                    <label className="text-sm text-gray-300 font-medium">Nombre de la Empresa</label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="bg-gray-800 border-gray-700 text-white mt-1"
                                        required
                                    />
                                </div>

                                {/* Tax ID */}
                                <div>
                                    <label className="text-sm text-gray-300 font-medium">NIF/CIF</label>
                                    <Input
                                        value={formData.taxId}
                                        onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                                        className="bg-gray-800 border-gray-700 text-white mt-1"
                                        placeholder="B12345678"
                                        required
                                    />
                                </div>

                                {/* Address */}
                                <div>
                                    <label className="text-sm text-gray-300 font-medium">Dirección</label>
                                    <Input
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="bg-gray-800 border-gray-700 text-white mt-1"
                                        required
                                    />
                                </div>

                                {/* Contact Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-gray-300 font-medium">Teléfono</label>
                                        <Input
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="bg-gray-800 border-gray-700 text-white mt-1"
                                            placeholder="+34 900 123 456"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-300 font-medium">Email</label>
                                        <Input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="bg-gray-800 border-gray-700 text-white mt-1"
                                            placeholder="info@empresa.com"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Website */}
                                <div>
                                    <label className="text-sm text-gray-300 font-medium">Sitio Web</label>
                                    <Input
                                        value={formData.website}
                                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                        className="bg-gray-800 border-gray-700 text-white mt-1"
                                        placeholder="www.empresa.com"
                                    />
                                </div>

                                {/* Save Button */}
                                <div className="flex items-center gap-3 pt-4 border-t border-gray-700">
                                    <Button
                                        type="submit"
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        <Save className="mr-2 h-4 w-4" />
                                        Guardar Cambios
                                    </Button>
                                    {saved && (
                                        <span className="text-sm text-green-400 flex items-center gap-2">
                                            ✓ Cambios guardados correctamente
                                        </span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </form>

                    {/* Preview */}
                    <Card className="border-gray-700 bg-gray-800/50">
                        <CardHeader>
                            <CardTitle className="text-white">Vista Previa</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-white p-6 rounded-lg">
                                {formData.logo && (
                                    <Image
                                        src={formData.logo}
                                        alt="Logo"
                                        width={64}
                                        height={64}
                                        className="h-16 mb-4 object-contain"
                                        unoptimized
                                    />
                                )}
                                <h3 className="text-xl font-bold text-gray-900">{formData.name}</h3>
                                <p className="text-sm text-gray-600 mt-2">NIF/CIF: {formData.taxId}</p>
                                <p className="text-sm text-gray-600">{formData.address}</p>
                                <p className="text-sm text-gray-600">{formData.phone} • {formData.email}</p>
                                {formData.website && (
                                    <p className="text-sm text-gray-600">{formData.website}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </>
            ) : (
                <Card className="border-gray-700 bg-gray-800/50">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-white flex items-center gap-2">
                            <Users className="h-5 w-5 text-blue-400" />
                            Gestión de Usuarios
                        </CardTitle>
                        <Button onClick={() => handleOpenUserModal()} className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Plus className="h-4 w-4 mr-2" />
                            Agregar Usuario
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-300">
                                <thead className="bg-gray-800 text-gray-100 uppercase font-medium">
                                    <tr>
                                        <th className="px-4 py-3 rounded-tl-lg">Nombre</th>
                                        <th className="px-4 py-3">Email</th>
                                        <th className="px-4 py-3">Rol</th>
                                        <th className="px-4 py-3">Estado</th>
                                        <th className="px-4 py-3 rounded-tr-lg text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-700/50 transition-colors">
                                            <td className="px-4 py-3 font-medium text-white">{user.name}</td>
                                            <td className="px-4 py-3">{user.email}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === "Admin" ? "bg-purple-900/50 text-purple-200" : "bg-blue-900/50 text-blue-200"
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.status === "Active" ? "bg-green-900/50 text-green-200" : "bg-red-900/50 text-red-200"
                                                    }`}>
                                                    {user.status === "Active" ? "Activo" : "Inactivo"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleOpenUserModal(user)}
                                                        className="p-1 hover:bg-gray-600 rounded-md text-blue-400 transition-colors"
                                                        title="Editar"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(user.id)}
                                                        className="p-1 hover:bg-gray-600 rounded-md text-red-400 transition-colors"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {users.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                                No hay usuarios registrados.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* User Modal */}
            {isUserModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl w-full max-w-md animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between p-4 border-b border-gray-700">
                            <h3 className="text-lg font-semibold text-white">
                                {editingUser ? "Editar Usuario" : "Nuevo Usuario"}
                            </h3>
                            <button
                                onClick={() => setIsUserModalOpen(false)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveUser} className="p-4 space-y-4">
                            <div>
                                <label className="text-sm text-gray-300 font-medium">Nombre</label>
                                <Input
                                    value={userForm.name}
                                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                                    className="bg-gray-700 border-gray-600 text-white mt-1"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-300 font-medium">Email</label>
                                <Input
                                    type="email"
                                    value={userForm.email}
                                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                                    className="bg-gray-700 border-gray-600 text-white mt-1"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-gray-300 font-medium">Rol</label>
                                    <select
                                        value={userForm.role}
                                        onChange={(e) => setUserForm({ ...userForm, role: e.target.value as "Admin" | "User" })}
                                        className="w-full bg-gray-700 border-gray-600 text-white rounded-md h-10 px-3 mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="Admin">Admin</option>
                                        <option value="User">User</option>
                                        <option value="Creator">Creator</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-300 font-medium">Estado</label>
                                    <select
                                        value={userForm.status}
                                        onChange={(e) => setUserForm({ ...userForm, status: e.target.value as "Active" | "Inactive" })}
                                        className="w-full bg-gray-700 border-gray-600 text-white rounded-md h-10 px-3 mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="Active">Activo</option>
                                        <option value="Inactive">Inactivo</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <Button
                                    type="button"
                                    onClick={() => setIsUserModalOpen(false)}
                                    className="bg-gray-700 hover:bg-gray-600 text-white"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    Guardar
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
