export async function askAITutor(
  prompt: string,
  studentContext?: {
    name: string;
    grade: string;
    weakTopics: string[];
  },
  onChunk?: (chunk: string) => void
): Promise<string> {
  const res = await fetch('/api/ask-ai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      studentContext,
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    console.error('AI backend error:', res.status, data);

    throw new Error('The AI backend could not complete the request');
  }

  if (!res.body) {
    throw new Error('The AI response stream is unavailable');
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  let buffer = '';
  let answer = '';
  let streamFinished = false;

  try {
    while (!streamFinished) {
      const { value, done } = await reader.read();

      if (done) {
        buffer += decoder.decode();
        buffer += '\n';
        streamFinished = true;
      } else {
        buffer += decoder.decode(value, { stream: true });
      }

      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const rawLine of lines) {
        const line = rawLine.trim();

        if (!line.startsWith('data:')) continue;

        const payload = line.slice(5).trim();

        if (!payload || payload === '[DONE]') continue;

        try {
          const event = JSON.parse(payload);
          const chunk = event?.choices?.[0]?.delta?.content;

          if (typeof chunk === 'string' && chunk.length > 0) {
            answer += chunk;
            onChunk?.(chunk);
          }
        } catch (error) {
          // Ignore malformed or incomplete SSE events.
          console.warn('Could not parse an AI stream event:', error);
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  if (!answer.trim()) {
    throw new Error('The AI provider returned an empty answer');
  }

  return answer.trim();
}