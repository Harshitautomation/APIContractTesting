const path = require('path');
const { Pact } = require('@pact-foundation/pact');
const fetch = require('node-fetch'); // Use 'node-fetch' to make HTTP requests
const { expect, test, beforeAll, afterAll } = require('@jest/globals');

// Initialize Pact
const provider = new Pact({
  port: 1234,
  log: path.resolve(process.cwd(), 'logs', 'pact.log'),
  dir: path.resolve(process.cwd(), 'pacts'),
  spec: 2,
  pactfileWriteMode: 'overwrite',
  consumer: 'UserConsumer',
  provider: 'UserProvider',
});

beforeAll(async () => {
  await provider.setup();
  await provider.addInteraction({
    uponReceiving: 'a request for user data',
    withRequest: {
      method: 'GET',
      path: '/user/1',
      headers: {
        Accept: 'application/json',
      },
    },
    willRespondWith: {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
      },
    },
  });
});

test('should receive user data from the provider', async () => {
  const response = await fetch('http://localhost:1234/user/1', {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  const data = await response.json();

  expect(response.status).toBe(200);
  expect(data).toEqual({
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
  });
});

afterAll(async () => {
  await provider.verify();
  await provider.finalize();
});
