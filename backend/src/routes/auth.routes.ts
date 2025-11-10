import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { query } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

// Login
router.post(
  '/login',
  authLimiter,
  [
    body('identifier').notEmpty().withMessage('DNI/CUIT or email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Validation error', 400, errors.array());
      }

      const { identifier, password } = req.body;

      // Find user by DNI, CUIT or email
      const result = await query(
        `SELECT * FROM users
         WHERE (dni = $1 OR cuit_cuil = $1 OR email = $1)
         AND status != 'blocked'`,
        [identifier]
      );

      if (result.rows.length === 0) {
        throw new AppError('Invalid credentials', 401);
      }

      const user = result.rows[0];

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);

      if (!isValidPassword) {
        throw new AppError('Invalid credentials', 401);
      }

      // Check if user is active
      if (user.status === 'pending') {
        throw new AppError('Your account is pending approval', 403);
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
          dni: user.dni,
        },
        process.env.JWT_SECRET!,
        { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as string }
      );

      // Update last login
      await query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

      // Remove password from response
      delete user.password_hash;

      res.json({
        token,
        user,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Register (Owner/Tenant)
router.post(
  '/register',
  [
    body('dni').isLength({ min: 7, max: 10 }).withMessage('Valid DNI is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('first_name').notEmpty().withMessage('First name is required'),
    body('last_name').notEmpty().withMessage('Last name is required'),
    body('role').isIn(['owner', 'tenant']).withMessage('Role must be owner or tenant'),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Validation error', 400, errors.array());
      }

      const { dni, email, password, first_name, last_name, phone, role } = req.body;

      // Check if user already exists
      const existingUser = await query(
        'SELECT id FROM users WHERE dni = $1 OR email = $2',
        [dni, email]
      );

      if (existingUser.rows.length > 0) {
        throw new AppError('User with this DNI or email already exists', 400);
      }

      // Hash password
      const password_hash = await bcrypt.hash(password, 10);

      // Create user
      const result = await query(
        `INSERT INTO users (dni, email, password_hash, role, first_name, last_name, phone, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
         RETURNING id, dni, email, role, first_name, last_name, status, created_at`,
        [dni, email, password_hash, role, first_name, last_name, phone]
      );

      res.status(201).json({
        message: 'Registration successful. Waiting for administrator approval.',
        user: result.rows[0],
      });
    } catch (error) {
      next(error);
    }
  }
);

// Register Provider
router.post(
  '/register-provider',
  [
    body('cuit_cuil').isLength({ min: 11, max: 13 }).withMessage('Valid CUIT/CUIL is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('first_name').notEmpty().withMessage('First name is required'),
    body('last_name').notEmpty().withMessage('Last name is required'),
    body('company_name').notEmpty().withMessage('Company name is required'),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Validation error', 400, errors.array());
      }

      const { cuit_cuil, email, password, first_name, last_name, phone, company_name, business_type } = req.body;

      // Check if user already exists
      const existingUser = await query(
        'SELECT id FROM users WHERE cuit_cuil = $1 OR email = $2',
        [cuit_cuil, email]
      );

      if (existingUser.rows.length > 0) {
        throw new AppError('Provider with this CUIT/CUIL or email already exists', 400);
      }

      // Hash password
      const password_hash = await bcrypt.hash(password, 10);

      // Create user
      const userResult = await query(
        `INSERT INTO users (cuit_cuil, email, password_hash, role, first_name, last_name, phone, status)
         VALUES ($1, $2, $3, 'provider', $4, $5, $6, 'pending')
         RETURNING id, cuit_cuil, email, role, first_name, last_name, status, created_at`,
        [cuit_cuil, email, password_hash, first_name, last_name, phone]
      );

      const userId = userResult.rows[0].id;

      // Create provider profile
      await query(
        `INSERT INTO providers (user_id, company_name, business_type)
         VALUES ($1, $2, $3)`,
        [userId, company_name, business_type]
      );

      res.status(201).json({
        message: 'Provider registration successful. Waiting for administrator approval.',
        user: userResult.rows[0],
      });
    } catch (error) {
      next(error);
    }
  }
);

// Verify email
router.post('/verify-email', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token: _token } = req.body;

    // TODO: Implement email verification logic
    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    next(error);
  }
});

// Request password reset
router.post('/forgot-password', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email: _email } = req.body;

    // TODO: Implement password reset logic
    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    next(error);
  }
});

export default router;
