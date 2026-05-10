import { randomUUID } from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs/promises';
import {
  addJobEvent,
  createArtifact,
  recordProviderCall,
  updateJobState,
} from '../repositories/jobRepository.js';
import { logger } from '../config/logger.js';
import { uploadBuffer } from '../config/storage.js';
import { composeVideo } from '../ffmpeg/composer.js';
import { generateImage, generateLyrics } from '../providers/openaiProvider.js';
import { generateSong } from '../providers/sunoProvider.js';
import { ensureDir, readBuffer, writeBuffer, writeJson } from '../utils/io.js';

const TMP_ROOT = path.resolve(process.cwd(), 'tmp', 'jobs');

const updateProgress = async ({ jobId, stage, status, progress, message, metadata = {} }) => {
  await updateJobState({
    jobId,
    stage,
    status,
    progress,
    errorMessage: status === 'failed' ? message : null,
  });

  await addJobEvent({
    jobId,
    stage,
    message,
    metadata,
  });
};

const withProviderTracking = async ({ jobId, provider, operation, requestPayload, run }) => {
  try {
    const responsePayload = await run();

    await recordProviderCall({
      jobId,
      provider,
      operation,
      status: 'success',
      requestPayload,
      responsePayload,
      errorMessage: null,
    });

    return responsePayload;
  } catch (error) {
    await recordProviderCall({
      jobId,
      provider,
      operation,
      status: 'failed',
      requestPayload,
      responsePayload: null,
      errorMessage: error.message,
    });
    throw error;
  }
};

const persistArtifact = async ({ jobId, artifactType, extension, mimeType, localPath }) => {
  const fileBuffer = await readBuffer(localPath);
  const objectName = `${jobId}/${Date.now()}-${artifactType}-${randomUUID()}.${extension}`;

  const uploaded = await uploadBuffer({
    objectName,
    buffer: fileBuffer,
    contentType: mimeType,
  });

  const artifact = await createArtifact({
    jobId,
    artifactType,
    storageKey: uploaded.storageKey,
    publicUrl: uploaded.publicUrl,
    mimeType,
  });

  return artifact;
};

export async function processGenerationJob(job) {
  const { jobId, input } = job.data;
  const workspaceDir = path.join(TMP_ROOT, jobId);

  await ensureDir(workspaceDir);

  try {
    await updateProgress({
      jobId,
      stage: 'processing',
      status: 'running',
      progress: 5,
      message: 'Worker started processing the generation pipeline.',
    });
    await job.updateProgress(5);

    const lyrics = await withProviderTracking({
      jobId,
      provider: 'openai',
      operation: 'lyrics.generate',
      requestPayload: input,
      run: () => generateLyrics(input),
    });

    await writeJson(path.join(workspaceDir, 'lyrics.json'), lyrics);
    await updateProgress({
      jobId,
      stage: 'lyrics_generated',
      status: 'running',
      progress: 25,
      message: 'Lyrics generated successfully.',
      metadata: { title: lyrics.title },
    });
    await job.updateProgress(25);

    const image = await withProviderTracking({
      jobId,
      provider: 'openai',
      operation: 'image.generate',
      requestPayload: {
        style: input.style,
        mood: input.mood,
        genre: input.genre,
        topic: input.topic,
      },
      run: () =>
        generateImage({
          lyrics,
          style: input.style,
          mood: input.mood,
          genre: input.genre,
          topic: input.topic,
        }),
    });

    const imagePath = path.join(workspaceDir, `cover.${image.extension}`);
    await writeBuffer(imagePath, image.buffer);
    await updateProgress({
      jobId,
      stage: 'image_generated',
      status: 'running',
      progress: 45,
      message: 'Cover image generated.',
    });
    await job.updateProgress(45);

    const song = await withProviderTracking({
      jobId,
      provider: 'suno',
      operation: 'music.generate',
      requestPayload: {
        mood: input.mood,
        genre: input.genre,
        topic: input.topic,
        lyrics,
      },
      run: () =>
        generateSong({
          lyrics,
          mood: input.mood,
          genre: input.genre,
          topic: input.topic,
        }),
    });

    const audioPath = path.join(workspaceDir, `track.${song.extension}`);
    await writeBuffer(audioPath, song.buffer);
    await updateProgress({
      jobId,
      stage: 'audio_generated',
      status: 'running',
      progress: 70,
      message: 'Music track generated and downloaded.',
      metadata: song.metadata,
    });
    await job.updateProgress(70);

    const videoPath = await composeVideo({
      workspaceDir,
      imagePath,
      audioPath,
      lyricsLines: lyrics.lines,
      durationSeconds: input.durationSeconds,
    });

    await updateProgress({
      jobId,
      stage: 'video_composed',
      status: 'running',
      progress: 85,
      message: 'Video composition finished.',
    });
    await job.updateProgress(85);

    await persistArtifact({
      jobId,
      artifactType: 'lyrics_json',
      extension: 'json',
      mimeType: 'application/json',
      localPath: path.join(workspaceDir, 'lyrics.json'),
    });

    await persistArtifact({
      jobId,
      artifactType: 'cover_image',
      extension: image.extension,
      mimeType: image.mimeType,
      localPath: imagePath,
    });

    await persistArtifact({
      jobId,
      artifactType: 'audio_track',
      extension: song.extension,
      mimeType: song.mimeType,
      localPath: audioPath,
    });

    await persistArtifact({
      jobId,
      artifactType: 'final_video',
      extension: 'mp4',
      mimeType: 'video/mp4',
      localPath: videoPath,
    });

    await updateProgress({
      jobId,
      stage: 'completed',
      status: 'done',
      progress: 100,
      message: 'Generation pipeline completed successfully.',
    });
    await job.updateProgress(100);

    return {
      jobId,
      status: 'done',
    };
  } catch (error) {
    await updateProgress({
      jobId,
      stage: 'failed',
      status: 'failed',
      progress: 100,
      message: error.message,
      metadata: {
        name: error.name,
      },
    });

    logger.error('Generation job failed', {
      jobId,
      error,
    });

    throw error;
  } finally {
    await fs.rm(workspaceDir, { recursive: true, force: true });
  }
}
