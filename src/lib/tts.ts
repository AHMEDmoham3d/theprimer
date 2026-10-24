
let currentAudioContext: AudioContext | null = null;
let activeSources = new Set<AudioBufferSourceNode>();
let progressTimer: ReturnType<typeof setInterval> | null = null;
let playbackId = 0;

export async function playTutorAudio(
  text: string,
  onProgress?: (visibleText: string) => void
): Promise<void> {
  stopTutorAudio();

  const thisPlaybackId = playbackId;
  const audioContext = new AudioContext({ sampleRate: 24000 });
  currentAudioContext = audioContext;

  try {
    await audioContext.resume();

    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(data?.error || 'Could not generate audio');
    }

    if (!response.body) {
      throw new Error('Audio stream is unavailable');
    }

    const reader = response.body.getReader();
    const audioChunks: Uint8Array[] = [];
    let totalBytes = 0;

    while (true) {
      const { value, done } = await reader.read();

      if (thisPlaybackId !== playbackId) {
        await reader.cancel().catch(() => {});
        return;
      }

      if (done) break;
      if (!value || value.length === 0) continue;

      audioChunks.push(value);
      totalBytes += value.length;
    }

    if (totalBytes < 2) {
      throw new Error('No audio chunks were received');
    }

    // Combine the streamed PCM chunks into one byte array.
    const allBytes = new Uint8Array(totalBytes);
    let offset = 0;

    for (const chunk of audioChunks) {
      allBytes.set(chunk, offset);
      offset += chunk.length;
    }

    // PCM 16-bit audio requires complete two-byte samples.
    const usableLength = allBytes.length - (allBytes.length % 2);

    if (usableLength === 0) {
      throw new Error('The audio data is incomplete');
    }

    const samples = new Int16Array(
      allBytes.buffer,
      allBytes.byteOffset,
      usableLength / 2
    );

    const audioBuffer = audioContext.createBuffer(
      1,
      samples.length,
      24000
    );

    const channel = audioBuffer.getChannelData(0);

    for (let i = 0; i < samples.length; i++) {
      channel[i] = samples[i] / 32768;
    }

    if (thisPlaybackId !== playbackId) return;

    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    activeSources.add(source);

    const words = text.trim().split(/\s+/);
    const duration = audioBuffer.duration;
    const startTime = audioContext.currentTime + 0.05;

    // Start with no visible text; reveal it as the audio progresses.
    onProgress?.('');

    source.onended = () => {
      activeSources.delete(source);

      if (progressTimer !== null) {
        clearInterval(progressTimer);
        progressTimer = null;
      }

      if (thisPlaybackId === playbackId) {
        onProgress?.(text);
      }

      if (currentAudioContext === audioContext) {
        currentAudioContext = null;
        void audioContext.close().catch(() => {});
      }
    };

    source.start(startTime);

    // Reveal whole words according to playback progress.
    progressTimer = setInterval(() => {
      if (thisPlaybackId !== playbackId) return;

      const elapsed = Math.max(
        0,
        audioContext.currentTime - startTime
      );

      const progress = Math.min(1, elapsed / duration);
      const visibleWordCount = Math.min(
        words.length,
        Math.ceil(progress * words.length)
      );

      onProgress?.(words.slice(0, visibleWordCount).join(' '));

      if (progress >= 1 && progressTimer !== null) {
        clearInterval(progressTimer);
        progressTimer = null;
      }
    }, 60);

    // Resolve only after playback ends.
    await new Promise<void>((resolve) => {
      source.addEventListener('ended', () => resolve(), { once: true });
    });
  } catch (error) {
    if (thisPlaybackId === playbackId) {
      stopTutorAudio();
    }

    throw error;
  }
}

export function stopTutorAudio(): void {
  playbackId++;

  if (progressTimer !== null) {
    clearInterval(progressTimer);
    progressTimer = null;
  }

  for (const source of activeSources) {
    try {
      source.stop();
    } catch {
      // The source may have already stopped.
    }

    try {
      source.disconnect();
    } catch {
      // The source may already be disconnected.
    }
  }

  activeSources.clear();

  if (currentAudioContext) {
    const context = currentAudioContext;
    currentAudioContext = null;
    void context.close().catch(() => {});
  }
}
