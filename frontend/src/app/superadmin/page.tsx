'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building2, Users, DollarSign, MessageSquare, Settings, Plus, TrendingUp, AlertCircle } from 'lucide-react';
import { api, buildingsApi } from '@/services/api';

interface User {
  id: number;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
}

interface Stats {
  buildings: number;
  users: number;
  admins: number;
  owners: number;
  tenants: number;
  providers: number;
  pendingApprovals: number;
}

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats>({
    buildings: 0,
    users: 0,
    admins: 0,
    owners: 0,
    tenants: 0,
    providers: 0,
    pendingApprovals: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar autenticación
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);

    if (parsedUser.role !== 'superadmin') {
      router.push('/login');
      return;
    }

    setUser(parsedUser);
    loadStats();
  }, [router]);

  const loadStats = async () => {
    try {
      // Load buildings
      const buildingsResponse = await buildingsApi.getAll();
      const buildings = buildingsResponse.data;

      // Load users
      const usersResponse = await api.get('/users');
      const users = usersResponse.data;

      const admins = users.filter((u: any) => u.role === 'admin').length;
      const owners = users.filter((u: any) => u.role === 'owner').length;
      const tenants = users.filter((u: any) => u.role === 'tenant').length;
      const providers = users.filter((u: any) => u.role === 'provider').length;
      const pending = users.filter((u: any) => u.status === 'pending').length;

      setStats({
        buildings: buildings.length,
        users: users.length,
        admins,
        owners,
        tenants,
        providers,
        pendingApprovals: pending,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Cargando...</p>
        </div>
      </div>
    );
  }

  const quickActions = [
    {
      title: 'Crear Consorcio',
      description: 'Agregar nuevo edificio al sistema',
      icon: Building2,
      href: '/superadmin/consorcios',
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      title: 'Crear Usuario',
      description: 'Agregar administrador o usuario',
      icon: Users,
      href: '/superadmin/usuarios',
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      title: 'Configuración',
      description: 'Ajustes del sistema',
      icon: Settings,
      href: '/superadmin/configuracion',
      color: 'bg-purple-500 hover:bg-purple-600',
    },
  ];

  const mainStats = [
    { name: 'Consorcios', value: stats.buildings, icon: Building2, color: 'bg-blue-500', href: '/superadmin/consorcios' },
    { name: 'Total Usuarios', value: stats.users, icon: Users, color: 'bg-green-500', href: '/superadmin/usuarios' },
    { name: 'Administradores', value: stats.admins, icon: Users, color: 'bg-purple-500', href: '/superadmin/usuarios?role=admin' },
    { name: 'Pendientes', value: stats.pendingApprovals, icon: AlertCircle, color: 'bg-orange-500', href: '/superadmin/usuarios?status=pending' },
  ];

  const detailedStats = [
    { label: 'Propietarios', value: stats.owners, change: '+0%', trend: 'up' },
    { label: 'Inquilinos', value: stats.tenants, change: '+0%', trend: 'up' },
    { label: 'Proveedores', value: stats.providers, change: '+0%', trend: 'up' },
    { label: 'Expensas Activas', value: 0, change: '0%', trend: 'neutral' },
  ];

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
                <p className="text-sm text-neutral-500">Panel de SuperAdmin</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-neutral-900">
                  {user.first_name} {user.last_name}
                </p>
                <p className="text-xs text-neutral-500">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Message */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-sm p-6 mb-8 text-white">
          <h2 className="text-2xl font-bold mb-2">
            ¡Bienvenido, {user.first_name}! 👋
          </h2>
          <p className="text-primary-100">
            Este es tu panel de control de SuperAdministrador. Gestiona todos los consorcios, usuarios y configuraciones del sistema.
          </p>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {mainStats.map((stat) => (
            <Link
              key={stat.name}
              href={stat.href}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">{stat.name}</p>
                  <p className="text-3xl font-bold text-neutral-900 mt-2">
                    {loading ? '...' : stat.value}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Acciones Rápidas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                href={action.href}
                className={`${action.color} text-white p-6 rounded-lg transition shadow-sm hover:shadow-md`}
              >
                <action.icon className="h-8 w-8 mb-3" />
                <h4 className="font-semibold text-lg mb-1">{action.title}</h4>
                <p className="text-sm opacity-90">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Detailed Stats */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Estadísticas Detalladas
            </h3>
            <div className="space-y-4">
              {detailedStats.map((stat) => (
                <div key={stat.label} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-neutral-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-neutral-900 mt-1">
                      {loading ? '...' : stat.value}
                    </p>
                  </div>
                  <div className={`text-sm font-medium ${
                    stat.trend === 'up' ? 'text-green-600' :
                    stat.trend === 'down' ? 'text-red-600' :
                    'text-neutral-600'
                  }`}>
                    {stat.change}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Actividad Reciente
            </h3>
            {stats.pendingApprovals > 0 ? (
              <div className="space-y-3">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-yellow-900">
                        {stats.pendingApprovals} usuario(s) pendiente(s) de aprobación
                      </p>
                      <p className="text-sm text-yellow-700 mt-1">
                        Revisa y aprueba las nuevas solicitudes
                      </p>
                      <Link
                        href="/superadmin/usuarios?status=pending"
                        className="text-sm text-yellow-800 font-medium hover:text-yellow-900 mt-2 inline-block"
                      >
                        Ver pendientes →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                <p className="text-neutral-500">No hay actividad reciente</p>
                <p className="text-sm text-neutral-400 mt-2">
                  La actividad del sistema aparecerá aquí
                </p>
              </div>
            )}
          </div>
        </div>

        {/* System Status */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Estado del Sistema</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-900">Base de Datos</span>
                <span className="h-2 w-2 bg-green-500 rounded-full"></span>
              </div>
              <p className="text-xs text-green-700 mt-1">Operativa</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-900">API Backend</span>
                <span className="h-2 w-2 bg-green-500 rounded-full"></span>
              </div>
              <p className="text-xs text-green-700 mt-1">Operativa</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-900">Almacenamiento</span>
                <span className="h-2 w-2 bg-green-500 rounded-full"></span>
              </div>
              <p className="text-xs text-green-700 mt-1">85% Disponible</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-neutral-500">
            &copy; 2024 Komunidad. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
