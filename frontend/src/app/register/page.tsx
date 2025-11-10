'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building2 } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { authApi } from '@/services/api';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<'owner' | 'tenant' | 'provider'>('owner');
  const [formData, setFormData] = useState({
    dni: '',
    cuit_cuil: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone: '',
    company_name: '',
    business_type: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (userType === 'provider') {
      if (!formData.cuit_cuil) {
        toast.error('El CUIT/CUIL es requerido para proveedores');
        return;
      }
      if (!formData.company_name) {
        toast.error('El nombre de la empresa es requerido');
        return;
      }
    } else {
      if (!formData.dni) {
        toast.error('El DNI es requerido');
        return;
      }
    }

    setIsLoading(true);

    try {
      let response;

      if (userType === 'provider') {
        response = await authApi.registerProvider({
          cuit_cuil: formData.cuit_cuil,
          email: formData.email,
          password: formData.password,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          company_name: formData.company_name,
          business_type: formData.business_type,
        });
      } else {
        response = await authApi.register({
          dni: formData.dni,
          email: formData.email,
          password: formData.password,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          role: userType,
        });
      }

      toast.success(response.data.message || '¡Registro exitoso! Esperando aprobación del administrador.');

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error: any) {
      console.error('Register error:', error);
      toast.error(error.response?.data?.error?.message || 'Error al registrarse');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-neutral-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center space-x-2 mb-2">
            <Building2 className="h-10 w-10 text-primary-600" />
            <span className="text-3xl font-bold text-neutral-900">Komunidad</span>
          </Link>
          <p className="text-neutral-600">Registro de Usuario</p>
        </div>

        {/* Register Card */}
        <div className="bg-white rounded-xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Crear Cuenta</h2>

          {/* User Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Tipo de Usuario
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setUserType('owner')}
                className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                  userType === 'owner'
                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                    : 'border-neutral-300 text-neutral-700 hover:border-neutral-400'
                }`}
              >
                Propietario
              </button>
              <button
                type="button"
                onClick={() => setUserType('tenant')}
                className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                  userType === 'tenant'
                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                    : 'border-neutral-300 text-neutral-700 hover:border-neutral-400'
                }`}
              >
                Inquilino
              </button>
              <button
                type="button"
                onClick={() => setUserType('provider')}
                className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                  userType === 'provider'
                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                    : 'border-neutral-300 text-neutral-700 hover:border-neutral-400'
                }`}
              >
                Proveedor
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Personal Information */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Nombre"
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                placeholder="Ingrese su nombre"
                required
                disabled={isLoading}
              />
              <Input
                label="Apellido"
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                placeholder="Ingrese su apellido"
                required
                disabled={isLoading}
              />
            </div>

            {/* DNI or CUIT based on user type */}
            {userType === 'provider' ? (
              <>
                <Input
                  label="CUIT/CUIL"
                  type="text"
                  value={formData.cuit_cuil}
                  onChange={(e) => setFormData({ ...formData, cuit_cuil: e.target.value })}
                  placeholder="20-12345678-9"
                  required
                  disabled={isLoading}
                  helpText="11 dígitos sin guiones"
                />
                <Input
                  label="Nombre de la Empresa"
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  placeholder="Nombre de su empresa"
                  required
                  disabled={isLoading}
                />
                <Input
                  label="Tipo de Servicio"
                  type="text"
                  value={formData.business_type}
                  onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
                  placeholder="Ej: Plomería, Electricidad, etc."
                  disabled={isLoading}
                />
              </>
            ) : (
              <Input
                label="DNI"
                type="text"
                value={formData.dni}
                onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                placeholder="12345678"
                required
                disabled={isLoading}
                helpText="Sin puntos ni guiones"
              />
            )}

            {/* Contact Information */}
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="ejemplo@email.com"
              required
              disabled={isLoading}
            />

            <Input
              label="Teléfono"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="1123456789"
              disabled={isLoading}
            />

            {/* Password */}
            <Input
              label="Contraseña"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Mínimo 6 caracteres"
              required
              disabled={isLoading}
            />

            <Input
              label="Confirmar Contraseña"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="Repita su contraseña"
              required
              disabled={isLoading}
            />

            {/* Info Message */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Nota:</strong> Su cuenta quedará pendiente de aprobación por un administrador.
                Recibirá una notificación cuando sea activada.
              </p>
            </div>

            <Button type="submit" fullWidth isLoading={isLoading}>
              Registrarse
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                Iniciar Sesión
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-neutral-500 mt-6">
          &copy; 2024 Komunidad. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
