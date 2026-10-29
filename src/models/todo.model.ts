import db from '../db/connection';

export interface Todo {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date: string | Date | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface TodoWithOwner extends Todo {
  username: string;
  email: string;
}

export interface TodoFilters {
  status?: string;
  priority?: string;
  search?: string;
  userId?: number;
  page?: number;
  limit?: number;
}

export class TodoModel {
  static async findById(id: number): Promise<Todo | undefined> {
    return db<Todo>('todos').where({ id }).first();
  }

  static async findByIdWithOwner(id: number): Promise<TodoWithOwner | undefined> {
    return db('todos')
      .join('users', 'todos.user_id', 'users.id')
      .select('todos.*', 'users.username', 'users.email')
      .where('todos.id', id)
      .first();
  }

  static async findByUserId(userId: number, filters: TodoFilters = {}): Promise<Todo[]> {
    let query = db<Todo>('todos').where('user_id', userId);

    if (filters.status && filters.status !== 'all') {
      query = query.andWhere('status', filters.status);
    }
    if (filters.priority && filters.priority !== 'all') {
      query = query.andWhere('priority', filters.priority);
    }
    if (filters.search && filters.search.trim() !== '') {
      const term = `%${filters.search.trim()}%`;
      query = query.andWhere((builder) => {
        builder.where('title', 'like', term).orWhere('description', 'like', term);
      });
    }

    return query.orderBy('created_at', 'desc');
  }

  private static applyFilters(query: any, filters: TodoFilters): void {
    if (filters.userId) {
      query.andWhere('todos.user_id', filters.userId);
    }
    if (filters.status && filters.status !== 'all') {
      query.andWhere('todos.status', filters.status);
    }
    if (filters.priority && filters.priority !== 'all') {
      query.andWhere('todos.priority', filters.priority);
    }
    if (filters.search && filters.search.trim() !== '') {
      const term = `%${filters.search.trim()}%`;
      query.andWhere((builder: any) => {
        builder
          .where('todos.title', 'like', term)
          .orWhere('todos.description', 'like', term)
          .orWhere('users.username', 'like', term)
          .orWhere('users.email', 'like', term);
      });
    }
  }

  static async findAllWithOwner(filters: TodoFilters = {}): Promise<TodoWithOwner[]> {
    let query = db('todos')
      .join('users', 'todos.user_id', 'users.id')
      .select('todos.*', 'users.username', 'users.email');

    this.applyFilters(query, filters);

    if (filters.limit) {
      query = query.limit(filters.limit);
      if (filters.page && filters.page > 1) {
        query = query.offset((filters.page - 1) * filters.limit);
      }
    }

    return query.orderBy('todos.created_at', 'desc');
  }

  static async paginate(filters: TodoFilters = {}): Promise<{ todos: TodoWithOwner[]; total: number }> {
    const page = Math.max(1, filters.page || 1);
    const limit = filters.limit || 50;

    const dataQuery = db('todos')
      .join('users', 'todos.user_id', 'users.id')
      .select('todos.*', 'users.username', 'users.email');

    const countQuery = db('todos')
      .join('users', 'todos.user_id', 'users.id');

    this.applyFilters(dataQuery, filters);
    this.applyFilters(countQuery, filters);

    const [todos, countRes] = await Promise.all([
      dataQuery
        .orderBy('todos.created_at', 'desc')
        .limit(limit)
        .offset((page - 1) * limit),
      countQuery.count<{ count: number | string }[]>({ count: 'todos.id' }),
    ]);

    return {
      todos,
      total: Number(countRes[0]?.count || 0),
    };
  }

  static async create(todo: Omit<Todo, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    const [id] = await db('todos').insert(todo);
    return id;
  }

  static async massInsert(todos: Omit<Todo, 'id' | 'created_at' | 'updated_at'>[]): Promise<void> {
    await db('todos').insert(todos);
  }

  static async update(id: number, data: Partial<Omit<Todo, 'id' | 'created_at' | 'updated_at'>>): Promise<number> {
    return db('todos').where({ id }).update({
      ...data,
      updated_at: db.fn.now(),
    });
  }

  static async delete(id: number): Promise<number> {
    return db('todos').where({ id }).del();
  }

  static async getStats(): Promise<{
    total: number;
    pending: number;
    in_progress: number;
    completed: number;
  }> {
    const totalRes = await db('todos').count<{ count: number }[]>('id as count');
    const pendingRes = await db('todos').where('status', 'pending').count<{ count: number }[]>('id as count');
    const inProgressRes = await db('todos').where('status', 'in_progress').count<{ count: number }[]>('id as count');
    const completedRes = await db('todos').where('status', 'completed').count<{ count: number }[]>('id as count');

    return {
      total: Number(totalRes[0]?.count || 0),
      pending: Number(pendingRes[0]?.count || 0),
      in_progress: Number(inProgressRes[0]?.count || 0),
      completed: Number(completedRes[0]?.count || 0),
    };
  }

  static async getUserStats(userId: number): Promise<{
    total: number;
    pending: number;
    in_progress: number;
    completed: number;
  }> {
    const totalRes = await db('todos').where({ user_id: userId }).count<{ count: number }[]>('id as count');
    const pendingRes = await db('todos').where({ user_id: userId, status: 'pending' }).count<{ count: number }[]>('id as count');
    const inProgressRes = await db('todos').where({ user_id: userId, status: 'in_progress' }).count<{ count: number }[]>('id as count');
    const completedRes = await db('todos').where({ user_id: userId, status: 'completed' }).count<{ count: number }[]>('id as count');

    return {
      total: Number(totalRes[0]?.count || 0),
      pending: Number(pendingRes[0]?.count || 0),
      in_progress: Number(inProgressRes[0]?.count || 0),
      completed: Number(completedRes[0]?.count || 0),
    };
  }
}
