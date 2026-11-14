
import type { StepAnimation, ShapeInstruction } from '@/types';

export interface StudentContext {
  name: string;
  grade: string;
  stage?: string;
  curriculum?: string;
  subject?: string;
  subjectName?: string;
  weakTopics: string[];
}

export interface TutorAIMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface TutorLessonContext {
  lessonId: string;
  lessonTitle: string;
  unitTitle: string;
  content: string;
  order: number;
}

export interface TutorAIOptions {
  conversationHistory?: TutorAIMessage[];
  isFirstMessage?: boolean;
  lastLessonTitle?: string | null;
  lastTopic?: string | null;

  // Actual lessons published for the student's selected curriculum.
  curriculumLessons?: TutorLessonContext[];

  // Receives structured whiteboard steps from the AI backend.
  onBoardSteps?: (steps: StepAnimation[]) => void;
}

function isValidShape(value: unknown): value is ShapeInstruction {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const shape = value as Record<string, unknown>;

  const supportedKinds = [
    'line',
    'rect',
    'circle',
    'arc',
    'text',
    'triangle',
    'arrow',
    'highlight',
    'molecule',
    'wave',
    'cell',
    'map-pin',
    'timeline-marker',
  ];

  return (
    typeof shape.kind === 'string' &&
    supportedKinds.includes(shape.kind) &&
    typeof shape.color === 'string'
  );
}

function isValidBoardSteps(value: unknown): value is StepAnimation[] {
  if (!Array.isArray(value)) {
    return false;
  }

  return value.every((step) => {
    if (!step || typeof step !== 'object') {
      return false;
    }

    const item = step as Record<string, unknown>;

    return (
      typeof item.id === 'string' &&
      typeof item.label === 'string' &&
      typeof item.narration === 'string' &&
      typeof item.durationMs === 'number' &&
      Array.isArray(item.shapes) &&
      item.shapes.every(isValidShape)
    );
  });
}

export async function askAITutor(
  prompt: string,
  studentContext?: StudentContext,
  onChunk?: (chunk: string) => void,
  options?: TutorAIOptions
): Promise<string> {
  const {
    onBoardSteps,
    curriculumLessons,
    ...tutorOptions
  } = options || {};

  const res = await fetch('/api/ask-ai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      studentContext,
      conversationHistory: tutorOptions.conversationHistory || [],
      tutorOptions: {
        isFirstMessage: tutorOptions.isFirstMessage ?? false,
        lastLessonTitle: tutorOptions.lastLessonTitle || null,
        lastTopic: tutorOptions.lastTopic || null,
      },
      curriculumLessons: curriculumLessons || [],
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);

    console.error('AI backend error:', res.status, data);

    throw new Error(
      data?.error || 'The AI backend could not complete the request'
    );
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

        if (!line.startsWith('data:')) {
          continue;
        }

        const payload = line.slice(5).trim();

        if (!payload || payload === '[DONE]') {
          continue;
        }

        try {
          const event = JSON.parse(payload);

          // Structured whiteboard event from the backend.
          if (event?.type === 'board') {
            if (isValidBoardSteps(event.steps)) {
              onBoardSteps?.(event.steps);
            }

            continue;
          }

          // Normal text event.
          if (
            event?.type === 'text' &&
            typeof event.chunk === 'string' &&
            event.chunk.length > 0
          ) {
            answer += event.chunk;
            onChunk?.(event.chunk);
            continue;
          }

          // Backward compatibility with the original Groq SSE format.
          const chunk = event?.choices?.[0]?.delta?.content;

          if (typeof chunk === 'string' && chunk.length > 0) {
            answer += chunk;
            onChunk?.(chunk);
          }
        } catch (error) {
          console.warn(
            'Could not parse an AI stream event:',
            error
          );
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
