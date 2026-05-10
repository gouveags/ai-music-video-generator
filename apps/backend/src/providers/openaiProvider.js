import axios from 'axios';
import OpenAI from 'openai';
import { env } from '../config/env.js';

const hasApiKey = Boolean(env.OPENAI_API_KEY);

const openaiClient = hasApiKey
  ? new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    })
  : null;

const parseLyricsPayload = (text) => {
  try {
    const parsed = JSON.parse(text);
    if (parsed && parsed.title && Array.isArray(parsed.lines) && parsed.lines.length > 0) {
      return parsed;
    }
  } catch (_error) {
    // best effort parser with fallback below
  }

  return {
    title: 'Untitled Vision',
    lines: text
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 12),
  };
};

const buildFallbackImage = ({ mood, genre, topic }) => {
  const width = 960;
  const height = 540;
  const bytes = Buffer.alloc(width * height * 3);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const offset = (y * width + x) * 3;
      bytes[offset] = Math.floor((x / width) * 255);
      bytes[offset + 1] = Math.floor((y / height) * 180 + 50);
      bytes[offset + 2] = Math.floor(((x + y) / (width + height)) * 255);
    }
  }

  const caption = `mood:${mood} genre:${genre} topic:${topic}`;
  const header = `P6\n# ${caption}\n${width} ${height}\n255\n`;
  return Buffer.concat([Buffer.from(header, 'utf8'), bytes]);
};

export async function generateLyrics(input) {
  if (!openaiClient) {
    const title = `${input.topic} in ${input.genre}`;
    return {
      title,
      lines: [
        `In this ${input.mood} night, we chase the light`,
        `Through ${input.topic}, our voices take flight`,
        `Every heartbeat turns into a spark`,
        `We sing the dawn awake out of the dark`,
        `Hold that thought, don't let it fade`,
        `In this rhythm, we are unafraid`,
      ],
    };
  }

  const prompt = [
    'Return only valid JSON with shape: {"title": string, "lines": string[]}.',
    'Generate exactly 8 lyric lines suitable for a 1-2 minute social media song.',
    `Mood: ${input.mood}`,
    `Genre: ${input.genre}`,
    `Topic: ${input.topic}`,
    `Language: ${input.language}`,
  ].join('\n');

  const completion = await openaiClient.chat.completions.create({
    model: env.OPENAI_TEXT_MODEL,
    messages: [
      {
        role: 'system',
        content:
          'You are an expert songwriter. Produce concise, emotionally vivid, singable lyrics.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.8,
  });

  const content = completion.choices?.[0]?.message?.content ?? '';
  return parseLyricsPayload(content);
}

export async function generateImage({ lyrics, style, mood, genre, topic }) {
  if (!openaiClient) {
    return {
      buffer: buildFallbackImage({ mood, genre, topic }),
      mimeType: 'image/x-portable-pixmap',
      extension: 'ppm',
      promptUsed: 'fallback-gradient',
    };
  }

  const prompt = [
    `Create an art-directed music video cover scene in ${style} style.`,
    `Mood: ${mood}. Genre: ${genre}. Topic: ${topic}.`,
    'Composition: cinematic lighting, dramatic depth, dynamic focus, no text overlays.',
    `Lyrics context: ${lyrics.lines.join(' | ')}`,
  ].join(' ');

  const response = await openaiClient.images.generate({
    model: env.OPENAI_IMAGE_MODEL,
    prompt,
    size: '1536x1024',
  });

  const first = response.data?.[0];
  if (first?.b64_json) {
    return {
      buffer: Buffer.from(first.b64_json, 'base64'),
      mimeType: 'image/png',
      extension: 'png',
      promptUsed: prompt,
    };
  }

  if (first?.url) {
    const imageResponse = await axios.get(first.url, {
      responseType: 'arraybuffer',
    });

    return {
      buffer: Buffer.from(imageResponse.data),
      mimeType: 'image/png',
      extension: 'png',
      promptUsed: prompt,
    };
  }

  throw new Error('OpenAI image response missing image payload.');
}
