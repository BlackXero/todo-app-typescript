import type { Knex } from 'knex';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const knexConfig: { [key: string]: Knex.Config } = {
  development: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'todo_app',
    },
    migrations: {
      directory: path.join(__dirname, '../db/migrations'),
      extension: 'ts',
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: path.join(__dirname, '../db/seeds'),
      extension: 'ts',
    },
  },
  test: {
    client: 'sqlite3',
    connection: {
      filename: ':memory:',
    },
    useNullAsDefault: true,
    migrations: {
      directory: path.join(__dirname, '../db/migrations'),
      extension: 'ts',
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: path.join(__dirname, '../db/seeds'),
      extension: 'ts',
    },
  },
  production: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    },
    migrations: {
      directory: path.join(__dirname, '../db/migrations'),
      extension: 'js',
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: path.join(__dirname, '../db/seeds'),
      extension: 'js',
    },
    pool: {
      min: 2,
      max: 10,
    },
  },
};

export default knexConfig;
