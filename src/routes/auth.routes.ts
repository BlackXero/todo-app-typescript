import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { redirectIfAuthenticated } from '../middlewares/auth.middleware';
import { validate, loginSchema, registerSchema } from '../middlewares/validation.middleware';

const router = Router();

router.get('/login', redirectIfAuthenticated, AuthController.showLogin);
router.post('/login', redirectIfAuthenticated, validate(loginSchema), AuthController.login);

router.get('/register', redirectIfAuthenticated, AuthController.showRegister);
router.post('/register', redirectIfAuthenticated, validate(registerSchema), AuthController.register);

router.post('/logout', AuthController.logout);
router.get('/logout', AuthController.logout);

export default router;
