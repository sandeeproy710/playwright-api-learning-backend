import { createApp } from '../src/app.js';
import { config } from '../src/config/env.js';
import { connectDatabase } from '../src/config/database.js';

const app = createApp();
let databaseConnectionPromise;
const publicRuntimeRoutes = new Set(['/', '/api/health', '/api/docs']);

export default async function handler(request, response) {
  if (!publicRuntimeRoutes.has(request.url?.split('?')[0])) {
    databaseConnectionPromise ||= connectDatabase(config.mongoUri);
    await databaseConnectionPromise;
  }

  return app(request, response);
}
