'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface PageLoaderProps {
  isLoading: boolean;
}

export function PageLoader({ isLoading }: PageLoaderProps) {
  const [show, setShow] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isLoading) {
      setShow(true);
      setProgress(0);

      // Simulate progress
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 15;
        });
      }, 200);

      return () => clearInterval(interval);
    } else {
      setProgress(100);
      const timer = setTimeout(() => setShow(false), 400);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-500 ${
        isLoading ? 'opacity-100' : 'opacity-0 scale-105'
      }`}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />

      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle, #22c55e 0%, transparent 70%)',
            animation: 'float 8s ease-in-out infinite',
          }}
        />
        <div
          className="absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)',
            animation: 'float 10s ease-in-out infinite reverse',
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, #f59e0b 0%, transparent 60%)',
            animation: 'pulse 4s ease-in-out infinite',
          }}
        />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Main Content */}
      <div className="relative flex flex-col items-center gap-8 px-4">

        {/* Logo Container with glow effect */}
        <div className="relative">
          {/* Glow effect */}
          <div
            className="absolute inset-0 blur-3xl opacity-50"
            style={{
              background: 'linear-gradient(135deg, #22c55e, #3b82f6)',
              animation: 'pulse 2s ease-in-out infinite',
            }}
          />

          {/* Logo ring animation */}
          <div className="relative">
            {/* Outer rotating ring */}
            <div
              className="absolute -inset-4 rounded-full border-2 border-dashed border-green-500/30"
              style={{ animation: 'spin 20s linear infinite' }}
            />

            {/* Middle rotating ring (reverse) */}
            <div
              className="absolute -inset-8 rounded-full border border-blue-500/20"
              style={{ animation: 'spin 15s linear infinite reverse' }}
            />

            {/* Logo */}
            <div
              className="relative w-28 h-28 rounded-2xl overflow-hidden shadow-2xl ring-4 ring-white/10"
              style={{ animation: 'logoFloat 3s ease-in-out infinite' }}
            >
              <Image
                src="/favicon.png"
                alt="AfricaVet"
                fill
                className="object-contain p-3 bg-white"
                priority
              />
            </div>
          </div>
        </div>

        {/* Brand name with gradient */}
        <div className="text-center">
          <h1
            className="text-4xl font-black tracking-tight"
            style={{
              background: 'linear-gradient(135deg, #22c55e 0%, #3b82f6 50%, #f59e0b 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'shimmer 3s ease-in-out infinite',
            }}
          >
            AfricaVet
          </h1>
          <p className="text-slate-400 text-sm mt-2 tracking-widest uppercase">
            Plateforme Vétérinaire Africaine
          </p>
        </div>

        {/* Modern Progress indicator */}
        <div className="w-64 space-y-3">
          {/* Progress bar container */}
          <div className="relative h-1.5 bg-slate-700/50 rounded-full overflow-hidden backdrop-blur-sm">
            {/* Animated background */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                animation: 'shimmerBar 1.5s ease-in-out infinite',
              }}
            />
            {/* Progress fill */}
            <div
              className="h-full rounded-full transition-all duration-300 ease-out relative overflow-hidden"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #22c55e, #3b82f6, #22c55e)',
                backgroundSize: '200% 100%',
                animation: 'gradientMove 2s linear infinite',
              }}
            >
              {/* Shine effect on progress */}
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
                  animation: 'shine 1s ease-in-out infinite',
                }}
              />
            </div>
          </div>

          {/* Loading text with dots */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-slate-400 text-sm font-medium">Chargement</span>
            <span className="flex gap-1">
              <span
                className="w-1.5 h-1.5 rounded-full bg-green-500"
                style={{ animation: 'bounce 1s ease-in-out infinite' }}
              />
              <span
                className="w-1.5 h-1.5 rounded-full bg-blue-500"
                style={{ animation: 'bounce 1s ease-in-out infinite', animationDelay: '0.15s' }}
              />
              <span
                className="w-1.5 h-1.5 rounded-full bg-amber-500"
                style={{ animation: 'bounce 1s ease-in-out infinite', animationDelay: '0.3s' }}
              />
            </span>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -z-10">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-white/20"
              style={{
                top: `${Math.sin(i * 60 * Math.PI / 180) * 150}px`,
                left: `${Math.cos(i * 60 * Math.PI / 180) * 150}px`,
                animation: `twinkle ${1 + i * 0.2}s ease-in-out infinite`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(30px, -30px); }
        }

        @keyframes logoFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes shimmer {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.2); }
        }

        @keyframes shimmerBar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }

        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(-5px); opacity: 0.5; }
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.5); }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.2; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}
