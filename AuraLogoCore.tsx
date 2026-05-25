import React from 'react';
import { motion } from 'motion/react';

export default function AuraLogoCore() {
  return (
    <div className="relative w-72 h-72 sm:w-80 sm:h-80 mx-auto flex items-center justify-center my-8 md:my-10 select-none pointer-events-none">
      {/* 1. Embedded custom high-end CSS animations */}
      <style>{`
        @keyframes float-subtle {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-8px) scale(1.02); }
        }
        @keyframes spin-clockwise {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-counter-clockwise {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes aura-pulse {
          0%, 100% { transform: scale(0.95); opacity: 0.35; }
          50% { transform: scale(1.08); opacity: 0.65; }
        }
        @keyframes frequency-bar {
          0%, 100% { height: 15%; }
          50% { height: 75%; }
        }
        @keyframes orbit-glow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
      `}</style>

      {/* 2. Global floating wrapper */}
      <div 
        className="absolute w-full h-full flex items-center justify-center"
        style={{ animation: 'float-subtle 6s ease-in-out infinite' }}
      >
        {/* Giant shifting blur backdrop */}
        <div 
          className="absolute w-[240px] h-[240px] rounded-full bg-gradient-to-tr from-cyan-500 via-purple-500 to-rose-400 blur-[52px] -z-10 will-change-transform"
          style={{ animation: 'aura-pulse 8s ease-in-out infinite' }}
        />

        {/* Triple Orbital Loader Ring System */}
        
        {/* Outer Ring with futuristic data-dash dots */}
        <div 
          className="absolute w-[280px] h-[280px] rounded-full border border-dashed border-cyan-400/20 active:border-cyan-400/45"
          style={{ 
            animation: 'spin-clockwise 30s linear infinite',
            boxShadow: '0 0 15px rgba(34, 211, 238, 0.03)' 
          }}
        />

        {/* Middle Ring with running dual-gradient solid ticks */}
        <div 
          className="absolute w-[230px] h-[230px] rounded-full border-2 border-transparent border-t-cyan-400/60 border-b-purple-500/60"
          style={{ 
            animation: 'spin-counter-clockwise 14s ease-in-out infinite',
            boxShadow: '0 0 25px rgba(168, 85, 247, 0.05)'
          }}
        />

        {/* Inner Ring with neon glow pointer points */}
        <div 
          className="absolute w-[180px] h-[180px] rounded-full border border-double border-white/5 border-r-rose-400/40 border-l-teal-400/40"
          style={{ 
            animation: 'spin-clockwise 10s cubic-bezier(0.4, 0, 0.2, 1) infinite'
          }}
        />

        {/* 3. Center Cinematic Voice Sphere and Digital Equalizer Node */}
        <div className="relative w-40 h-40 rounded-full bg-slate-950/90 border border-white/10 flex items-center justify-center overflow-hidden shadow-2xl backdrop-blur-xl group">
          
          {/* Internal rotating grid panel */}
          <div 
            className="absolute inset-0 opacity-[0.25]"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)',
              backgroundSize: '12px 12px',
              animation: 'spin-clockwise 45s linear infinite'
            }}
          />

          {/* Core holographic glowing orb */}
          <div className="absolute w-24 h-24 rounded-full bg-slate-900 border border-white/10 shadow-inner flex items-center justify-center">
            
            {/* Pulsating core voice waves equalizer */}
            <div className="flex items-center justify-center gap-[4px] h-12 w-20">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((item, idx) => {
                // Determine heights and durations for premium staggered feel
                const duration = 0.5 + Math.random() * 0.7;
                const delay = idx * 0.08;
                const colors = [
                  'bg-cyan-400 shadow-cyan-500/35',
                  'bg-cyan-300 shadow-cyan-400/35',
                  'bg-teal-400 shadow-teal-500/35',
                  'bg-purple-400 shadow-purple-500/35',
                  'bg-purple-300 shadow-purple-400/35',
                  'bg-rose-400 shadow-rose-500/35',
                  'text-amber-300'
                ];
                const itemColor = colors[idx % colors.length];

                return (
                  <div
                    key={idx}
                    className={`w-[4px] rounded-full transition-all ${itemColor} shadow-[0_0_8px_rgba(34,211,238,0.5)]`}
                    style={{
                      height: '20%',
                      animation: `frequency-bar ${duration}s ease-in-out ${delay}s infinite`
                    }}
                  />
                );
              })}
            </div>

          </div>

          {/* Scanning cyber lines sweeps across the loader */}
          <div 
            className="absolute left-0 w-full h-[2px] bg-cyan-400/40 blur-xs"
            style={{
              animation: 'frequency-bar 3s ease-in-out infinite',
              top: '40%'
            }}
          />

          {/* Circular Tech Dial Labels */}
          <div className="absolute top-2 text-[8px] font-mono tracking-widest text-cyan-400/65 uppercase font-medium">
            AuraVoice
          </div>
          <div className="absolute bottom-2.5 text-[7px] font-mono tracking-wider text-purple-400/65 font-bold uppercase">
            Live Spectrum
          </div>
        </div>

        {/* Ambient surrounding constellation items */}
        <div className="absolute top-0 left-0 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" style={{ animation: 'orbit-glow 3s ease-in-out infinite' }} />
        <div className="absolute bottom-4 right-2 w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_10px_#a855f7]" style={{ animation: 'orbit-glow 4s ease-in-out infinite 1s' }} />
        <div className="absolute top-10 right-8 w-1 h-1 rounded-full bg-rose-400 shadow-[0_0_6px_#f43f5e]" style={{ animation: 'orbit-glow 2s ease-in-out infinite 0.5s' }} />
      </div>
    </div>
  );
}
