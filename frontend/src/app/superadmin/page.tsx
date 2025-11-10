'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Users, DollarSign, MessageSquare, Settings } from 'lucide-react';

interface User {
  id: number;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
}

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

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
  }, [router]);

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

  const stats = [
    { name: 'Consorcios', value: '0', icon: Building2, color: 'bg-blue-500' },
    { name: 'Usuarios', value: '1', icon: Users, color: 'bg-green-500' },
    { name: 'Administradores', value: '0', icon: Users, color: 'bg-purple-500' },
    { name: 'Mensajes', value: '0', icon: MessageSquare, color: 'bg-orange-500' },
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
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">
            ¡Bienvenido, {user.first_name}! 👋
          </h2>
          <p className="text-neutral-600">
            Este es tu panel de control de SuperAdministrador. Desde aquí puedes gestionar todos los consorcios, usuarios y configuraciones del sistema.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">{stat.name}</p>
                  <p className="text-3xl font-bold text-neutral-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Acciones Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center space-x-3 p-4 border-2 border-neutral-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition">
              <Building2 className="h-6 w-6 text-primary-600" />
              <div className="text-left">
                <p className="font-medium text-neutral-900">Crear Consorcio</p>
                <p className="text-sm text-neutral-500">Agregar nuevo edificio</p>
              </div>
            </button>
            <button className="flex items-center space-x-3 p-4 border-2 border-neutral-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition">
              <Users className="h-6 w-6 text-primary-600" />
              <div className="text-left">
                <p className="font-medium text-neutral-900">Crear Administrador</p>
                <p className="text-sm text-neutral-500">Nuevo admin de consorcio</p>
              </div>
            </button>
            <button className="flex items-center space-x-3 p-4 border-2 border-neutral-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition">
              <Settings className="h-6 w-6 text-primary-600" />
              <div className="text-left">
                <p className="font-medium text-neutral-900">Configuración</p>
                <p className="text-sm text-neutral-500">Ajustes del sistema</p>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Actividad Reciente</h3>
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-500">No hay actividad reciente</p>
            <p className="text-sm text-neutral-400 mt-2">
              La actividad del sistema aparecerá aquí
            </p>
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
