'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, ArrowLeft, Users, UserPlus, Mail, Phone, Home } from 'lucide-react';
import { api, buildingsApi } from '@/services/api';
import { Button } from '@/components/common/Button';
import toast from 'react-hot-toast';

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
  phone_secondary?: string;
  address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  created_at: string;
}

interface Unit {
  id: number;
  unit_number: string;
  building_id: number;
  building_name: string;
}

export default function AdminUsuariosPage() {
  const router = useRouter();
  const [owners, setOwners] = useState<User[]>([]);
  const [tenants, setTenants] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'owners' | 'tenants'>('owners');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userUnits, setUserUnits] = useState<Unit[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const user = JSON.parse(userData);
    if (user.role !== 'admin') {
      router.push('/login');
      return;
    }

    loadUsers();
  }, [router]);

  const loadUsers = async () => {
    try {
      const ownersResponse = await api.get('/users?role=owner');
      setOwners(ownersResponse.data);

      const tenantsResponse = await api.get('/users?role=tenant');
      setTenants(tenantsResponse.data);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const loadUserUnits = async (userId: number, userRole: 'owner' | 'tenant') => {
    setLoadingUnits(true);
    try {
      // Get all buildings for this admin
      const buildingsResponse = await buildingsApi.getAll();
      const buildings = buildingsResponse.data;

      const units: Unit[] = [];

      // For each building, get units and filter by user
      for (const building of buildings) {
        try {
          const unitsResponse = await buildingsApi.getUnits(building.id);
          const buildingUnits = unitsResponse.data;

          const userUnitsInBuilding = buildingUnits.filter((unit: any) => {
            if (userRole === 'owner') {
              return unit.owner_id === userId;
            } else {
              return unit.tenant_id === userId;
            }
          });

          userUnitsInBuilding.forEach((unit: any) => {
            units.push({
              id: unit.id,
              unit_number: unit.unit_number,
              building_id: building.id,
              building_name: building.name,
            });
          });
        } catch (error) {
          console.error(`Error loading units for building ${building.id}:`, error);
        }
      }

      setUserUnits(units);
    } catch (error) {
      console.error('Error loading user units:', error);
      toast.error('Error al cargar unidades del usuario');
    } finally {
      setLoadingUnits(false);
    }
  };

  const handleViewUser = async (user: User) => {
    setSelectedUser(user);
    const userRole = user.role === 'owner' ? 'owner' : 'tenant';
    await loadUserUnits(user.id, userRole);
  };

  const handleCloseUserDetails = () => {
    setSelectedUser(null);
    setUserUnits([]);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      blocked: 'bg-red-100 text-red-800',
    };

    const labels = {
      active: 'Activo',
      inactive: 'Inactivo',
      pending: 'Pendiente',
      blocked: 'Bloqueado',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  const currentUsers = activeTab === 'owners' ? owners : tenants;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Building2 className="h-8 w-8 text-primary-600" />
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">Komunidad</h1>
                <p className="text-sm text-neutral-500">Panel de Administrador</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="secondary"
          onClick={() => router.push('/admin')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al Dashboard
        </Button>

        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-neutral-900 mb-2">Gestión de Usuarios</h2>
          <p className="text-neutral-600">
            Administra propietarios e inquilinos de tus consorcios
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-neutral-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('owners')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'owners'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Propietarios ({owners.length})
                </div>
              </button>
              <button
                onClick={() => setActiveTab('tenants')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'tenants'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center">
                  <UserPlus className="h-5 w-5 mr-2" />
                  Inquilinos ({tenants.length})
                </div>
              </button>
            </nav>
          </div>

          {/* User List */}
          <div className="p-6">
            {currentUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">Nombre</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">DNI</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">Teléfono</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">Estado</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-neutral-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {currentUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-neutral-50">
                        <td className="px-4 py-3 text-sm text-neutral-900">
                          {user.first_name} {user.last_name}
                        </td>
                        <td className="px-4 py-3 text-sm text-neutral-600">{user.email}</td>
                        <td className="px-4 py-3 text-sm text-neutral-600">{user.dni || '-'}</td>
                        <td className="px-4 py-3 text-sm text-neutral-600">{user.phone || '-'}</td>
                        <td className="px-4 py-3 text-sm">{getStatusBadge(user.status)}</td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center justify-center">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleViewUser(user)}
                            >
                              Ver Detalles
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                {activeTab === 'owners' ? (
                  <>
                    <Users className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                    <p className="text-neutral-600 mb-2">No hay propietarios registrados</p>
                    <p className="text-sm text-neutral-500">
                      Los propietarios se crean desde la sección de SuperAdmin
                    </p>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                    <p className="text-neutral-600 mb-2">No hay inquilinos registrados</p>
                    <p className="text-sm text-neutral-500">
                      Los inquilinos se crean desde la sección de SuperAdmin
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* User Details Panel */}
        {selectedUser && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-neutral-900">Detalles del Usuario</h3>
              <Button variant="secondary" size="sm" onClick={handleCloseUserDetails}>
                Cerrar
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Personal Info */}
              <div>
                <h4 className="text-sm font-semibold text-neutral-900 mb-3">Información Personal</h4>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-xs text-neutral-500">Nombre Completo</dt>
                    <dd className="text-sm text-neutral-900">{selectedUser.first_name} {selectedUser.last_name}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-neutral-500">DNI</dt>
                    <dd className="text-sm text-neutral-900">{selectedUser.dni || '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-neutral-500">CUIT/CUIL</dt>
                    <dd className="text-sm text-neutral-900">{selectedUser.cuit_cuil || '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-neutral-500">Estado</dt>
                    <dd className="text-sm">{getStatusBadge(selectedUser.status)}</dd>
                  </div>
                </dl>
              </div>

              {/* Contact Info */}
              <div>
                <h4 className="text-sm font-semibold text-neutral-900 mb-3">Información de Contacto</h4>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-xs text-neutral-500">Email</dt>
                    <dd className="text-sm text-neutral-900 flex items-center">
                      <Mail className="h-4 w-4 mr-1 text-neutral-400" />
                      {selectedUser.email}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-neutral-500">Teléfono Principal</dt>
                    <dd className="text-sm text-neutral-900 flex items-center">
                      <Phone className="h-4 w-4 mr-1 text-neutral-400" />
                      {selectedUser.phone || '-'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-neutral-500">Teléfono Secundario</dt>
                    <dd className="text-sm text-neutral-900">{selectedUser.phone_secondary || '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-neutral-500">Dirección</dt>
                    <dd className="text-sm text-neutral-900">
                      {selectedUser.address ? (
                        <>
                          {selectedUser.address}
                          {selectedUser.city && `, ${selectedUser.city}`}
                          {selectedUser.province && `, ${selectedUser.province}`}
                          {selectedUser.postal_code && ` (${selectedUser.postal_code})`}
                        </>
                      ) : (
                        '-'
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Units Section */}
            <div className="border-t border-neutral-200 pt-6">
              <h4 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center">
                <Home className="h-5 w-5 mr-2 text-primary-600" />
                Unidades Asignadas
              </h4>
              {loadingUnits ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-neutral-600">Cargando unidades...</p>
                </div>
              ) : userUnits.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userUnits.map((unit) => (
                    <div key={unit.id} className="border border-neutral-200 rounded-lg p-4">
                      <p className="text-sm font-medium text-neutral-900 mb-1">
                        Unidad {unit.unit_number}
                      </p>
                      <p className="text-xs text-neutral-600">{unit.building_name}</p>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="mt-2 w-full"
                        onClick={() => router.push(`/admin/consorcios/${unit.building_id}`)}
                      >
                        Ver Consorcio
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-neutral-600 text-center py-4">
                  Este usuario no tiene unidades asignadas
                </p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
