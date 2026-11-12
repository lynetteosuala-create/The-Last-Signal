import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CloudRain, Wind, Sparkles, Sliders } from 'lucide-react';
import { sound } from '../audio/soundEngine';

export type WeatherMode = 'dust' | 'rain' | 'blend';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  baseAlpha: number;
  length: number;
  type: 'dust' | 'rain';
  sway: number;
  swaySpeed: number;
}

interface AtmosphericParticlesProps {
  initialMode?: WeatherMode;
}

export const AtmosphericParticles: React.FC<AtmosphericParticlesProps> = ({
  initialMode = 'blend',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mode, setMode] = useState<WeatherMode>(initialMode);
  const [showControls, setShowControls] = useState<boolean>(false);
  const [displayTurbulence, setDisplayTurbulence] = useState<number>(1);

  // References to keep animation loop fast without React re-render overhead
  const intensityRef = useRef<number>(1.0);
  const targetIntensityRef = useRef<number>(1.0);
  const modeRef = useRef<WeatherMode>(initialMode);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });

  // Keep modeRef in sync
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Check reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Handle Resize
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    };

    window.addEventListener('resize', handleResize);

    // Initialize particles based on screen area
    const initParticles = () => {
      const count = Math.min(180, Math.floor((width * height) / 9500));
      const particles: Particle[] = [];

      for (let i = 0; i < count; i++) {
        const isRain =
          modeRef.current === 'rain'
            ? true
            : modeRef.current === 'dust'
            ? false
            : Math.random() < 0.38;

        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: isRain ? (Math.random() - 0.5) * 0.4 - 0.3 : (Math.random() - 0.5) * 0.45,
          vy: isRain ? 6 + Math.random() * 8 : 0.25 + Math.random() * 0.75,
          size: isRain ? 1 + Math.random() * 1.2 : 1 + Math.random() * 2.4,
          alpha: 0.15 + Math.random() * 0.5,
          baseAlpha: 0.15 + Math.random() * 0.5,
          length: isRain ? 14 + Math.random() * 24 : 0,
          type: isRain ? 'rain' : 'dust',
          sway: Math.random() * Math.PI * 2,
          swaySpeed: 0.015 + Math.random() * 0.03,
        });
      }
      particlesRef.current = particles;
    };

    initParticles();

    // Interaction & Scroll Event Listeners
    let lastScrollY = window.scrollY;
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDelta = Math.abs(currentScrollY - lastScrollY);
      lastScrollY = currentScrollY;

      // Intensify proportionally to scroll velocity
      const addedIntensity = Math.min(3.5, scrollDelta * 0.08 + 1.2);
      targetIntensityRef.current = Math.max(targetIntensityRef.current, addedIntensity);

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        targetIntensityRef.current = 1.0;
      }, 350);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY, active: true };
      targetIntensityRef.current = Math.max(targetIntensityRef.current, 1.4);

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        targetIntensityRef.current = 1.0;
        mouseRef.current.active = false;
      }, 400);
    };

    const handleMouseDown = () => {
      targetIntensityRef.current = 2.8;
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        targetIntensityRef.current = 1.0;
      }, 500);
    };

    const handleTouchMove = () => {
      targetIntensityRef.current = 2.5;
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        targetIntensityRef.current = 1.0;
      }, 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    // Animation Loop
    let lastTime = performance.now();
    let uiThrottle = 0;

    const animate = (time: number) => {
      const dt = Math.min(0.1, (time - lastTime) / 1000);
      lastTime = time;

      // Smooth intensity interpolation (lerp)
      intensityRef.current += (targetIntensityRef.current - intensityRef.current) * 0.07;
      const intensity = intensityRef.current;

      // Update UI turbulence indicator at 10Hz
      uiThrottle += dt;
      if (uiThrottle > 0.12) {
        setDisplayTurbulence(Math.round(intensity * 10) / 10);
        uiThrottle = 0;
      }

      ctx.clearRect(0, 0, width, height);

      const particles = particlesRef.current;
      const currentMode = modeRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Recalculate particle type if mode changed dynamically
        if (currentMode === 'rain' && p.type !== 'rain') {
          p.type = 'rain';
          p.vy = 7 + Math.random() * 9;
          p.length = 16 + Math.random() * 26;
        } else if (currentMode === 'dust' && p.type !== 'dust') {
          p.type = 'dust';
          p.vy = 0.3 + Math.random() * 0.8;
          p.length = 0;
        }

        // Sway oscillation
        p.sway += p.swaySpeed * (1 + (intensity - 1) * 0.8);

        // Calculate motion
        let speedMultiplier = 1;
        let windX = 0;

        if (p.type === 'rain') {
          // Rain falls faster, slanting slightly
          speedMultiplier = 1 + (intensity - 1) * 1.25;
          windX = -1.2 * intensity;
        } else {
          // Dust drifts organically with air currents and reacts to intensity
          speedMultiplier = 1 + (intensity - 1) * 1.6;
          windX = Math.sin(p.sway) * 0.6 * intensity;
        }

        // Mouse proximity repulsion/swirl effect
        if (mouseRef.current.active) {
          const dx = p.x - mouseRef.current.x;
          const dy = p.y - mouseRef.current.y;
          const distSq = dx * dx + dy * dy;
          const maxDist = 130;
          if (distSq < maxDist * maxDist && distSq > 0) {
            const dist = Math.sqrt(distSq);
            const force = (1 - dist / maxDist) * 2.5;
            p.x += (dx / dist) * force;
            p.y += (dy / dist) * force;
          }
        }

        p.x += (p.vx + windX) * speedMultiplier;
        p.y += p.vy * speedMultiplier;

        // Wrap around boundaries
        if (p.y > height + 40) {
          p.y = -20;
          p.x = Math.random() * width;
        } else if (p.y < -30) {
          p.y = height + 10;
        }

        if (p.x > width + 40) {
          p.x = -20;
        } else if (p.x < -30) {
          p.x = width + 20;
        }

        // Render particle
        const dynamicAlpha = Math.min(0.85, p.baseAlpha * (0.8 + (intensity - 1) * 0.4));

        if (p.type === 'rain') {
          // Slanted rain drop streak
          const streakLen = p.length * (0.9 + (intensity - 1) * 0.6);
          const endX = p.x + windX * 2;
          const endY = p.y + streakLen;

          const grad = ctx.createLinearGradient(p.x, p.y, endX, endY);
          grad.addColorStop(0, `rgba(180, 200, 220, 0)`);
          grad.addColorStop(0.6, `rgba(195, 215, 235, ${dynamicAlpha * 0.7})`);
          grad.addColorStop(1, `rgba(225, 235, 245, ${dynamicAlpha})`);

          ctx.strokeStyle = grad;
          ctx.lineWidth = p.size;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(endX, endY);
          ctx.stroke();
        } else {
          // Organic glowing dust mote
          const radius = p.size * (1 + (intensity - 1) * 0.25);
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius * 2.2);

          // Subtle reddish/amber dust glow matching The Last Signal's dark bunker atmosphere
          grad.addColorStop(0, `rgba(240, 230, 220, ${dynamicAlpha})`);
          grad.addColorStop(0.4, `rgba(210, 180, 160, ${dynamicAlpha * 0.6})`);
          grad.addColorStop(1, 'rgba(120, 40, 40, 0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius * 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('touchmove', handleTouchMove);
      clearTimeout(scrollTimeout);
    };
  }, []);

  return (
    <>
      {/* Hardware-accelerated fullscreen canvas behind content */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-10 w-full h-full"
      />

      {/* Subtle Atmospheric Weather Widget in bottom-left */}
      <div className="fixed bottom-4 left-4 z-40 font-mono text-[11px]">
        {showControls ? (
          <div className="rounded-lg border border-neutral-800 bg-neutral-950/95 backdrop-blur-md p-3 shadow-2xl text-neutral-300 w-64 animate-flicker">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-2.5">
              <span className="font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                <Wind className="h-3.5 w-3.5" />
                Atmospheric Dynamics
              </span>
              <button
                onClick={() => {
                  sound.playClick();
                  setShowControls(false);
                }}
                className="text-neutral-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-neutral-400">
                <span>Turbulence:</span>
                <span className="text-red-400 font-bold tabular-nums">
                  {displayTurbulence.toFixed(1)}x {displayTurbulence > 1.4 ? '(INTENSIFIED)' : '(CALM)'}
                </span>
              </div>

              <div className="text-[10px] text-neutral-500 mb-1">
                Scroll or move cursor to agitate suspended particles.
              </div>

              <div className="grid grid-cols-3 gap-1 pt-1 border-t border-neutral-900">
                <button
                  onClick={() => {
                    sound.playClick();
                    setMode('dust');
                  }}
                  className={`px-2 py-1 rounded text-center transition-colors ${
                    mode === 'dust'
                      ? 'bg-neutral-800 text-amber-300 font-bold border border-amber-900/60'
                      : 'bg-black text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  Dust
                </button>
                <button
                  onClick={() => {
                    sound.playClick();
                    setMode('rain');
                  }}
                  className={`px-2 py-1 rounded text-center transition-colors ${
                    mode === 'rain'
                      ? 'bg-neutral-800 text-blue-300 font-bold border border-blue-900/60'
                      : 'bg-black text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  Rain
                </button>
                <button
                  onClick={() => {
                    sound.playClick();
                    setMode('blend');
                  }}
                  className={`px-2 py-1 rounded text-center transition-colors ${
                    mode === 'blend'
                      ? 'bg-neutral-800 text-red-300 font-bold border border-red-900/60'
                      : 'bg-black text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  Storm
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => {
              sound.playClick();
              setShowControls(true);
            }}
            title="Adjust atmospheric particulate effect"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-neutral-800/80 bg-neutral-950/80 backdrop-blur-sm text-neutral-400 hover:text-neutral-200 hover:border-neutral-700 transition-colors shadow-lg"
          >
            {mode === 'rain' ? (
              <CloudRain className="h-3.5 w-3.5 text-blue-400" />
            ) : mode === 'dust' ? (
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            ) : (
              <Wind className="h-3.5 w-3.5 text-red-400" />
            )}
            <span className="capitalize">{mode}</span>
            <span className="text-neutral-600">·</span>
            <span className="tabular-nums text-red-400 font-semibold">{displayTurbulence.toFixed(1)}x</span>
          </button>
        )}
      </div>
    </>
  );
};
