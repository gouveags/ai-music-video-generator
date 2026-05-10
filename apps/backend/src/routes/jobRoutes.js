import { Router } from 'express';

export function createJobRouter(controller) {
  const router = Router();

  router.post('/jobs', controller.createJob);
  router.get('/jobs/:id', controller.getJob);
  router.get('/jobs/:id/artifacts', controller.getArtifacts);
  router.get('/jobs/:id/events', controller.streamEvents);

  return router;
}
