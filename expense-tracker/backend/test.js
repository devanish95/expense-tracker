const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const dotenv = require('dotenv');

dotenv.config();
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_key_12345';

let mongoServer;
let app;

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

const passedTests = [];
const failedTests = [];

function assert(condition, description) {
  if (condition) {
    console.log(`  ${GREEN}✓ PASS:${RESET} ${description}`);
    passedTests.push(description);
  } else {
    console.error(`  ${RED}✗ FAIL:${RESET} ${description}`);
    failedTests.push(description);
  }
}

async function runTests() {
  console.log(`\n${BLUE}==================================================${RESET}`);
  console.log(`${BLUE}  Starting Expense Tracker Full-Stack Test Suite  ${RESET}`);
  console.log(`${BLUE}==================================================\n${RESET}`);

  try {
    mongoServer = await MongoMemoryServer.create();

    const uri = mongoServer.getUri();
    process.env.MONGODB_URI = uri;

    await mongoose.connect(uri);

    console.log(
      `${GREEN}✓ In-memory MongoDB connected for test suite${RESET}\n`
    );

    app = require('./server');

    let userAToken = '';
    let userAId = '';
    let userBToken = '';
    let userBId = '';
    let userATxId = '';

    console.log(
      `${BLUE}[1] Testing User Registration & Validation${RESET}`
    );

    const regResA = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Alice Johnson',
        email: 'alice@example.com',
        password: 'password123'
      });

    assert(
      regResA.status === 201,
      'User A registered successfully (Status 201)'
    );

    assert(
      regResA.body.token !== undefined,
      'User A received a valid JWT token'
    );

    assert(
      regResA.body.user.password === undefined,
      'Password is NOT exposed in response payload'
    );

    assert(
      regResA.body.user.name === 'Alice Johnson',
      'User name stored correctly'
    );

    userAToken = regResA.body.token;
    userAId = regResA.body.user.id;

    const dupRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Alice Duplicate',
        email: 'alice@example.com',
        password: 'password123'
      });

    assert(
      dupRes.status === 400,
      'Duplicate email registration rejected with Status 400'
    );

    const shortPassRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Bob',
        email: 'bob@example.com',
        password: '123'
      });

    assert(
      shortPassRes.status === 400,
      'Short password (< 6 chars) rejected with Status 400'
    );

    const regResB = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Bob Smith',
        email: 'bob@example.com',
        password: 'password123'
      });

    userBToken = regResB.body.token;
    userBId = regResB.body.user.id;

    assert(
      regResB.status === 201,
      'User B registered successfully for isolation tests'
    );

    console.log(
      `\n${BLUE}[2] Testing User Login & Credentials${RESET}`
    );

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'alice@example.com',
        password: 'password123'
      });

    assert(
      loginRes.status === 200,
      'User A login succeeded with valid credentials'
    );

    assert(
      loginRes.body.token !== undefined,
      'Login response returned JWT token'
    );

    const badPassRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'alice@example.com',
        password: 'wrongpassword'
      });

    assert(
      badPassRes.status === 401,
      'Login with incorrect password rejected with Status 401'
    );

    const noUserRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nobody@example.com',
        password: 'password123'
      });

    assert(
      noUserRes.status === 401,
      'Login with non-existent email rejected with Status 401'
    );

    console.log(
      `\n${BLUE}[3] Testing Route Protection (JWT Authentication)${RESET}`
    );

    const noTokenRes = await request(app)
      .get('/api/transactions');

    assert(
      noTokenRes.status === 401,
      'Accessing /api/transactions without token returns Status 401'
    );

    const badTokenRes = await request(app)
      .get('/api/transactions')
      .set(
        'Authorization',
        'Bearer invalid_fake_token_string'
      );

    assert(
      badTokenRes.status === 401,
      'Accessing /api/transactions with invalid token returns Status 401'
    );

    const validTokenRes = await request(app)
      .get('/api/auth/me')
      .set(
        'Authorization',
        `Bearer ${userAToken}`
      );

    assert(
      validTokenRes.status === 200,
      'Accessing /api/auth/me with valid token returns Status 200'
    );

    assert(
      validTokenRes.body.user.name === 'Alice Johnson',
      'Authenticated user identity verified'
    );

    console.log(
      `\n${BLUE}[4] Testing Transaction CRUD Operations${RESET}`
    );

    const incomeRes = await request(app)
      .post('/api/transactions')
      .set(
        'Authorization',
        `Bearer ${userAToken}`
      )
      .send({
        type: 'income',
        amount: 40000,
        category: 'Salary',
        description: 'Monthly Software Dev Salary',
        date: '2026-08-30'
      });

    assert(
      incomeRes.status === 201,
      'Created income transaction (₹40,000 Salary)'
    );

    userATxId = incomeRes.body.transaction._id;

    const expenseRes = await request(app)
      .post('/api/transactions')
      .set(
        'Authorization',
        `Bearer ${userAToken}`
      )
      .send({
        type: 'expense',
        amount: 2500,
        category: 'Food',
        description: 'Weekly Grocery Shopping',
        date: '2026-08-29'
      });

    assert(
      expenseRes.status === 201,
      'Created expense transaction (₹2,500 Grocery)'
    );

    const invalidAmtRes = await request(app)
      .post('/api/transactions')
      .set(
        'Authorization',
        `Bearer ${userAToken}`
      )
      .send({
        type: 'expense',
        amount: -50,
        category: 'Food',
        description: 'Invalid'
      });

    assert(
      invalidAmtRes.status === 400,
      'Negative amount rejected with Status 400'
    );

    const getTxRes = await request(app)
      .get('/api/transactions')
      .set(
        'Authorization',
        `Bearer ${userAToken}`
      );

    assert(
      getTxRes.status === 200,
      'Fetched User A transactions list'
    );

    assert(
      getTxRes.body.transactions.length === 2,
      'User A has exactly 2 transactions'
    );

    const updateRes = await request(app)
      .put(`/api/transactions/${userATxId}`)
      .set(
        'Authorization',
        `Bearer ${userAToken}`
      )
      .send({
        amount: 45000,
        description: 'Promoted Monthly Salary'
      });

    assert(
      updateRes.status === 200,
      'Updated transaction successfully (Status 200)'
    );

    assert(
      updateRes.body.transaction.amount === 45000,
      'Amount updated to 45000 in database'
    );

    assert(
      updateRes.body.transaction.description ===
        'Promoted Monthly Salary',
      'Description updated'
    );

    console.log(
      `\n${BLUE}[5] Testing User Data Isolation (Multi-User Privacy)${RESET}`
    );

    const userBTxRes = await request(app)
      .get('/api/transactions')
      .set(
        'Authorization',
        `Bearer ${userBToken}`
      );

    assert(
      userBTxRes.body.transactions.length === 0,
      "User B cannot see User A's transactions (returns 0 records)"
    );

    const hackUpdateRes = await request(app)
      .put(`/api/transactions/${userATxId}`)
      .set(
        'Authorization',
        `Bearer ${userBToken}`
      )
      .send({
        amount: 999999
      });

    assert(
      hackUpdateRes.status === 403,
      "User B editing User A's transaction rejected with Status 403 Forbidden"
    );

    const hackDeleteRes = await request(app)
      .delete(`/api/transactions/${userATxId}`)
      .set(
        'Authorization',
        `Bearer ${userBToken}`
      );

    assert(
      hackDeleteRes.status === 403,
      "User B deleting User A's transaction rejected with Status 403 Forbidden"
    );

    console.log(
      `\n${BLUE}[6] Testing Filters & Deletion${RESET}`
    );

    const filterIncomeRes = await request(app)
      .get('/api/transactions?type=income')
      .set(
        'Authorization',
        `Bearer ${userAToken}`
      );

    assert(
      filterIncomeRes.body.transactions.length === 1,
      'Filter by type=income returned 1 item'
    );

    assert(
      filterIncomeRes.body.transactions[0].type === 'income',
      'Filtered item is indeed income'
    );

    const delRes = await request(app)
      .delete(`/api/transactions/${userATxId}`)
      .set(
        'Authorization',
        `Bearer ${userAToken}`
      );

    assert(
      delRes.status === 200,
      'User A deleted their own transaction successfully (Status 200)'
    );

    const afterDelRes = await request(app)
      .get('/api/transactions')
      .set(
        'Authorization',
        `Bearer ${userAToken}`
      );

    assert(
      afterDelRes.body.transactions.length === 1,
      'Transaction count decreased to 1 after deletion'
    );

    console.log(
      `\n${BLUE}==================================================${RESET}`
    );

    console.log(
      `${GREEN}  All ${passedTests.length} Automated Tests Passed Successfully! ${RESET}`
    );

    console.log(
      `${BLUE}==================================================\n${RESET}`
    );
  } catch (error) {
    console.error(
      `\n${RED}Test runner error:${RESET}`,
      error
    );

    failedTests.push(error.message);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    if (mongoServer) {
      await mongoServer.stop();
    }

    if (failedTests.length > 0) {
      console.error(
        `${RED}Tests failed: ${failedTests.length}${RESET}`
      );

      process.exit(1);
    } else {
      process.exit(0);
    }
  }
}

runTests();
