'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Building2, ArrowLeft, MapPin, Users, Edit, CheckCircle, XCircle } from 'lucide-react';
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
  floors?: number;
  year_built?: number;
  is_active: boolean;
  admin_name?: string;
  admin_email?: string;
  admin_phone?: string;
  created_at: string;
}

interface Unit {
  id: number;
  unit_number: string;
  floor: number;
  unit_type: string;
  area_sqm?: number;
  owner_name?: string;
  tenant_name?: string;
}

const buildingTypeLabels: Record<string, string> = {
  apartment: 'Departamentos',
  house: 'Casas',
  office: 'Oficinas',
  mixed: 'Mixto',
};

export default function ConsorcioDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [building, setBuilding] = useState<Building | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);

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

    loadBuildingDetails();
  }, [params.id, router]);

  const loadBuildingDetails = async () => {
    try {
      const buildingId = parseInt(params.id as string);
      const buildingResponse = await buildingsApi.getById(buildingId);
      setBuilding(buildingResponse.data);

      const unitsResponse = await buildingsApi.getUnits(buildingId);
      setUnits(unitsResponse.data);
    } catch (error) {
      console.error('Error loading building details:', error);
      toast.error('Error al cargar detalles del consorcio');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (loading || !building) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Cargando detalles...</p>
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
                <p className="text-sm text-neutral-500">Panel de SuperAdmin</p>
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
          onClick={() => router.push('/superadmin/consorcios')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Consorcios
        </Button>

        {/* Building Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-3xl font-bold text-neutral-900">{building.name}</h2>
                {building.is_active ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Activo
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    <XCircle className="h-4 w-4 mr-1" />
                    Inactivo
                  </span>
                )}
              </div>
              <p className="text-lg text-neutral-600 mb-4">{building.legal_name}</p>
              <div className="flex items-center text-neutral-600">
                <MapPin className="h-5 w-5 mr-2" />
                <span>
                  {building.address}, {building.city}, {building.province}
                  {building.postal_code && ` (CP: ${building.postal_code})`}
                </span>
              </div>
            </div>
            <Button variant="primary" onClick={() => toast.info('Edición en desarrollo')}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Basic Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Información Básica</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-neutral-500">CUIT</dt>
                <dd className="text-base text-neutral-900">{building.cuit}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-neutral-500">Tipo de Edificio</dt>
                <dd className="text-base text-neutral-900">{buildingTypeLabels[building.building_type]}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-neutral-500">Total de Unidades</dt>
                <dd className="text-base text-neutral-900">{building.total_units}</dd>
              </div>
              {building.floors && (
                <div>
                  <dt className="text-sm font-medium text-neutral-500">Pisos</dt>
                  <dd className="text-base text-neutral-900">{building.floors}</dd>
                </div>
              )}
              {building.year_built && (
                <div>
                  <dt className="text-sm font-medium text-neutral-500">Año de Construcción</dt>
                  <dd className="text-base text-neutral-900">{building.year_built}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Administrator Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Administrador</h3>
            {building.admin_name ? (
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-neutral-500">Nombre</dt>
                  <dd className="text-base text-neutral-900">{building.admin_name}</dd>
                </div>
                {building.admin_email && (
                  <div>
                    <dt className="text-sm font-medium text-neutral-500">Email</dt>
                    <dd className="text-base text-neutral-900">{building.admin_email}</dd>
                  </div>
                )}
                {building.admin_phone && (
                  <div>
                    <dt className="text-sm font-medium text-neutral-500">Teléfono</dt>
                    <dd className="text-base text-neutral-900">{building.admin_phone}</dd>
                  </div>
                )}
              </dl>
            ) : (
              <p className="text-neutral-500">Sin administrador asignado</p>
            )}
          </div>

          {/* Statistics */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Estadísticas</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-neutral-500">Unidades Registradas</dt>
                <dd className="text-base text-neutral-900">{units.length} / {building.total_units}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-neutral-500">Unidades Ocupadas</dt>
                <dd className="text-base text-neutral-900">
                  {units.filter((u) => u.owner_name || u.tenant_name).length}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-neutral-500">Fecha de Registro</dt>
                <dd className="text-base text-neutral-900">
                  {new Date(building.created_at).toLocaleDateString('es-AR')}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Units List */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Users className="h-6 w-6 text-primary-600 mr-2" />
              <h3 className="text-lg font-semibold text-neutral-900">Unidades</h3>
            </div>
            <Button variant="primary" onClick={() => toast.info('Agregar unidad en desarrollo')}>
              Agregar Unidad
            </Button>
          </div>

          {units.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">Unidad</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">Piso</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">Tipo</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">Área (m²)</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">Propietario</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">Inquilino</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {units.map((unit) => (
                    <tr key={unit.id} className="hover:bg-neutral-50">
                      <td className="px-4 py-3 text-sm text-neutral-900">{unit.unit_number}</td>
                      <td className="px-4 py-3 text-sm text-neutral-900">{unit.floor}</td>
                      <td className="px-4 py-3 text-sm text-neutral-600">{unit.unit_type}</td>
                      <td className="px-4 py-3 text-sm text-neutral-600">
                        {unit.area_sqm ? `${unit.area_sqm} m²` : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-900">
                        {unit.owner_name || <span className="text-neutral-400">-</span>}
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-900">
                        {unit.tenant_name || <span className="text-neutral-400">-</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-600 mb-2">No hay unidades registradas</p>
              <p className="text-sm text-neutral-500">
                Agrega unidades para empezar a gestionar este consorcio
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
