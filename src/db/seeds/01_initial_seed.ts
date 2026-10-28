import type { Knex } from 'knex';
import bcrypt from 'bcryptjs';

export async function seed(knex: Knex): Promise<void> {
  // Clear existing entries
  await knex('todos').del();
  await knex('users').del();

  const saltRounds = 10;
  const adminPasswordHash = await bcrypt.hash('Admin@123', saltRounds);
  const userPasswordHash = await bcrypt.hash('User@123', saltRounds);

  // Insert seed users
  const [adminId] = await knex('users').insert({
    username: 'admin',
    email: 'admin@todo.local',
    password_hash: adminPasswordHash,
    role: 'admin',
  });

  const [userId1] = await knex('users').insert({
    username: 'john_doe',
    email: 'user@todo.local',
    password_hash: userPasswordHash,
    role: 'user',
  });

  const [userId2] = await knex('users').insert({
    username: 'jane_doe',
    email: 'jane@todo.local',
    password_hash: userPasswordHash,
    role: 'user',
  });

  // Calculate some sample due dates
  const today = new Date();
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  // Insert sample todos
  await knex('todos').insert([
    {
      user_id: userId1,
      title: 'Complete TypeScript Todo App',
      description: 'Implement Admin & User panels with proper middleware, Knex migrations, and EJS templates.',
      status: 'in_progress',
      priority: 'high',
      due_date: nextWeek,
    },
    {
      user_id: userId1,
      title: 'Buy groceries for the week',
      description: 'Milk, oats, fruits, ground coffee, and vegetables.',
      status: 'completed',
      priority: 'low',
      due_date: today,
    },
    {
      user_id: userId1,
      title: 'Prepare project documentation',
      description: 'Write setup instructions and architecture walkthrough.',
      status: 'pending',
      priority: 'medium',
      due_date: nextMonth,
    },
    {
      user_id: userId2,
      title: 'Design Marketing Campaign banner',
      description: 'Create high-res vector graphics in Figma for Q4 product announcement.',
      status: 'pending',
      priority: 'high',
      due_date: nextWeek,
    },
    {
      user_id: userId2,
      title: 'Review pull request #42',
      description: 'Check database index optimizations and middleware security patches.',
      status: 'in_progress',
      priority: 'medium',
      due_date: nextWeek,
    },
    {
      user_id: adminId,
      title: 'Server maintenance and log audit',
      description: 'Review production error logs and verify SSL certificate expiration dates.',
      status: 'pending',
      priority: 'high',
      due_date: nextWeek,
    },
  ]);
}
