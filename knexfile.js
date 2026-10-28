"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const config = {
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
            directory: path_1.default.join(__dirname, 'src/db/migrations'),
            extension: 'ts',
            tableName: 'knex_migrations',
        },
        seeds: {
            directory: path_1.default.join(__dirname, 'src/db/seeds'),
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
            directory: path_1.default.join(__dirname, 'dist/db/migrations'),
            extension: 'js',
            tableName: 'knex_migrations',
        },
        seeds: {
            directory: path_1.default.join(__dirname, 'dist/db/seeds'),
            extension: 'js',
        },
        pool: {
            min: 2,
            max: 10,
        },
    },
};
exports.default = config;
