import React from 'react';
import { useAIMode } from './AIModeContext';
import './ai-workspace.css';

interface AIOrbProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AIOrb: React.FC<AIOrbProps> = ({ size = 'lg', className = '' }) => {
  const { theme } = useAIMode();
  const isLight = theme === 'light';
  const isSmall = size === 'sm';
  const isMedium = size === 'md';

  return (
    <div
      className={`relative flex items-center justify-center select-none ${className} ${
        isSmall ? 'w-16 h-16' : isMedium ? 'w-28 h-28' : 'w-48 h-48 md:w-56 md:h-56'
      }`}
    >
      {/* 1. Ambient Volumetric Deep Glow */}
      <div
        className={`absolute inset-0 rounded-full pointer-events-none ${
          isLight
            ? 'bg-gradient-to-tr from-blue-400/20 via-indigo-400/15 to-cyan-400/20 blur-3xl'
            : 'bg-gradient-to-tr from-blue-600/30 via-indigo-600/20 to-cyan-400/25 blur-3xl'
        }`}
      />

      {/* 2. Concentric 3D Orbital Wave Rings (Matching Light and Dark Reference Images) */}
      {!isSmall && (
        <>
          {/* Main 3D Orbital Disc */}
          <div className="absolute w-full h-full flex items-center justify-center pointer-events-none animate-ring-spin">
            <div
              className={`w-[140%] h-[140%] rounded-full border ${
                isLight
                  ? 'border-blue-400/40 shadow-[0_0_20px_rgba(59,130,246,0.25)]'
                  : 'border-cyan-400/40 shadow-[0_0_20px_rgba(56,189,248,0.4)]'
              }`}
            />
          </div>

          {/* Secondary Counter-rotating Disc */}
          <div className="absolute w-full h-full flex items-center justify-center pointer-events-none animate-ring-reverse">
            <div
              className={`w-[118%] h-[118%] rounded-full border border-dashed ${
                isLight
                  ? 'border-indigo-400/35 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                  : 'border-indigo-400/30 shadow-[0_0_15px_rgba(129,140,248,0.3)]'
              }`}
            />
          </div>

          {/* Light Mode Concentric Radar Waves (Exact Light Screenshot Match) */}
          {isLight && (
            <div className="absolute w-[180%] h-[180%] flex items-center justify-center pointer-events-none opacity-60">
              <div className="w-[85%] h-[85%] rounded-full border border-blue-200/60" />
              <div className="absolute w-[60%] h-[60%] rounded-full border border-blue-300/40" />
            </div>
          )}

          {/* Horizon Ring Flare */}
          <div
            className={`absolute w-[160%] h-0.5 bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent blur-[1px] ${
              isLight ? 'opacity-50' : 'opacity-75'
            }`}
          />
        </>
      )}

      {/* 3. Central Floating Glass Sphere with Smile Core */}
      <div className="relative z-10 flex items-center justify-center animate-orb-float">
        {/* Layer 1: Outer Glass Shell Glow */}
        <div
          className={`rounded-full p-1 shadow-[0_0_40px_rgba(59,130,246,0.6)] ${
            isLight
              ? 'bg-gradient-to-b from-cyan-300 via-blue-600 to-indigo-700 shadow-blue-500/30'
              : 'bg-gradient-to-b from-cyan-300 via-blue-600 to-indigo-900 shadow-blue-500/50'
          } ${isSmall ? 'w-12 h-12' : isMedium ? 'w-20 h-20' : 'w-28 h-28 md:w-32 md:h-32'}`}
        >
          {/* Layer 2: Inner Deep Core */}
          <div
            className={`w-full h-full rounded-full relative overflow-hidden flex items-center justify-center border shadow-inner ${
              isLight
                ? 'bg-gradient-to-br from-[#1E40AF] via-[#1D4ED8] to-[#0F172A] border-white/40'
                : 'bg-[#070D1F] border-white/20'
            }`}
          >
            {/* Top Glass Specular Reflection Highlight */}
            <div className="absolute top-1 left-2 right-2 h-1/3 rounded-full bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />

            {/* Internal Volumetric Core Glow */}
            <div className="absolute inset-2 rounded-full bg-radial from-cyan-400/30 via-blue-500/25 to-transparent animate-pulse-glow" />

            {/* Iconic Friendly Neural Digital Face (Matching Screenshot) */}
            <div className="relative z-10 flex flex-col items-center justify-center gap-1 text-cyan-200 drop-shadow-[0_0_8px_rgba(56,189,248,0.9)]">
              {/* Eyes */}
              <div className="flex items-center gap-3">
                <span className={`${isSmall ? 'w-1.5 h-1.5' : 'w-2.5 h-2.5'} rounded-full bg-white shadow-[0_0_6px_#ffffff]`} />
                <span className={`${isSmall ? 'w-1.5 h-1.5' : 'w-2.5 h-2.5'} rounded-full bg-white shadow-[0_0_6px_#ffffff]`} />
              </div>

              {/* Gentle Smile Curve */}
              <svg
                className={`${isSmall ? 'w-4 h-2' : 'w-6 h-3'} text-white`}
                viewBox="0 0 24 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.8"
                strokeLinecap="round"
              >
                <path d="M4 3c3 6 13 6 16 0" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
