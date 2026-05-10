import { ZodError } from 'zod';

const parseAfterId = (value) => {
  const n = Number(value);
  if (Number.isNaN(n) || n < 0) {
    return 0;
  }
  return Math.floor(n);
};

export function createJobController(jobService) {
  return {
    createJob: async (req, res, next) => {
      try {
        const result = await jobService.createGenerationJob(req.body ?? {});
        res.status(202).json(result);
      } catch (error) {
        if (error instanceof ZodError) {
          res.status(400).json({
            error: 'Invalid request payload',
            details: error.issues,
          });
          return;
        }

        next(error);
      }
    },

    getJob: async (req, res, next) => {
      try {
        const job = await jobService.getGenerationJob(req.params.id);
        if (!job) {
          res.status(404).json({ error: 'Job not found' });
          return;
        }

        res.json(job);
      } catch (error) {
        next(error);
      }
    },

    getArtifacts: async (req, res, next) => {
      try {
        const job = await jobService.getGenerationJob(req.params.id);
        if (!job) {
          res.status(404).json({ error: 'Job not found' });
          return;
        }

        const artifacts = await jobService.getGenerationJobArtifacts(req.params.id);
        res.json({
          jobId: req.params.id,
          artifacts,
        });
      } catch (error) {
        next(error);
      }
    },

    streamEvents: async (req, res, next) => {
      try {
        const job = await jobService.getGenerationJob(req.params.id);
        if (!job) {
          res.status(404).json({ error: 'Job not found' });
          return;
        }

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        let lastEventId = parseAfterId(req.query.afterId);

        const publishEvents = async () => {
          const events = await jobService.getGenerationJobEvents(req.params.id, {
            afterId: lastEventId,
            limit: 100,
          });

          for (const event of events) {
            lastEventId = event.id;
            res.write(`event: job-event\n`);
            res.write(`id: ${event.id}\n`);
            res.write(`data: ${JSON.stringify(event)}\n\n`);
          }

          const current = await jobService.getGenerationJob(req.params.id);
          if (current && (current.status === 'done' || current.status === 'failed')) {
            res.write(`event: terminal\n`);
            res.write(`data: ${JSON.stringify({ status: current.status })}\n\n`);
          }
        };

        await publishEvents();

        const interval = setInterval(async () => {
          try {
            await publishEvents();
          } catch (error) {
            clearInterval(interval);
            res.write(`event: error\n`);
            res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
            res.end();
          }
        }, 2000);

        req.on('close', () => {
          clearInterval(interval);
          res.end();
        });
      } catch (error) {
        next(error);
      }
    },
  };
}
