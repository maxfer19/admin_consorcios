'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Plus, Edit, Trash2, Users, DollarSign } from 'lucide-react';
import { buildingsApi } from '@/services/api';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import toast from 'react-hot-toast';

interface Building {
  id: number;
  name: string;
  legal_name: string;
  cuit: string;
  address: string;
  city: string;
  province: string;
  total_units: number;
  building_type: string;
  admin_name?: string;
  is_active: boolean;
}

export default function ConsorciosPage() {
  const router = useRouter();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    cuit: '',
    name: '',
    legal_name: '',
    address: '',
    city: '',
    province: '',
    postal_code: '',
    total_units: '',
    building_type: 'apartment',
    floors: '',
    year_built: '',
    admin_id: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await buildingsApi.create({
        ...formData,
        total_units: parseInt(formData.total_units),
        floors: parseInt(formData.floors) || null,
        year_built: parseInt(formData.year_built) || null,
        admin_id: parseInt(formData.admin_id) || null,
      });

      toast.success('Consorcio creado exitosamente');
      setShowCreateModal(false);
      setFormData({
        cuit: '',
        name: '',
        legal_name: '',
        address: '',
        city: '',
        province: '',
        postal_code: '',
        total_units: '',
        building_type: 'apartment',
        floors: '',
        year_built: '',
        admin_id: '',
      });
      loadBuildings();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Error al crear consorcio');
    }
  };

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
              <Building2 className="h-8 w-8 text-primary-600" />
              <div>
                <h1 className="text-2xl font-bold">Gestión de Consorcios</h1>
                <p className="text-sm text-neutral-500">
                  Administra todos los consorcios del sistema
                </p>
              </div>
            </div>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-5 w-5 mr-2" />
              Nuevo Consorcio
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-neutral-600">Cargando consorcios...</p>
          </div>
        ) : buildings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Building2 className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              No hay consorcios registrados
            </h3>
            <p className="text-neutral-600 mb-6">
              Comienza creando tu primer consorcio
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-5 w-5 mr-2" />
              Crear Primer Consorcio
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {buildings.map((building) => (
              <div
                key={building.id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                      {building.name}
                    </h3>
                    <p className="text-sm text-neutral-500">{building.legal_name}</p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${
                      building.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {building.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-neutral-600">
                    <Building2 className="h-4 w-4 mr-2" />
                    {building.address}, {building.city}
                  </div>
                  <div className="flex items-center text-sm text-neutral-600">
                    <Users className="h-4 w-4 mr-2" />
                    {building.total_units} unidades
                  </div>
                  {building.admin_name && (
                    <div className="flex items-center text-sm text-neutral-600">
                      <Users className="h-4 w-4 mr-2" />
                      Admin: {building.admin_name}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={() => router.push(`/superadmin/consorcios/${building.id}`)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Ver Detalles
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Crear Nuevo Consorcio"
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="CUIT"
              type="text"
              value={formData.cuit}
              onChange={(e) => setFormData({ ...formData, cuit: e.target.value })}
              placeholder="20-12345678-9"
              required
            />
            <Input
              label="Nombre del Consorcio"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Edificio Las Flores"
              required
            />
            <Input
              label="Razón Social"
              type="text"
              value={formData.legal_name}
              onChange={(e) => setFormData({ ...formData, legal_name: e.target.value })}
              placeholder="Consorcio Propietarios Edificio Las Flores"
              required
              className="md:col-span-2"
            />
            <Input
              label="Dirección"
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Av. Principal 1234"
              required
              className="md:col-span-2"
            />
            <Input
              label="Ciudad"
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="Buenos Aires"
              required
            />
            <Input
              label="Provincia"
              type="text"
              value={formData.province}
              onChange={(e) => setFormData({ ...formData, province: e.target.value })}
              placeholder="Buenos Aires"
              required
            />
            <Input
              label="Código Postal"
              type="text"
              value={formData.postal_code}
              onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
              placeholder="1234"
            />
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Tipo de Edificio
              </label>
              <select
                value={formData.building_type}
                onChange={(e) => setFormData({ ...formData, building_type: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="apartment">Departamentos</option>
                <option value="house">Casas</option>
                <option value="office">Oficinas</option>
                <option value="mixed">Mixto</option>
              </select>
            </div>
            <Input
              label="Total de Unidades"
              type="number"
              value={formData.total_units}
              onChange={(e) => setFormData({ ...formData, total_units: e.target.value })}
              placeholder="24"
              required
            />
            <Input
              label="Pisos"
              type="number"
              value={formData.floors}
              onChange={(e) => setFormData({ ...formData, floors: e.target.value })}
              placeholder="6"
            />
            <Input
              label="Año de Construcción"
              type="number"
              value={formData.year_built}
              onChange={(e) => setFormData({ ...formData, year_built: e.target.value })}
              placeholder="2020"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">
              Crear Consorcio
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
