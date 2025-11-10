/**
 * DEBUG SCRIPT PARA FRONTEND
 *
 * Este script se puede pegar en la consola del navegador cuando estás
 * en la página de login (http://localhost:3000/login)
 *
 * INSTRUCCIONES:
 * 1. Abre la consola del navegador (F12)
 * 2. Copia y pega este script completo
 * 3. Presiona Enter
 * 4. El script intentará hacer login y mostrará información detallada
 */

(async function debugLogin() {
  console.clear();
  console.log('%c🔐 KOMUNIDAD - DEBUG LOGIN SCRIPT', 'color: #4CAF50; font-size: 20px; font-weight: bold;');
  console.log('%c═══════════════════════════════════════', 'color: #4CAF50;');
  console.log('');

  // Configuration
  const API_URL = 'http://localhost:4000/api/v1';
  const CREDENTIALS = {
    identifier: '00000000',
    password: 'admin123'
  };

  console.log('%c📋 Configuración:', 'color: #2196F3; font-weight: bold;');
  console.log('  API URL:', API_URL);
  console.log('  Identifier:', CREDENTIALS.identifier);
  console.log('  Password:', '*'.repeat(CREDENTIALS.password.length));
  console.log('');

  // Step 1: Check localStorage
  console.log('%c📦 Step 1: Verificando localStorage...', 'color: #2196F3; font-weight: bold;');
  const existingToken = localStorage.getItem('token');
  const existingUser = localStorage.getItem('user');

  if (existingToken) {
    console.log('  ⚠️ Token existente encontrado:', existingToken.substring(0, 50) + '...');
    console.log('  Limpiando localStorage...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  } else {
    console.log('  ✅ localStorage limpio');
  }
  console.log('');

  // Step 2: Test Health Endpoint
  console.log('%c💚 Step 2: Probando health endpoint...', 'color: #2196F3; font-weight: bold;');
  try {
    const healthResponse = await fetch('http://localhost:4000/health');
    const healthData = await healthResponse.json();
    console.log('  ✅ Health check:', healthResponse.status, healthResponse.statusText);
    console.log('  Response:', healthData);
  } catch (error) {
    console.error('  ❌ Health check falló:', error.message);
    console.error('  El backend probablemente no está corriendo');
    return;
  }
  console.log('');

  // Step 3: Test CORS
  console.log('%c🌐 Step 3: Probando CORS...', 'color: #2196F3; font-weight: bold;');
  try {
    const corsResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'OPTIONS',
    });
    console.log('  Status:', corsResponse.status);
    console.log('  Access-Control-Allow-Origin:', corsResponse.headers.get('Access-Control-Allow-Origin') || '❌ NO HEADER');
    console.log('  Access-Control-Allow-Methods:', corsResponse.headers.get('Access-Control-Allow-Methods') || 'NO HEADER');
  } catch (error) {
    console.error('  ⚠️ CORS preflight falló:', error.message);
  }
  console.log('');

  // Step 4: Test Login
  console.log('%c🚀 Step 4: Probando login...', 'color: #2196F3; font-weight: bold;');
  console.log('  Endpoint:', `${API_URL}/auth/login`);
  console.log('  Method: POST');
  console.log('  Body:', JSON.stringify(CREDENTIALS, null, 2));
  console.log('');

  try {
    const startTime = performance.now();

    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(CREDENTIALS)
    });

    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);

    console.log(`  ⏱️ Tiempo de respuesta: ${duration}ms`);
    console.log(`  📥 Status: ${response.status} ${response.statusText}`);
    console.log('');

    // Headers
    console.log('  📋 Response Headers:');
    const headers = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
      console.log(`    ${key}: ${value}`);
    });
    console.log('');

    // Body
    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
      console.log('  📦 Response Body:', data);
    } else {
      const text = await response.text();
      console.log('  📦 Response Body (text):', text);
    }
    console.log('');

    // Analyze result
    if (response.ok) {
      console.log('%c✅ LOGIN EXITOSO', 'color: #4CAF50; font-size: 18px; font-weight: bold;');
      console.log('%c═══════════════════════════════════════', 'color: #4CAF50;');

      if (data.token) {
        console.log('');
        console.log('  🎫 Token:', data.token.substring(0, 50) + '...');

        // Save to localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        console.log('  💾 Token guardado en localStorage');
      }

      if (data.user) {
        console.log('');
        console.log('  👤 Usuario:');
        console.log('    ID:', data.user.id);
        console.log('    DNI:', data.user.dni);
        console.log('    Email:', data.user.email);
        console.log('    Role:', data.user.role);
        console.log('    Status:', data.user.status);
        console.log('    First Name:', data.user.first_name);
        console.log('    Last Name:', data.user.last_name);
      }

      console.log('');
      console.log('%c💡 El login funciona correctamente!', 'color: #4CAF50; font-weight: bold;');
      console.log('%cSi el frontend sigue mostrando error, el problema está en:', 'color: #ff9800; font-weight: bold;');
      console.log('  1. El manejo de errores del componente de login');
      console.log('  2. El router de Next.js');
      console.log('  3. Algún error en el código del frontend');
      console.log('');
      console.log('%cIntentar navegar a:', 'color: #2196F3; font-weight: bold;');
      console.log(`  window.location.href = '/superadmin'`);

    } else {
      console.log('%c❌ LOGIN FALLÓ', 'color: #f44336; font-size: 18px; font-weight: bold;');
      console.log('%c═══════════════════════════════════════', 'color: #f44336;');
      console.log('');

      if (data && data.error) {
        console.log('  Error:', data.error.message);
        console.log('  Status Code:', data.error.statusCode);

        if (data.error.statusCode === 401) {
          console.log('');
          console.log('%c🔍 Causa: Credenciales inválidas', 'color: #ff9800; font-weight: bold;');
          console.log('  Posibles razones:');
          console.log('    1. Hash de contraseña corrupto en la base de datos');
          console.log('    2. Usuario no existe');
          console.log('    3. Usuario bloqueado');
          console.log('');
          console.log('%c💡 Solución:', 'color: #2196F3; font-weight: bold;');
          console.log('  Ejecuta en el servidor:');
          console.log('  cd /home/server/admin_consorcios');
          console.log('  ./fix-superadmin.sh');
        }
      }
    }

  } catch (error) {
    console.log('%c❌ ERROR DE RED O CONEXIÓN', 'color: #f44336; font-size: 18px; font-weight: bold;');
    console.log('%c═══════════════════════════════════════', 'color: #f44336;');
    console.log('');
    console.error('  Error:', error.message);
    console.error('  Tipo:', error.name);
    console.error('  Stack:', error.stack);
    console.log('');
    console.log('%c🔍 Posibles causas:', 'color: #ff9800; font-weight: bold;');
    console.log('  1. Backend no está corriendo (docker ps | grep komunidad-backend)');
    console.log('  2. Puerto incorrecto (debe ser 4000)');
    console.log('  3. CORS bloqueando la petición');
    console.log('  4. Firewall bloqueando conexión');
  }

  console.log('');
  console.log('%c═══════════════════════════════════════', 'color: #4CAF50;');
  console.log('%c🏁 Debug completado', 'color: #4CAF50; font-weight: bold;');
  console.log('%c═══════════════════════════════════════', 'color: #4CAF50;');

})();
