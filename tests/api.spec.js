import { expect, test } from '@playwright/test';

function uniqueEmail() {
  return `student-${Date.now()}-${Math.round(Math.random() * 100000)}@example.com`;
}

test.describe.serial('Playwright API learning backend', () => {
  let token;
  let productId;
  let taskId;

  test('health check returns API status', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.status).toBe('ok');
  });

  test('registers a user and returns a JWT token', async ({ request }) => {
    const response = await request.post('/api/auth/register', {
      data: {
        name: 'Playwright Student',
        email: uniqueEmail(),
        password: 'Password123!'
      }
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.user.email).toContain('@example.com');
    expect(body.token).toBeTruthy();
    token = body.token;
  });

  test('reads the logged-in user with Bearer auth', async ({ request }) => {
    const response = await request.get('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.user.name).toBe('Playwright Student');
  });

  test('creates and reads a product', async ({ request }) => {
    const response = await request.post('/api/products', {
      headers: { Authorization: `Bearer ${token}` },
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
    const created = await response.json();
    productId = created.data.id;

    const getResponse = await request.get(`/api/products/${productId}`);
    expect(getResponse.ok()).toBeTruthy();
    const found = await getResponse.json();
    expect(found.data.name).toBe('API Testing Notebook');
  });

  test('updates, replaces, lists, and deletes a product', async ({ request }) => {
    const patchResponse = await request.patch(`/api/products/${productId}`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { price: 14.99 }
    });
    expect(patchResponse.ok()).toBeTruthy();
    expect((await patchResponse.json()).data.price).toBe(14.99);

    const putResponse = await request.put(`/api/products/${productId}`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        name: 'API Testing Workbook',
        description: 'A replaced product payload.',
        price: 19.99,
        stock: 40,
        category: 'learning',
        tags: ['tests']
      }
    });
    expect(putResponse.ok()).toBeTruthy();
    expect((await putResponse.json()).data.name).toBe('API Testing Workbook');

    const listResponse = await request.get('/api/products?category=learning&limit=5');
    expect(listResponse.ok()).toBeTruthy();
    expect((await listResponse.json()).meta.limit).toBe(5);

    const deleteResponse = await request.delete(`/api/products/${productId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    expect(deleteResponse.status()).toBe(204);
  });

  test('creates, updates, and deletes a private task', async ({ request }) => {
    const createResponse = await request.post('/api/tasks', {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        title: 'Write API assertions',
        description: 'Practice request fixtures and response expectations.',
        priority: 'high'
      }
    });

    expect(createResponse.status()).toBe(201);
    taskId = (await createResponse.json()).data.id;

    const patchResponse = await request.patch(`/api/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { status: 'done' }
    });
    expect(patchResponse.ok()).toBeTruthy();
    expect((await patchResponse.json()).data.status).toBe('done');

    const listResponse = await request.get('/api/tasks?status=done', {
      headers: { Authorization: `Bearer ${token}` }
    });
    expect(listResponse.ok()).toBeTruthy();
    expect((await listResponse.json()).data.some((task) => task.id === taskId)).toBeTruthy();

    const deleteResponse = await request.delete(`/api/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    expect(deleteResponse.status()).toBe(204);
  });

  test('returns validation errors for bad input', async ({ request }) => {
    const response = await request.post('/api/products', {
      headers: { Authorization: `Bearer ${token}` },
      data: { name: 'x' }
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error.message).toBe('Validation failed');
    expect(body.error.details.length).toBeGreaterThan(0);
  });
});
