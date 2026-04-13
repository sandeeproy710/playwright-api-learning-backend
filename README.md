# Playwright API Learning Backend

This is a MongoDB-backed Express API built for learning API testing with Playwright. It gives you real endpoints for auth, users, products, and tasks, so you can practice status code assertions, request bodies, headers, query strings, CRUD flows, validation errors, and authenticated API calls.

Live API:

```text
https://playwright-api-learning-backend.vercel.app
```

Local API:

```text
http://localhost:4000
```

## What You Can Practice

- `GET`, `POST`, `PUT`, `PATCH`, and `DELETE`
- Public and protected endpoints
- Bearer token authentication
- JSON request bodies
- Query parameters for pagination, search, and filtering
- Positive and negative assertions
- Chained API tests, such as create -> read -> update -> delete
- Common status codes: `200`, `201`, `204`, `400`, `401`, `404`, and `409`

## Tech Stack

- Node.js and Express
- MongoDB Atlas or local MongoDB
- Mongoose models
- JWT authentication
- Zod validation
- Helmet, CORS, Morgan, and rate limiting
- Playwright API testing
- Vercel serverless deployment

## Project Structure

```text
api/
  index.js                  Vercel serverless entry point
src/
  app.js                    Express app setup and route mounting
  server.js                 Local server entry point
  config/                   Environment and MongoDB connection
  controllers/              Route handlers
  middleware/               Auth, validation, error, and 404 middleware
  models/                   Mongoose schemas
  routes/                   API route definitions
  utils/                    Shared helpers
  validators/               Zod schemas
tests/
  api.spec.js               Playwright API tests
vercel.json                 Vercel routing configuration
```

## Setup Locally

Install dependencies:

```powershell
npm install
```

Create your local environment file:

```powershell
copy .env.example .env
```

Use MongoDB Atlas in `.env`:

```env
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/playwright_api_learning?retryWrites=true&w=majority
JWT_SECRET=replace-this-with-a-long-random-secret
JWT_EXPIRES_IN=1d
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=300
```

If the MongoDB password contains special characters, URL-encode them. For example, `@` becomes `%40`.

Start the API:

```powershell
npm run dev
```

Check that it is running:

```powershell
curl.exe http://localhost:4000/api/health
```

## Run Playwright API Tests

Run tests against local API:

```powershell
npm run test:api
```

Run tests against the hosted Vercel API:

```powershell
$env:API_BASE_URL="https://playwright-api-learning-backend.vercel.app"
npm run test:api
```

Open Playwright UI mode:

```powershell
npm run test:api:ui
```

The Playwright tests are in:

```text
tests/api.spec.js
```

## Playwright Request Pattern

Use Playwright's `request` fixture for API testing:

```js
import { expect, test } from '@playwright/test';

test('health check', async ({ request }) => {
  const response = await request.get('/api/health');
  expect(response.status()).toBe(200);

  const body = await response.json();
  expect(body.status).toBe('ok');
});
```

For protected routes, pass a Bearer token:

```js
const response = await request.get('/api/auth/me', {
  headers: {
    Authorization: `Bearer ${token}`
  }
});
```

## Standard Response Formats

Single-resource success:

```json
{
  "data": {
    "id": "65f000000000000000000000",
    "name": "Example"
  }
}
```

List success:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "totalPages": 0
  }
}
```

Auth success:

```json
{
  "user": {
    "id": "65f000000000000000000000",
    "name": "Playwright Student",
    "email": "student@example.com",
    "role": "student",
    "isActive": true
  },
  "token": "jwt-token"
}
```

Error response:

```json
{
  "error": {
    "message": "Validation failed",
    "details": [
      {
        "path": "body.name",
        "message": "String must contain at least 2 character(s)"
      }
    ]
  }
}
```

## Authentication Flow

1. Register a user with `POST /api/auth/register`.
2. Save `body.token` from the response.
3. Send the token in protected requests:

```text
Authorization: Bearer <token>
```

Playwright example:

```js
const registerResponse = await request.post('/api/auth/register', {
  data: {
    name: 'Playwright Student',
    email: `student-${Date.now()}@example.com`,
    password: 'Password123!'
  }
});

expect(registerResponse.status()).toBe(201);
const registerBody = await registerResponse.json();
const token = registerBody.token;
```

## Endpoint Summary

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/` | No | Basic API information |
| `GET` | `/api/docs` | No | Small docs pointer response |
| `GET` | `/api/health` | No | Health check |
| `POST` | `/api/auth/register` | No | Create a user and get token |
| `POST` | `/api/auth/login` | No | Login and get token |
| `GET` | `/api/auth/me` | Yes | Get logged-in user |
| `GET` | `/api/users` | Yes | List users |
| `GET` | `/api/products` | No | List products |
| `POST` | `/api/products` | Yes | Create product |
| `GET` | `/api/products/:id` | No | Get product by id |
| `PUT` | `/api/products/:id` | Yes | Replace product |
| `PATCH` | `/api/products/:id` | Yes | Partially update product |
| `DELETE` | `/api/products/:id` | Yes | Delete product |
| `GET` | `/api/tasks` | Yes | List your tasks |
| `POST` | `/api/tasks` | Yes | Create your task |
| `GET` | `/api/tasks/:id` | Yes | Get your task by id |
| `PUT` | `/api/tasks/:id` | Yes | Replace your task |
| `PATCH` | `/api/tasks/:id` | Yes | Partially update your task |
| `DELETE` | `/api/tasks/:id` | Yes | Delete your task |

## Public Utility Endpoints

### GET `/`

Use this to confirm the base API route is reachable. It returns the API name, version, docs path, and health path.

Expected status:

```text
200 OK
```

Playwright example:

```js
const response = await request.get('/');
expect(response.status()).toBe(200);

const body = await response.json();
expect(body.name).toBe('Playwright API Learning Backend');
expect(body.docs).toBe('/api/docs');
expect(body.health).toBe('/api/health');
```

### GET `/api/docs`

Use this as a simple machine-readable docs pointer. It returns a message and the main resource groups.

Expected status:

```text
200 OK
```

Playwright example:

```js
const response = await request.get('/api/docs');
expect(response.ok()).toBeTruthy();

const body = await response.json();
expect(body.resources).toContain('/api/products');
expect(body.resources).toContain('/api/tasks');
```

### GET `/api/health`

Use this as a smoke test for deployment or local startup. On Vercel, this route does not need a database call, so it is useful for separating hosting problems from database problems.

Expected status:

```text
200 OK
```

Response fields:

- `status`: should be `ok`
- `uptimeSeconds`: server uptime rounded to seconds
- `timestamp`: ISO timestamp

Playwright example:

```js
const response = await request.get('/api/health');
expect(response.status()).toBe(200);

const body = await response.json();
expect(body.status).toBe('ok');
expect(body.timestamp).toBeTruthy();
```

## Auth Endpoints

### POST `/api/auth/register`

Creates a new user and returns a JWT token. Use this at the start of most Playwright tests that need authentication.

Auth required:

```text
No
```

Expected status:

```text
201 Created
```

Body fields:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `name` | string | Yes | 2 to 80 characters |
| `email` | string | Yes | Must be unique and valid email |
| `password` | string | Yes | 6 to 100 characters |
| `role` | string | No | `student` or `admin`; default is `student` |

Example body:

```json
{
  "name": "Playwright Student",
  "email": "student@example.com",
  "password": "Password123!",
  "role": "student"
}
```

Playwright example:

```js
const response = await request.post('/api/auth/register', {
  data: {
    name: 'Playwright Student',
    email: `student-${Date.now()}@example.com`,
    password: 'Password123!'
  }
});

expect(response.status()).toBe(201);

const body = await response.json();
expect(body.user.email).toContain('@example.com');
expect(body.token).toBeTruthy();
```

Useful negative tests:

- Duplicate email should return `409`.
- Missing or invalid fields should return `400`.
- Too-short password should return `400`.

### POST `/api/auth/login`

Logs in an existing user and returns a new JWT token.

Auth required:

```text
No
```

Expected status:

```text
200 OK
```

Body fields:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `email` | string | Yes | Registered email |
| `password` | string | Yes | Matching password |

Playwright example:

```js
const response = await request.post('/api/auth/login', {
  data: {
    email: 'student@example.com',
    password: 'Password123!'
  }
});

expect(response.status()).toBe(200);

const body = await response.json();
expect(body.user.email).toBe('student@example.com');
expect(body.token).toBeTruthy();
```

Useful negative tests:

- Wrong password should return `401`.
- Unknown email should return `401`.
- Invalid email format should return `400`.

### GET `/api/auth/me`

Returns the current logged-in user. This is the simplest endpoint for practicing authenticated `GET` requests.

Auth required:

```text
Yes
```

Expected status:

```text
200 OK
```

Playwright example:

```js
const response = await request.get('/api/auth/me', {
  headers: {
    Authorization: `Bearer ${token}`
  }
});

expect(response.status()).toBe(200);

const body = await response.json();
expect(body.user.name).toBe('Playwright Student');
expect(body.user.passwordHash).toBeUndefined();
```

Useful negative tests:

- Missing token should return `401`.
- Invalid token should return `401`.

## User Endpoints

### GET `/api/users`

Lists users without password hashes. Use this to practice authenticated list endpoints, query strings, and pagination assertions.

Auth required:

```text
Yes
```

Expected status:

```text
200 OK
```

Query parameters:

| Parameter | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `page` | number | No | `1` | Page number |
| `limit` | number | No | `10` | Max `100` |
| `search` | string | No | none | Searches name and email |

Example:

```text
GET /api/users?page=1&limit=5&search=student
```

Playwright example:

```js
const response = await request.get('/api/users?page=1&limit=5', {
  headers: {
    Authorization: `Bearer ${token}`
  }
});

expect(response.status()).toBe(200);

const body = await response.json();
expect(Array.isArray(body.data)).toBeTruthy();
expect(body.meta.page).toBe(1);
expect(body.meta.limit).toBe(5);
```

Useful negative tests:

- Missing token should return `401`.
- `limit=101` should return `400`.
- `page=0` should return `400`.

## Product Endpoints

Products are public for reading and protected for writing. This makes them good for practicing both public and authenticated CRUD tests.

Product fields:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `name` | string | Yes | 2 to 120 characters |
| `description` | string | Yes | 1 to 1000 characters |
| `price` | number | Yes | Minimum `0` |
| `stock` | number | Yes | Integer, minimum `0` |
| `category` | string | Yes | 2 to 80 characters |
| `tags` | string array | No | Max 20 tags |
| `isActive` | boolean | No | Default `true` |

Example product body:

```json
{
  "name": "API Testing Notebook",
  "description": "A sample product used in Playwright API tests.",
  "price": 12.5,
  "stock": 25,
  "category": "learning",
  "tags": ["playwright", "api"],
  "isActive": true
}
```

### GET `/api/products`

Lists products with optional filters. Use this to practice public list endpoints, query strings, and pagination.

Auth required:

```text
No
```

Expected status:

```text
200 OK
```

Query parameters:

| Parameter | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `page` | number | No | `1` | Page number |
| `limit` | number | No | `10` | Max `100` |
| `search` | string | No | none | Text search |
| `category` | string | No | none | Exact category |
| `minPrice` | number | No | none | Minimum price |
| `maxPrice` | number | No | none | Maximum price |
| `isActive` | boolean | No | none | `true` or `false` |

Example:

```text
GET /api/products?category=learning&limit=5
```

Playwright example:

```js
const response = await request.get('/api/products?category=learning&limit=5');
expect(response.status()).toBe(200);

const body = await response.json();
expect(Array.isArray(body.data)).toBeTruthy();
expect(body.meta.limit).toBe(5);
```

### POST `/api/products`

Creates a product. Use this to practice authenticated `POST` requests and saving an id for later tests.

Auth required:

```text
Yes
```

Expected status:

```text
201 Created
```

Playwright example:

```js
const response = await request.post('/api/products', {
  headers: {
    Authorization: `Bearer ${token}`
  },
  data: {
    name: 'API Testing Notebook',
    description: 'A sample product used in Playwright API tests.',
    price: 12.5,
    stock: 25,
    category: 'learning',
    tags: ['playwright', 'api']
  }
});

expect(response.status()).toBe(201);

const body = await response.json();
expect(body.data.id).toBeTruthy();
expect(body.data.name).toBe('API Testing Notebook');

const productId = body.data.id;
```

Useful negative tests:

- Missing token should return `401`.
- Missing required fields should return `400`.
- Negative price should return `400`.
- `stock` below `0` should return `400`.

### GET `/api/products/:id`

Gets one product by id. Use this after creating a product to verify persistence.

Auth required:

```text
No
```

Expected status:

```text
200 OK
```

Playwright example:

```js
const response = await request.get(`/api/products/${productId}`);
expect(response.status()).toBe(200);

const body = await response.json();
expect(body.data.id).toBe(productId);
```

Useful negative tests:

- Unknown valid MongoDB id should return `404`.
- Bad id format should return `400`.

### PUT `/api/products/:id`

Replaces a product with a complete new product body. Use this to learn the difference between `PUT` and `PATCH`: `PUT` expects the full resource body.

Auth required:

```text
Yes
```

Expected status:

```text
200 OK
```

Playwright example:

```js
const response = await request.put(`/api/products/${productId}`, {
  headers: {
    Authorization: `Bearer ${token}`
  },
  data: {
    name: 'API Testing Workbook',
    description: 'A replaced product payload.',
    price: 19.99,
    stock: 40,
    category: 'learning',
    tags: ['tests']
  }
});

expect(response.status()).toBe(200);

const body = await response.json();
expect(body.data.name).toBe('API Testing Workbook');
expect(body.data.price).toBe(19.99);
```

Useful negative tests:

- Missing token should return `401`.
- Partial body should return `400`.
- Unknown valid MongoDB id should return `404`.

### PATCH `/api/products/:id`

Partially updates one or more product fields. Use this to practice small update payloads.

Auth required:

```text
Yes
```

Expected status:

```text
200 OK
```

Example body:

```json
{
  "price": 14.99,
  "stock": 30
}
```

Playwright example:

```js
const response = await request.patch(`/api/products/${productId}`, {
  headers: {
    Authorization: `Bearer ${token}`
  },
  data: {
    price: 14.99
  }
});

expect(response.status()).toBe(200);

const body = await response.json();
expect(body.data.price).toBe(14.99);
```

Useful negative tests:

- Empty body should return `400`.
- Invalid field value should return `400`.
- Missing token should return `401`.

### DELETE `/api/products/:id`

Deletes a product. Use this at the end of chained tests to clean up test data.

Auth required:

```text
Yes
```

Expected status:

```text
204 No Content
```

Playwright example:

```js
const response = await request.delete(`/api/products/${productId}`, {
  headers: {
    Authorization: `Bearer ${token}`
  }
});

expect(response.status()).toBe(204);
```

Useful negative tests:

- Missing token should return `401`.
- Deleting the same id twice should return `404` on the second request.

## Task Endpoints

Tasks are private to the authenticated user. This makes them useful for practicing protected CRUD routes and ownership behavior.

Task fields:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `title` | string | Yes | 2 to 120 characters |
| `description` | string | No | Max 1000 characters |
| `status` | string | No | `todo`, `in_progress`, or `done`; default `todo` |
| `priority` | string | No | `low`, `medium`, or `high`; default `medium` |
| `dueDate` | date string | No | ISO date string |

Example task body:

```json
{
  "title": "Write API assertions",
  "description": "Practice request fixtures and response expectations.",
  "status": "todo",
  "priority": "high",
  "dueDate": "2026-04-30T00:00:00.000Z"
}
```

### GET `/api/tasks`

Lists tasks owned by the authenticated user. Use this to practice private list endpoints and filters.

Auth required:

```text
Yes
```

Expected status:

```text
200 OK
```

Query parameters:

| Parameter | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `page` | number | No | `1` | Page number |
| `limit` | number | No | `10` | Max `100` |
| `search` | string | No | none | Searches title and description |
| `status` | string | No | none | `todo`, `in_progress`, or `done` |
| `priority` | string | No | none | `low`, `medium`, or `high` |

Playwright example:

```js
const response = await request.get('/api/tasks?status=done&limit=5', {
  headers: {
    Authorization: `Bearer ${token}`
  }
});

expect(response.status()).toBe(200);

const body = await response.json();
expect(Array.isArray(body.data)).toBeTruthy();
expect(body.meta.limit).toBe(5);
```

### POST `/api/tasks`

Creates a task owned by the authenticated user.

Auth required:

```text
Yes
```

Expected status:

```text
201 Created
```

Playwright example:

```js
const response = await request.post('/api/tasks', {
  headers: {
    Authorization: `Bearer ${token}`
  },
  data: {
    title: 'Write API assertions',
    description: 'Practice request fixtures and response expectations.',
    priority: 'high'
  }
});

expect(response.status()).toBe(201);

const body = await response.json();
expect(body.data.id).toBeTruthy();
expect(body.data.status).toBe('todo');

const taskId = body.data.id;
```

Useful negative tests:

- Missing token should return `401`.
- Missing title should return `400`.
- Invalid status should return `400`.

### GET `/api/tasks/:id`

Gets one task owned by the authenticated user.

Auth required:

```text
Yes
```

Expected status:

```text
200 OK
```

Playwright example:

```js
const response = await request.get(`/api/tasks/${taskId}`, {
  headers: {
    Authorization: `Bearer ${token}`
  }
});

expect(response.status()).toBe(200);

const body = await response.json();
expect(body.data.id).toBe(taskId);
```

Useful negative tests:

- Missing token should return `401`.
- Unknown valid MongoDB id should return `404`.
- Bad id format should return `400`.

### PUT `/api/tasks/:id`

Replaces a task with a complete new task body.

Auth required:

```text
Yes
```

Expected status:

```text
200 OK
```

Playwright example:

```js
const response = await request.put(`/api/tasks/${taskId}`, {
  headers: {
    Authorization: `Bearer ${token}`
  },
  data: {
    title: 'Write full API assertions',
    description: 'Replaced task body.',
    status: 'in_progress',
    priority: 'high'
  }
});

expect(response.status()).toBe(200);

const body = await response.json();
expect(body.data.title).toBe('Write full API assertions');
expect(body.data.status).toBe('in_progress');
```

Useful negative tests:

- Missing token should return `401`.
- Partial body should return `400`.
- Invalid status should return `400`.

### PATCH `/api/tasks/:id`

Partially updates one or more task fields.

Auth required:

```text
Yes
```

Expected status:

```text
200 OK
```

Example body:

```json
{
  "status": "done"
}
```

Playwright example:

```js
const response = await request.patch(`/api/tasks/${taskId}`, {
  headers: {
    Authorization: `Bearer ${token}`
  },
  data: {
    status: 'done'
  }
});

expect(response.status()).toBe(200);

const body = await response.json();
expect(body.data.status).toBe('done');
```

Useful negative tests:

- Empty body should return `400`.
- Invalid status should return `400`.
- Missing token should return `401`.

### DELETE `/api/tasks/:id`

Deletes a task owned by the authenticated user.

Auth required:

```text
Yes
```

Expected status:

```text
204 No Content
```

Playwright example:

```js
const response = await request.delete(`/api/tasks/${taskId}`, {
  headers: {
    Authorization: `Bearer ${token}`
  }
});

expect(response.status()).toBe(204);
```

Useful negative tests:

- Missing token should return `401`.
- Deleting the same task twice should return `404` on the second request.

## Full Playwright CRUD Flow Example

This is the pattern you will use often in real API automation:

```js
test('product CRUD flow', async ({ request }) => {
  const registerResponse = await request.post('/api/auth/register', {
    data: {
      name: 'CRUD Student',
      email: `crud-${Date.now()}@example.com`,
      password: 'Password123!'
    }
  });

  const { token } = await registerResponse.json();

  const createResponse = await request.post('/api/products', {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      name: 'CRUD Product',
      description: 'Product used for CRUD testing.',
      price: 10,
      stock: 5,
      category: 'testing',
      tags: ['crud']
    }
  });

  expect(createResponse.status()).toBe(201);
  const created = await createResponse.json();
  const productId = created.data.id;

  const getResponse = await request.get(`/api/products/${productId}`);
  expect(getResponse.status()).toBe(200);

  const patchResponse = await request.patch(`/api/products/${productId}`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { price: 15 }
  });
  expect(patchResponse.status()).toBe(200);

  const deleteResponse = await request.delete(`/api/products/${productId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  expect(deleteResponse.status()).toBe(204);
});
```

## Suggested Testing Checklist

Use this checklist when writing your own Playwright tests:

- Check public endpoints return `200`.
- Register a unique user using `Date.now()` in the email.
- Save the returned token.
- Call `/api/auth/me` with and without the token.
- Create a product and save `productId`.
- Get the product by id.
- Patch one product field.
- Replace the product with `PUT`.
- Delete the product.
- Try deleting it again and assert `404`.
- Create a task and save `taskId`.
- Filter tasks by `status` and `priority`.
- Send invalid request bodies and assert `400`.
- Send protected requests without auth and assert `401`.

## Deploying To Vercel

The project includes `api/index.js` and `vercel.json`, so Vercel can run the Express app as a serverless function.

Add these environment variables in Vercel:

```env
MONGODB_URI=<your MongoDB Atlas URI>
JWT_SECRET=<your long random secret>
JWT_EXPIRES_IN=1d
CORS_ORIGIN=*
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=300
```

Do not commit `.env`; it is for local development only.

For Vercel deployments, your MongoDB Atlas cluster must allow connections from Vercel. For a learning project, add `0.0.0.0/0` in Atlas under **Network Access**. For production, use a stricter networking approach.
