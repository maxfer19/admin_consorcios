'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Building2, ArrowLeft, MapPin, Users, Edit, CheckCircle, XCircle, UserPlus, Trash2 } from 'lucide-react';
import { buildingsApi, api } from '@/services/api';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
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
  admin_id?: number;
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
  square_meters?: number;
  percentage: number;
  owner_name?: string;
  tenant_name?: string;
  owner_id?: number;
  tenant_id?: number;
}

interface Admin {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  dni?: string;
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
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddUnitModal, setShowAddUnitModal] = useState(false);
  const [showEditUnitModal, setShowEditUnitModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [owners, setOwners] = useState<Admin[]>([]);
  const [tenants, setTenants] = useState<Admin[]>([]);
  const [selectedAdminId, setSelectedAdminId] = useState<number | null>(null);

  const [editFormData, setEditFormData] = useState({
    name: '',
    legal_name: '',
    address: '',
    city: '',
    province: '',
    postal_code: '',
    is_active: true,
  });

  const [unitFormData, setUnitFormData] = useState({
    unit_number: '',
    floor: '',
    unit_type: 'apartment',
    square_meters: '',
    percentage: '',
    owner_id: '',
    tenant_id: '',
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

  const loadAdmins = async () => {
    try {
      const response = await api.get('/users?role=admin&status=active');
      setAdmins(response.data);
    } catch (error) {
      console.error('Error loading admins:', error);
      toast.error('Error al cargar administradores');
    }
  };

  const handleOpenAssignModal = () => {
    loadAdmins();
    setSelectedAdminId(building?.admin_id || null);
    setShowAssignModal(true);
  };

  const handleAssignAdmin = async () => {
    if (!selectedAdminId || !building) return;

    try {
      await buildingsApi.update(building.id, { admin_id: selectedAdminId });
      toast.success('Administrador asignado exitosamente');
      setShowAssignModal(false);
      loadBuildingDetails();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Error al asignar administrador');
    }
  };

  const handleOpenEditModal = () => {
    if (!building) return;
    setEditFormData({
      name: building.name,
      legal_name: building.legal_name,
      address: building.address,
      city: building.city,
      province: building.province,
      postal_code: building.postal_code || '',
      is_active: building.is_active,
    });
    setShowEditModal(true);
  };

  const handleUpdateBuilding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!building) return;

    try {
      await buildingsApi.update(building.id, editFormData);
      toast.success('Consorcio actualizado exitosamente');
      setShowEditModal(false);
      loadBuildingDetails();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Error al actualizar consorcio');
    }
  };

  const loadOwnersAndTenants = async () => {
    try {
      const ownersResponse = await api.get('/users?role=owner&status=active');
      setOwners(ownersResponse.data);

      const tenantsResponse = await api.get('/users?role=tenant&status=active');
      setTenants(tenantsResponse.data);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleOpenAddUnitModal = () => {
    loadOwnersAndTenants();
    setUnitFormData({
      unit_number: '',
      floor: '',
      unit_type: 'apartment',
      square_meters: '',
      percentage: '',
      owner_id: '',
      tenant_id: '',
    });
    setShowAddUnitModal(true);
  };

  const handleCreateUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!building) return;

    try {
      await api.post('/units', {
        building_id: building.id,
        unit_number: unitFormData.unit_number,
        floor: unitFormData.floor ? parseInt(unitFormData.floor) : null,
        unit_type: unitFormData.unit_type,
        square_meters: unitFormData.square_meters ? parseFloat(unitFormData.square_meters) : null,
        percentage: parseFloat(unitFormData.percentage),
        owner_id: unitFormData.owner_id || null,
        tenant_id: unitFormData.tenant_id || null,
      });

      toast.success('Unidad creada exitosamente');
      setShowAddUnitModal(false);
      loadBuildingDetails();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Error al crear unidad');
    }
  };

  const handleOpenEditUnitModal = (unit: Unit) => {
    setSelectedUnit(unit);
    setUnitFormData({
      unit_number: unit.unit_number,
      floor: unit.floor?.toString() || '',
      unit_type: unit.unit_type,
      square_meters: unit.square_meters?.toString() || '',
      percentage: unit.percentage.toString(),
      owner_id: unit.owner_id?.toString() || '',
      tenant_id: unit.tenant_id?.toString() || '',
    });
    loadOwnersAndTenants();
    setShowEditUnitModal(true);
  };

  const handleUpdateUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnit) return;

    try {
      await api.put(`/units/${selectedUnit.id}`, {
        unit_number: unitFormData.unit_number,
        floor: unitFormData.floor ? parseInt(unitFormData.floor) : null,
        unit_type: unitFormData.unit_type,
        square_meters: unitFormData.square_meters ? parseFloat(unitFormData.square_meters) : null,
        percentage: parseFloat(unitFormData.percentage),
        owner_id: unitFormData.owner_id || null,
        tenant_id: unitFormData.tenant_id || null,
      });

      toast.success('Unidad actualizada exitosamente');
      setShowEditUnitModal(false);
      setSelectedUnit(null);
      loadBuildingDetails();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Error al actualizar unidad');
    }
  };

  const handleDeleteUnit = async (unitId: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta unidad? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await api.delete(`/units/${unitId}`);
      toast.success('Unidad eliminada exitosamente');
      loadBuildingDetails();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Error al eliminar unidad');
    }
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
            <Button variant="primary" onClick={handleOpenEditModal}>
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-900">Administrador</h3>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleOpenAssignModal}
              >
                <UserPlus className="h-4 w-4 mr-1" />
                {building.admin_name ? 'Cambiar' : 'Asignar'}
              </Button>
            </div>
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
            <Button variant="primary" onClick={handleOpenAddUnitModal}>
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
                    <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">% Expensas</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">Propietario</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">Inquilino</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-neutral-700">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {units.map((unit) => (
                    <tr key={unit.id} className="hover:bg-neutral-50">
                      <td className="px-4 py-3 text-sm text-neutral-900">{unit.unit_number}</td>
                      <td className="px-4 py-3 text-sm text-neutral-900">{unit.floor || 'PB'}</td>
                      <td className="px-4 py-3 text-sm text-neutral-600">{unit.unit_type}</td>
                      <td className="px-4 py-3 text-sm text-neutral-600">
                        {unit.square_meters ? `${unit.square_meters} m²` : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-600">
                        {unit.percentage}%
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-900">
                        {unit.owner_name || <span className="text-neutral-400">-</span>}
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-900">
                        {unit.tenant_name || <span className="text-neutral-400">-</span>}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleOpenEditUnitModal(unit)}
                            className="p-1 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded"
                            title="Editar unidad"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUnit(unit.id)}
                            className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                            title="Eliminar unidad"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
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

      {/* Assign Admin Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Asignar Administrador"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-600">
            Selecciona un administrador para asignar a este consorcio:
          </p>

          {admins.length > 0 ? (
            <div className="space-y-2">
              {admins.map((admin) => (
                <label
                  key={admin.id}
                  className="flex items-center p-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="admin"
                    value={admin.id}
                    checked={selectedAdminId === admin.id}
                    onChange={() => setSelectedAdminId(admin.id)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                  />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-neutral-900">
                      {admin.first_name} {admin.last_name}
                    </p>
                    <p className="text-sm text-neutral-500">{admin.email}</p>
                    {admin.dni && (
                      <p className="text-xs text-neutral-400">DNI: {admin.dni}</p>
                    )}
                  </div>
                </label>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-500 py-4 text-center">
              No hay administradores disponibles. Crea un usuario con rol de administrador primero.
            </p>
          )}

          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowAssignModal(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleAssignAdmin}
              disabled={!selectedAdminId}
            >
              Asignar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Building Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Editar Consorcio"
        size="xl"
      >
        <form onSubmit={handleUpdateBuilding} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nombre del Consorcio"
              type="text"
              value={editFormData.name}
              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              required
            />
            <Input
              label="Razón Social"
              type="text"
              value={editFormData.legal_name}
              onChange={(e) => setEditFormData({ ...editFormData, legal_name: e.target.value })}
              required
              className="md:col-span-2"
            />
            <Input
              label="Dirección"
              type="text"
              value={editFormData.address}
              onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
              required
              className="md:col-span-2"
            />
            <Input
              label="Ciudad"
              type="text"
              value={editFormData.city}
              onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
              required
            />
            <Input
              label="Provincia"
              type="text"
              value={editFormData.province}
              onChange={(e) => setEditFormData({ ...editFormData, province: e.target.value })}
              required
            />
            <Input
              label="Código Postal"
              type="text"
              value={editFormData.postal_code}
              onChange={(e) => setEditFormData({ ...editFormData, postal_code: e.target.value })}
            />
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Estado
              </label>
              <select
                value={editFormData.is_active ? 'active' : 'inactive'}
                onChange={(e) => setEditFormData({ ...editFormData, is_active: e.target.value === 'active' })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancelar
            </Button>
            <Button type="submit">Actualizar</Button>
          </div>
        </form>
      </Modal>

      {/* Add Unit Modal */}
      <Modal
        isOpen={showAddUnitModal}
        onClose={() => setShowAddUnitModal(false)}
        title="Agregar Unidad"
        size="lg"
      >
        <form onSubmit={handleCreateUnit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Número de Unidad"
              type="text"
              value={unitFormData.unit_number}
              onChange={(e) => setUnitFormData({ ...unitFormData, unit_number: e.target.value })}
              placeholder="A101, 1A, etc."
              required
            />
            <Input
              label="Piso"
              type="number"
              value={unitFormData.floor}
              onChange={(e) => setUnitFormData({ ...unitFormData, floor: e.target.value })}
              placeholder="0 para PB, 1, 2, etc."
              required
            />
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Tipo de Unidad
              </label>
              <select
                value={unitFormData.unit_type}
                onChange={(e) => setUnitFormData({ ...unitFormData, unit_type: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="apartment">Departamento</option>
                <option value="office">Oficina</option>
                <option value="commercial">Local Comercial</option>
                <option value="parking">Cochera</option>
                <option value="storage">Baulera</option>
              </select>
            </div>
            <Input
              label="Área (m²) - Opcional"
              type="number"
              step="0.01"
              value={unitFormData.square_meters}
              onChange={(e) => setUnitFormData({ ...unitFormData, square_meters: e.target.value })}
              placeholder="45.5"
            />
            <Input
              label="Porcentaje de Expensas (%)"
              type="number"
              step="0.01"
              value={unitFormData.percentage}
              onChange={(e) => setUnitFormData({ ...unitFormData, percentage: e.target.value })}
              placeholder="1.25"
              required
            />
            <div className="md:col-span-2 text-xs text-neutral-500 -mt-2">
              <p>El porcentaje se usa para calcular las expensas comunes. Ej: Si una unidad representa el 1.25% del total, ingrese 1.25</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Propietario (Opcional)
              </label>
              <select
                value={unitFormData.owner_id}
                onChange={(e) => setUnitFormData({ ...unitFormData, owner_id: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Sin propietario asignado</option>
                {owners.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.first_name} {owner.last_name} - {owner.email}
                  </option>
                ))}
              </select>
              <p className="text-xs text-neutral-500 mt-1">
                Si no hay propietarios disponibles, créalos desde la sección de Usuarios
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Inquilino (Opcional)
              </label>
              <select
                value={unitFormData.tenant_id}
                onChange={(e) => setUnitFormData({ ...unitFormData, tenant_id: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Sin inquilino asignado</option>
                {tenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.first_name} {tenant.last_name} - {tenant.email}
                  </option>
                ))}
              </select>
              <p className="text-xs text-neutral-500 mt-1">
                Si no hay inquilinos disponibles, créalos desde la sección de Usuarios
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="secondary" onClick={() => setShowAddUnitModal(false)}>
              Cancelar
            </Button>
            <Button type="submit">Crear Unidad</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Unit Modal */}
      <Modal
        isOpen={showEditUnitModal}
        onClose={() => {
          setShowEditUnitModal(false);
          setSelectedUnit(null);
        }}
        title="Editar Unidad"
        size="lg"
      >
        <form onSubmit={handleUpdateUnit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Número de Unidad"
              type="text"
              value={unitFormData.unit_number}
              onChange={(e) => setUnitFormData({ ...unitFormData, unit_number: e.target.value })}
              placeholder="A101, 1A, etc."
              required
            />
            <Input
              label="Piso"
              type="number"
              value={unitFormData.floor}
              onChange={(e) => setUnitFormData({ ...unitFormData, floor: e.target.value })}
              placeholder="0 para PB, 1, 2, etc."
            />
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Tipo de Unidad
              </label>
              <select
                value={unitFormData.unit_type}
                onChange={(e) => setUnitFormData({ ...unitFormData, unit_type: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="apartment">Departamento</option>
                <option value="office">Oficina</option>
                <option value="commercial">Local Comercial</option>
                <option value="parking">Cochera</option>
                <option value="storage">Baulera</option>
              </select>
            </div>
            <Input
              label="Área (m²) - Opcional"
              type="number"
              step="0.01"
              value={unitFormData.square_meters}
              onChange={(e) => setUnitFormData({ ...unitFormData, square_meters: e.target.value })}
              placeholder="45.5"
            />
            <Input
              label="Porcentaje de Expensas (%)"
              type="number"
              step="0.01"
              value={unitFormData.percentage}
              onChange={(e) => setUnitFormData({ ...unitFormData, percentage: e.target.value })}
              placeholder="1.25"
              required
            />
            <div className="md:col-span-2 text-xs text-neutral-500 -mt-2">
              <p>El porcentaje se usa para calcular las expensas comunes. Ej: Si una unidad representa el 1.25% del total, ingrese 1.25</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Propietario (Opcional)
              </label>
              <select
                value={unitFormData.owner_id}
                onChange={(e) => setUnitFormData({ ...unitFormData, owner_id: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Sin propietario asignado</option>
                {owners.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.first_name} {owner.last_name} - {owner.email}
                  </option>
                ))}
              </select>
              <p className="text-xs text-neutral-500 mt-1">
                Puedes cambiar el propietario o dejarlo vacío
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Inquilino (Opcional)
              </label>
              <select
                value={unitFormData.tenant_id}
                onChange={(e) => setUnitFormData({ ...unitFormData, tenant_id: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Sin inquilino asignado</option>
                {tenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.first_name} {tenant.last_name} - {tenant.email}
                  </option>
                ))}
              </select>
              <p className="text-xs text-neutral-500 mt-1">
                Puedes cambiar el inquilino o dejarlo vacío
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowEditUnitModal(false);
                setSelectedUnit(null);
              }}
            >
              Cancelar
            </Button>
            <Button type="submit">Actualizar Unidad</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
