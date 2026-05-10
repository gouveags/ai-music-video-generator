import axios from 'axios';
import { env } from '../config/env.js';

const sunoClient = axios.create({
  baseURL: env.SUNO_API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const normalizePrompt = ({ lyrics, genre, mood, topic }) => {
  const verse = lyrics.lines.join(' ');
  return `A ${genre} song with ${mood} mood about ${topic}. Lyrics excerpt: ${verse}`;
};

async function startGeneration(payload) {
  try {
    const custom = await sunoClient.post('/api/custom_generate', {
      prompt: payload.prompt,
      tags: payload.genre,
      title: payload.title,
      make_instrumental: false,
      wait_audio: false,
      lyrics: payload.lyrics.lines.join('\n'),
    });

    if (Array.isArray(custom.data) && custom.data.length > 0) {
      return custom.data;
    }
  } catch (_error) {
    // fallback to simpler endpoint below
  }

  const basic = await sunoClient.post('/api/generate', {
    prompt: payload.prompt,
    make_instrumental: false,
    wait_audio: false,
  });

  return basic.data;
}

const parseReadyAudio = (items) =>
  items.find((item) => {
    const status = (item.status || '').toLowerCase();
    return (
      Boolean(item.audio_url) &&
      (status.includes('stream') || status.includes('complete') || status.includes('succeeded'))
    );
  });

export async function generateSong(input) {
  const prompt = normalizePrompt(input);
  const initial = await startGeneration({
    prompt,
    genre: input.genre,
    title: input.lyrics.title,
    lyrics: input.lyrics,
  });

  const ids = initial.map((item) => item.id).filter(Boolean);
  if (ids.length === 0) {
    throw new Error('Suno API did not return generation IDs.');
  }

  const startedAt = Date.now();
  while (Date.now() - startedAt < env.SUNO_POLL_TIMEOUT_MS) {
    const response = await sunoClient.get('/api/get', {
      params: {
        ids: ids.join(','),
      },
    });

    const tracks = Array.isArray(response.data) ? response.data : [];
    const ready = parseReadyAudio(tracks);

    if (ready?.audio_url) {
      const audioResponse = await axios.get(ready.audio_url, {
        responseType: 'arraybuffer',
      });

      return {
        buffer: Buffer.from(audioResponse.data),
        mimeType: 'audio/mpeg',
        extension: 'mp3',
        metadata: {
          sunoId: ready.id,
          title: ready.title,
          audioUrl: ready.audio_url,
        },
      };
    }

    await sleep(env.SUNO_POLL_INTERVAL_MS);
  }

  throw new Error('Timed out waiting for Suno generation to complete.');
}
