import { Router } from 'express';
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
