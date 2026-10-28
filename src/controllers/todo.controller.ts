import { Request, Response, NextFunction } from 'express';
import { TodoModel, Todo } from '../models/todo.model';

export class TodoController {
  static async index(req: Request, res: Response, next: NextFunction): Promise<void> {
    const userId = req.session.user!.id;
    const { status, priority, search } = req.query as {
      status?: string;
      priority?: string;
      search?: string;
    };

    try {
      const todos = await TodoModel.findByUserId(userId, { status, priority, search });
      const stats = await TodoModel.getUserStats(userId);

      res.render('user/dashboard', {
        title: 'My Todos - User Panel',
        todos,
        stats,
        filters: {
          status: status || 'all',
          priority: priority || 'all',
          search: search || '',
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    const userId = req.session.user!.id;
    const { title, description, status, priority, due_date } = req.body;

    try {
      await TodoModel.create({
        user_id: userId,
        title,
        description: description || null,
        status: status || 'pending',
        priority: priority || 'medium',
        due_date: due_date || null,
      });

      req.flash('success', 'Todo created successfully!');
      res.redirect('/todos');
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    const todoId = Number(req.params.id);
    const { title, description, status, priority, due_date } = req.body;

    try {
      await TodoModel.update(todoId, {
        title,
        description: description || null,
        status,
        priority,
        due_date: due_date || null,
      });

      req.flash('success', 'Todo updated successfully.');
      res.redirect('/todos');
    } catch (error) {
      next(error);
    }
  }

  static async toggleStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    const todoId = Number(req.params.id);
    const targetTodo = res.locals.targetTodo as Todo;

    try {
      const newStatus = targetTodo.status === 'completed' ? 'pending' : 'completed';
      await TodoModel.update(todoId, { status: newStatus });

      req.flash('success', `Todo marked as ${newStatus === 'completed' ? 'completed' : 'pending'}.`);
      res.redirect('/todos');
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    const todoId = Number(req.params.id);

    try {
      await TodoModel.delete(todoId);
      req.flash('success', 'Todo deleted successfully.');
      res.redirect('/todos');
    } catch (error) {
      next(error);
    }
  }
}
