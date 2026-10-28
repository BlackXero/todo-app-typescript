/// <reference path="../@types/express-session.d.ts" />
import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';
import todoRoutes from './todo.routes';
import adminRoutes from './admin.routes';

const router = Router();

// Root route redirects based on session
router.get('/', (req: Request, res: Response) => {
  if (req.session.user) {
    if (req.session.user.role === 'admin') {
      return res.redirect('/admin');
    }
    return res.redirect('/todos');
  }
  return res.redirect('/login');
});

router.use('/', authRoutes);
router.use('/todos', todoRoutes);
router.use('/admin', adminRoutes);

export default router;
