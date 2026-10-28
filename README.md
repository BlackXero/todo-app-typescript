# TodoFlow - Two-Panel Todo Application (TypeScript, Express.js, MySQL & EJS)

A full-stack, enterprise-ready Todo web application built with TypeScript and Express.js featuring dual-panel Role-Based Access Control (RBAC):
- **User Panel (`/todos`)**: Authenticated users can create, view, filter, edit, toggle completion, and delete **only their own** todos.
- **Admin Panel (`/admin`)**: Administrators have full system oversight with metrics, can view all todos across all users, create/edit/delete any task, and reassign tasks between users.

---

## Features
- **TypeScript Architecture**: Strict type checking with clean separation of models, controllers, routes, and middleware.
- **Role-Based Access Control (RBAC)**: Custom middlewares enforce session-based route security (`requireAuth`, `requireAdmin`, `canManageTodo`).
- **Relational Database with Migrations**: Knex.js migrations and seeds for MySQL database versioning.
- **Server-Side Rendered (SSR)**: Express with EJS templates and modern UI powered by Bootstrap 5 and Bootstrap Icons.
- **Input Validation**: Schema validation using Zod for signup, login, and todo manipulation.
- **Automated Integration Test Suite**: 23 automated tests verifying authorization isolation, CRUD lifecycle, and HTTP guards.

---

## Default Seeded Accounts
| Role | Email | Username | Password |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@todo.local` | `admin` | `Admin@123` |
| **User** | `user@todo.local` | `john_doe` | `User@123` |
| **User** | `jane@todo.local` | `jane_doe` | `User@123` |

---

## Quick Start

### 1. Configure MySQL Database
Edit the `.env` file with your MySQL credentials:
```env
PORT=3000
NODE_ENV=development
SESSION_SECRET=super_secret_session_key_change_in_production_123456

# MySQL Database Configuration
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=todo_app
```

### 2. Initialize Database & Run Migrations
Run the database setup script to create the MySQL database if it does not exist:
```bash
npm run setup:db
```

Apply migrations and populate sample data:
```bash
npm run migrate:latest
npm run seed:run
```

### 3. Start the Server
For development with live reloading:
```bash
npm run dev
```

For production build and start:
```bash
npm run build
npm start
```

Visit the application at: **`http://localhost:3000`**

---

## Automated Tests
Run the automated test suite (runs against in-memory isolated engine with full migration & seed execution):
```bash
npm test
```

---

## Project Structure
```
typescript-app/
├── knexfile.ts              # Knex database configuration
├── package.json             # NPM package scripts & dependencies
├── tsconfig.json            # TypeScript configuration
├── .env                     # Environment variables
├── src/
│   ├── config/              # Centralized environment & Knex config
│   ├── db/
│   │   ├── connection.ts    # Knex query builder instance
│   │   ├── migrations/      # Knex database schema migrations
│   │   └── seeds/           # Initial demo data & users
│   ├── middlewares/
│   │   ├── auth.middleware.ts       # RBAC & ownership guards
│   │   ├── validation.middleware.ts # Zod schema validators
│   │   └── error.middleware.ts      # 404 & 500 error handlers
│   ├── models/
│   │   ├── user.model.ts    # User DB queries & password checks
│   │   └── todo.model.ts    # Todo DB queries & status filters
│   ├── controllers/
│   │   ├── auth.controller.ts       # Login, Register, Logout
│   │   ├── todo.controller.ts       # User panel CRUD
│   │   └── admin.controller.ts      # Admin panel management
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── todo.routes.ts
│   │   ├── admin.routes.ts
│   │   └── index.ts
│   ├── views/               # EJS templates & partials
│   │   ├── partials/        # Navbar, Header, Footer, Flash alerts
│   │   ├── auth/            # Login & Register views
│   │   ├── user/            # User panel dashboard
│   │   ├── admin/           # Admin panel & all-todos table
│   │   └── error.ejs        # 403 / 404 / 500 template
│   ├── public/              # CSS & JS assets
│   ├── tests/
│   │   └── integration.test.ts # Automated test suite
│   ├── app.ts               # Express application setup
│   └── server.ts            # Entrypoint listener
```
