import mysql from 'mysql2/promise';
import { config } from '../config';

async function initDatabase() {
  console.log(`Connecting to MySQL host: ${config.db.host}:${config.db.port} as user: ${config.db.user}...`);
  try {
    const connection = await mysql.createConnection({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
    });

    console.log(`Ensuring database '${config.db.database}' exists...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${config.db.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    console.log(`Database '${config.db.database}' is ready.`);
    await connection.end();
  } catch (error: any) {
    console.error('Failed to initialize database:', error.message);
    process.exit(1);
  }
}

initDatabase();
