
let currentAudioContext: AudioContext | null = null;

let activeSources = new Set<AudioBufferSourceNode>();

let nextStartTime = 0;
let playbackId = 0;

export async function playTutorAudio(
  text: string
): Promise<void> {
  stopTutorAudio();

  const thisPlaybackId = playbackId;

  const audioContext = new AudioContext({
    sampleRate: 24000,
  });

  currentAudioContext = audioContext;
  nextStartTime = audioContext.currentTime;

  try {
    await audioContext.resume();

    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);

      throw new Error(
        data?.error || 'Could not generate audio'
      );
    }

    if (!response.body) {
      throw new Error('Audio stream is unavailable');
    }

    const reader = response.body.getReader();

    let pendingByte: number | null = null;
    let receivedAudio = false;

    while (true) {
      const { value, done } = await reader.read();

      if (thisPlaybackId !== playbackId) {
        await reader.cancel().catch(() => {});
        return;
      }

      if (done) break;
      if (!value || value.length === 0) continue;

      let bytes = value;

      // Preserve a byte if a network chunk ends mid-sample.
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

      const startTime = Math.max(
        nextStartTime,
        audioContext.currentTime + 0.03
      );

      source.start(startTime);
      activeSources.add(source);

      nextStartTime = startTime + audioBuffer.duration;
      receivedAudio = true;
    }

    if (pendingByte !== null) {
      console.warn('Incomplete final PCM audio sample received');
    }

    if (!receivedAudio) {
      throw new Error('No audio chunks were received');
    }
  } catch (error) {
    if (thisPlaybackId === playbackId) {
      stopTutorAudio();
    }

    throw error;
  }
}

export function stopTutorAudio(): void {
  playbackId++;

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

  nextStartTime = 0;
}
