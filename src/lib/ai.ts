
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

const SUPPORTED_SHAPES = [
  'line',
  'rect',
  'circle',
  'arc',
  'text',
  'triangle',
  'arrow',
  'highlight',
  'timeline-marker',
  'path',
  'polyline',
  'polygon',
  'group',
  'molecule',
  'wave',
  'cell',
  'map-pin',
] as const;

const MAX_SHAPE_DEPTH = 3;
const MAX_SHAPES_PER_GROUP = 12;

function isValidPoint(value: unknown): boolean {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const point = value as Record<string, unknown>;

  return (
    typeof point.x === 'number' &&
    Number.isFinite(point.x) &&
    point.x >= 0 &&
    point.x <= 500 &&
    typeof point.y === 'number' &&
    Number.isFinite(point.y) &&
    point.y >= 0 &&
    point.y <= 320
  );
}

function isValidShape(
  value: unknown,
  depth = 0
): value is ShapeInstruction {
  if (!value || typeof value !== 'object') {
    return false;
  }

  if (depth > MAX_SHAPE_DEPTH) {
    return false;
  }

  const shape = value as Record<string, unknown>;

  if (
    typeof shape.kind !== 'string' ||
    !SUPPORTED_SHAPES.includes(
      shape.kind as (typeof SUPPORTED_SHAPES)[number]
    ) ||
    typeof shape.color !== 'string'
  ) {
    return false;
  }

  // Validate coordinates when supplied.
  const coordinateFields = [
    'x1',
    'x2',
  ];

  for (const field of coordinateFields) {
    const coordinate = shape[field];

    if (
      coordinate !== undefined &&
      (typeof coordinate !== 'number' ||
        !Number.isFinite(coordinate) ||
        coordinate < 0 ||
        coordinate > 500)
    ) {
      return false;
    }
  }

  const verticalFields = ['y1', 'y2'];

  for (const field of verticalFields) {
    const coordinate = shape[field];

    if (
      coordinate !== undefined &&
      (typeof coordinate !== 'number' ||
        !Number.isFinite(coordinate) ||
        coordinate < 0 ||
        coordinate > 320)
    ) {
      return false;
    }
  }

  // Validate points used by polygons, waves and paths.
  if (shape.points !== undefined) {
    if (
      !Array.isArray(shape.points) ||
      !shape.points.every(isValidPoint)
    ) {
      return false;
    }
  }

  // Validate nested shapes used by groups and molecules.
  if (shape.children !== undefined) {
    if (
      !Array.isArray(shape.children) ||
      shape.children.length > MAX_SHAPES_PER_GROUP
    ) {
      return false;
    }

    if (
      !shape.children.every((child) =>
        isValidShape(child, depth + 1)
      )
    ) {
      return false;
    }
  }

  // Validate SVG path data.
  if (
    shape.pathData !== undefined &&
    (typeof shape.pathData !== 'string' ||
      shape.pathData.length > 4000)
  ) {
    return false;
  }

  // Validate text fields.
  const stringFields = [
    'text',
    'fontFamily',
    'fontWeight',
    'textAnchor',
    'fill',
    'lineCap',
    'lineJoin',
    'dashArray',
    'id',
  ];

  for (const field of stringFields) {
    if (
      shape[field] !== undefined &&
      typeof shape[field] !== 'string'
    ) {
      return false;
    }
  }

  // Validate numeric properties.
  const numericFields = [
    'radius',
    'fontSize',
    'delayMs',
    'rotation',
    'strokeWidth',
    'fillOpacity',
    'opacity',
    'durationMs',
  ];

  for (const field of numericFields) {
    if (
      shape[field] !== undefined &&
      (typeof shape[field] !== 'number' ||
        !Number.isFinite(shape[field]))
    ) {
      return false;
    }
  }

  // Validate boolean properties.
  if (
    shape.closed !== undefined &&
    typeof shape.closed !== 'boolean'
  ) {
    return false;
  }

  return true;
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
      Number.isFinite(item.durationMs) &&
      Array.isArray(item.shapes) &&
      item.shapes.length <= 12 &&
      item.shapes.every((shape) => isValidShape(shape))
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
              console.log(
                'Whiteboard steps received:',
                event.steps.length,
                event.steps.map((step: StepAnimation) => ({
                  label: step.label,
                  shapes: step.shapes.length,
                  kinds: step.shapes.map((shape) => shape.kind),
                }))
              );

              onBoardSteps?.(event.steps);
            } else {
              console.warn(
                'Whiteboard event received but its steps are invalid:',
                event.steps
              );
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
