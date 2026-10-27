import cors from 'cors';
import express from 'express';
import { apiRouter } from './routes/api.js';

type ApiError = Error & { status?: number; type?: string };

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.get('/health', (_request, response) => response.json({ ok: true }));
  app.use('/api', apiRouter);
  app.use('/api', (_request, response) => {
    response.status(404).json({ error: 'API route was not found' });
  });
  app.use((error: ApiError, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
    const status = error.type === 'entity.parse.failed' ? 400 : error.status ?? 500;
    response.status(status).json({ error: status === 400 && error.type === 'entity.parse.failed' ? 'Request body must be valid JSON' : error.message });
  });
  return app;
}
