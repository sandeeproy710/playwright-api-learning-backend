# Playwright API Learning Backend

A complete Express + MongoDB backend you can use to practice API testing with Playwright. It includes authentication, validation, pagination, filtering, error handling, and examples for all common HTTP methods.

## Tech Stack

- Node.js with Express
- MongoDB with Mongoose
- JWT authentication
- Zod request validation
- Helmet, CORS, request logging, rate limiting
- Playwright API tests

## Project Structure

```text
src/
  app.js                    Express app setup and route mounting
  server.js                 Server entry point
  config/                   Environment and MongoDB connection
  controllers/              Route handlers
  middleware/               Auth, validation, error, and 404 middleware
  models/                   Mongoose schemas
  routes/                   API route definitions
  utils/                    Shared helpers
  validators/               Zod schemas
tests/
  api.spec.js               Playwright API tests
```

## Setup

1. Install Node.js 20 or newer.

2. Install MongoDB locally, or use MongoDB Atlas.

3. Install dependencies:

```bash
npm install
```

4. Create your environment file:

```bash
copy .env.example .env
```

On macOS/Linux, use:

```bash
cp .env.example .env
```

5. Edit `.env` if needed:

```env
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/playwright_api_learning
JWT_SECRET=replace-this-with-a-long-random-secret
JWT_EXPIRES_IN=1d
CORS_ORIGIN=http://localhost:3000
```

6. Start MongoDB.

If MongoDB is installed as a Windows service, start it from Services or run:

```powershell
net start MongoDB
```

If you use Docker:

```bash
docker run --name playwright-api-mongo -p 27017:27017 -d mongo:7
```

7. Start the API:

```bash
npm run dev
```

The API runs at:

```text
http://localhost:4000
```

## Deploying To Vercel

This project includes `api/index.js` and `vercel.json`, so Vercel can run the Express app as a serverless function.

Before deploying, add these environment variables in Vercel:

```env
MONGODB_URI=<your MongoDB Atlas URI>
JWT_SECRET=<your long random secret>
JWT_EXPIRES_IN=1d
CORS_ORIGIN=*
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=300
```

Do not commit `.env`; it is for local development only.

## Running Playwright API Tests

Start the API first, then run:

```bash
npm run test:api
```

To use the Playwright UI:

```bash
npm run test:api:ui
```

If your API is running on another URL:

```bash
$env:API_BASE_URL="http://localhost:4000"
npm run test:api
```

## Response Format

Successful single-resource responses usually look like:

```json
{
  "data": {
    "id": "65f000000000000000000000",
    "name": "Example"
  }
}
```

List responses include pagination:

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

Errors use:

```json
{
  "error": {
    "message": "Validation failed",
    "details": []
  }
}
```

## Authentication

Protected routes require this header:

```text
Authorization: Bearer <token>
```

Get a token by registering or logging in.

## API Documentation

### Health

#### GET `/api/health`

Checks whether the API server is running.

Example:

```powershell
curl.exe http://localhost:4000/api/health
```

Response:

```json
{
  "status": "ok",
  "uptimeSeconds": 10,
  "timestamp": "2026-04-13T00:00:00.000Z"
}
```

### Auth

#### POST `/api/auth/register`

Creates a new user and returns a JWT.

Body:

```json
{
  "name": "Playwright Student",
  "email": "student@example.com",
  "password": "Password123!",
  "role": "student"
}
```

Example:

```powershell
curl.exe -X POST http://localhost:4000/api/auth/register `
  -H "Content-Type: application/json" `
  -d "{\"name\":\"Playwright Student\",\"email\":\"student@example.com\",\"password\":\"Password123!\"}"
```

#### POST `/api/auth/login`

Logs in an existing user.

Body:

```json
{
  "email": "student@example.com",
  "password": "Password123!"
}
```

#### GET `/api/auth/me`

Returns the authenticated user.

Headers:

```text
Authorization: Bearer <token>
```

### Users

#### GET `/api/users`

Protected. Lists users without password hashes.

Query parameters:

- `page`: page number, default `1`
- `limit`: items per page, default `10`, max `100`
- `search`: optional name or email search

Example:

```powershell
curl.exe "http://localhost:4000/api/users?page=1&limit=10" `
  -H "Authorization: Bearer <token>"
```

### Products

Products are public for reading and protected for writing.

Product body:

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

#### GET `/api/products`

Lists products.

Query parameters:

- `page`: page number
- `limit`: items per page
- `search`: text search by name, description, or category
- `category`: exact category filter
- `minPrice`: minimum price
- `maxPrice`: maximum price
- `isActive`: `true` or `false`

#### POST `/api/products`

Protected. Creates a product.

#### GET `/api/products/:id`

Gets one product by id.

#### PUT `/api/products/:id`

Protected. Replaces a product. Send the complete product body.

#### PATCH `/api/products/:id`

Protected. Partially updates a product. Send one or more fields.

Example:

```json
{
  "price": 14.99,
  "stock": 30
}
```

#### DELETE `/api/products/:id`

Protected. Deletes a product and returns `204 No Content`.

### Tasks

Tasks are private to the authenticated user.

Task body:

```json
{
  "title": "Write API assertions",
  "description": "Practice request fixtures and response expectations.",
  "status": "todo",
  "priority": "high",
  "dueDate": "2026-04-30T00:00:00.000Z"
}
```

#### GET `/api/tasks`

Protected. Lists the authenticated user's tasks.

Query parameters:

- `page`: page number
- `limit`: items per page
- `search`: title or description search
- `status`: `todo`, `in_progress`, or `done`
- `priority`: `low`, `medium`, or `high`

#### POST `/api/tasks`

Protected. Creates a task for the authenticated user.

#### GET `/api/tasks/:id`

Protected. Gets one task owned by the authenticated user.

#### PUT `/api/tasks/:id`

Protected. Replaces a task. Send the complete task body.

#### PATCH `/api/tasks/:id`

Protected. Partially updates a task.

Example:

```json
{
  "status": "done"
}
```

#### DELETE `/api/tasks/:id`

Protected. Deletes a task and returns `204 No Content`.

## Suggested Learning Flow With Playwright

1. Test public routes first: `GET /api/health` and `GET /api/products`.
2. Register a user and save the returned token.
3. Send protected requests with `Authorization: Bearer <token>`.
4. Practice status assertions: `201`, `200`, `204`, `400`, `401`, `404`, and `409`.
5. Chain requests: create a product, read it, patch it, replace it, delete it.
6. Validate error bodies by sending intentionally invalid payloads.
