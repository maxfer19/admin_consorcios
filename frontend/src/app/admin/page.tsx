'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Users, DollarSign, FileText, Home, UserPlus } from 'lucide-react';
import { buildingsApi } from '@/services/api';
import { Button } from '@/components/common/Button';
import toast from 'react-hot-toast';

interface User {
  id: number;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
}

interface Building {
  id: number;
  name: string;
  address: string;
  city: string;
  is_active: boolean;
}

interface Stats {
  buildings: number;
  totalUnits: number;
  occupiedUnits: number;
  owners: number;
  tenants: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    buildings: 0,
    totalUnits: 0,
    occupiedUnits: 0,
    owners: 0,
    tenants: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'admin') {
      router.push('/login');
      return;
    }

    setUser(parsedUser);
    loadStats();
  }, [router]);

  const loadStats = async () => {
    try {
      // Get buildings assigned to this admin
      const buildingsResponse = await buildingsApi.getAll();
      const buildings = buildingsResponse.data;

      let totalUnits = 0;
      let occupiedUnits = 0;
      const ownersSet = new Set();
      const tenantsSet = new Set();

      // Load units from each building
      for (const building of buildings) {
        try {
          const unitsResponse = await buildingsApi.getUnits(building.id);
          const units = unitsResponse.data;
          totalUnits += units.length;

          units.forEach((unit: any) => {
            if (unit.owner_id || unit.tenant_id) {
              occupiedUnits++;
            }
            if (unit.owner_id) {
              ownersSet.add(unit.owner_id);
            }
            if (unit.tenant_id) {
              tenantsSet.add(unit.tenant_id);
            }
          });
        } catch (error) {
          console.error(`Error loading units for building ${building.id}:`, error);
        }
      }

      setStats({
        buildings: buildings.length,
        totalUnits,
        occupiedUnits,
        owners: ownersSet.size,
        tenants: tenantsSet.size,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      toast.error('Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Cargando...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { name: 'Mis Consorcios', value: stats.buildings.toString(), icon: Building2, color: 'bg-blue-500', link: '/admin/consorcios' },
    { name: 'Total Unidades', value: stats.totalUnits.toString(), icon: Home, color: 'bg-green-500', link: '/admin/consorcios' },
    { name: 'Propietarios', value: stats.owners.toString(), icon: Users, color: 'bg-purple-500', link: '/admin/usuarios' },
    { name: 'Inquilinos', value: stats.tenants.toString(), icon: UserPlus, color: 'bg-orange-500', link: '/admin/usuarios' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Building2 className="h-8 w-8 text-primary-600" />
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">Komunidad</h1>
                <p className="text-sm text-neutral-500">Panel de Administrador</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-neutral-900">{user.first_name} {user.last_name}</p>
                <p className="text-xs text-neutral-500">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">¡Bienvenido, {user.first_name}!</h2>
          <p className="text-neutral-600">Gestiona tus consorcios, unidades y propietarios desde este panel de control.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => (
            <button
              key={stat.name}
              onClick={() => router.push(stat.link)}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600">{stat.name}</p>
                  <p className="text-3xl font-bold text-neutral-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Acciones Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="primary"
              onClick={() => router.push('/admin/consorcios')}
              className="w-full justify-center"
            >
              <Building2 className="h-5 w-5 mr-2" />
              Ver Mis Consorcios
            </Button>
            <Button
              variant="secondary"
              onClick={() => router.push('/admin/usuarios')}
              className="w-full justify-center"
            >
              <Users className="h-5 w-5 mr-2" />
              Gestionar Usuarios
            </Button>
          </div>
        </div>

        {/* Status Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Estado del Sistema</h3>
          <ul className="space-y-3">
            <li className="flex items-center text-neutral-700">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              <span className="font-medium">Gestión de Consorcios:</span>
              <span className="ml-2 text-green-600">Activo</span>
            </li>
            <li className="flex items-center text-neutral-700">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              <span className="font-medium">Gestión de Unidades y Propietarios:</span>
              <span className="ml-2 text-green-600">Activo</span>
            </li>
            <li className="flex items-center text-neutral-700">
              <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
              <span className="font-medium">Liquidación de Expensas:</span>
              <span className="ml-2 text-yellow-600">Próximamente</span>
            </li>
            <li className="flex items-center text-neutral-700">
              <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
              <span className="font-medium">Comunicados y Notificaciones:</span>
              <span className="ml-2 text-yellow-600">Próximamente</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
