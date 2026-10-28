import { Router } from 'express';
import { TodoController } from '../controllers/todo.controller';
import { requireAuth, canManageTodo } from '../middlewares/auth.middleware';
import { validate, todoSchema } from '../middlewares/validation.middleware';

const router = Router();

// All todo routes require authentication
router.use(requireAuth);

router.get('/', TodoController.index);
router.post('/', validate(todoSchema), TodoController.create);
router.post('/:id/update', canManageTodo, validate(todoSchema), TodoController.update);
router.post('/:id/toggle', canManageTodo, TodoController.toggleStatus);
router.post('/:id/delete', canManageTodo, TodoController.delete);

export default router;
