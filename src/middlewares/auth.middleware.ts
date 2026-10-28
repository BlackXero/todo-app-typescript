/// <reference path="../@types/express-session.d.ts" />
import { Request, Response, NextFunction } from 'express';
import { TodoModel } from '../models/todo.model';

export function populateLocals(req: Request, res: Response, next: NextFunction): void {
  res.locals.currentUser = req.session.user || null;
  res.locals.isAuthenticated = Boolean(req.session.user);
  res.locals.isAdmin = req.session.user?.role === 'admin';
  res.locals.currentPath = req.path;
  res.locals.successMessage = req.flash('success');
  res.locals.errorMessage = req.flash('error');
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.session.user) {
    req.flash('error', 'Please log in to access this page.');
    return res.redirect('/login');
  }
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.session.user) {
    req.flash('error', 'Please log in to access this page.');
    return res.redirect('/login');
  }

  if (req.session.user.role !== 'admin') {
    req.flash('error', 'Access denied. Administrator privileges required.');
    return res.status(403).render('error', {
      title: '403 - Forbidden',
      statusCode: 403,
      message: 'Access Denied: You do not have permission to access the Admin Panel.',
    });
  }

  next();
}

export function redirectIfAuthenticated(req: Request, res: Response, next: NextFunction): void {
  if (req.session.user) {
    if (req.session.user.role === 'admin') {
      return res.redirect('/admin');
    }
    return res.redirect('/todos');
  }
  next();
}

export async function canManageTodo(req: Request, res: Response, next: NextFunction): Promise<void> {
  const todoId = Number(req.params.id);
  if (isNaN(todoId)) {
    req.flash('error', 'Invalid Todo ID.');
    return res.redirect('back');
  }

  try {
    const todo = await TodoModel.findById(todoId);
    if (!todo) {
      req.flash('error', 'Todo item not found.');
      return res.redirect('back');
    }

    const currentUser = req.session.user;
    if (!currentUser) {
      req.flash('error', 'Please log in.');
      return res.redirect('/login');
    }

    // Admin can manage any todo; User can only manage their own
    if (currentUser.role !== 'admin' && todo.user_id !== currentUser.id) {
      req.flash('error', 'Forbidden: You can only edit or delete your own todos.');
      return res.status(403).render('error', {
        title: '403 - Unauthorized Modification',
        statusCode: 403,
        message: 'You are not authorized to modify or delete this todo item.',
      });
    }

    // Attach todo to res.locals for convenient reuse in controllers
    res.locals.targetTodo = todo;
    next();
  } catch (error) {
    next(error);
  }
}
