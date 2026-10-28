import db from '../db/connection';

export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'user';
  created_at?: Date;
  updated_at?: Date;
}

export class UserModel {
  static async findById(id: number): Promise<User | undefined> {
    return db<User>('users').where({ id }).first();
  }

  static async findByEmail(email: string): Promise<User | undefined> {
    return db<User>('users').where({ email }).first();
  }

  static async findByUsername(username: string): Promise<User | undefined> {
    return db<User>('users').where({ username }).first();
  }

  static async create(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    const [id] = await db('users').insert(user);
    return id;
  }

  static async getAllWithTodoCount(): Promise<Array<User & { todo_count: number }>> {
    return db('users')
      .leftJoin('todos', 'users.id', 'todos.user_id')
      .select(
        'users.id',
        'users.username',
        'users.email',
        'users.role',
        'users.created_at',
        db.raw('COUNT(todos.id) as todo_count')
      )
      .groupBy('users.id', 'users.username', 'users.email', 'users.role', 'users.created_at')
      .orderBy('users.id', 'asc');
  }

  static async countAll(): Promise<number> {
    const result = await db('users').count<{ count: number }[]>('id as count');
    return Number(result[0]?.count || 0);
  }
}
