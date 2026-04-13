import { createApp } from '../src/app.js';
import { config } from '../src/config/env.js';
import { connectDatabase } from '../src/config/database.js';

const app = createApp();
let databaseConnectionPromise;

export default async function handler(request, response) {
  databaseConnectionPromise ||= connectDatabase(config.mongoUri);
  await databaseConnectionPromise;
  return app(request, response);
}
