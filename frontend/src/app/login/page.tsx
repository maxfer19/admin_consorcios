'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building2 } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { authApi } from '@/services/api';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authApi.login(formData.identifier, formData.password);
      const { token, user } = response.data;

      // Store token
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      toast.success('¡Bienvenido!');

      // Redirect based on role
      switch (user.role) {
        case 'superadmin':
          router.push('/superadmin');
          break;
        case 'admin':
          router.push('/admin');
          break;
        case 'owner':
          router.push('/owner');
          break;
        case 'tenant':
          router.push('/tenant');
          break;
        case 'provider':
          router.push('/provider');
          break;
        default:
          router.push('/');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.error?.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-neutral-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Building2 className="h-10 w-10 text-primary-600" />
            <span className="text-3xl font-bold text-neutral-900">Komunidad</span>
          </div>
          <p className="text-neutral-600">Gestión de Consorcios</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Iniciar Sesión</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="DNI, CUIT o Email"
              type="text"
              value={formData.identifier}
              onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
              placeholder="Ingrese su DNI, CUIT o email"
              required
              disabled={isLoading}
            />

            <Input
              label="Contraseña"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Ingrese su contraseña"
              required
              disabled={isLoading}
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-neutral-700">Recordarme</span>
              </label>
              <Link href="/forgot-password" className="text-primary-600 hover:text-primary-700">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <Button type="submit" fullWidth isLoading={isLoading}>
              Iniciar Sesión
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600">
              ¿No tienes cuenta?{' '}
              <Link href="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                Registrarse
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
