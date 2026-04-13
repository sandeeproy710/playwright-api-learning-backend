import { expect, test } from '@playwright/test';

const uniqueRunId = `${Date.now()}-${Math.round(Math.random() * 100000)}`;
const user = {
  name: 'Full Journey Student',
  email: `full-journey-${uniqueRunId}@example.com`,
  password: 'Password123!'
};

test.describe.serial('Full API journey from public checks to cleanup', () => {
  let token;
  let productId;
  let taskId;

  test('01 public API metadata and health are reachable', async ({ request }) => {
    const rootResponse = await request.get('/');
    expect(rootResponse.status()).toBe(200);

    const root = await rootResponse.json();
    expect(root.name).toBe('Playwright API Learning Backend');
    expect(root.docs).toBe('/api/docs');
    expect(root.health).toBe('/api/health');

    const docsResponse = await request.get('/api/docs');
    expect(docsResponse.status()).toBe(200);

    const docs = await docsResponse.json();
    expect(docs.resources).toEqual(expect.arrayContaining(['/api/auth', '/api/users', '/api/products', '/api/tasks']));

    const healthResponse = await request.get('/api/health');
    expect(healthResponse.status()).toBe(200);

    const health = await healthResponse.json();
    expect(health.status).toBe('ok');
    expect(health.timestamp).toBeTruthy();
  });

  test('02 protected endpoints reject missing auth token', async ({ request }) => {
    const meResponse = await request.get('/api/auth/me');
    expect(meResponse.status()).toBe(401);

    const usersResponse = await request.get('/api/users');
    expect(usersResponse.status()).toBe(401);

    const tasksResponse = await request.get('/api/tasks');
    expect(tasksResponse.status()).toBe(401);
  });

  test('03 register a user and capture the JWT token', async ({ request }) => {
    const response = await request.post('/api/auth/register', {
      data: user
    });

    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body.user.name).toBe(user.name);
    expect(body.user.email).toBe(user.email);
    expect(body.user.passwordHash).toBeUndefined();
    expect(body.token).toBeTruthy();

    token = body.token;
  });

  test('04 duplicate registration returns conflict', async ({ request }) => {
    const response = await request.post('/api/auth/register', {
      data: user
    });

    expect(response.status()).toBe(409);

    const body = await response.json();
    expect(body.error.message).toBe('Email is already registered');
  });

  test('05 login returns a fresh token', async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      data: {
        email: user.email,
        password: user.password
      }
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.user.email).toBe(user.email);
    expect(body.token).toBeTruthy();

    token = body.token;
  });

  test('06 bad login returns unauthorized', async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      data: {
        email: user.email,
        password: 'wrong-password'
      }
    });

    expect(response.status()).toBe(401);

    const body = await response.json();
    expect(body.error.message).toBe('Invalid email or password');
  });

  test('07 authenticated user and users list are available', async ({ request }) => {
    const meResponse = await request.get('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });

    expect(meResponse.status()).toBe(200);

    const me = await meResponse.json();
    expect(me.user.email).toBe(user.email);
    expect(me.user.passwordHash).toBeUndefined();

    const usersResponse = await request.get('/api/users?page=1&limit=5&search=journey', {
      headers: { Authorization: `Bearer ${token}` }
    });

    expect(usersResponse.status()).toBe(200);

    const users = await usersResponse.json();
    expect(Array.isArray(users.data)).toBeTruthy();
    expect(users.meta.page).toBe(1);
    expect(users.meta.limit).toBe(5);
  });

  test('08 product list supports public query parameters', async ({ request }) => {
    const response = await request.get('/api/products?page=1&limit=5&isActive=true');
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(Array.isArray(body.data)).toBeTruthy();
    expect(body.meta.page).toBe(1);
    expect(body.meta.limit).toBe(5);
  });

  test('09 create a product', async ({ request }) => {
    const response = await request.post('/api/products', {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        name: 'Full Journey Product',
        description: 'Product created by the full API journey test.',
        price: 25.5,
        stock: 10,
        category: 'journey',
        tags: ['playwright', 'journey'],
        isActive: true
      }
    });

    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body.data.id).toBeTruthy();
    expect(body.data.name).toBe('Full Journey Product');
    expect(body.data.createdBy).toBeTruthy();

    productId = body.data.id;
  });

  test('10 get the created product by id', async ({ request }) => {
    const response = await request.get(`/api/products/${productId}`);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.data.id).toBe(productId);
    expect(body.data.category).toBe('journey');
  });

  test('11 patch the product', async ({ request }) => {
    const response = await request.patch(`/api/products/${productId}`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        price: 30,
        stock: 12
      }
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.data.price).toBe(30);
    expect(body.data.stock).toBe(12);
  });

  test('12 replace the product with PUT', async ({ request }) => {
    const response = await request.put(`/api/products/${productId}`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        name: 'Full Journey Product Replaced',
        description: 'Product replaced by the full API journey test.',
        price: 40,
        stock: 20,
        category: 'journey',
        tags: ['put', 'journey'],
        isActive: true
      }
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.data.name).toBe('Full Journey Product Replaced');
    expect(body.data.tags).toEqual(['put', 'journey']);
  });

  test('13 validation rejects an invalid product body', async ({ request }) => {
    const response = await request.post('/api/products', {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        name: 'x',
        price: -1
      }
    });

    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body.error.message).toBe('Validation failed');
    expect(body.error.details.length).toBeGreaterThan(0);
  });

  test('14 create a private task', async ({ request }) => {
    const response = await request.post('/api/tasks', {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        title: 'Full Journey Task',
        description: 'Task created by the full API journey test.',
        status: 'todo',
        priority: 'high'
      }
    });

    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body.data.id).toBeTruthy();
    expect(body.data.owner).toBeTruthy();
    expect(body.data.status).toBe('todo');

    taskId = body.data.id;
  });

  test('15 list, get, patch, and replace the task', async ({ request }) => {
    const listResponse = await request.get('/api/tasks?priority=high&limit=5', {
      headers: { Authorization: `Bearer ${token}` }
    });

    expect(listResponse.status()).toBe(200);

    const listBody = await listResponse.json();
    expect(listBody.data.some((task) => task.id === taskId)).toBeTruthy();
    expect(listBody.meta.limit).toBe(5);

    const getResponse = await request.get(`/api/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    expect(getResponse.status()).toBe(200);
    expect((await getResponse.json()).data.id).toBe(taskId);

    const patchResponse = await request.patch(`/api/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        status: 'done'
      }
    });

    expect(patchResponse.status()).toBe(200);
    expect((await patchResponse.json()).data.status).toBe('done');

    const putResponse = await request.put(`/api/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        title: 'Full Journey Task Replaced',
        description: 'Task replaced by the full API journey test.',
        status: 'in_progress',
        priority: 'medium'
      }
    });

    expect(putResponse.status()).toBe(200);

    const replaced = await putResponse.json();
    expect(replaced.data.title).toBe('Full Journey Task Replaced');
    expect(replaced.data.status).toBe('in_progress');
    expect(replaced.data.priority).toBe('medium');
  });

  test('16 validation rejects an invalid task update', async ({ request }) => {
    const response = await request.patch(`/api/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        status: 'blocked'
      }
    });

    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body.error.message).toBe('Validation failed');
  });

  test('17 delete created resources and confirm they are gone', async ({ request }) => {
    const deleteProductResponse = await request.delete(`/api/products/${productId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    expect(deleteProductResponse.status()).toBe(204);

    const getDeletedProductResponse = await request.get(`/api/products/${productId}`);
    expect(getDeletedProductResponse.status()).toBe(404);

    const deleteTaskResponse = await request.delete(`/api/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    expect(deleteTaskResponse.status()).toBe(204);

    const getDeletedTaskResponse = await request.get(`/api/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    expect(getDeletedTaskResponse.status()).toBe(404);
  });

  test('18 unknown routes return not found', async ({ request }) => {
    const response = await request.get('/api/this-route-does-not-exist');
    expect(response.status()).toBe(404);

    const body = await response.json();
    expect(body.error.message).toContain('Route not found');
  });
});
