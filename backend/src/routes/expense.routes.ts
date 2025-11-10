import { Router } from 'express';
import { query } from '../config/database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

// Get expenses for a building
router.get('/building/:buildingId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { buildingId } = req.params;

    const result = await query(
      `SELECT * FROM expenses
       WHERE building_id = $1
       ORDER BY period DESC`,
      [buildingId]
    );

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// Get my expenses (Owner/Tenant)
router.get('/my-expenses', authenticate, authorize('owner', 'tenant'), async (req: AuthRequest, res, next) => {
  try {
    const result = await query(
      `SELECT e.*, ue.*, u.unit_number, b.name as building_name
       FROM unit_expenses ue
       JOIN expenses e ON ue.expense_id = e.id
       JOIN units u ON ue.unit_id = u.id
       JOIN buildings b ON e.building_id = b.id
       WHERE (u.owner_id = $1 OR u.tenant_id = $1)
       AND e.status = 'published'
       ORDER BY e.period DESC
       LIMIT 12`,
      [req.user!.id]
    );

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// Create expense (Admin)
router.post('/', authenticate, authorize('admin', 'superadmin'), async (req: AuthRequest, res, next) => {
  try {
    const { building_id, period, due_date, total_amount, details } = req.body;

    const result = await query(
      `INSERT INTO expenses (building_id, period, due_date, total_amount, details, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [building_id, period, due_date, total_amount, details, req.user!.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

export default router;
