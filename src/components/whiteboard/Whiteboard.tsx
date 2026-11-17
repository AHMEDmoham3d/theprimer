
import { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  RotateCcw,
} from 'lucide-react';

import type { StepAnimation, ShapeInstruction } from '@/types';
import { cn } from '@/lib/utils';

interface WhiteboardProps {
  steps?: StepAnimation[] | Array<{
    text?: string;
    delayMs?: number;
    label?: string;
    narration?: string;
    durationMs?: number;
    shapes?: ShapeInstruction[];
  }>;
  autoPlay?: boolean;
  className?: string;
}

interface WhiteboardStep {
  text?: string;
  delayMs?: number;
  label?: string;
  narration?: string;
  durationMs?: number;
  shapes?: ShapeInstruction[];
}

const EMPTY_STEPS: WhiteboardStep[] = [];

export function Whiteboard({
  steps,
  autoPlay = false,
  className,
}: WhiteboardProps) {
  const safeSteps = (steps ?? EMPTY_STEPS) as WhiteboardStep[];

  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [showNarration, setShowNarration] = useState(true);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setIsPlaying(autoPlay);
  }, [autoPlay]);

  useEffect(() => {
    if (safeSteps.length === 0) {
      setCurrentStep(0);
      setIsPlaying(false);
      return;
    }

    setCurrentStep((current) =>
      Math.min(current, safeSteps.length - 1)
    );
  }, [safeSteps.length]);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (!isPlaying || safeSteps.length === 0) {
      return;
    }

    if (currentStep >= safeSteps.length - 1) {
      setIsPlaying(false);
      return;
    }

    const currentDuration = Math.max(
      500,
      safeSteps[currentStep]?.durationMs ?? 3000
    );

    timeoutRef.current = setTimeout(() => {
      setCurrentStep((current) =>
        Math.min(current + 1, safeSteps.length - 1)
      );
    }, currentDuration);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isPlaying, currentStep, safeSteps]);

  const allShapes = safeSteps
    .slice(0, currentStep + 1)
    .flatMap((step, stepIndex) =>
      (step.shapes ?? []).map((shape, shapeIndex) => ({
        shape,
        stepIndex,
        shapeIndex,
      }))
    );

  const currentStepData = safeSteps[currentStep];

  const play = () => {
    if (safeSteps.length === 0) return;

    if (currentStep >= safeSteps.length - 1) {
      setCurrentStep(0);
    }

    setIsPlaying(true);
  };

  const pause = () => {
    setIsPlaying(false);
  };

  const next = () => {
    setIsPlaying(false);

    setCurrentStep((current) =>
      Math.min(current + 1, safeSteps.length - 1)
    );
  };

  const prev = () => {
    setIsPlaying(false);

    setCurrentStep((current) =>
      Math.max(current - 1, 0)
    );
  };

  const reset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-2xl border border-[#2a2a2a] bg-[#141414]',
        className
      )}
    >
      <div className="relative aspect-[16/10] w-full bg-[#0f0f0f]">
        <svg
          viewBox="0 0 500 320"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <pattern
              id="whiteboard-grid"
              width="25"
              height="25"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 25 0 L 0 0 0 25"
                fill="none"
                stroke="#1a1a1a"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>

          <style>
            {`
              @keyframes wb-draw {
                from {
                  stroke-dashoffset: 100;
                }
                to {
                  stroke-dashoffset: 0;
                }
              }

              @keyframes wb-fade {
                from {
                  opacity: 0;
                }
                to {
                  opacity: 1;
                }
              }

              @keyframes wb-appear {
                from {
                  opacity: 0;
                  transform: scale(0.65);
                }
                to {
                  opacity: 1;
                  transform: scale(1);
                }
              }

              .wb-draw {
                stroke-dasharray: 100;
                stroke-dashoffset: 100;
                animation-name: wb-draw;
                animation-timing-function: ease-in-out;
                animation-fill-mode: forwards;
              }

              .wb-fade {
                opacity: 0;
                animation: wb-fade 450ms ease forwards;
              }

              .wb-appear {
                opacity: 0;
                transform-box: fill-box;
                transform-origin: center;
                animation: wb-appear 500ms ease forwards;
              }
            `}
          </style>

          <rect
            width="500"
            height="320"
            fill="url(#whiteboard-grid)"
          />

          {allShapes.map(
            ({ shape, stepIndex, shapeIndex }) => (
              <ShapeRenderer
                key={`${stepIndex}-${shapeIndex}`}
                shape={shape}
              />
            )
          )}
        </svg>

        {safeSteps.length > 0 && (
          <div className="absolute left-3 top-3 flex gap-1.5">
            {safeSteps.map((_, index) => (
              <div
                key={index}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  index <= currentStep
                    ? 'w-6 bg-white'
                    : 'w-1.5 bg-neutral-700'
                )}
              />
            ))}
          </div>
        )}

        {currentStepData?.label && (
          <div className="absolute bottom-3 right-3 rounded-lg bg-black/70 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">
            {currentStepData.label}
          </div>
        )}

        {safeSteps.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-neutral-500">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-neutral-700">
              <Play size={20} />
            </div>

            <p className="text-sm">
              السبورة جاهزة للشرح
            </p>

            <p className="text-xs text-neutral-600">
              ستظهر الرسومات هنا أثناء الشرح
            </p>
          </div>
        )}
      </div>

      {showNarration && currentStepData?.narration && (
        <div className="flex items-start gap-2 border-t border-[#2a2a2a] bg-[#161616] px-4 py-3">
          <Volume2
            size={16}
            className="mt-0.5 shrink-0 text-neutral-400"
          />

          <p className="text-sm leading-relaxed text-neutral-200">
            {currentStepData.narration}
          </p>
        </div>
      )}

      <div className="flex items-center gap-2 border-t border-[#2a2a2a] bg-[#141414] px-4 py-3">
        <button
          onClick={reset}
          disabled={safeSteps.length === 0}
          title="إعادة من البداية"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-800 hover:text-white disabled:opacity-30"
        >
          <RotateCcw size={16} />
        </button>

        <button
          onClick={prev}
          disabled={currentStep === 0 || safeSteps.length === 0}
          title="الخطوة السابقة"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-800 hover:text-white disabled:opacity-30"
        >
          <SkipBack size={16} />
        </button>

        {isPlaying ? (
          <button
            onClick={pause}
            title="إيقاف مؤقت"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black transition hover:bg-neutral-200"
          >
            <Pause size={18} />
          </button>
        ) : (
          <button
            onClick={play}
            disabled={safeSteps.length === 0}
            title="تشغيل"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black transition hover:bg-neutral-200 disabled:opacity-30"
          >
            <Play size={18} className="mr-0.5" />
          </button>
        )}

        <button
          onClick={next}
          disabled={
            currentStep >= safeSteps.length - 1 ||
            safeSteps.length === 0
          }
          title="الخطوة التالية"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-800 hover:text-white disabled:opacity-30"
        >
          <SkipForward size={16} />
        </button>

        <div className="mr-auto text-xs tabular-nums text-neutral-500">
          {safeSteps.length > 0
            ? `${currentStep + 1} / ${safeSteps.length}`
            : '0 / 0'}
        </div>

        <button
          onClick={() => setShowNarration((visible) => !visible)}
          className={cn(
            'rounded-lg px-3 py-1.5 text-xs font-medium transition',
            showNarration
              ? 'bg-neutral-800 text-white'
              : 'text-neutral-500 hover:text-white'
          )}
        >
          {showNarration ? 'إخفاء الشرح' : 'إظهار الشرح'}
        </button>
      </div>
    </div>
  );
}

export function ShapeRenderer({
  shape,
}: {
  shape?: ShapeInstruction;
  index?: number;
}) {
  if (!shape) return null;

  const delay = Math.max(0, shape.delayMs ?? 0);
  const color = shape.color || '#3b82f6';
  const strokeWidth = shape.strokeWidth ?? 2.5;
  const duration = Math.max(100, shape.durationMs ?? 900);

  const fill = shape.fill ?? 'none';
  const fillOpacity = shape.fillOpacity ?? 0.15;
  const opacity = shape.opacity ?? 1;

  const lineCap = shape.lineCap ?? 'round';

  // React SVG typings support only round, bevel, and miter here.
  const lineJoin: 'round' | 'bevel' | 'miter' =
    shape.lineJoin === 'bevel' || shape.lineJoin === 'miter'
      ? shape.lineJoin
      : 'round';

  const drawStyle = {
    animationDuration: `${duration}ms`,
    animationDelay: `${delay}ms`,
  };

  const fadeStyle = {
    animationDelay: `${delay}ms`,
  };

  const pointsString = (shape.points ?? [])
    .map((point) => `${point.x},${point.y}`)
    .join(' ');

  switch (shape.kind) {
    case 'line':
      return (
        <line
          x1={shape.x1 ?? 0}
          y1={shape.y1 ?? 0}
          x2={shape.x2 ?? 0}
          y2={shape.y2 ?? 0}
          pathLength={100}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap={lineCap}
          strokeLinejoin={lineJoin}
          strokeDasharray={shape.dashArray}
          opacity={opacity}
          className="wb-draw"
          style={drawStyle}
        />
      );

    case 'rect': {
      const x = Math.min(shape.x1 ?? 0, shape.x2 ?? 0);
      const y = Math.min(shape.y1 ?? 0, shape.y2 ?? 0);
      const width = Math.abs((shape.x2 ?? 0) - (shape.x1 ?? 0));
      const height = Math.abs((shape.y2 ?? 0) - (shape.y1 ?? 0));

      return (
        <g opacity={opacity}>
          <rect
            x={x}
            y={y}
            width={width}
            height={height}
            fill={fill === 'none' ? color : fill}
            fillOpacity={fillOpacity}
            rx={shape.radius ?? 6}
            className="wb-fade"
            style={fadeStyle}
          />

          <rect
            x={x}
            y={y}
            width={width}
            height={height}
            pathLength={100}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            rx={shape.radius ?? 6}
            className="wb-draw"
            style={drawStyle}
          />
        </g>
      );
    }

    case 'circle':
      return (
        <g opacity={opacity}>
          <circle
            cx={shape.x1 ?? 0}
            cy={shape.y1 ?? 0}
            r={shape.radius ?? 10}
            fill={fill === 'none' ? color : fill}
            fillOpacity={fillOpacity}
            className="wb-fade"
            style={fadeStyle}
          />

          <circle
            cx={shape.x1 ?? 0}
            cy={shape.y1 ?? 0}
            r={shape.radius ?? 10}
            pathLength={100}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            className="wb-draw"
            style={drawStyle}
          />
        </g>
      );

    case 'arc': {
      const radius = shape.radius ?? 10;

      return (
        <path
          d={shape.pathData ?? `
            M ${shape.x1 ?? 0} ${shape.y1 ?? 0}
            A ${radius} ${radius} 0 0 0
            ${(shape.x1 ?? 0) + radius}
            ${(shape.y1 ?? 0) + 10}
          `}
          pathLength={100}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap={lineCap}
          className="wb-draw"
          style={drawStyle}
        />
      );
    }

    case 'text':
      return (
        <text
          x={shape.x1 ?? 0}
          y={shape.y1 ?? 0}
          fill={color}
          fontSize={shape.fontSize ?? 16}
          fontFamily={shape.fontFamily ?? 'Cairo, sans-serif'}
          fontWeight={shape.fontWeight ?? 600}
          textAnchor={shape.textAnchor ?? 'start'}
          opacity={opacity}
          className="wb-fade"
          style={fadeStyle}
        >
          {shape.text || ''}
        </text>
      );

    case 'triangle':
    case 'polygon': {
      if (!shape.points || shape.points.length < 3) {
        return null;
      }

      return (
        <g opacity={opacity}>
          <polygon
            points={pointsString}
            fill={fill === 'none' ? color : fill}
            fillOpacity={fillOpacity}
            className="wb-fade"
            style={fadeStyle}
          />

          <polygon
            points={pointsString}
            pathLength={100}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinejoin={lineJoin}
            className="wb-draw"
            style={drawStyle}
          />
        </g>
      );
    }

    case 'polyline':
      if (!shape.points || shape.points.length < 2) {
        return null;
      }

      return (
        <polyline
          points={pointsString}
          pathLength={100}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap={lineCap}
          strokeLinejoin={lineJoin}
          strokeDasharray={shape.dashArray}
          opacity={opacity}
          className="wb-draw"
          style={drawStyle}
        />
      );

    case 'path':
      if (!shape.pathData) {
        return null;
      }

      return (
        <path
          d={shape.pathData}
          pathLength={100}
          fill={fill}
          fillOpacity={fillOpacity}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap={lineCap}
          strokeLinejoin={lineJoin}
          strokeDasharray={shape.dashArray}
          opacity={opacity}
          className="wb-draw"
          style={drawStyle}
        />
      );

    case 'arrow':
      return (
        <g opacity={opacity}>
          <line
            x1={shape.x1 ?? 0}
            y1={shape.y1 ?? 0}
            x2={shape.x2 ?? 0}
            y2={shape.y2 ?? 0}
            pathLength={100}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap={lineCap}
            className="wb-draw"
            style={drawStyle}
          />

          <path
            d={`
              M ${(shape.x2 ?? 0) - 8} ${(shape.y2 ?? 0) - 6}
              L ${shape.x2 ?? 0} ${shape.y2 ?? 0}
              L ${(shape.x2 ?? 0) - 8} ${(shape.y2 ?? 0) + 6}
            `}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="wb-fade"
            style={{
              animationDelay: `${delay + duration}ms`,
            }}
          />
        </g>
      );

    case 'highlight':
      return (
        <rect
          x={Math.min(shape.x1 ?? 0, shape.x2 ?? 0) - 4}
          y={Math.min(shape.y1 ?? 0, shape.y2 ?? 0) - 4}
          width={Math.abs((shape.x2 ?? 0) - (shape.x1 ?? 0)) + 8}
          height={Math.abs((shape.y2 ?? 0) - (shape.y1 ?? 0)) + 8}
          fill={fill === 'none' ? color : fill}
          fillOpacity={shape.fillOpacity ?? 0.18}
          rx={shape.radius ?? 4}
          opacity={opacity}
          className="wb-fade"
          style={fadeStyle}
        />
      );

    case 'timeline-marker':
      return (
        <g
          opacity={opacity}
          className="wb-appear"
          style={fadeStyle}
        >
          <circle
            cx={shape.x1 ?? 0}
            cy={shape.y1 ?? 0}
            r={12}
            fill={color}
            fillOpacity={0.2}
          />

          <circle
            cx={shape.x1 ?? 0}
            cy={shape.y1 ?? 0}
            r={7}
            fill={color}
          />
        </g>
      );

    case 'group':
    case 'molecule':
      return (
        <g
          opacity={opacity}
          transform={
            shape.rotation
              ? `rotate(${shape.rotation} ${shape.x1 ?? 0} ${shape.y1 ?? 0})`
              : undefined
          }
        >
          {(shape.children ?? []).map((child, index) => (
            <ShapeRenderer
              key={child.id ?? `${shape.kind}-${index}`}
              shape={child}
            />
          ))}
        </g>
      );

    case 'wave':
      if (shape.pathData) {
        return (
          <path
            d={shape.pathData}
            pathLength={100}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap={lineCap}
            strokeLinejoin={lineJoin}
            opacity={opacity}
            className="wb-draw"
            style={drawStyle}
          />
        );
      }

      if (shape.points && shape.points.length >= 2) {
        return (
          <polyline
            points={pointsString}
            pathLength={100}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap={lineCap}
            strokeLinejoin={lineJoin}
            opacity={opacity}
            className="wb-draw"
            style={drawStyle}
          />
        );
      }

      return null;

    case 'cell': {
      const cx = shape.x1 ?? 0;
      const cy = shape.y1 ?? 0;
      const radius = shape.radius ?? 35;

      return (
        <g opacity={opacity}>
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill={fill === 'none' ? color : fill}
            fillOpacity={0.08}
            stroke={color}
            strokeWidth={strokeWidth}
            pathLength={100}
            className="wb-draw"
            style={drawStyle}
          />

          <circle
            cx={cx + radius * 0.15}
            cy={cy - radius * 0.1}
            r={radius * 0.3}
            fill={color}
            fillOpacity={0.2}
            stroke={color}
            strokeWidth={1.5}
            className="wb-appear"
            style={{
              animationDelay: `${delay + duration}ms`,
            }}
          />

          <circle
            cx={cx + radius * 0.15}
            cy={cy - radius * 0.1}
            r={radius * 0.1}
            fill={color}
            className="wb-appear"
            style={{
              animationDelay: `${delay + duration + 250}ms`,
            }}
          />
        </g>
      );
    }

    case 'map-pin': {
      const x = shape.x1 ?? 0;
      const y = shape.y1 ?? 0;
      const radius = shape.radius ?? 9;

      return (
        <g
          opacity={opacity}
          className="wb-appear"
          style={fadeStyle}
        >
          <path
            d={`
              M ${x} ${y + radius * 2}
              C ${x - radius * 0.6} ${y + radius * 0.8},
                ${x - radius * 1.8} ${y - radius * 0.3},
                ${x - radius} ${y - radius}
              A ${radius} ${radius} 0 1 1
                ${x + radius} ${y - radius}
              C ${x + radius * 1.8} ${y - radius * 0.3},
                ${x + radius * 0.6} ${y + radius * 0.8},
                ${x} ${y + radius * 2}
              Z
            `}
            fill={fill === 'none' ? color : fill}
            fillOpacity={0.9}
            stroke={color}
            strokeWidth={1.5}
          />

          <circle
            cx={x}
            cy={y - radius * 0.25}
            r={radius * 0.35}
            fill="#ffffff"
          />
        </g>
      );
    }

    default:
      return null;
  }
}
