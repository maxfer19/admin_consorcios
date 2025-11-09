import { Router } from 'express';
import { query } from '../config/database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Get communications for a building
router.get('/building/:buildingId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { buildingId } = req.params;

    const result = await query(
      `SELECT c.*, u.first_name || ' ' || u.last_name as created_by_name
       FROM communications c
       LEFT JOIN users u ON c.created_by = u.id
       WHERE c.building_id = $1
       AND c.is_published = true
       ORDER BY c.created_at DESC`,
      [buildingId]
    );

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// Create communication (Admin)
router.post('/', authenticate, authorize('admin', 'superadmin'), async (req: AuthRequest, res, next) => {
  try {
    const { building_id, type, title, content, target_roles, target_units, is_important, is_urgent } = req.body;

    const result = await query(
      `INSERT INTO communications (building_id, type, title, content, target_roles, target_units, is_important, is_urgent, created_by, is_published, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, CURRENT_TIMESTAMP)
       RETURNING *`,
      [building_id, type, title, content, target_roles, target_units, is_important, is_urgent, req.user!.id]
    );

    // TODO: Send notifications to users
    const io = req.app.get('io');
    io.to(`building-${building_id}`).emit('new-communication', result.rows[0]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Mark communication as read
router.post('/:id/read', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    await query(
      `INSERT INTO communication_reads (communication_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT (communication_id, user_id) DO NOTHING`,
      [id, req.user!.id]
    );

    res.json({ message: 'Communication marked as read' });
  } catch (error) {
    next(error);
  }
});

export default router;
