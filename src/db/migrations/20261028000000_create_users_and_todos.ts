import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create users table
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('username', 50).notNullable().unique();
    table.string('email', 100).notNullable().unique();
    table.string('password_hash', 255).notNullable();
    table.enum('role', ['user', 'admin']).notNullable().defaultTo('user');
    table.timestamps(true, true);
  });

  // Create todos table
  await knex.schema.createTable('todos', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable()
      .references('id').inTable('users')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
    table.string('title', 255).notNullable();
    table.text('description').nullable();
    table.enum('status', ['pending', 'in_progress', 'completed']).notNullable().defaultTo('pending');
    table.enum('priority', ['low', 'medium', 'high']).notNullable().defaultTo('medium');
    table.date('due_date').nullable();
    table.timestamps(true, true);

    table.index(['user_id']);
    table.index(['status']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('todos');
  await knex.schema.dropTableIfExists('users');
}
