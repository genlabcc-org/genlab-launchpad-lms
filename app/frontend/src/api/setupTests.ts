import { beforeAll, afterEach, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { handlers } from './mocks/generatedHandlers';

export const server = setupServer(...handlers);

beforeAll(() => {
  // Start intercepting requests
  server.listen({ onUnhandledRequest: 'bypass' });
});

afterEach(() => {
  // Reset any runtime handlers added during individual tests
  server.resetHandlers();
  localStorage.clear();
});

afterAll(() => {
  // Clean up and close mock server
  server.close();
});
