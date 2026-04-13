import { config } from './config/env.js';
import { connectDatabase } from './config/database.js';
import { createApp } from './app.js';

async function startServer() {
  await connectDatabase(config.mongoUri);

  const app = createApp();
  app.listen(config.port, () => {
    console.log(`API server running at http://localhost:${config.port}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start API server:', error);
  process.exit(1);
});
