import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { requireAdmin } from '../middlewares/auth.middleware';
import { validate, adminTodoSchema } from '../middlewares/validation.middleware';

const router = Router();

// All admin routes require admin privileges
router.use(requireAdmin);

router.get('/', AdminController.dashboard);
router.get('/todos', AdminController.todosList);
router.post('/todos', validate(adminTodoSchema), AdminController.createTodo);
router.post('/todos/:id/update', validate(adminTodoSchema), AdminController.updateTodo);
router.post('/todos/:id/delete', AdminController.deleteTodo);

export default router;
