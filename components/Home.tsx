import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Link } from 'react-router-dom';
import { SITE_CONTENT, PROJECTS } from '../constants';
import { Project } from '../types';

const PostcardItem: React.FC<{ project: Project; index: number }> = ({ project, index }) => {
  const isEven = index % 2 === 0;
  const [isHovered, setIsHovered] = useState(false);
  const [heroVideo, setHeroVideo] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const checkVideo = async () => {
      const extensions = ['mp4', 'webm', 'mov'];
      for (const ext of extensions) {
        const path = `/projects/${project.id}/hero.${ext}`;
        try {
          const video = document.createElement('video');
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(), 1000);
            video.onloadedmetadata = () => { clearTimeout(timeout); resolve(true); };
            video.onerror = () => { clearTimeout(timeout); reject(); };
            video.src = path;
          });
          setHeroVideo(path);
          return;
        } catch {}
      }
    };
    checkVideo();
  }, [project.id]);

  useEffect(() => {
    if (videoRef.current) {
      if (isHovered) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isHovered]);

  return (
    <div
      className="group cursor-pointer block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 items-start`}>
        {/* Image/Video */}
          <Link
            to={`/work/${project.id}`}
            className="relative w-full md:w-2/3 aspect-[16/9] flex-shrink-0 transition-all duration-300 shadow-[4px_4px_0_rgba(0,0,0,0.35)] group-hover:shadow-[8px_8px_0_rgba(0,0,0,0.35)] group-hover:-translate-y-2 group-hover:rotate-1"
            style={{ transform: isHovered ? 'rotate(-1deg)' : 'rotate(0deg)', backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)', backgroundSize: '20px 20px' }}
          >
          <div className="absolute inset-0 overflow-hidden rounded-sm">
            <img 
              src={project.image} 
              alt={project.title}
              className="w-full h-full object-cover"
            />
            {heroVideo && isHovered && (
              <video
                ref={videoRef}
                src={heroVideo}
                className="absolute inset-0 w-full h-full object-cover"
                loop
                muted
                playsInline
              />
            )}
          </div>
          
          {/* Award Badge */}
          {project.stickers && project.stickers.length > 0 && (
            <div className="absolute -top-10 -right-10 z-10">
              {project.stickers.map((sticker, idx) => (
                <img 
                  key={idx}
                  src={sticker}
                  alt="Award"
                  className="w-40 h-40 object-contain drop-shadow-2xl transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110"
                />
              ))}
            </div>
          )}
        </Link>
        
        {/* Content - Sticky Note Style */}
        <div className="flex-1 pt-4 relative">
          <div
            className="bg-white py-6 px-6 border-2 border-black shadow-[4px_4px_0_rgba(0,0,0,0.35)] transition-transform duration-300 hover:shadow-[8px_8px_0_rgba(0,0,0,0.35)] hover:-translate-y-1 relative"
            style={{ transform: isHovered ? 'rotate(0.5deg)' : 'rotate(0deg)' }}
          >
            <h3 className="text-3xl md:text-4xl font-medium text-black mb-3">{project.title}</h3>
            <p className="text-base text-gray-700 mb-4">{project.venue}</p>
            <p className="text-sm text-gray-500 mb-6">{project.location} • {project.installDate}</p>
            <p className="text-base text-gray-600 mb-5 leading-relaxed">{project.shortDescription}</p>
            <div className="flex flex-wrap gap-2.5 mb-6">
              {project.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 text-xs font-semibold rounded-full border-2 border-black shadow-[4px_4px_0_rgba(0,0,0,0.35)] transition-transform duration-200"
                  style={{
                    backgroundColor: ['#FF6B6B', '#FFD93D', '#6BCF7F', '#A78BFA', '#FF9ECD'][idx % 5] + '33',
                    transform: idx % 2 === 0 ? 'rotate(-2deg)' : 'rotate(2deg)'
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
            <Link 
              to={`/work/${project.id}`}
              className="inline-block px-6 py-3 bg-black text-white border-2 border-black shadow-[0_3px_10px_rgba(0,0,0,0.24)] transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(0,0,0,0.28)]"
            >
              View Project →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const COLLAGE_IMAGES = [
  '/about/Jan.png',
  '/about/Feb.png',
  '/about/Mar.png',
  '/about/April.png',
  '/about/May.png',
  '/about/June.png',
  '/about/July.png',
  '/about/August.png',
  '/about/Sep.png',
  '/about/Oct.png'
];

const MAX_PINS = 8;
const PIN_LIFETIME_MS = 10000;
const AMBIENT_MAX = 8;
const AMBIENT_BEAT_MS = 900;
const AMBIENT_LIFE_MS = AMBIENT_BEAT_MS * AMBIENT_MAX;

const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);
type StickerSource = { src: string };

const getAvailableImages = (current: StickerSource[]) =>
  COLLAGE_IMAGES.filter((src) => !current.some((item) => item.src === src));
const pickUniqueImage = (current: StickerSource[]) => {
  const available = getAvailableImages(current);
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
};

type CollageItem = {
  id: number;
  src: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  parallax: number;
  introDelay: number;
};

const SKILL_TAGS = [
  { label: '🎮 Unity & Unreal', bg: '#FFF2C6' },
  { label: '💃 AI & Motion Tracking', bg: '#E7F4FF' },
  { label: '🏛️ Museum Installations', bg: '#E7FFE7' },
  { label: '✨ Mixed Reality', bg: '#FDE7F3' }
];

type AmbientItem = {
  id: number;
  src: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  parallax: number;
  lifeMs: number;
  floatMs: number;
  size: number;
};

export const Home: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const shapesRef = useRef<HTMLDivElement>(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [pupilPos, setPupilPos] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const [heroPinnedItems, setHeroPinnedItems] = useState<CollageItem[]>([]);
  const [heroAmbientItems, setHeroAmbientItems] = useState<AmbientItem[]>([]);
  const [heroScrollOffset, setHeroScrollOffset] = useState(0);
  const heroIdRef = useRef(0);
  const isHeroMountedRef = useRef(true);
  const heroPinnedRef = useRef<CollageItem[]>([]);
  const heroAmbientRef = useRef<AmbientItem[]>([]);
  const heroDragRef = useRef<{
    kind: 'pinned' | 'ambient';
    id: number;
    offsetX: number;
    offsetY: number;
    startX: number;
    startY: number;
    moved: boolean;
  } | null>(null);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(blinkInterval);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
      const moveX = (e.clientX / window.innerWidth - 0.5) * 15;
      const moveY = (e.clientY / window.innerHeight - 0.5) * 15;
      setPupilPos({ x: moveX, y: moveY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    if (!heroRef.current || !shapesRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.fromTo(
        '.hero-title',
        { y: 90, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 1.1,
          ease: 'elastic.out(1, 0.55)',
          clearProps: 'all'
        }
      )
        .fromTo(
          '.hero-subtitle',
          { y: 40, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.8,
            ease: 'power3.out',
            clearProps: 'all'
          },
          '-=0.5'
        )
        .fromTo(
          '.hero-cta',
          { scale: 0.7, rotation: -180, autoAlpha: 0 },
          {
            scale: 1,
            rotation: 0,
            autoAlpha: 1,
            duration: 0.6,
            ease: 'back.out(1.7)',
            clearProps: 'all'
          },
          '-=0.3'
        );

      const shapes = shapesRef.current!.querySelectorAll('.floating-shape');
      shapes.forEach((shape, index) => {
        gsap.to(shape, {
          y: 'random(-22, 22)',
          x: 'random(-16, 16)',
          rotation: 'random(-14, 14)',
          duration: 'random(2, 4)',
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: index * 0.2
        });
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    isHeroMountedRef.current = true;
    return () => {
      isHeroMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    heroPinnedRef.current = heroPinnedItems;
  }, [heroPinnedItems]);

  useEffect(() => {
    heroAmbientRef.current = heroAmbientItems;
  }, [heroAmbientItems]);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (!heroDragRef.current || !heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const nextX = x - heroDragRef.current.offsetX;
      const nextY = y - heroDragRef.current.offsetY;
      const clampedX = Math.max(0, Math.min(rect.width, nextX));
      const clampedY = Math.max(0, Math.min(rect.height, nextY));
      const dx = x - heroDragRef.current.startX;
      const dy = y - heroDragRef.current.startY;
      if (Math.hypot(dx, dy) > 6) heroDragRef.current.moved = true;
      if (heroDragRef.current.kind === 'pinned') {
        setHeroPinnedItems((prev) =>
          prev.map((item) =>
            item.id === heroDragRef.current?.id ? { ...item, x: clampedX, y: clampedY } : item
          )
        );
      } else {
        setHeroAmbientItems((prev) =>
          prev.map((item) =>
            item.id === heroDragRef.current?.id ? { ...item, x: clampedX, y: clampedY } : item
          )
        );
      }
    };

    const handlePointerUp = () => {
      if (!heroDragRef.current) return;
      const { id, moved, kind } = heroDragRef.current;
      heroDragRef.current = null;
      if (!moved) {
        if (kind === 'pinned') {
          setHeroPinnedItems((prev) => prev.filter((item) => item.id !== id));
        } else {
          setHeroAmbientItems((prev) => prev.filter((item) => item.id !== id));
        }
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, []);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        setHeroScrollOffset(window.scrollY || 0);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let beatTimer = 0;
    let startTimer = 0;
    const seedTimers: number[] = [];
    let raf = 0;

    const getFallbackPoint = (existing: AmbientItem[]) => {
      const rect = heroRef.current?.getBoundingClientRect();
      const width = rect?.width ?? window.innerWidth;
      const height = rect?.height ?? window.innerHeight;
      if (width < 10 || height < 10) return null;
      const margin = 40;
      const safeWidth = Math.max(width, margin * 2 + 10);
      const safeHeight = Math.max(height, margin * 2 + 10);
      const contentRect = heroContentRef.current?.getBoundingClientRect();
      const avoidPadding = 140;
      const avoidRect = contentRect
        ? {
            left: contentRect.left - (rect?.left ?? 0) - avoidPadding,
            right: contentRect.right - (rect?.left ?? 0) + avoidPadding,
            top: contentRect.top - (rect?.top ?? 0) - avoidPadding,
            bottom: contentRect.bottom - (rect?.top ?? 0) + avoidPadding
          }
        : {
            left: safeWidth * 0.25,
            right: safeWidth * 0.75,
            top: safeHeight * 0.25,
            bottom: safeHeight * 0.75
          };

      for (let attempt = 0; attempt < 40; attempt++) {
        const x = randomBetween(margin, safeWidth - margin);
        const y = randomBetween(margin, safeHeight - margin);
        if (
          x > avoidRect.left &&
          x < avoidRect.right &&
          y > avoidRect.top &&
          y < avoidRect.bottom
        ) {
          continue;
        }
        const tooClose = existing.some(
          (p) => Math.hypot(p.x - x, p.y - y) < 70
        );
        if (!tooClose) return { x, y };
      }
      return { x: margin, y: margin };
    };

    const buildAmbientItem = (existing: AmbientItem[]): AmbientItem | null => {
      const point = getFallbackPoint(existing);
      if (!point) return null;
      const src = pickUniqueImage([...existing, ...heroPinnedRef.current]);
      if (!src) return null;
      const lifeMs = AMBIENT_LIFE_MS;
      const floatMs = randomBetween(1400, 3200);
      return {
        id: heroIdRef.current++,
        src,
        x: point.x,
        y: point.y,
        rotation: randomBetween(-20, 20),
        scale: randomBetween(0.7, 1.35),
        parallax: randomBetween(0.01, 0.035),
        lifeMs,
        floatMs,
        size: randomBetween(100, 240)
      };
    };

    const pushAmbient = () => {
      if (!isHeroMountedRef.current || cancelled) return;
      setHeroAmbientItems((prev) => {
        let next = [...prev];
        if (next.length >= AMBIENT_MAX) {
          next = next.slice(1);
        }
        const item = buildAmbientItem(next);
        if (!item) return next;
        return [...next, item];
      });
    };

    const start = () => {
      if (cancelled) return;
      if (!heroRef.current) {
        raf = window.requestAnimationFrame(start);
        return;
      }

      for (let i = 0; i < AMBIENT_MAX; i += 1) {
        const timer = window.setTimeout(() => {
          if (!isHeroMountedRef.current || cancelled) return;
          pushAmbient();
        }, i * AMBIENT_BEAT_MS);
        seedTimers.push(timer);
      }

      startTimer = window.setTimeout(() => {
        if (!isHeroMountedRef.current || cancelled) return;
        beatTimer = window.setInterval(() => {
          pushAmbient();
        }, AMBIENT_BEAT_MS);
      }, AMBIENT_BEAT_MS * AMBIENT_MAX);
    };

    start();

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(raf);
      window.clearTimeout(startTimer);
      window.clearInterval(beatTimer);
      seedTimers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  const getHeroRelativePoint = (event: React.PointerEvent<HTMLElement>) => {
    if (!heroRef.current) return null;
    const rect = heroRef.current.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  };

  const spawnHeroPin = (x: number, y: number) => {
    let created: CollageItem | null = null;
    setHeroPinnedItems((prev) => {
      const src = pickUniqueImage([...prev, ...heroAmbientRef.current]);
      if (!src) return prev;
      const item: CollageItem = {
        id: heroIdRef.current++,
        src,
        x,
        y,
        rotation: randomBetween(-15, 15),
        scale: randomBetween(0.7, 1),
        parallax: randomBetween(0.02, 0.08),
        introDelay: 0
      };
      created = item;
      const next = [...prev, item];
      return next.length > MAX_PINS ? next.slice(next.length - MAX_PINS) : next;
    });
    if (!created) return;
    window.setTimeout(() => {
      if (!isHeroMountedRef.current) return;
      setHeroPinnedItems((prev) => prev.filter((pinned) => pinned.id !== created?.id));
    }, PIN_LIFETIME_MS);
  };

  const getAmbientPoint = (existing: AmbientItem[]) => {
    if (!heroRef.current || !heroContentRef.current) return null;
    const containerRect = heroRef.current.getBoundingClientRect();
    const contentRect = heroContentRef.current.getBoundingClientRect();
    if (containerRect.width < 10 || containerRect.height < 10) return null;

    const padding = 40;
    const midX = (contentRect.left + contentRect.right) / 2;
    const midY = (contentRect.top + contentRect.bottom) / 2;
    const baseRadiusX = contentRect.width / 2 + padding;
    const baseRadiusY = contentRect.height / 2 + padding;
    const minGap = Math.min(
      110,
      Math.max(80, Math.min(containerRect.width, containerRect.height) * 0.12)
    );
    const minY = Math.max(0, contentRect.top - containerRect.top - 60);
    const contentAvoidPadding = 140;
    const avoidRect = {
      left: contentRect.left - containerRect.left - contentAvoidPadding,
      right: contentRect.right - containerRect.left + contentAvoidPadding,
      top: contentRect.top - containerRect.top - contentAvoidPadding,
      bottom: contentRect.bottom - containerRect.top + contentAvoidPadding
    };

    for (let attempt = 0; attempt < 40; attempt++) {
      const useLeft = Math.random() < 0.5;
      const angle = useLeft
        ? randomBetween(Math.PI * 0.7, Math.PI * 1.3)
        : randomBetween(-Math.PI * 0.3, Math.PI * 0.3);
      const radiusX = baseRadiusX + randomBetween(20, 140);
      const radiusY = baseRadiusY + randomBetween(10, 90);
      let x = midX + Math.cos(angle) * radiusX;
      let y = midY + Math.sin(angle) * radiusY * 0.6;

      if (
        x > contentRect.left - padding &&
        x < contentRect.right + padding &&
        y > contentRect.top - padding &&
        y < contentRect.bottom + padding
      ) {
        const push = randomBetween(50, 100);
        x = midX + Math.cos(angle) * (radiusX + push);
        y = midY + Math.sin(angle) * (radiusY + push * 0.7);
      }

      const clampedX = Math.max(
        0,
        Math.min(containerRect.width, x - containerRect.left + randomBetween(-14, 14))
      );
      let clampedY = Math.max(
        0,
        Math.min(containerRect.height, y - containerRect.top + randomBetween(-14, 14))
      );
      if (clampedY < minY) {
        clampedY = Math.min(containerRect.height, minY + randomBetween(8, 30));
      }

      if (
        clampedX > avoidRect.left &&
        clampedX < avoidRect.right &&
        clampedY > avoidRect.top &&
        clampedY < avoidRect.bottom
      ) {
        continue;
      }

      const tooClose = existing.some(
        (p) => Math.hypot(p.x - clampedX, p.y - clampedY) < minGap
      );
      if (!tooClose) return { x: clampedX, y: clampedY };
    }

    return null;
  };

  const isInteractiveTarget = (target: HTMLElement | null) =>
    Boolean(target?.closest('a, button, input, textarea, select, label'));

  const handleHeroPointerDown = (event: React.PointerEvent<HTMLElement>) => {
    if (isInteractiveTarget(event.target as HTMLElement)) return;
    const point = getHeroRelativePoint(event);
    if (!point) return;
    spawnHeroPin(point.x, point.y);
  };

  const handleHeroStickerPointerDown = (
    event: React.PointerEvent<HTMLDivElement>,
    item: CollageItem,
    kind: 'pinned' | 'ambient'
  ) => {
    event.stopPropagation();
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    heroDragRef.current = {
      kind,
      id: item.id,
      offsetX: x - item.x,
      offsetY: y - item.y,
      startX: x,
      startY: y,
      moved: false
    };
  };

  return (
    <>
      {/* Custom Eye Cursor */}
      <div id="custom-cursor" style={{ left: `${cursorPos.x}px`, top: `${cursorPos.y}px` }}>
        <svg width="70" height="60" viewBox="0 0 70 40">
          {/* Left Eye */}
          <ellipse cx="25" cy="30" rx="10" ry={isBlinking ? 1 : 15} fill="white" stroke="#1a1a1a" strokeWidth="2" style={{ transition: 'ry 0.1s' }} />
          {!isBlinking && <circle cx={25 + pupilPos.x} cy={30 + pupilPos.y} r="6" fill="#1a1a1a" />}

          {/* Right Eye */}
          <ellipse cx="50" cy="30" rx="10" ry={isBlinking ? 1 : 15} fill="white" stroke="#1a1a1a" strokeWidth="2" style={{ transition: 'ry 0.1s' }} />
          {!isBlinking && <circle cx={50 + pupilPos.x} cy={30 + pupilPos.y} r="6" fill="#1a1a1a" />}
        </svg>
      </div>
      
    <div className="min-h-screen w-full" style={{ background: 'linear-gradient(#d4d4d4 1px, transparent 1px), linear-gradient(90deg, #d4d4d4 1px, transparent 1px), #fafaf9', backgroundSize: '50px 50px' }}>
      
      {/* Neo-Memphis Hero */}
      <div
        ref={heroRef}
        onPointerDown={handleHeroPointerDown}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        <style>{`
          .collage-sticker {
            filter:
              drop-shadow(1px 0 0 rgba(255,255,255,0.95))
              drop-shadow(-1px 0 0 rgba(255,255,255,0.95))
              drop-shadow(0 1px 0 rgba(255,255,255,0.95))
              drop-shadow(0 -1px 0 rgba(255,255,255,0.95))
              drop-shadow(3px 3px 0 rgba(0,0,0,0.35));
          }
          .collage-pin-appear {
            animation: collage-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
          }
          .collage-pin-inner {
            animation: collage-float 6s ease-in-out infinite;
            transform: rotate(var(--rot)) scale(var(--scale));
            transform-origin: center;
          }
          .ambient-life {
            animation-name: ambient-life;
            animation-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
            animation-fill-mode: forwards;
            opacity: 0;
          }
          .ambient-float {
            animation-name: ambient-float;
            animation-timing-function: ease-in-out;
            animation-iteration-count: infinite;
            transform: rotate(var(--rot)) scale(var(--scale));
            transform-origin: center;
          }
          .pencil-draw {
            stroke-dasharray: 1;
            stroke-dashoffset: 1;
            transition: stroke-dashoffset 0.35s ease;
          }
          .group:hover .pencil-draw {
            stroke-dashoffset: 0;
          }
          @keyframes collage-pop {
            0% { transform: translateY(10px) scale(0) rotate(-6deg); opacity: 0; }
            100% { transform: translateY(0) scale(1) rotate(0deg); opacity: 1; }
          }
          @keyframes collage-float {
            0% { transform: rotate(var(--rot)) scale(var(--scale)) translateY(0); }
            50% { transform: rotate(calc(var(--rot) - 2deg)) scale(var(--scale)) translateY(-6px); }
            100% { transform: rotate(var(--rot)) scale(var(--scale)) translateY(0); }
          }
          @keyframes ambient-life {
            0% { opacity: 0; transform: translateY(12px) scale(0.75); }
            16% { opacity: 0.9; transform: translateY(-2px) scale(1.08); }
            65% { opacity: 0.85; transform: translateY(-6px) scale(1.04); }
            100% { opacity: 0; transform: translateY(-14px) scale(0.85); }
          }
          @keyframes ambient-float {
            0% { transform: rotate(var(--rot)) scale(var(--scale)) translateY(0); }
            50% { transform: rotate(calc(var(--rot) - 3.5deg)) scale(var(--scale)) translateY(-12px); }
            100% { transform: rotate(var(--rot)) scale(var(--scale)) translateY(0); }
          }
        `}</style>
        {/* Floating geometric shapes */}
        <div ref={shapesRef} className="absolute inset-0 pointer-events-none z-0">
          <div className="floating-shape absolute top-16 left-10 w-16 h-16 rounded-full bg-[#FF6B6B] opacity-60" />
          <div className="floating-shape absolute top-32 right-24 w-20 h-20 bg-[#FFD93D] opacity-70" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
          <div className="floating-shape absolute bottom-32 left-1/4 w-24 h-24 bg-[#6BCF7F] opacity-60 rotate-45 rounded-[2rem]" />
          <div className="floating-shape absolute top-1/3 right-1/4 w-12 h-12 rounded-full bg-[#A78BFA] opacity-60" />
          <div className="floating-shape absolute bottom-20 right-10 w-16 h-16 bg-[#FF9ECD] opacity-60" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
        </div>

        <div className="absolute inset-0 pointer-events-none z-10">
          {heroAmbientItems.map((item) => (
            <div
              key={item.id}
              className="absolute pointer-events-auto"
              style={{
                left: item.x,
                top: item.y,
                transform: `translate(-50%, -50%) translateY(${heroScrollOffset * item.parallax}px)`
              }}
            >
              <div
                className="ambient-life"
                style={{ animationDuration: `${item.lifeMs}ms` } as React.CSSProperties}
              >
                <div
                  className="ambient-float"
                  style={{
                    '--rot': `${item.rotation}deg`,
                    '--scale': item.scale,
                    animationDuration: `${item.floatMs}ms`
                  } as React.CSSProperties}
                >
                  <div
                    onPointerDown={(event) =>
                      handleHeroStickerPointerDown(event, item as CollageItem, 'ambient')
                    }
                    className="cursor-grab active:cursor-grabbing group"
                  >
                    <img
                      src={item.src}
                      alt=""
                      className="collage-sticker block h-auto mix-blend-multiply select-none pointer-events-none opacity-85"
                      style={{ width: `${Math.round(item.size)}px` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="absolute inset-0 pointer-events-none z-30">
          {heroPinnedItems.map((item, index) => (
            <div
              key={item.id}
              className="absolute pointer-events-auto"
              style={{
                left: item.x,
                top: item.y,
                transform: `translate(-50%, -50%) translateY(${heroScrollOffset * item.parallax}px)`,
                zIndex: 10 + index
              }}
            >
              <div
                className="collage-pin-appear"
                style={{ animationDelay: `${item.introDelay || 0}s` }}
              >
                <div
                  className="collage-pin-inner"
                  style={{
                    '--rot': `${item.rotation}deg`,
                    '--scale': item.scale,
                    animationDelay: `${index * 0.2}s`
                  } as React.CSSProperties}
                >
                  <div
                    onPointerDown={(event) => handleHeroStickerPointerDown(event, item, 'pinned')}
                    className="cursor-grab active:cursor-grabbing group"
                  >
                    <img
                      src={item.src}
                      alt=""
                      className="collage-sticker block w-32 md:w-40 h-auto mix-blend-multiply select-none pointer-events-none transition-transform duration-200 group-hover:-translate-y-1 group-hover:scale-105"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div ref={heroContentRef} className="relative z-20 text-center px-6 max-w-5xl">
          <h1 className="hero-title text-4xl md:text-6xl lg:text-7xl font-semibold mb-6 leading-tight tracking-tight text-gray-900">
            {SITE_CONTENT.hero.greeting}
          </h1>
          
          <p className="hero-subtitle text-lg md:text-2xl lg:text-3xl font-normal mb-10 max-w-3xl mx-auto leading-relaxed text-gray-600">
            {SITE_CONTENT.hero.intro}
          </p>
          
          <div className="hero-cta flex flex-col sm:flex-row gap-20 justify-center items-center">
            <Link
              to="/work"
              className="text-xl px-10 py-4 rounded-none border-2 border-[#2D2D2D] bg-[#1f1f1f] text-white font-semibold shadow-[0_3px_10px_rgba(0,0,0,0.24)] transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(0,0,0,0.28)]"
            >
              Work
            </Link>

            <Link
              to="/gallery"
              className="relative text-lg px-2 py-0 text-[#1f1f1f] font-semibold transition-transform duration-300 group hover:scale-110 hover:rotate-2"
            >
              <span className="relative z-20">Gallery</span>
              <svg
                className="absolute left-1/2 top-1/2 w-52 h-24 -translate-x-1/2 -translate-y-1/2 -rotate-10 opacity-0 group-hover:opacity-100 pointer-events-none"
                viewBox="0 0 260 120"
                aria-hidden="true"
              >
                <path
                  className="pencil-draw"
                  d="M24,58 C28,30 62,20 92,18 C110,6 132,6 150,16 C176,12 202,22 214,38 C232,46 238,60 232,72 C224,92 200,102 172,100 C156,112 132,114 114,104 C96,112 70,108 52,94 C30,88 20,72 24,58 Z"
                  fill="none"
                  stroke="#2D2D2D"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength="1"
                />
              </svg>
            </Link>
          </div>

          <div className="mt-24 mb-30 flex flex-wrap justify-center gap-10 text-sm font-semibold text-gray-900">
            {SKILL_TAGS.map((tag, idx) => (
              <div
                key={tag.label}
                className={`relative px-7 py-2 border border-[#2D2D2D]/40 transition-transform duration-200 hover:-translate-y-0.5 ${idx % 2 === 0 ? 'rotate-1' : '-rotate-1'}`}
                style={{ backgroundColor: `${tag.bg}CC` }}
              >
                {tag.label}
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-14 h-14 flex items-center justify-center rotate-2">
            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="#2D2D2D" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 8l8 8 8-8" />
            </svg>
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div id="projects" className="bg-amber-50/30 py-20 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-24">
            {PROJECTS
              .filter(p => p.featured)
              .sort((a, b) => (a.featuredOrder || 999) - (b.featuredOrder || 999))
              .map((project, index) => (
                <PostcardItem key={project.id} project={project} index={index} />
              ))}
          </div>
        </div>
      </div>

    </div>
    </>
  );
};
