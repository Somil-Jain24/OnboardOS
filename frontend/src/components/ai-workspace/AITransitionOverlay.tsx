import React from 'react';
import { useAIMode } from './AIModeContext';
import { Sparkles } from 'lucide-react';
import { cn } from '../../utils/cn';

export const AITransitionOverlay: React.FC = () => {
  const { isTransitioning, transitionStep } = useAIMode();

  if (!isTransitioning || transitionStep === 0) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-[99999] pointer-events-none flex items-center justify-center transition-all duration-500 overflow-hidden',
        transitionStep >= 1 ? 'bg-[#030712]/80 backdrop-blur-md' : 'bg-transparent backdrop-blur-none'
      )}
    >
      {/* Outer Atmospheric Glow / Radial Lights (Step 2+) */}
      <div
        className={cn(
          'absolute inset-0 transition-opacity duration-700 ease-out flex items-center justify-center',
          transitionStep >= 2 ? 'opacity-100' : 'opacity-0'
        )}
      >
        <div className="w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-blue-600/30 via-indigo-500/25 to-cyan-400/20 blur-[100px] animate-pulse" />
        <div className="absolute w-[400px] h-[400px] rounded-full bg-blue-500/20 blur-[80px]" />
      </div>

      {/* Outward Expanding Shockwave Ring (Step 4+) */}
      {transitionStep >= 4 && (
        <div className="absolute w-[300px] h-[300px] rounded-full border-2 border-blue-400/40 animate-ping duration-1000" />
      )}

      {/* Central Neural Orb & Pulse (Step 3+) */}
      <div
        className={cn(
          'relative z-10 flex flex-col items-center gap-4 transition-all duration-500',
          transitionStep >= 3 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
        )}
      >
        {/* Glowing Orb Core */}
        <div className="relative w-28 h-28 flex items-center justify-center">
          {/* Orbital Particle Halo */}
          <div className="absolute inset-0 rounded-full border border-cyan-400/50 animate-spin duration-3000" />
          <div className="absolute -inset-2 rounded-full border border-indigo-500/40 border-dashed animate-spin duration-7000" />

          {/* Glowing Sphere */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 via-blue-600 to-indigo-700 p-0.5 shadow-[0_0_50px_rgba(59,130,246,0.8)] flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-[#070D1D] flex items-center justify-center relative overflow-hidden">
              {/* Internal Neural Shimmer */}
              <div className="absolute inset-0 bg-gradient-to-t from-blue-600/30 to-transparent" />
              <Sparkles className="w-8 h-8 text-cyan-300 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Status Text */}
        <div className="text-center space-y-1">
          <div className="text-sm font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-200 to-indigo-300 uppercase font-mono">
            Entering Intelligence Mode
          </div>
          <div className="text-xs text-slate-400 font-medium">
            Initializing OnboardOS Neural Engine...
          </div>
        </div>
      </div>
    </div>
  );
};
