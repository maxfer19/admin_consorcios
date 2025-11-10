import { Router } from 'express';
import { query } from '../config/database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Get all buildings
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    let queryText = '';
    let params: any[] = [];

    if (req.user!.role === 'superadmin') {
      queryText = `SELECT b.*, u.first_name || ' ' || u.last_name as admin_name
                   FROM buildings b
                   LEFT JOIN users u ON b.admin_id = u.id
                   ORDER BY b.created_at DESC`;
    } else if (req.user!.role === 'admin') {
      queryText = `SELECT * FROM buildings WHERE admin_id = $1 ORDER BY created_at DESC`;
      params = [req.user!.id];
    } else {
      // For owners/tenants, get their buildings
      queryText = `SELECT DISTINCT b.*
                   FROM buildings b
                   JOIN units u ON b.id = u.building_id
                   WHERE u.owner_id = $1 OR u.tenant_id = $1
                   ORDER BY b.created_at DESC`;
      params = [req.user!.id];
    }

    const result = await query(queryText, params);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// Get building by ID
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT b.*, u.first_name || ' ' || u.last_name as admin_name, u.email as admin_email, u.phone as admin_phone
       FROM buildings b
       LEFT JOIN users u ON b.admin_id = u.id
       WHERE b.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new AppError('Building not found', 404);
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Create building (SuperAdmin)
router.post('/', authenticate, authorize('superadmin'), async (req: AuthRequest, res, next) => {
  try {
    const { cuit, name, legal_name, address, city, province, postal_code, total_units, building_type, floors, year_built, admin_id } = req.body;

    const result = await query(
      `INSERT INTO buildings (cuit, name, legal_name, address, city, province, postal_code, total_units, building_type, floors, year_built, admin_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [cuit, name, legal_name, address, city, province, postal_code, total_units, building_type, floors, year_built, admin_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Update building
router.put('/:id', authenticate, authorize('admin', 'superadmin'), async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const { name, address, city, province, config, is_active, admin_id } = req.body;

    const result = await query(
      `UPDATE buildings
       SET name = COALESCE($1, name),
           address = COALESCE($2, address),
           city = COALESCE($3, city),
           province = COALESCE($4, province),
           config = COALESCE($5, config),
           is_active = COALESCE($6, is_active),
           admin_id = COALESCE($7, admin_id)
       WHERE id = $8
       RETURNING *`,
      [name, address, city, province, config, is_active, admin_id, id]
    );

    if (result.rows.length === 0) {
      throw new AppError('Building not found', 404);
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Delete building (SuperAdmin only)
router.delete('/:id', authenticate, authorize('superadmin'), async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    // Check if building has units
    const unitsResult = await query('SELECT COUNT(*) as count FROM units WHERE building_id = $1', [id]);
    const unitCount = parseInt(unitsResult.rows[0].count);

    if (unitCount > 0) {
      throw new AppError(`Cannot delete building with ${unitCount} existing units. Delete units first.`, 400);
    }

    const result = await query('DELETE FROM buildings WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      throw new AppError('Building not found', 404);
    }

    res.json({ message: 'Building deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Get units for a building
router.get('/:id/units', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT u.*,
              o.first_name || ' ' || o.last_name as owner_name,
              t.first_name || ' ' || t.last_name as tenant_name
       FROM units u
       LEFT JOIN users o ON u.owner_id = o.id
       LEFT JOIN users t ON u.tenant_id = t.id
       WHERE u.building_id = $1
       ORDER BY u.floor, u.unit_number`,
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

export default router;
