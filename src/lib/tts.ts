
let currentAudio: HTMLAudioElement | null = null;
let currentAudioUrl: string | null = null;

export async function playTutorAudio(
  text: string
): Promise<void> {
  stopTutorAudio();

  const response = await fetch('/api/tts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.error || 'Could not generate audio'
    );
  }

  if (typeof data?.audio !== 'string') {
    throw new Error('Audio data is missing');
  }

  const binary = atob(data.audio);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  const audioBlob = new Blob([bytes], {
    type: data.mimeType || 'audio/wav',
  });

  currentAudioUrl = URL.createObjectURL(audioBlob);
  currentAudio = new Audio(currentAudioUrl);

  try {
    await currentAudio.play();
  } catch (error) {
    stopTutorAudio();
    throw error;
  }

  currentAudio.onended = () => {
    stopTutorAudio();
  };
}

export function stopTutorAudio(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio.onended = null;
    currentAudio = null;
  }

  if (currentAudioUrl) {
    URL.revokeObjectURL(currentAudioUrl);
    currentAudioUrl = null;
  }
}
