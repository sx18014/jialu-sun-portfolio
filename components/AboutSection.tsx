import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { SITE_CONTENT, withBase } from '../constants';

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
const INITIAL_PINS = 5;

const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);
const pickRandomImage = () => COLLAGE_IMAGES[Math.floor(Math.random() * COLLAGE_IMAGES.length)];
const getAvailableImages = (current: CollageItem[]) =>
  COLLAGE_IMAGES.filter((src) => !current.some((item) => item.src === src));
const pickRandomAvailableImage = (current: CollageItem[]) => {
  const available = getAvailableImages(current);
  const pool = available.length > 0 ? available : COLLAGE_IMAGES;
  return pool[Math.floor(Math.random() * pool.length)];
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

export const AboutSection: React.FC = () => {
  const aboutRef = useRef<HTMLDivElement>(null);
  const [pinnedItems, setPinnedItems] = useState<CollageItem[]>([]);
  const [scrollOffset, setScrollOffset] = useState(0);
  const idRef = useRef(0);
  const isMountedRef = useRef(true);
  const seededRef = useRef(false);
  const dragRef = useRef<{
    id: number;
    offsetX: number;
    offsetY: number;
    startX: number;
    startY: number;
    moved: boolean;
  } | null>(null);

  useEffect(() => {
    if (!aboutRef.current) return;
    const items = aboutRef.current.querySelectorAll('.about-item');
    gsap.fromTo(
      items,
      {
        y: 80,
        autoAlpha: 0,
        rotate: -4
      },
      {
        y: 0,
        autoAlpha: 1,
        rotate: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.1,
        delay: 0.1,
        clearProps: 'opacity,transform'
      }
    );
  }, []);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (!dragRef.current || !aboutRef.current) return;
      const rect = aboutRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const nextX = x - dragRef.current.offsetX;
      const nextY = y - dragRef.current.offsetY;
      const clampedX = Math.max(0, Math.min(rect.width, nextX));
      const clampedY = Math.max(0, Math.min(rect.height, nextY));
      const dx = x - dragRef.current.startX;
      const dy = y - dragRef.current.startY;
      if (Math.hypot(dx, dy) > 6) dragRef.current.moved = true;
      setPinnedItems((prev) =>
        prev.map((item) =>
          item.id === dragRef.current?.id ? { ...item, x: clampedX, y: clampedY } : item
        )
      );
    };

    const handlePointerUp = () => {
      if (!dragRef.current) return;
      const { id, moved } = dragRef.current;
      dragRef.current = null;
      if (!moved) {
        setPinnedItems((prev) => prev.filter((item) => item.id !== id));
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
        setScrollOffset(window.scrollY || 0);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const getRelativePoint = (event: React.PointerEvent<HTMLElement>) => {
    if (!aboutRef.current) return null;
    const rect = aboutRef.current.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  };

  const spawnPin = (x: number, y: number) => {
    let created: CollageItem | null = null;
    setPinnedItems((prev) => {
      const item: CollageItem = {
        id: idRef.current++,
        src: pickRandomAvailableImage(prev),
        x,
        y,
        rotation: randomBetween(-15, 15),
        scale: randomBetween(0.7, 1),
        parallax: randomBetween(0.02, 0.08)
      };
      created = item;
      const next = [...prev, item];
      return next.length > MAX_PINS ? next.slice(next.length - MAX_PINS) : next;
    });
    if (!created) return;
    window.setTimeout(() => {
      if (!isMountedRef.current) return;
      setPinnedItems((prev) => prev.filter((pinned) => pinned.id !== created?.id));
    }, PIN_LIFETIME_MS);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLElement>) => {
    const point = getRelativePoint(event);
    if (!point) return;
    spawnPin(point.x, point.y);
  };

  const handleStickerPointerDown = (event: React.PointerEvent<HTMLDivElement>, item: CollageItem) => {
    event.stopPropagation();
    if (!aboutRef.current) return;
    const rect = aboutRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    dragRef.current = {
      id: item.id,
      offsetX: x - item.x,
      offsetY: y - item.y,
      startX: x,
      startY: y,
      moved: false
    };
  };

  useEffect(() => {
    if (!aboutRef.current || pinnedItems.length > 0) return;
    if (seededRef.current) return;
    let frame = 0;
    let tries = 0;

    const attemptSeed = () => {
      if (!aboutRef.current || seededRef.current) return;
      const containerRect = aboutRef.current.getBoundingClientRect();
      const targets = Array.from(
        aboutRef.current.querySelectorAll('[data-collage-seed]')
      ) as HTMLElement[];
      if (containerRect.width < 10 || containerRect.height < 10 || targets.length === 0) {
        if (tries < 10) {
          tries += 1;
          frame = window.requestAnimationFrame(attemptSeed);
        }
        return;
      }

      const corners = ['tl', 'tr', 'bl', 'br'] as const;
      const padding = 28;
      const shuffledImages = [...COLLAGE_IMAGES].sort(() => Math.random() - 0.5);
      const seeded: CollageItem[] = targets.slice(0, INITIAL_PINS).map((target, index) => {
        const rect = target.getBoundingClientRect();
        const corner = corners[index % corners.length];
        const cornerPoint = {
          x: corner === 'tr' || corner === 'br' ? rect.right - padding : rect.left + padding,
          y: corner === 'bl' || corner === 'br' ? rect.bottom - padding : rect.top + padding
        };
        const x = cornerPoint.x - containerRect.left + randomBetween(-10, 10);
        const y = cornerPoint.y - containerRect.top + randomBetween(-10, 10);
        return {
          id: idRef.current++,
          src: shuffledImages[index % shuffledImages.length],
          x: Math.max(0, Math.min(containerRect.width, x)),
          y: Math.max(0, Math.min(containerRect.height, y)),
          rotation: randomBetween(-15, 15),
          scale: randomBetween(0.7, 1),
          parallax: randomBetween(0.02, 0.08)
        };
      });

      seededRef.current = true;
      setPinnedItems(seeded);
      seeded.forEach((item) => {
        window.setTimeout(() => {
          if (!isMountedRef.current) return;
          setPinnedItems((prev) => prev.filter((pinned) => pinned.id !== item.id));
        }, PIN_LIFETIME_MS);
      });
    };

    frame = window.requestAnimationFrame(attemptSeed);
    return () => window.cancelAnimationFrame(frame);
  }, [pinnedItems.length]);

  return (
    <section
      id="about"
      ref={aboutRef}
      onPointerDown={handlePointerDown}
      className="relative py-20 md:py-28 overflow-hidden"
      style={{
        background:
          'radial-gradient(circle at 20% 20%, rgba(255, 213, 128, 0.35), transparent 28%), radial-gradient(circle at 80% 30%, rgba(167, 139, 250, 0.28), transparent 30%), radial-gradient(circle at 30% 80%, rgba(110, 231, 183, 0.28), transparent 30%), #fafaf9'
      }}
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
        @keyframes collage-float {
          0% { transform: rotate(var(--rot)) scale(var(--scale)) translateY(0); }
          50% { transform: rotate(calc(var(--rot) - 2deg)) scale(var(--scale)) translateY(-6px); }
          100% { transform: rotate(var(--rot)) scale(var(--scale)) translateY(0); }
        }
      `}</style>

      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="floating-shape absolute top-12 left-10 w-14 h-14 rounded-full bg-[#FF6B6B] opacity-50" />
        <div className="floating-shape absolute top-1/3 right-16 w-16 h-16 bg-[#FFD93D] opacity-60" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
        <div className="floating-shape absolute bottom-16 left-1/4 w-18 h-18 bg-[#6BCF7F] opacity-55 rotate-45 rounded-[1.25rem]" />
      </div>

      <div className="absolute inset-0 pointer-events-none z-30">
        {pinnedItems.map((item, index) => (
          <div
            key={item.id}
            className="absolute pointer-events-auto"
            style={{
              left: item.x,
              top: item.y,
              transform: `translate(-50%, -50%) translateY(${scrollOffset * item.parallax}px)`,
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
                onPointerDown={(event) => handleStickerPointerDown(event, item)}
                className="cursor-grab active:cursor-grabbing group"
              >
                <img src={item.src} alt="" className="collage-sticker block w-36 md:w-48 h-auto mix-blend-multiply select-none pointer-events-none transition-transform duration-200 group-hover:-translate-y-1 group-hover:scale-105" />
              </div>
            </div>
          </div>
        ))}

      </div>

      <div className="max-w-5xl mx-auto px-6 relative z-20 space-y-8">
        <div data-collage-seed className="about-item bg-white rounded-sm p-8 md:p-12 shadow-[3px_3px_0_rgba(0,0,0,0.35)] border-2 border-[#1f1f1f]/70 rotate-1 transition-transform duration-300 hover:-translate-y-1 hover:rotate-2 hover:shadow-[8px_8px_0_rgba(0,0,0,0.35)]">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 text-[#1f1f1f]">Hi, I'm Jialu.</h2>
          <div className="space-y-6 text-lg leading-relaxed text-[#1f1f1f]">
            <p>{SITE_CONTENT.about.narrative.split('\n\n')[0]}</p>
            <p>{SITE_CONTENT.about.narrative.split('\n\n')[1]}</p>
            <p>{SITE_CONTENT.about.narrative.split('\n\n')[2]}</p>
            <p className="font-semibold text-xl">{SITE_CONTENT.about.signature}</p>
          </div>
        </div>

        <div data-collage-seed className="about-item bg-[#FFD93D] rounded-sm p-8 md:p-12 shadow-[3px_3px_0_rgba(0,0,0,0.35)] border-2 border-[#1f1f1f]/70 -rotate-1 transition-transform duration-300 hover:-translate-y-1 hover:-rotate-2 hover:shadow-[8px_8px_0_rgba(0,0,0,0.35)]">
          <h3 className="text-3xl md:text-4xl font-bold mb-4 text-[#1f1f1f]">My Philosophy</h3>
          <p className="text-lg leading-relaxed text-[#1f1f1f]">
            For me, interaction is a full-body conversation — between people, between imagination and reality, between technology and emotion. I believe playful experiences can trigger curiosity, creativity, and empathy, helping us see the world, and each other, in new ways.
          </p>
        </div>

        <div className="about-item grid md:grid-cols-2 gap-6">
          <div data-collage-seed className="bg-[#6BCF7F] rounded-sm p-6 shadow-[3px_3px_0_rgba(0,0,0,0.35)] border-2 border-[#1f1f1f]/70 rotate-1 transition-transform duration-300 hover:-translate-y-1 hover:rotate-2 hover:shadow-[8px_8px_0_rgba(0,0,0,0.35)]">
            <h4 className="text-2xl font-bold mb-3 text-[#1f1f1f]">Education</h4>
            <div className="space-y-3 text-[#1f1f1f]">
              <div>
                <p className="font-bold">Carnegie Mellon University</p>
                <p className="text-sm">M.S. Entertainment Technology</p>
                <p className="text-sm text-[#1f1f1f]/70">2021-2023</p>
              </div>
              <div>
                <p className="font-bold">Shanghai University</p>
                <p className="text-sm">B.Eng. Computer Science</p>
                <p className="text-sm text-[#1f1f1f]/70">2017-2021</p>
              </div>
            </div>
          </div>

          <div data-collage-seed className="relative bg-[#A78BFA] rounded-sm p-6 shadow-[3px_3px_0_rgba(0,0,0,0.35)] border-2 border-[#1f1f1f]/70 -rotate-1 transition-transform duration-300 hover:-translate-y-1 hover:-rotate-2 hover:shadow-[8px_8px_0_rgba(0,0,0,0.35)]">
            <h4 className="text-2xl font-bold mb-3 text-[#1f1f1f]">Currently</h4>
            <a
              href="https://www.rlmg.com/"
              target="_blank"
              rel="noopener noreferrer"
              onPointerDown={(event) => event.stopPropagation()}
              className="absolute top-6 right-6 text-base px-5 py-2.5 rounded-none border-2 border-[#1f1f1f] bg-[#1f1f1f] text-white font-semibold shadow-[0_3px_10px_rgba(0,0,0,0.24)] transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(0,0,0,0.28)]"
            >
              RLMG
            </a>
            <div>
              <p className="font-bold text-lg">Creative Strategist</p>
              <p className="text-sm mb-2">
                <a
                  href="https://www.rlmg.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onPointerDown={(event) => event.stopPropagation()}
                  className="underline decoration-2 decoration-[#1f1f1f]/40 hover:decoration-[#1f1f1f]"
                >
                  RLMG
                </a>{' '}
                • Boston, MA
              </p>
              <p className="text-sm leading-relaxed text-[#1f1f1f]">
              I define interactive concepts and technical approaches for museum installations. I bridge design and engineering through prototyping, system planning, and cross-team collaboration, focused on building learn-by-doing experiences that work reliably on site.
              </p>
            </div>
          </div>
        </div>

        <div data-collage-seed className="about-item bg-white rounded-sm p-8 shadow-[3px_3px_0_rgba(0,0,0,0.35)] border-2 border-[#1f1f1f]/70 rotate-1 transition-transform duration-300 hover:-translate-y-1 hover:rotate-2 hover:shadow-[8px_8px_0_rgba(0,0,0,0.35)]">
          <h4 className="text-2xl font-bold mb-4 text-center text-[#1f1f1f]">Core Skills</h4>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              'Unity',
              'Unreal Engine',
              'TouchDesigner',
              'MediaPipe',
              'C#',
              'C++',
              'JavaScript',
              'TypeScript',
              'Motion Tracking',
              'Mixed Reality',
              'AI Integration',
              'Three.js',
              'CMS'
            ].map((skill, index) => (
              <span
                key={skill}
                className="px-4 py-2 rounded-full border-2 border-[#1f1f1f]/70 font-semibold text-sm transition-transform duration-200 cursor-default shadow-[4px_4px_0_rgba(0,0,0,0.35)] hover:-translate-y-0.5 hover:shadow-[8px_8px_0_rgba(0,0,0,0.35)] hover:scale-105"
                style={{
                  backgroundColor: ['#FF6B6B', '#FFD93D', '#6BCF7F', '#A78BFA', '#FF9ECD'][index % 5] + '33',
                  transform: index % 2 === 0 ? 'rotate(-2deg)' : 'rotate(2deg)'
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
