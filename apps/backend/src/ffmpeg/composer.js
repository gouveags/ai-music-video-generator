import { spawn } from 'node:child_process';
import path from 'node:path';
import { env } from '../config/env.js';
import { writeText } from '../utils/io.js';

const toSrtTimestamp = (seconds) => {
  const millis = Math.floor((seconds % 1) * 1000);
  const total = Math.floor(seconds);
  const hrs = String(Math.floor(total / 3600)).padStart(2, '0');
  const mins = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
  const secs = String(total % 60).padStart(2, '0');
  const ms = String(millis).padStart(3, '0');
  return `${hrs}:${mins}:${secs},${ms}`;
};

const buildSrt = (lines, totalDurationSeconds) => {
  const safeLines = lines.length > 0 ? lines : ['Instrumental interlude'];
  const blockDuration = Math.max(3, totalDurationSeconds / safeLines.length);

  return safeLines
    .map((line, index) => {
      const start = index * blockDuration;
      const end = Math.min(totalDurationSeconds, (index + 1) * blockDuration - 0.2);
      return [
        String(index + 1),
        `${toSrtTimestamp(start)} --> ${toSrtTimestamp(Math.max(end, start + 1))}`,
        line,
        '',
      ].join('\n');
    })
    .join('\n');
};

const runFfmpeg = (args) =>
  new Promise((resolve, reject) => {
    const child = spawn(env.FFMPEG_PATH, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stderr = '';
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`ffmpeg exited with code ${code}: ${stderr}`));
    });
  });

const escapeForFilterPath = (filePath) =>
  filePath.replace(/\\/g, '/').replace(/:/g, '\\:').replace(/'/g, "\\'");

export async function composeVideo({
  workspaceDir,
  imagePath,
  audioPath,
  lyricsLines,
  durationSeconds,
}) {
  const outputPath = path.join(workspaceDir, 'final-video.mp4');
  const subtitlePath = path.join(workspaceDir, 'lyrics.srt');
  const duration = Number.isFinite(durationSeconds) ? durationSeconds : 90;

  const srt = buildSrt(lyricsLines, duration);
  await writeText(subtitlePath, srt);

  const subtitleFilter = `subtitles='${escapeForFilterPath(subtitlePath)}':force_style='FontName=DejaVu Serif,FontSize=34,Outline=2,Shadow=1,Alignment=2,MarginV=52'`;
  const baseFilter =
    'scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,eq=saturation=1.12:contrast=1.06:brightness=0.02,format=yuv420p';

  const withSubtitleArgs = [
    '-y',
    '-loop',
    '1',
    '-framerate',
    '30',
    '-i',
    imagePath,
    '-i',
    audioPath,
    '-vf',
    `${baseFilter},${subtitleFilter}`,
    '-c:v',
    'libx264',
    '-preset',
    'medium',
    '-pix_fmt',
    'yuv420p',
    '-c:a',
    'aac',
    '-b:a',
    '192k',
    '-shortest',
    '-movflags',
    '+faststart',
    outputPath,
  ];

  try {
    await runFfmpeg(withSubtitleArgs);
    return outputPath;
  } catch (_error) {
    const fallbackArgs = [
      '-y',
      '-loop',
      '1',
      '-framerate',
      '30',
      '-i',
      imagePath,
      '-i',
      audioPath,
      '-vf',
      baseFilter,
      '-c:v',
      'libx264',
      '-preset',
      'medium',
      '-pix_fmt',
      'yuv420p',
      '-c:a',
      'aac',
      '-b:a',
      '192k',
      '-shortest',
      '-movflags',
      '+faststart',
      outputPath,
    ];

    await runFfmpeg(fallbackArgs);
    return outputPath;
  }
}
