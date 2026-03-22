const request = require('supertest');

jest.mock('mongodb', () => {
  const orders = [];

  return {
    MongoClient: {
      connect: jest.fn(() =>
        Promise.resolve({
          db: () => ({
            collection: () => ({
              find: () => ({
                toArray: () => Promise.resolve(orders)
              }),
              insertOne: (doc) => {
                const inserted = { _id: 'mocked-id', ...doc };
                orders.push(inserted);

                return Promise.resolve({
                  insertedId: inserted._id
                });
              }
            })
          })
        })
      )
    }
  };
});

const app = require('./server');

beforeAll(async () => {
  await app.connectDb();
});

test('GET /health', async () => {
  const res = await request(app).get('/health');
  expect(res.status).toBe(200);
});

test('GET /metrics', async () => {
  const res = await request(app).get('/metrics');
  expect(res.text).toMatch(/http_requests_total/);
});

test('POST /orders', async () => {
  const res = await request(app)
    .post('/orders')
    .send({ dish: 'Test Dish' });

  expect(res.status).toBe(201);
});

test('GET /orders', async () => {
  const res = await request(app).get('/orders');
  expect(Array.isArray(res.body)).toBe(true);
});