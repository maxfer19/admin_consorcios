const bcrypt = require('bcryptjs');

async function generateAndCompare() {
  const password = 'admin123';
  const currentHash = '$2a$10$8K1p/a0dL3I8U/oIKvRNIe5Dy0R7gp/KbJlT3X19T0Q3dJ8HZn8ma';

  console.log('===========================================');
  console.log('🔐 Password Hash Verification & Generation');
  console.log('===========================================\n');

  console.log('Password to test:', password);
  console.log('Current hash in DB:', currentHash);
  console.log('');

  // Test current hash
  console.log('Testing current hash...');
  const isValid = await bcrypt.compare(password, currentHash);
  console.log('Does current hash match "admin123"?', isValid ? '✅ YES' : '❌ NO');
  console.log('');

  // Generate new hash
  console.log('Generating NEW hash for "admin123"...');
  const newHash = await bcrypt.hash(password, 10);
  console.log('New hash:', newHash);
  console.log('');

  // Test new hash
  const newHashValid = await bcrypt.compare(password, newHash);
  console.log('Does new hash match "admin123"?', newHashValid ? '✅ YES' : '❌ NO');
  console.log('');

  console.log('===========================================');
  console.log('SQL to update database:');
  console.log('===========================================');
  console.log(`UPDATE users`);
  console.log(`SET password_hash = '${newHash}'`);
  console.log(`WHERE dni = '00000000';`);
  console.log('');
}

generateAndCompare().catch(console.error);
