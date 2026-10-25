
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

  let nextStartTime = 0;
  let playbackStartTime = 0;
  let audioStarted = false;

  const words = text.trim().split(/\s+/).filter(Boolean);

  // Estimate the speaking duration for gradual text reveal.
  // This is approximate, not exact word-level synchronization.
  const estimatedDuration = Math.max(words.length / 2.5, 1);

  try {
    await audioContext.resume();

    const response = await fetch("/api/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(data?.error || "Could not generate audio");
    }

    if (!response.body) {
      throw new Error("Audio stream is unavailable");
    }

    const reader = response.body.getReader();

    let pendingByte: number | null = null;
    let receivedAudio = false;

    onProgress?.("");

    while (true) {
      const { value, done } = await reader.read();

      if (thisPlaybackId !== playbackId) {
        await reader.cancel().catch(() => {});
        return;
      }

      if (done) break;
      if (!value || value.length === 0) continue;

      let bytes = value;

      // Preserve a byte if the chunk ends halfway through an Int16 sample.
      if (pendingByte !== null) {
        const combined = new Uint8Array(bytes.length + 1);
        combined[0] = pendingByte;
        combined.set(bytes, 1);
        bytes = combined;
        pendingByte = null;
      }

      if (bytes.length % 2 !== 0) {
        pendingByte = bytes[bytes.length - 1];
        bytes = bytes.subarray(0, bytes.length - 1);
      }

      if (bytes.length === 0) continue;

      const samples = new Int16Array(
        bytes.buffer,
        bytes.byteOffset,
        bytes.length / 2
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

      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);

      source.onended = () => {
        activeSources.delete(source);
      };

      // Schedule each chunk immediately after the previous chunk.
      const startTime = Math.max(
        nextStartTime,
        audioContext.currentTime + 0.03
      );

      source.start(startTime);
      activeSources.add(source);

      nextStartTime = startTime + audioBuffer.duration;
      receivedAudio = true;

      // Start revealing the answer as soon as audio playback begins.
      if (!audioStarted) {
        audioStarted = true;
        playbackStartTime = startTime;

        progressTimer = setInterval(() => {
          if (thisPlaybackId !== playbackId) return;

          const elapsed = Math.max(
            0,
            audioContext.currentTime - playbackStartTime
          );

          const progress = Math.min(
            elapsed / estimatedDuration,
            0.98
          );

          const visibleWordCount = Math.min(
            Math.max(1, Math.ceil(progress * words.length)),
            Math.max(1, words.length - 1)
          );

          if (words.length > 1) {
            onProgress?.(
              words.slice(0, visibleWordCount).join(" ")
            );
          } else {
            onProgress?.(text);
          }
        }, 60);
      }
    }

    if (pendingByte !== null) {
      console.warn("Incomplete final PCM audio sample received");
    }

    if (!receivedAudio) {
      throw new Error("No audio chunks were received");
    }

    // Wait until all scheduled audio has finished playing.
    while (
      thisPlaybackId === playbackId &&
      audioContext.currentTime < nextStartTime
    ) {
      await new Promise<void>((resolve) => {
        setTimeout(resolve, 50);
      });
    }

    if (thisPlaybackId !== playbackId) return;

    if (progressTimer !== null) {
      clearInterval(progressTimer);
      progressTimer = null;
    }

    onProgress?.(text);

    activeSources.clear();

    if (currentAudioContext === audioContext) {
      currentAudioContext = null;
    }

    await audioContext.close().catch(() => {});
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
