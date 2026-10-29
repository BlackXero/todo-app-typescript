import { Request, Response, NextFunction } from 'express';
import { TodoModel } from '../models/todo.model';
import { UserModel } from '../models/user.model';
import {faker} from "@faker-js/faker";;

export class AdminController {
  static async dashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await TodoModel.getStats();
      const userCount = await UserModel.countAll();
      const recentTodos = await TodoModel.findAllWithOwner();
      const users = await UserModel.getAllWithTodoCount();

      res.render('admin/dashboard', {
        title: 'Admin Control Center - Todo App',
        stats,
        userCount,
        recentTodos: recentTodos.slice(0, 8),
        users,
      });
    } catch (error) {
      next(error);
    }
  }

  static async todosAdd(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const todos = Array.from({ length: 5000 }, (_, i) => ({
        user_id: 1,
        title: `${faker.lorem.sentence(4)} => ${i + 1}`,
        description: faker.lorem.paragraph({ min: 1, max: 5 }),
        status: 'pending' as const,
        priority: 'high' as const,
        due_date: null,
      }));

      await TodoModel.massInsert(todos);
      req.flash('success', 'Admin action: New todo successfully assigned and created.');
      res.redirect('/admin/todos');
    } catch (error) {
      next(error);
    }
  }

  static async todosList(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { status, priority, userId, search, page } = req.query as {
      status?: string;
      priority?: string;
      userId?: string;
      search?: string;
      page?: string;
    };

    try {
      const parsedUserId = userId && userId !== 'all' ? Number(userId) : undefined;
      const currentPage = Math.max(1, parseInt(page || '1', 10) || 1);
      const limit = 50;

      const { todos, total } = await TodoModel.paginate({
        status,
        priority,
        userId: parsedUserId,
        search,
        page: currentPage,
        limit,
      });

      const totalPages = Math.ceil(total / limit) || 1;
      const users = await UserModel.getAllWithTodoCount();
      const stats = await TodoModel.getStats();

      res.render('admin/todos', {
        title: 'All Todos Management - Admin Panel',
        todos,
        users,
        stats,
        pagination: {
          currentPage,
          totalPages,
          totalCount: total,
          limit,
        },
        filters: {
          status: status || 'all',
          priority: priority || 'all',
          userId: userId || 'all',
          search: search || '',
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async createTodo(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { user_id, title, description, status, priority, due_date } = req.body;

    try {
      await TodoModel.create({
        user_id: Number(user_id),
        title,
        description: description || null,
        status: status || 'pending',
        priority: priority || 'medium',
        due_date: due_date || null,
      });

      req.flash('success', 'Admin action: New todo successfully assigned and created.');
      res.redirect('/admin/todos');
    } catch (error) {
      next(error);
    }
  }

  static async updateTodo(req: Request, res: Response, next: NextFunction): Promise<void> {
    const todoId = Number(req.params.id);
    const { user_id, title, description, status, priority, due_date } = req.body;

    try {
      await TodoModel.update(todoId, {
        user_id: Number(user_id),
        title,
        description: description || null,
        status,
        priority,
        due_date: due_date || null,
      });

      req.flash('success', `Admin action: Todo #${todoId} updated successfully.`);
      res.redirect('/admin/todos');
    } catch (error) {
      next(error);
    }
  }

  static async deleteTodo(req: Request, res: Response, next: NextFunction): Promise<void> {
    const todoId = Number(req.params.id);

    try {
      await TodoModel.delete(todoId);
      req.flash('success', `Admin action: Todo #${todoId} deleted successfully.`);
      res.redirect('back');
    } catch (error) {
      next(error);
    }
  }
}
