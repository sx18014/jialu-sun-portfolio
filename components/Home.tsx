import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Link } from 'react-router-dom';
import { SITE_CONTENT, PROJECTS, withBase } from '../constants';
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
        const path = withBase(`/projects/${project.id}/hero.${ext}`);
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
  withBase('/about/Jan.png'),
  withBase('/about/Feb.png'),
  withBase('/about/Mar.png'),
  withBase('/about/April.png'),
  withBase('/about/May.png'),
  withBase('/about/June.png'),
  withBase('/about/July.png'),
  withBase('/about/August.png'),
  withBase('/about/Sep.png'),
  withBase('/about/Oct.png')
];

const MAX_PINS = 8;
const PIN_LIFETIME_MS = 10000;
const PARALLAX_MIN = 0.01;
const PARALLAX_MAX = 0.035;

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
};

const SKILL_TAGS = [
  'Unity & Unreal',
  'AI & Motion Tracking',
  'Museum Installations',
  'Mixed Reality'
];

export const Home: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const shapesRef = useRef<HTMLDivElement>(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [pupilPos, setPupilPos] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const [heroPinnedItems, setHeroPinnedItems] = useState<CollageItem[]>([]);
  const [heroScrollOffset, setHeroScrollOffset] = useState(0);
  const heroIdRef = useRef(0);
  const isHeroMountedRef = useRef(true);
  const heroDragRef = useRef<{
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

  const scrollToProjects = () => {
    document.getElementById('projects')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };

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
      setHeroPinnedItems((prev) =>
        prev.map((item) =>
          item.id === heroDragRef.current?.id ? { ...item, x: clampedX, y: clampedY } : item
        )
      );
    };

    const handlePointerUp = () => {
      if (!heroDragRef.current) return;
      const { id, moved } = heroDragRef.current;
      heroDragRef.current = null;
      if (!moved) {
        setHeroPinnedItems((prev) => prev.filter((item) => item.id !== id));
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
        if (heroRef.current) {
          const rect = heroRef.current.getBoundingClientRect();
          const relativeOffset = Math.max(0, -rect.top);
          setHeroScrollOffset(Math.min(relativeOffset, rect.height));
        } else {
          setHeroScrollOffset(window.scrollY || 0);
        }
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
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
      const src = pickUniqueImage(prev);
      if (!src) return prev;
      const item: CollageItem = {
        id: heroIdRef.current++,
        src,
        x,
        y,
        rotation: randomBetween(-15, 15),
        scale: randomBetween(0.7, 1),
        parallax: randomBetween(PARALLAX_MIN, PARALLAX_MAX)
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
    item: CollageItem
  ) => {
    event.stopPropagation();
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    heroDragRef.current = {
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
          .collage-pin-inner {
            animation: collage-float 6s ease-in-out infinite;
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
          @keyframes collage-float {
            0% { transform: rotate(var(--rot)) scale(var(--scale)) translateY(0); }
            50% { transform: rotate(calc(var(--rot) - 2deg)) scale(var(--scale)) translateY(-6px); }
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
                className="collage-pin-inner"
                style={{
                  '--rot': `${item.rotation}deg`,
                  '--scale': item.scale,
                  animationDelay: `${index * 0.2}s`
                } as React.CSSProperties}
              >
                <div
                  onPointerDown={(event) => handleHeroStickerPointerDown(event, item)}
                  className="cursor-grab active:cursor-grabbing group"
                >
                  <img
                    src={item.src}
                    alt=""
                    className="collage-sticker block w-36 md:w-48 h-auto mix-blend-multiply select-none pointer-events-none transition-transform duration-200 group-hover:-translate-y-1 group-hover:scale-105"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="relative z-20 text-center px-6 max-w-5xl">
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

          <div className="mt-20 mb-30 text-gray-600">
            <p className="max-w-3xl mx-auto text-center text-sm md:text-base font-normal text-gray-500 leading-relaxed cursor-default select-none">
              {SKILL_TAGS.map((tag, idx) => (
                <React.Fragment key={tag}>
                  {idx > 0 && <span className="mx-2 text-gray-400">·</span>}
                  <span>{tag}</span>
                </React.Fragment>
              ))}
            </p>
          </div>
        </div>

        {/* Scroll indicator */}
        <button
          type="button"
          onClick={scrollToProjects}
          aria-label="Scroll to featured work"
          className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce cursor-pointer"
        >
          <div className="w-14 h-14 flex items-center justify-center rotate-2">
            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="#2D2D2D" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 8l8 8 8-8" />
            </svg>
          </div>
        </button>
      </div>

      {/* Projects Section */}
      <div id="projects" className="py-20 px-8">
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
