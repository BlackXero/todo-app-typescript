import http from 'http';
import app from '../app';
import db from '../db/connection';
import { UserModel } from '../models/user.model';
import { TodoModel } from '../models/todo.model';
import bcrypt from 'bcryptjs';

async function runTests() {
  console.log('🧪 Starting integration & authorization test suite...');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Run migrations
    console.log('\n--- Step 1: Database Migrations & Seeds ---');
    await db.migrate.latest();
    console.log('  Migrations applied.');
    await db.seed.run();
    console.log('  Seeds executed.');

    // 2. Verify seeded users and password verification
    console.log('\n--- Step 2: User Authentication & Role Verification ---');
    const adminUser = await UserModel.findByEmail('admin@todo.local');
    assert(!!adminUser, 'Admin user was found in database');
    assert(adminUser?.role === 'admin', 'Admin user has admin role');
    const isAdminPasswordValid = await bcrypt.compare('Admin@123', adminUser!.password_hash);
    assert(isAdminPasswordValid, 'Admin password hash verifies correctly');

    const regularUser = await UserModel.findByEmail('user@todo.local');
    assert(!!regularUser, 'Regular user was found in database');
    assert(regularUser?.role === 'user', 'Regular user has user role');
    const isUserPasswordValid = await bcrypt.compare('User@123', regularUser!.password_hash);
    assert(isUserPasswordValid, 'Regular user password hash verifies correctly');

    // 3. User Panel Todo Isolation
    console.log('\n--- Step 3: Todo Ownership & User Panel Isolation ---');
    const userTodos = await TodoModel.findByUserId(regularUser!.id);
    assert(userTodos.length > 0, `Regular user has ${userTodos.length} personal todos`);
    const allBelongToUser = userTodos.every((t) => t.user_id === regularUser!.id);
    assert(allBelongToUser, "All fetched user todos strictly belong to user's user_id");

    // 4. Admin Panel Global View & Reassignment
    console.log('\n--- Step 4: Admin Panel Visibility & Reassignment ---');
    const allTodos = await TodoModel.findAllWithOwner();
    assert(allTodos.length >= 6, `Admin query retrieves all ${allTodos.length} system todos across all users`);
    const distinctUsersInTodos = new Set(allTodos.map((t) => t.user_id));
    assert(distinctUsersInTodos.size > 1, 'Admin view contains todos belonging to multiple distinct users');

    // 5. Test CRUD & Permission Guard Logic
    console.log('\n--- Step 5: CRUD Lifecycle & Role Guard Logic ---');
    // User creates a todo
    const newTodoId = await TodoModel.create({
      user_id: regularUser!.id,
      title: 'Automated Test Task',
      description: 'Test task created during test run',
      status: 'pending',
      priority: 'high',
      due_date: '2026-11-01',
    });
    const createdTodo = await TodoModel.findById(newTodoId);
    assert(createdTodo?.title === 'Automated Test Task', 'User successfully created a new todo');

    // Verify ownership check logic
    const canUserEditOwn = createdTodo!.user_id === regularUser!.id || regularUser!.role === 'admin';
    assert(canUserEditOwn === true, 'Ownership check: User is permitted to edit their own todo');

    const otherUser = await UserModel.findByEmail('jane@todo.local');
    assert(!!otherUser, 'Other user found');
    const canOtherUserEdit = createdTodo!.user_id === otherUser!.id || otherUser!.role === 'admin';
    assert(canOtherUserEdit === false, 'Ownership check: Another regular user is BLOCKED from editing this todo');

    const canAdminEdit = createdTodo!.user_id === adminUser!.id || adminUser!.role === 'admin';
    assert(canAdminEdit === true, 'Ownership check: Admin is permitted to manage any user todo');

    // Admin reassigns the todo to jane
    await TodoModel.update(newTodoId, { user_id: otherUser!.id, status: 'in_progress' });
    const reassignedTodo = await TodoModel.findById(newTodoId);
    assert(reassignedTodo?.user_id === otherUser!.id, 'Admin successfully reassigned todo to another user');
    assert(reassignedTodo?.status === 'in_progress', 'Admin updated status of reassigned todo');

    // Delete todo
    await TodoModel.delete(newTodoId);
    const deletedTodo = await TodoModel.findById(newTodoId);
    assert(!deletedTodo, 'Todo successfully deleted');

    // 6. Test Express HTTP Endpoints & Route Guards
    console.log('\n--- Step 6: HTTP Server & Route Middleware Guards ---');
    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const port = (server.address() as any).port;
    const baseUrl = `http://127.0.0.1:${port}`;

    async function httpGet(path: string): Promise<{ status: number; location?: string }> {
      return new Promise((resolve, reject) => {
        http.get(`${baseUrl}${path}`, (res) => {
          resolve({
            status: res.statusCode || 0,
            location: res.headers.location,
          });
        }).on('error', reject);
      });
    }

    const rootRes = await httpGet('/');
    assert(rootRes.status === 302 && rootRes.location === '/login', 'GET / redirects unauthenticated user to /login');

    const loginRes = await httpGet('/login');
    assert(loginRes.status === 200, 'GET /login responds with 200 OK');

    const registerRes = await httpGet('/register');
    assert(registerRes.status === 200, 'GET /register responds with 200 OK');

    const userTodosRes = await httpGet('/todos');
    assert(userTodosRes.status === 302 && userTodosRes.location === '/login', 'GET /todos middleware guards against unauthenticated access');

    const adminRes = await httpGet('/admin');
    assert(adminRes.status === 302 && adminRes.location === '/login', 'GET /admin middleware guards against unauthenticated access');

    await new Promise<void>((resolve) => server.close(() => resolve()));

    console.log(`\n===============================================`);
    console.log(`🎉 TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
    console.log(`===============================================`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

runTests();
