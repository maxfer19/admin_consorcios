import Link from 'next/link';
import { Building2, Users, FileText, TrendingUp, Shield, Bell } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Building2 className="h-8 w-8 text-primary-600" />
            <span className="text-2xl font-bold text-neutral-900">Komunidad</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="px-6 py-2 text-neutral-700 hover:text-primary-600 transition-colors"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/register"
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Solicitar Demo
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-neutral-900 mb-6">
            Gestión de Consorcios <span className="text-primary-600">Simplificada</span>
          </h1>
          <p className="text-xl text-neutral-600 mb-8">
            La plataforma integral que conecta administradores, propietarios, inquilinos y proveedores
            en un solo lugar. Digitaliza tu gestión y mejora la comunicación.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/register"
              className="px-8 py-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-lg font-semibold"
            >
              Comenzar Ahora
            </Link>
            <Link
              href="#caracteristicas"
              className="px-8 py-4 bg-white text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors text-lg font-semibold border border-neutral-300"
            >
              Ver Características
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-neutral-900 mb-12">
            Beneficios para Todos
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Administradores */}
            <div className="p-6 bg-gradient-to-br from-primary-50 to-white rounded-xl border border-primary-100">
              <Shield className="h-12 w-12 text-primary-600 mb-4" />
              <h3 className="text-xl font-bold text-neutral-900 mb-3">
                Para Administradores
              </h3>
              <ul className="space-y-2 text-neutral-600">
                <li>• Gestión financiera completa</li>
                <li>• Liquidación automática</li>
                <li>• Control de morosidad</li>
                <li>• Reportes instantáneos</li>
                <li>• Comunicación centralizada</li>
              </ul>
            </div>

            {/* Propietarios */}
            <div className="p-6 bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-100">
              <Users className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold text-neutral-900 mb-3">
                Para Propietarios
              </h3>
              <ul className="space-y-2 text-neutral-600">
                <li>• Expensas digitales</li>
                <li>• Estado de cuenta</li>
                <li>• Votaciones online</li>
                <li>• Reserva de amenities</li>
                <li>• Comunicación directa</li>
              </ul>
            </div>

            {/* Inquilinos */}
            <div className="p-6 bg-gradient-to-br from-green-50 to-white rounded-xl border border-green-100">
              <Bell className="h-12 w-12 text-green-600 mb-4" />
              <h3 className="text-xl font-bold text-neutral-900 mb-3">
                Para Inquilinos
              </h3>
              <ul className="space-y-2 text-neutral-600">
                <li>• Avisos importantes</li>
                <li>• Info de expensas</li>
                <li>• Reclamos y solicitudes</li>
                <li>• Trabajos programados</li>
                <li>• Canal de comunicación</li>
              </ul>
            </div>

            {/* Proveedores */}
            <div className="p-6 bg-gradient-to-br from-purple-50 to-white rounded-xl border border-purple-100">
              <FileText className="h-12 w-12 text-purple-600 mb-4" />
              <h3 className="text-xl font-bold text-neutral-900 mb-3">
                Para Proveedores
              </h3>
              <ul className="space-y-2 text-neutral-600">
                <li>• Portal de presupuestos</li>
                <li>• Gestión de OT</li>
                <li>• Documentación digital</li>
                <li>• Seguimiento de trabajos</li>
                <li>• Facturación integrada</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="caracteristicas" className="py-20 bg-neutral-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-neutral-900 mb-12">
            Características Principales
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<TrendingUp className="h-8 w-8" />}
              title="Gestión Financiera"
              description="Control total de ingresos, egresos, liquidaciones y morosidad con reportes en tiempo real."
            />
            <FeatureCard
              icon={<Bell className="h-8 w-8" />}
              title="Comunicación Centralizada"
              description="Avisos, votaciones, chat directo y notificaciones push para mantener a todos informados."
            />
            <FeatureCard
              icon={<FileText className="h-8 w-8" />}
              title="Documentación Digital"
              description="Almacena y comparte reglamentos, actas, presupuestos y documentos importantes."
            />
            <FeatureCard
              icon={<Users className="h-8 w-8" />}
              title="Portal de Propietarios"
              description="Acceso 24/7 a expensas, estado de cuenta, reservas y participación en decisiones."
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8" />}
              title="Seguridad y Auditoría"
              description="Logs completos de actividad, permisos granulares y protección de datos."
            />
            <FeatureCard
              icon={<Building2 className="h-8 w-8" />}
              title="Multi-Consorcio"
              description="Gestiona múltiples consorcios desde una sola cuenta con cambio rápido entre ellos."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            ¿Listo para transformar tu gestión?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Únete a los administradores que ya están digitalizando sus consorcios
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-4 bg-white text-primary-600 rounded-lg hover:bg-neutral-100 transition-colors text-lg font-semibold"
          >
            Solicitar Demo Gratuita
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Building2 className="h-6 w-6 text-primary-500" />
                <span className="text-xl font-bold text-white">Komunidad</span>
              </div>
              <p className="text-sm">
                La plataforma más completa para la gestión de consorcios
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Producto</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Características</a></li>
                <li><a href="#" className="hover:text-white">Precios</a></li>
                <li><a href="#" className="hover:text-white">Demo</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Soporte</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Centro de Ayuda</a></li>
                <li><a href="#" className="hover:text-white">Contacto</a></li>
                <li><a href="#" className="hover:text-white">Tutoriales</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Términos</a></li>
                <li><a href="#" className="hover:text-white">Privacidad</a></li>
                <li><a href="#" className="hover:text-white">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-neutral-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2024 Komunidad. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-6 bg-white rounded-xl border border-neutral-200 hover:shadow-lg transition-shadow">
      <div className="text-primary-600 mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-neutral-900 mb-2">{title}</h3>
      <p className="text-neutral-600">{description}</p>
    </div>
  );
}
