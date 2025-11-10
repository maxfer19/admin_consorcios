'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, Save, Database, Bell, Shield, Mail, DollarSign } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import toast from 'react-hot-toast';

export default function ConfiguracionPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('general');

  const [config, setConfig] = useState({
    // General
    siteName: 'Komunidad',
    siteUrl: 'https://komunidad.com',
    supportEmail: 'soporte@komunidad.com',
    supportPhone: '+54 11 1234-5678',

    // Notificaciones
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    digestFrequency: 'daily',

    // Facturación
    currency: 'ARS',
    taxRate: '21',
    latePaymentFee: '5',
    paymentMethods: {
      cash: true,
      transfer: true,
      card: true,
      mercadopago: false,
    },

    // Seguridad
    sessionTimeout: '30',
    passwordMinLength: '6',
    requireEmailVerification: true,
    twoFactorAuth: false,

    // Backup
    autoBackup: true,
    backupFrequency: 'daily',
    backupRetention: '30',
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

    // Cargar configuración desde localStorage o API
    const savedConfig = localStorage.getItem('systemConfig');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  }, [router]);

  const handleSave = () => {
    // En producción, esto iría al backend
    localStorage.setItem('systemConfig', JSON.stringify(config));
    toast.success('Configuración guardada exitosamente');
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
    { id: 'billing', label: 'Facturación', icon: DollarSign },
    { id: 'security', label: 'Seguridad', icon: Shield },
    { id: 'backup', label: 'Respaldos', icon: Database },
  ];

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
              <Settings className="h-8 w-8 text-primary-600" />
              <div>
                <h1 className="text-2xl font-bold">Configuración del Sistema</h1>
                <p className="text-sm text-neutral-500">
                  Configura los parámetros globales de la plataforma
                </p>
              </div>
            </div>
            <Button onClick={handleSave}>
              <Save className="h-5 w-5 mr-2" />
              Guardar Cambios
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-12 md:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg transition ${
                        activeTab === tab.id
                          ? 'bg-primary-50 text-primary-600'
                          : 'text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="col-span-12 md:col-span-9">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold mb-4">Información General</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Nombre del Sitio"
                        value={config.siteName}
                        onChange={(e) => setConfig({ ...config, siteName: e.target.value })}
                      />
                      <Input
                        label="URL del Sitio"
                        value={config.siteUrl}
                        onChange={(e) => setConfig({ ...config, siteUrl: e.target.value })}
                      />
                      <Input
                        label="Email de Soporte"
                        type="email"
                        value={config.supportEmail}
                        onChange={(e) => setConfig({ ...config, supportEmail: e.target.value })}
                      />
                      <Input
                        label="Teléfono de Soporte"
                        value={config.supportPhone}
                        onChange={(e) => setConfig({ ...config, supportPhone: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold mb-4">Notificaciones</h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                        <div>
                          <p className="font-medium">Notificaciones por Email</p>
                          <p className="text-sm text-neutral-600">
                            Enviar notificaciones importantes por correo
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={config.emailNotifications}
                            onChange={(e) =>
                              setConfig({ ...config, emailNotifications: e.target.checked })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                        <div>
                          <p className="font-medium">Notificaciones SMS</p>
                          <p className="text-sm text-neutral-600">
                            Enviar alertas urgentes por mensaje de texto
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={config.smsNotifications}
                            onChange={(e) =>
                              setConfig({ ...config, smsNotifications: e.target.checked })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                        <div>
                          <p className="font-medium">Notificaciones Push</p>
                          <p className="text-sm text-neutral-600">
                            Notificaciones en el navegador
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={config.pushNotifications}
                            onChange={(e) =>
                              setConfig({ ...config, pushNotifications: e.target.checked })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Frecuencia de Resumen
                        </label>
                        <select
                          value={config.digestFrequency}
                          onChange={(e) =>
                            setConfig({ ...config, digestFrequency: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="realtime">Tiempo Real</option>
                          <option value="hourly">Cada Hora</option>
                          <option value="daily">Diario</option>
                          <option value="weekly">Semanal</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'billing' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold mb-4">Configuración de Facturación</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Moneda
                        </label>
                        <select
                          value={config.currency}
                          onChange={(e) => setConfig({ ...config, currency: e.target.value })}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="ARS">Peso Argentino (ARS)</option>
                          <option value="USD">Dólar (USD)</option>
                          <option value="EUR">Euro (EUR)</option>
                        </select>
                      </div>

                      <Input
                        label="Tasa de IVA (%)"
                        type="number"
                        value={config.taxRate}
                        onChange={(e) => setConfig({ ...config, taxRate: e.target.value })}
                      />

                      <Input
                        label="Cargo por Mora (%)"
                        type="number"
                        value={config.latePaymentFee}
                        onChange={(e) => setConfig({ ...config, latePaymentFee: e.target.value })}
                      />
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-neutral-700 mb-3">
                        Métodos de Pago Habilitados
                      </h3>
                      <div className="space-y-3">
                        {Object.entries(config.paymentMethods).map(([key, value]) => (
                          <div key={key} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={(e) =>
                                setConfig({
                                  ...config,
                                  paymentMethods: {
                                    ...config.paymentMethods,
                                    [key]: e.target.checked,
                                  },
                                })
                              }
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                            />
                            <label className="ml-3 text-sm text-neutral-700 capitalize">
                              {key === 'cash' && 'Efectivo'}
                              {key === 'transfer' && 'Transferencia Bancaria'}
                              {key === 'card' && 'Tarjeta de Crédito/Débito'}
                              {key === 'mercadopago' && 'Mercado Pago'}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold mb-4">Seguridad</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <Input
                        label="Tiempo de Sesión (minutos)"
                        type="number"
                        value={config.sessionTimeout}
                        onChange={(e) => setConfig({ ...config, sessionTimeout: e.target.value })}
                      />

                      <Input
                        label="Longitud Mínima de Contraseña"
                        type="number"
                        value={config.passwordMinLength}
                        onChange={(e) =>
                          setConfig({ ...config, passwordMinLength: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                        <div>
                          <p className="font-medium">Verificación de Email Obligatoria</p>
                          <p className="text-sm text-neutral-600">
                            Los usuarios deben verificar su email para acceder
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={config.requireEmailVerification}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                requireEmailVerification: e.target.checked,
                              })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                        <div>
                          <p className="font-medium">Autenticación de Dos Factores (2FA)</p>
                          <p className="text-sm text-neutral-600">
                            Requiere verificación adicional al iniciar sesión
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={config.twoFactorAuth}
                            onChange={(e) =>
                              setConfig({ ...config, twoFactorAuth: e.target.checked })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'backup' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold mb-4">Respaldos Automáticos</h2>

                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex">
                        <Database className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium text-blue-900 mb-1">
                            Estado del Sistema de Respaldo
                          </h4>
                          <p className="text-sm text-blue-700">
                            Último respaldo: Hoy a las 03:00 AM
                          </p>
                          <p className="text-sm text-blue-700">
                            Próximo respaldo: Mañana a las 03:00 AM
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                        <div>
                          <p className="font-medium">Respaldo Automático</p>
                          <p className="text-sm text-neutral-600">
                            Crear respaldos automáticos de la base de datos
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={config.autoBackup}
                            onChange={(e) =>
                              setConfig({ ...config, autoBackup: e.target.checked })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Frecuencia de Respaldo
                        </label>
                        <select
                          value={config.backupFrequency}
                          onChange={(e) =>
                            setConfig({ ...config, backupFrequency: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                          disabled={!config.autoBackup}
                        >
                          <option value="hourly">Cada Hora</option>
                          <option value="daily">Diario</option>
                          <option value="weekly">Semanal</option>
                          <option value="monthly">Mensual</option>
                        </select>
                      </div>

                      <Input
                        label="Retención de Respaldos (días)"
                        type="number"
                        value={config.backupRetention}
                        onChange={(e) => setConfig({ ...config, backupRetention: e.target.value })}
                        disabled={!config.autoBackup}
                      />

                      <div className="pt-4">
                        <Button variant="secondary" className="w-full md:w-auto">
                          <Database className="h-5 w-5 mr-2" />
                          Crear Respaldo Manual Ahora
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
