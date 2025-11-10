import { Router } from 'express';
import { query } from '../config/database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Create unit (SuperAdmin or Admin)
router.post('/', authenticate, authorize('superadmin', 'admin'), async (req: AuthRequest, res, next) => {
  try {
    const {
      building_id,
      unit_number,
      floor,
      unit_type = 'apartment',
      square_meters,
      percentage,
      owner_id,
      tenant_id,
    } = req.body;

    // Validate required fields
    if (!building_id || !unit_number || !percentage) {
      throw new AppError('Missing required fields: building_id, unit_number, percentage', 400);
    }

    // Check if unit already exists in building
    const existingUnit = await query(
      'SELECT id FROM units WHERE building_id = $1 AND unit_number = $2',
      [building_id, unit_number]
    );

    if (existingUnit.rows.length > 0) {
      throw new AppError('Unit number already exists in this building', 400);
    }

    // Create unit
    const result = await query(
      `INSERT INTO units (building_id, unit_number, floor, unit_type, square_meters, percentage, owner_id, tenant_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [building_id, unit_number, floor || null, unit_type, square_meters || null, percentage, owner_id || null, tenant_id || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Update unit (SuperAdmin or Admin)
router.put('/:id', authenticate, authorize('superadmin', 'admin'), async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const { unit_number, floor, unit_type, area_sqm, owner_id, tenant_id } = req.body;

    const result = await query(
      `UPDATE units
       SET unit_number = COALESCE($1, unit_number),
           floor = COALESCE($2, floor),
           unit_type = COALESCE($3, unit_type),
           area_sqm = COALESCE($4, area_sqm),
           owner_id = COALESCE($5, owner_id),
           tenant_id = COALESCE($6, tenant_id)
       WHERE id = $7
       RETURNING *`,
      [unit_number, floor, unit_type, area_sqm, owner_id, tenant_id, id]
    );

    if (result.rows.length === 0) {
      throw new AppError('Unit not found', 404);
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Delete unit (SuperAdmin or Admin)
router.delete('/:id', authenticate, authorize('superadmin', 'admin'), async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const result = await query('DELETE FROM units WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      throw new AppError('Unit not found', 404);
    }

    res.json({ message: 'Unit deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
