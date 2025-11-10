-- Fix superadmin password
-- Password: admin123 (properly hashed with bcrypt)

-- Delete existing superadmin if exists (to avoid conflicts)
DELETE FROM users WHERE dni = '00000000' OR email = 'superadmin@komunidad.com';

-- Insert superadmin with correct hash
INSERT INTO users (dni, email, password_hash, role, status, first_name, last_name, email_verified)
VALUES ('00000000', 'superadmin@komunidad.com', '$2a$10$8K1p/a0dL3I8U/oIKvRNIe5Dy0R7gp/KbJlT3X19T0Q3dJ8HZn8ma', 'superadmin', 'active', 'Super', 'Admin', true);

-- Verify
SELECT id, dni, email, role, status, first_name, last_name FROM users WHERE role = 'superadmin';
