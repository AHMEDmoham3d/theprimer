import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, RotateCcw } from 'lucide-react';
import type { StepAnimation, ShapeInstruction } from '@/types';
import { cn } from '@/lib/utils';

interface WhiteboardProps {
  steps: StepAnimation[];
  autoPlay?: boolean;
  className?: string;
}

export function Whiteboard({ steps, autoPlay = false, className }: WhiteboardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [showNarration, setShowNarration] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      timeoutRef.current = setTimeout(() => {
        setCurrentStep((s) => s + 1);
      }, steps[currentStep]?.durationMs ?? 3000);
    } else if (isPlaying && currentStep >= steps.length - 1) {
      setIsPlaying(false);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isPlaying, currentStep, steps]);

  const allShapes = steps.slice(0, currentStep + 1).flatMap((step) => step.shapes);

  const play = () => {
    if (currentStep >= steps.length - 1) {
      setCurrentStep(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(true);
    }
  };
  const pause = () => setIsPlaying(false);
  const next = () => {
    setIsPlaying(false);
    setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
  };
  const prev = () => {
    setIsPlaying(false);
    setCurrentStep((s) => Math.max(s - 1, 0));
  };
  const reset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  return (
    <div className={cn('flex flex-col rounded-2xl border border-[#2a2a2a] bg-[#141414] overflow-hidden', className)}>
      {/* Canvas */}
      <div className="relative aspect-[16/10] w-full bg-[#0f0f0f]">
        <svg viewBox="0 0 500 320" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
          {/* Grid */}
          <defs>
            <pattern id="grid" width="25" height="25" patternUnits="userSpaceOnUse">
              <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#1a1a1a" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="500" height="320" fill="url(#grid)" />

          {allShapes.map((shape, i) => (
            <ShapeRenderer key={`${currentStep}-${i}`} shape={shape} index={i} />
          ))}
        </svg>

        {/* Step indicator */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {steps.map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                i <= currentStep ? 'w-6 bg-white' : 'w-1.5 bg-neutral-700'
              )}
            />
          ))}
        </div>

        {/* Step label */}
        <div className="absolute bottom-3 right-3 rounded-lg bg-black/70 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">
          {steps[currentStep]?.label}
        </div>
      </div>

      {/* Narration */}
      {showNarration && steps[currentStep]?.narration && (
        <div className="flex items-start gap-2 border-t border-[#2a2a2a] px-4 py-3 bg-[#161616]">
          <Volume2 size={16} className="mt-0.5 shrink-0 text-neutral-400" />
          <p className="text-sm text-neutral-200 leading-relaxed">{steps[currentStep].narration}</p>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-2 border-t border-[#2a2a2a] px-4 py-3 bg-[#141414]">
        <button
          onClick={reset}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition hover:text-white hover:bg-neutral-800"
        >
          <RotateCcw size={16} />
        </button>
        <button
          onClick={prev}
          disabled={currentStep === 0}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition hover:text-white hover:bg-neutral-800 disabled:opacity-30"
        >
          <SkipBack size={16} />
        </button>
        {isPlaying ? (
          <button
            onClick={pause}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black transition hover:bg-neutral-200"
          >
            <Pause size={18} />
          </button>
        ) : (
          <button
            onClick={play}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black transition hover:bg-neutral-200"
          >
            <Play size={18} className="mr-0.5" />
          </button>
        )}
        <button
          onClick={next}
          disabled={currentStep >= steps.length - 1}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition hover:text-white hover:bg-neutral-800 disabled:opacity-30"
        >
          <SkipForward size={16} />
        </button>
        <div className="mr-auto text-xs text-neutral-500">
          {currentStep + 1} / {steps.length}
        </div>
        <button
          onClick={() => setShowNarration(!showNarration)}
          className={cn(
            'rounded-lg px-3 py-1.5 text-xs font-medium transition',
            showNarration ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-white'
          )}
        >
          {showNarration ? 'إخفاء الشرح' : 'إظهار الشرح'}
        </button>
      </div>
    </div>
  );
}

function ShapeRenderer({ shape, index }: { shape: ShapeInstruction; index: number }) {
  const delay = (shape.delayMs ?? 0) / 1000;

  switch (shape.kind) {
    case 'line':
      return (
        <line
          x1={shape.x1} y1={shape.y1} x2={shape.x2} y2={shape.y2}
          stroke={shape.color}
          strokeWidth={3}
          strokeLinecap="round"
          className="animate-draw"
          style={{ animationDelay: `${delay}s` }}
        />
      );
    case 'rect':
      return (
        <rect
          x={shape.x1} y={shape.y1}
          width={(shape.x2 ?? 0) - (shape.x1 ?? 0)}
          height={(shape.y2 ?? 0) - (shape.y1 ?? 0)}
          fill={shape.color}
          fillOpacity={0.2}
          stroke={shape.color}
          strokeWidth={2}
          rx={6}
          className="animate-appear-scale"
          style={{ animationDelay: `${delay}s`, transformOrigin: 'center' }}
        />
      );
    case 'circle':
      return (
        <circle
          cx={shape.x1} cy={shape.y1} r={shape.radius}
          fill={shape.color}
          fillOpacity={0.15}
          stroke={shape.color}
          strokeWidth={2.5}
          className="animate-appear-scale"
          style={{ animationDelay: `${delay}s`, transformOrigin: 'center' }}
        />
      );
    case 'arc':
      return (
        <path
          d={`M ${shape.x1} ${shape.y1} A ${shape.radius} ${shape.radius} 0 0 0 ${(shape.x1 ?? 0) + (shape.radius ?? 0)} ${(shape.y1 ?? 0) + 10}`}
          fill="none"
          stroke={shape.color}
          strokeWidth={2.5}
          className="animate-draw"
          style={{ animationDelay: `${delay}s` }}
        />
      );
    case 'text':
      return (
        <text
          x={shape.x1} y={shape.y1}
          fill={shape.color}
          fontSize={shape.fontSize ?? 16}
          fontFamily="Cairo, sans-serif"
          fontWeight="600"
          className="animate-fade-in"
          style={{ animationDelay: `${delay}s` }}
        >
          {shape.text}
        </text>
      );
    case 'triangle':
      if (!shape.points || shape.points.length < 3) return null;
      const pts = shape.points.map((p) => `${p.x},${p.y}`).join(' ');
      return (
        <polygon
          points={pts}
          fill={shape.color}
          fillOpacity={0.1}
          stroke={shape.color}
          strokeWidth={2.5}
          className="animate-appear-scale"
          style={{ animationDelay: `${delay}s`, transformOrigin: 'center' }}
        />
      );
    case 'arrow':
      return (
        <g className="animate-fade-in" style={{ animationDelay: `${delay}s` }}>
          <line x1={shape.x1} y1={shape.y1} x2={shape.x2} y2={shape.y2} stroke={shape.color} strokeWidth={2.5} strokeLinecap="round" />
          <circle cx={shape.x2} cy={shape.y2} r={4} fill={shape.color} />
        </g>
      );
    case 'highlight':
      return (
        <rect
          x={Math.min(shape.x1 ?? 0, shape.x2 ?? 0) - 4}
          y={Math.min(shape.y1 ?? 0, shape.y2 ?? 0) - 4}
          width={Math.abs((shape.x2 ?? 0) - (shape.x1 ?? 0)) + 8}
          height={Math.abs((shape.y2 ?? 0) - (shape.y1 ?? 0)) + 8}
          fill={shape.color}
          fillOpacity={0.12}
          rx={4}
          className="animate-fade-in"
          style={{ animationDelay: `${delay}s` }}
        />
      );
    case 'timeline-marker':
      return (
        <g className="animate-appear-scale" style={{ animationDelay: `${delay}s`, transformOrigin: 'center' }}>
          <circle cx={shape.x1} cy={shape.y1} r={8} fill={shape.color} />
          <circle cx={shape.x1} cy={shape.y1} r={12} fill={shape.color} fillOpacity={0.2} />
        </g>
      );
    default:
      return null;
  }
}
