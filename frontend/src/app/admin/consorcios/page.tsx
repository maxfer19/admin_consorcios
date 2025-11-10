'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, MapPin, Users, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { buildingsApi } from '@/services/api';
import { Button } from '@/components/common/Button';
import toast from 'react-hot-toast';

interface Building {
  id: number;
  cuit: string;
  name: string;
  legal_name: string;
  address: string;
  city: string;
  province: string;
  postal_code?: string;
  total_units: number;
  building_type: string;
  is_active: boolean;
  admin_id: number;
  admin_name?: string;
  created_at: string;
}

const buildingTypeLabels: Record<string, string> = {
  apartment: 'Departamentos',
  house: 'Casas',
  office: 'Oficinas',
  mixed: 'Mixto',
};

export default function AdminConsorciosPage() {
  const router = useRouter();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);

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

    loadBuildings();
  }, [router]);

  const loadBuildings = async () => {
    try {
      const response = await buildingsApi.getAll();
      setBuildings(response.data);
    } catch (error) {
      console.error('Error loading buildings:', error);
      toast.error('Error al cargar consorcios');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Cargando consorcios...</p>
        </div>
      </div>
    );
  }

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
          <h2 className="text-3xl font-bold text-neutral-900 mb-2">Mis Consorcios</h2>
          <p className="text-neutral-600">
            Gestiona los consorcios asignados a tu administración
          </p>
        </div>

        {/* Buildings Grid */}
        {buildings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {buildings.map((building) => (
              <div
                key={building.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-neutral-900 mb-1">
                        {building.name}
                      </h3>
                      <p className="text-sm text-neutral-500">{building.legal_name}</p>
                    </div>
                    {building.is_active ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Activo
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <XCircle className="h-3 w-3 mr-1" />
                        Inactivo
                      </span>
                    )}
                  </div>

                  {/* Location */}
                  <div className="flex items-start text-neutral-600 mb-4">
                    <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">
                      {building.address}, {building.city}, {building.province}
                    </span>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-4 pt-4 border-t border-neutral-200">
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">Tipo</p>
                      <p className="text-sm font-medium text-neutral-900">
                        {buildingTypeLabels[building.building_type]}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">Unidades</p>
                      <p className="text-sm font-medium text-neutral-900">
                        {building.total_units}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    onClick={() => router.push(`/admin/consorcios/${building.id}`)}
                  >
                    Ver Detalles
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Building2 className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              No hay consorcios asignados
            </h3>
            <p className="text-neutral-600">
              Aún no tienes consorcios asignados a tu administración.
              <br />
              Contacta al SuperAdmin para que te asigne un consorcio.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
