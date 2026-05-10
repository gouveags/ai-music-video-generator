const state = {
  jobId: null,
  pollTimer: null,
  eventSource: null,
  lastEventId: 0,
};

const refs = {
  form: document.querySelector('#generation-form'),
  submitButton: document.querySelector('#submit-button'),
  statusPill: document.querySelector('#status-pill'),
  jobId: document.querySelector('#job-id'),
  stageLabel: document.querySelector('#stage-label'),
  progressValue: document.querySelector('#progress-value'),
  progressFill: document.querySelector('#progress-fill'),
  progressTrack: document.querySelector('.progress-track'),
  eventsList: document.querySelector('#events-list'),
  artifactsGrid: document.querySelector('#artifacts-grid'),
  artifactTemplate: document.querySelector('#artifact-template'),
};

const apiBase = (document.body.dataset.apiBase || 'http://localhost:8080/api/v1').replace(
  /\/$/,
  ''
);

const statusClassMap = {
  queued: 'queued',
  running: 'running',
  done: 'done',
  failed: 'failed',
};

const formatDate = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const request = async (path, options) => {
  const response = await fetch(`${apiBase}${path}`, options);
  if (!response.ok) {
    let message = `${response.status} ${response.statusText}`;
    try {
      const payload = await response.json();
      message = payload.error || payload.message || message;
    } catch (_error) {
      // ignore json parse errors
    }
    throw new Error(message);
  }
  return response.json();
};

const appendEvent = (event) => {
  if (!refs.eventsList) return;

  const li = document.createElement('li');
  li.className = 'event-item';
  li.innerHTML = `
    <div class="event-stage">${event.stage}</div>
    <div class="event-message">${event.message}</div>
    <time class="event-time">${formatDate(event.created_at)}</time>
  `;

  refs.eventsList.prepend(li);

  while (refs.eventsList.children.length > 40) {
    refs.eventsList.removeChild(refs.eventsList.lastChild);
  }
};

const setStatus = ({ status, stage, progress }) => {
  const safeStatus = status || 'queued';
  const safeStage = stage || 'queued';
  const safeProgress = Number.isFinite(progress) ? progress : 0;

  refs.statusPill.textContent = safeStatus;
  refs.statusPill.className = `status-pill ${statusClassMap[safeStatus] || 'queued'}`;
  refs.stageLabel.textContent = safeStage.replaceAll('_', ' ');
  refs.progressValue.textContent = `${safeProgress}%`;
  refs.progressFill.style.width = `${safeProgress}%`;
  refs.progressTrack.setAttribute('aria-valuenow', String(safeProgress));
};

const clearArtifacts = () => {
  refs.artifactsGrid.innerHTML = '';
};

const renderArtifactPreview = (artifact, previewNode) => {
  if (artifact.artifact_type === 'cover_image') {
    const img = document.createElement('img');
    img.src = artifact.public_url;
    img.alt = 'Generated cover art';
    img.loading = 'lazy';
    previewNode.append(img);
    return;
  }

  if (artifact.artifact_type === 'audio_track') {
    const audio = document.createElement('audio');
    audio.controls = true;
    audio.src = artifact.public_url;
    previewNode.append(audio);
    return;
  }

  if (artifact.artifact_type === 'final_video') {
    const video = document.createElement('video');
    video.controls = true;
    video.src = artifact.public_url;
    previewNode.append(video);
    return;
  }

  const p = document.createElement('p');
  p.textContent = 'No inline preview available.';
  previewNode.append(p);
};

const renderArtifacts = (artifacts = []) => {
  clearArtifacts();

  if (artifacts.length === 0) {
    refs.artifactsGrid.innerHTML = '<p class="artifact-empty">No artifacts yet.</p>';
    return;
  }

  for (const artifact of artifacts) {
    const fragment = refs.artifactTemplate.content.cloneNode(true);
    const titleNode = fragment.querySelector('.artifact-title');
    const metaNode = fragment.querySelector('.artifact-meta');
    const previewNode = fragment.querySelector('.artifact-preview');
    const linkNode = fragment.querySelector('.artifact-link');

    titleNode.textContent = artifact.artifact_type.replaceAll('_', ' ');
    metaNode.textContent = `${artifact.mime_type || 'unknown mime'} · ${formatDate(artifact.created_at)}`;
    linkNode.href = artifact.public_url;

    renderArtifactPreview(artifact, previewNode);

    refs.artifactsGrid.append(fragment);
  }
};

const fetchJob = async () => {
  if (!state.jobId) return;

  const job = await request(`/jobs/${state.jobId}`);
  setStatus(job);

  if (job.status === 'done') {
    const artifactPayload = await request(`/jobs/${state.jobId}/artifacts`);
    renderArtifacts(artifactPayload.artifacts || []);
    stopPolling();
    closeEventStream();
  }

  if (job.status === 'failed') {
    stopPolling();
    closeEventStream();
  }
};

const stopPolling = () => {
  if (state.pollTimer) {
    clearInterval(state.pollTimer);
    state.pollTimer = null;
  }
};

const closeEventStream = () => {
  if (state.eventSource) {
    state.eventSource.close();
    state.eventSource = null;
  }
};

const subscribeToEvents = () => {
  closeEventStream();

  const url = `${apiBase}/jobs/${state.jobId}/events?afterId=${state.lastEventId}`;
  const source = new EventSource(url);

  source.addEventListener('job-event', (event) => {
    const payload = JSON.parse(event.data);
    state.lastEventId = payload.id;
    appendEvent(payload);
  });

  source.addEventListener('terminal', () => {
    fetchJob().catch(console.error);
  });

  source.onerror = () => {
    source.close();
    state.eventSource = null;
  };

  state.eventSource = source;
};

const setBusy = (busy) => {
  refs.submitButton.disabled = busy;
  refs.submitButton.textContent = busy ? 'Submitting...' : 'Generate Video';
};

refs.form?.addEventListener('submit', async (event) => {
  event.preventDefault();

  try {
    setBusy(true);
    clearArtifacts();
    refs.eventsList.innerHTML = '';
    state.lastEventId = 0;

    const formData = new FormData(refs.form);
    const payload = Object.fromEntries(formData.entries());
    payload.durationSeconds = Number(payload.durationSeconds);

    const created = await request('/jobs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    state.jobId = created.id;
    refs.jobId.textContent = `Active Job: ${created.id}`;
    setStatus({ status: created.status, stage: 'queued', progress: 0 });

    subscribeToEvents();
    stopPolling();
    state.pollTimer = setInterval(() => {
      fetchJob().catch(console.error);
    }, 4000);

    await fetchJob();
  } catch (error) {
    appendEvent({
      id: Date.now(),
      stage: 'client_error',
      message: error.message,
      created_at: new Date().toISOString(),
    });
    setStatus({ status: 'failed', stage: 'request_failed', progress: 100 });
  } finally {
    setBusy(false);
  }
});
