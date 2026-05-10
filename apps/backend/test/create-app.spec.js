import { expect } from 'chai';
import request from 'supertest';
import { createApp } from '../src/createApp.js';
import { jobInputSchema } from '../src/services/validation.js';

const buildService = () => {
  const jobs = new Map();

  return {
    async createGenerationJob(payload) {
      const input = jobInputSchema.parse(payload);
      const id = 'job-123';
      jobs.set(id, {
        id,
        status: 'queued',
        stage: 'queued',
        progress: 0,
        input,
      });
      return { id, status: 'queued' };
    },

    async getGenerationJob(id) {
      return jobs.get(id) ?? null;
    },

    async getGenerationJobArtifacts() {
      return [
        {
          artifact_type: 'final_video',
          public_url: 'http://localhost:9000/music-video-assets/job-123/final.mp4',
        },
      ];
    },

    async getGenerationJobEvents() {
      return [];
    },

    async getHealthStatus() {
      return { status: 'ok' };
    },
  };
};

describe('createApp', () => {
  it('returns health status', async () => {
    const app = createApp(buildService());
    const response = await request(app).get('/api/v1/health');

    expect(response.status).to.equal(200);
    expect(response.body.status).to.equal('ok');
  });

  it('creates job when payload is valid', async () => {
    const app = createApp(buildService());

    const response = await request(app).post('/api/v1/jobs').send({
      mood: 'relaxed',
      genre: 'ambient',
      topic: 'sunrise by the beach',
    });

    expect(response.status).to.equal(202);
    expect(response.body.id).to.equal('job-123');
  });

  it('rejects invalid job payload', async () => {
    const app = createApp(buildService());

    const response = await request(app).post('/api/v1/jobs').send({
      mood: 'x',
      genre: 'ambient',
      topic: 'sunrise by the beach',
    });

    expect(response.status).to.equal(400);
    expect(response.body.error).to.equal('Invalid request payload');
  });

  it('returns 404 for missing job', async () => {
    const app = createApp(buildService());
    const response = await request(app).get('/api/v1/jobs/not-found');

    expect(response.status).to.equal(404);
  });
});
