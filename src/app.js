import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config/env.js';
import { authRouter } from './routes/auth.routes.js';
import { productRouter } from './routes/product.routes.js';
import { taskRouter } from './routes/task.routes.js';
import { userRouter } from './routes/user.routes.js';
import { notFoundHandler } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: config.corsOrigin, credentials: config.corsOrigin !== '*' }));
  app.use(express.json({ limit: '1mb' }));
  app.use(morgan(config.nodeEnv === 'test' ? 'tiny' : 'dev'));
  app.use(
    rateLimit({
      windowMs: config.rateLimitWindowMs,
      limit: config.rateLimitMax,
      standardHeaders: 'draft-8',
      legacyHeaders: false
    })
  );

  app.get('/', (_request, response) => {
    response.json({
      name: 'Playwright API Learning Backend',
      version: '1.0.0',
      docs: '/api/docs',
      health: '/api/health'
    });
  });

  app.get('/api/health', (_request, response) => {
    response.json({
      status: 'ok',
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString()
    });
  });

  app.get('/api/docs', (_request, response) => {
    response.json({
      message: 'See README.md for full API documentation and Playwright examples.',
      resources: ['/api/auth', '/api/users', '/api/products', '/api/tasks']
    });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/users', userRouter);
  app.use('/api/products', productRouter);
  app.use('/api/tasks', taskRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
