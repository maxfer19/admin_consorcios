'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Home, DollarSign, FileText, MessageSquare } from 'lucide-react';

interface User {
  id: number;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
}

export default function OwnerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'owner') {
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

  if (!user) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;

  const stats = [
    { name: 'Mis Unidades', value: '0', icon: Home, color: 'bg-blue-500' },
    { name: 'Expensas del Mes', value: '$0', icon: DollarSign, color: 'bg-green-500' },
    { name: 'Comunicados', value: '0', icon: MessageSquare, color: 'bg-purple-500' },
    { name: 'Documentos', value: '0', icon: FileText, color: 'bg-orange-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Home className="h-8 w-8 text-primary-600" />
              <div>
                <h1 className="text-2xl font-bold">Komunidad</h1>
                <p className="text-sm text-neutral-500">Portal del Propietario</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium">{user.first_name} {user.last_name}</p>
                <p className="text-xs text-neutral-500">{user.email}</p>
              </div>
              <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-bold mb-2">¡Bienvenido, {user.first_name}! 🏠</h2>
          <p className="text-neutral-600">Gestiona tus propiedades y consulta información de tu consorcio.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600">{stat.name}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Funcionalidades próximamente</h3>
          <ul className="space-y-2 text-neutral-600">
            <li>✅ Login funcionando</li>
            <li>⏳ Ver mis expensas</li>
            <li>⏳ Descargar liquidaciones</li>
            <li>⏳ Comunicados del consorcio</li>
            <li>⏳ Reserva de amenities</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
