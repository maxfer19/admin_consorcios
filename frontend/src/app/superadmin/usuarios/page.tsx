'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Plus, Shield, Home, Wrench, Search, Filter } from 'lucide-react';
import { api } from '@/services/api';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import toast from 'react-hot-toast';
import bcrypt from 'bcryptjs';

interface User {
  id: number;
  dni?: string;
  cuit_cuil?: string;
  email: string;
  role: string;
  status: string;
  first_name: string;
  last_name: string;
  phone?: string;
  created_at: string;
}

const roleLabels: Record<string, { label: string; icon: any; color: string }> = {
  superadmin: { label: 'SuperAdmin', icon: Shield, color: 'text-purple-600 bg-purple-100' },
  admin: { label: 'Administrador', icon: Shield, color: 'text-blue-600 bg-blue-100' },
  owner: { label: 'Propietario', icon: Home, color: 'text-green-600 bg-green-100' },
  tenant: { label: 'Inquilino', icon: Home, color: 'text-yellow-600 bg-yellow-100' },
  provider: { label: 'Proveedor', icon: Wrench, color: 'text-orange-600 bg-orange-100' },
};

export default function UsuariosPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [formData, setFormData] = useState({
    dni: '',
    cuit_cuil: '',
    email: '',
    password: '',
    role: 'admin',
    first_name: '',
    last_name: '',
    phone: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const user = JSON.parse(userData);
    if (user.role !== 'superadmin') {
      router.push('/login');
      return;
    }

    loadUsers();
  }, [router]);

  useEffect(() => {
    let filtered = users;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.dni?.includes(searchTerm) ||
          user.cuit_cuil?.includes(searchTerm)
      );
    }

    // Filter by role
    if (filterRole !== 'all') {
      filtered = filtered.filter((user) => user.role === filterRole);
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter((user) => user.status === filterStatus);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, filterRole, filterStatus]);

  const loadUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Hash password
      const password_hash = await bcrypt.hash(formData.password, 10);

      const userData: any = {
        email: formData.email,
        password_hash,
        role: formData.role,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        status: 'active',
        email_verified: true,
      };

      // Add DNI or CUIT based on role
      if (formData.role === 'admin' || formData.role === 'owner' || formData.role === 'tenant') {
        userData.dni = formData.dni;
      } else if (formData.role === 'provider') {
        userData.cuit_cuil = formData.cuit_cuil;
      }

      await api.post('/users', userData);

      toast.success('Usuario creado exitosamente');
      setShowCreateModal(false);
      setFormData({
        dni: '',
        cuit_cuil: '',
        email: '',
        password: '',
        role: 'admin',
        first_name: '',
        last_name: '',
        phone: '',
      });
      loadUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Error al crear usuario');
    }
  };

  const handleStatusChange = async (userId: number, newStatus: string) => {
    try {
      await api.put(`/users/${userId}/status`, { status: newStatus });
      toast.success('Estado actualizado');
      loadUsers();
    } catch (error) {
      toast.error('Error al actualizar estado');
    }
  };

  const getRoleStats = () => {
    const stats = {
      total: users.length,
      superadmin: users.filter((u) => u.role === 'superadmin').length,
      admin: users.filter((u) => u.role === 'admin').length,
      owner: users.filter((u) => u.role === 'owner').length,
      tenant: users.filter((u) => u.role === 'tenant').length,
      provider: users.filter((u) => u.role === 'provider').length,
      active: users.filter((u) => u.status === 'active').length,
      pending: users.filter((u) => u.status === 'pending').length,
    };
    return stats;
  };

  const stats = getRoleStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push('/superadmin')}
                className="text-neutral-600 hover:text-neutral-900"
              >
                ← Volver
              </button>
              <Users className="h-8 w-8 text-primary-600" />
              <div>
                <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
                <p className="text-sm text-neutral-500">Administra todos los usuarios del sistema</p>
              </div>
            </div>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-5 w-5 mr-2" />
              Nuevo Usuario
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-neutral-600">Total</p>
            <p className="text-2xl font-bold text-neutral-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-neutral-600">Admins</p>
            <p className="text-2xl font-bold text-blue-600">{stats.admin}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-neutral-600">Propietarios</p>
            <p className="text-2xl font-bold text-green-600">{stats.owner}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-neutral-600">Inquilinos</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.tenant}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-neutral-600">Proveedores</p>
            <p className="text-2xl font-bold text-orange-600">{stats.provider}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-neutral-600">Pendientes</p>
            <p className="text-2xl font-bold text-red-600">{stats.pending}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, email, DNI..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">Todos los roles</option>
              <option value="admin">Administradores</option>
              <option value="owner">Propietarios</option>
              <option value="tenant">Inquilinos</option>
              <option value="provider">Proveedores</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="pending">Pendientes</option>
              <option value="inactive">Inactivos</option>
              <option value="blocked">Bloqueados</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-neutral-600">Cargando usuarios...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {filteredUsers.map((user) => {
                  const roleInfo = roleLabels[user.role];
                  const RoleIcon = roleInfo.icon;

                  return (
                    <tr key={user.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-neutral-900">
                            {user.first_name} {user.last_name}
                          </div>
                          <div className="text-sm text-neutral-500">
                            {user.dni || user.cuit_cuil || 'Sin documento'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-900">{user.email}</div>
                        <div className="text-sm text-neutral-500">{user.phone || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleInfo.color}`}
                        >
                          <RoleIcon className="h-3 w-3 mr-1" />
                          {roleInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : user.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {user.status === 'active'
                            ? 'Activo'
                            : user.status === 'pending'
                            ? 'Pendiente'
                            : user.status === 'inactive'
                            ? 'Inactivo'
                            : 'Bloqueado'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {user.status === 'pending' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleStatusChange(user.id, 'active')}
                              className="text-green-600 hover:text-green-900"
                            >
                              Aprobar
                            </button>
                            <button
                              onClick={() => handleStatusChange(user.id, 'blocked')}
                              className="text-red-600 hover:text-red-900"
                            >
                              Rechazar
                            </button>
                          </div>
                        )}
                        {user.status === 'active' && user.role !== 'superadmin' && (
                          <button
                            onClick={() => handleStatusChange(user.id, 'inactive')}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            Desactivar
                          </button>
                        )}
                        {user.status === 'inactive' && (
                          <button
                            onClick={() => handleStatusChange(user.id, 'active')}
                            className="text-green-600 hover:text-green-900"
                          >
                            Activar
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                <p className="text-neutral-500">No se encontraron usuarios</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Crear Nuevo Usuario"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1">Rol</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="admin">Administrador de Consorcio</option>
                <option value="owner">Propietario</option>
                <option value="tenant">Inquilino</option>
                <option value="provider">Proveedor</option>
              </select>
            </div>

            {(formData.role === 'admin' ||
              formData.role === 'owner' ||
              formData.role === 'tenant') && (
              <Input
                label="DNI"
                type="text"
                value={formData.dni}
                onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                placeholder="12345678"
                required
              />
            )}

            {formData.role === 'provider' && (
              <Input
                label="CUIT/CUIL"
                type="text"
                value={formData.cuit_cuil}
                onChange={(e) => setFormData({ ...formData, cuit_cuil: e.target.value })}
                placeholder="20-12345678-9"
                required
              />
            )}

            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="usuario@ejemplo.com"
              required
            />

            <Input
              label="Contraseña"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Mínimo 6 caracteres"
              required
            />

            <Input
              label="Nombre"
              type="text"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              placeholder="Juan"
              required
            />

            <Input
              label="Apellido"
              type="text"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              placeholder="Pérez"
              required
            />

            <Input
              label="Teléfono"
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+54 11 1234-5678"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancelar
            </Button>
            <Button type="submit">Crear Usuario</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
