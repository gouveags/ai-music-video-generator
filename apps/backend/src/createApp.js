import express from 'express';
import cors from 'cors';
import { createJobController } from './controllers/jobController.js';
import { createJobRouter } from './routes/jobRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { env } from './config/env.js';

export function createApp(jobService) {
  const app = express();

  app.use(
    cors({
      origin: env.FRONTEND_ORIGIN,
    })
  );

  app.use(express.json({ limit: '2mb' }));

  const controller = createJobController(jobService);

  app.get('/api/v1/health', async (_req, res, next) => {
    try {
      const health = await jobService.getHealthStatus();
      res.json(health);
    } catch (error) {
      next(error);
    }
  });

  app.use('/api/v1', createJobRouter(controller));

  app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  app.use(errorHandler);

  return app;
}
