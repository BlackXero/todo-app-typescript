import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export const registerSchema = z.object({
  username: z.string().trim().min(3, 'Username must be at least 3 characters').max(30, 'Username cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain alphanumeric characters and underscores'),
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirm_password: z.string().min(6, 'Confirm password must be at least 6 characters'),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, 'Email or Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const todoSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(255, 'Title must be 255 characters or less'),
  description: z.string().trim().optional(),
  status: z.enum(['pending', 'in_progress', 'completed']).default('pending'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  due_date: z.string().optional().nullable().transform((val) => (val && val.trim() !== '' ? val : null)),
});

export const adminTodoSchema = todoSchema.extend({
  user_id: z.coerce.number().int().positive('Please select a valid user'),
});

export function validate(schema: z.ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((e) => e.message).join('. ');
        req.flash('error', errorMessages);
        return res.redirect('back');
      }
      next(error);
    }
  };
}
