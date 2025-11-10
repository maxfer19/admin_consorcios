import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../config/database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Get current user profile
router.get('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const result = await query(
      `SELECT id, dni, cuit_cuil, email, role, status, first_name, last_name,
              phone, phone_secondary, address, city, province, postal_code,
              notification_preferences, created_at, last_login
       FROM users WHERE id = $1`,
      [req.user!.id]
    );

    if (result.rows.length === 0) {
      throw new AppError('User not found', 404);
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Update current user profile
router.put('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { first_name, last_name, phone, phone_secondary, address, city, province, postal_code, notification_preferences } = req.body;

    const result = await query(
      `UPDATE users
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           phone = COALESCE($3, phone),
           phone_secondary = COALESCE($4, phone_secondary),
           address = COALESCE($5, address),
           city = COALESCE($6, city),
           province = COALESCE($7, province),
           postal_code = COALESCE($8, postal_code),
           notification_preferences = COALESCE($9, notification_preferences)
       WHERE id = $10
       RETURNING id, dni, email, role, first_name, last_name, phone, notification_preferences`,
      [first_name, last_name, phone, phone_secondary, address, city, province, postal_code, notification_preferences, req.user!.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Get all users (SuperAdmin only)
router.get('/', authenticate, authorize('superadmin'), async (req: AuthRequest, res, next) => {
  try {
    const { role, status } = req.query;

    let queryText = `SELECT id, dni, cuit_cuil, email, role, status, first_name, last_name, phone, created_at
                     FROM users WHERE 1=1`;
    const params: any[] = [];

    if (role) {
      params.push(role);
      queryText += ` AND role = $${params.length}`;
    }

    if (status) {
      params.push(status);
      queryText += ` AND status = $${params.length}`;
    }

    queryText += ' ORDER BY created_at DESC';

    const result = await query(queryText, params);

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// Create user (SuperAdmin only)
router.post('/', authenticate, authorize('superadmin'), async (req: AuthRequest, res, next) => {
  try {
    const {
      dni,
      cuit_cuil,
      email,
      password,
      role,
      first_name,
      last_name,
      phone,
      phone_secondary,
      address,
      city,
      province,
      postal_code,
      status = 'active',
    } = req.body;

    // Validate required fields
    if (!email || !password || !role || !first_name || !last_name) {
      throw new AppError('Missing required fields', 400);
    }

    // Validate role
    if (!['superadmin', 'admin', 'owner', 'tenant', 'provider'].includes(role)) {
      throw new AppError('Invalid role', 400);
    }

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1 OR (dni IS NOT NULL AND dni = $2) OR (cuit_cuil IS NOT NULL AND cuit_cuil = $3)',
      [email, dni || null, cuit_cuil || null]
    );

    if (existingUser.rows.length > 0) {
      throw new AppError('User with this email, DNI, or CUIT/CUIL already exists', 400);
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user
    const result = await query(
      `INSERT INTO users (
        dni, cuit_cuil, email, password_hash, role, status,
        first_name, last_name, phone, phone_secondary,
        address, city, province, postal_code
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING id, dni, cuit_cuil, email, role, status, first_name, last_name, phone, created_at`,
      [
        dni || null,
        cuit_cuil || null,
        email,
        password_hash,
        role,
        status,
        first_name,
        last_name,
        phone || null,
        phone_secondary || null,
        address || null,
        city || null,
        province || null,
        postal_code || null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Approve/Reject user (Admin/SuperAdmin)
router.put('/:id/status', authenticate, authorize('admin', 'superadmin'), async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive', 'blocked'].includes(status)) {
      throw new AppError('Invalid status', 400);
    }

    const result = await query(
      'UPDATE users SET status = $1 WHERE id = $2 RETURNING id, email, role, status',
      [status, id]
    );

    if (result.rows.length === 0) {
      throw new AppError('User not found', 404);
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

export default router;
