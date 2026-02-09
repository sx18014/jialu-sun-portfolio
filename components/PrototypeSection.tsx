import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { withBase } from '../constants';
import { PROTOTYPE_MANIFEST, type PrototypeMediaItem } from '../generated/prototypeManifest';

gsap.registerPlugin(ScrollTrigger);

interface PrototypeNote {
  image: string;
  caption?: string;
  notes?: string;
  color?: 'yellow' | 'pink' | 'blue' | 'mint';
}

interface PrototypeSectionProps {
  projectId: string;
  prototypeData?: {
    captions?: string[];
    annotations?: string[];
  };
}

const STICKY_COLORS = {
  yellow: 'bg-white border-gray-300',
  pink: 'bg-white border-gray-300',
  blue: 'bg-white border-gray-300',
  mint: 'bg-white border-gray-300',
};

export const PrototypeSection: React.FC<PrototypeSectionProps> = ({ projectId, prototypeData }) => {
  const colors: Array<'yellow' | 'pink' | 'blue' | 'mint'> = ['yellow', 'pink', 'blue', 'mint'];
  const [devPrototypeManifest, setDevPrototypeManifest] = useState<Record<string, PrototypeMediaItem[]> | null>(null);
  const devPrototypeSnapshotRef = useRef<string | null>(null);

  useEffect(() => {
    if (!import.meta.env.DEV) return;

    let isActive = true;

    const loadDevPrototypeManifest = async () => {
      try {
        const response = await fetch(withBase('/__dev-prototype-manifest'), { cache: 'no-store' });
        if (!response.ok) return;
        const data = (await response.json()) as Record<string, PrototypeMediaItem[]>;
        const snapshot = JSON.stringify(data);
        if (isActive) {
          if (snapshot === devPrototypeSnapshotRef.current) return;
          devPrototypeSnapshotRef.current = snapshot;
          setDevPrototypeManifest(data);
        }
      } catch {
        // keep generated fallback when dev endpoint is unavailable
      }
    };

    void loadDevPrototypeManifest();

    const interval = window.setInterval(() => {
      void loadDevPrototypeManifest();
    }, 2000);

    return () => {
      isActive = false;
      window.clearInterval(interval);
    };
  }, []);

  const prototypeManifest = import.meta.env.DEV && devPrototypeManifest ? devPrototypeManifest : PROTOTYPE_MANIFEST;
  const prototypes: PrototypeNote[] = (prototypeManifest[projectId] ?? []).map((item, index) => ({
    image: withBase(item.src),
    caption: prototypeData?.captions?.[index] || `Prototype ${item.id}`,
    notes: prototypeData?.annotations?.[index],
    color: colors[index % colors.length],
  }));

  if (prototypes.length === 0) return null;

  const generatePositions = (count: number) => {
    const positions = [];
    const cols = 3;
    const colPositions = ['2%', '36%', '70%'];
    const rowGap = 550;
    
    for (let i = 0; i < count; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      positions.push({
        left: colPositions[col],
        top: row * rowGap + (col * 20)
      });
    }
    return positions;
  };

  const organicPositions = generatePositions(prototypes.length);
  const containerHeight = Math.ceil(prototypes.length / 3) * 550 + 400;

  return (
    <div className="mb-0">
      <h2 className="text-2xl font-semibold text-black mb-12">Early Stage Prototypes</h2>
      
      <div
        className="relative w-screen left-1/2 right-1/2 -mx-[50vw]"
        style={{
          padding: '60px 0',
          background:
            'linear-gradient(#d4d4d4 1px, transparent 1px), linear-gradient(90deg, #d4d4d4 1px, transparent 1px), #fafaf9',
          backgroundSize: '50px 50px'
        }}
      >
        <div className="relative max-w-6xl mx-auto px-6" style={{ height: `${containerHeight}px` }}>
          {prototypes.map((proto, index) => (
            <StickyNote 
              key={index} 
              {...proto} 
              index={index} 
              position={organicPositions[index] || organicPositions[0]}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const StickyNote: React.FC<PrototypeNote & { index: number; position: { left: string; top: number } }> = ({ 
  image, 
  caption, 
  notes, 
  color = 'yellow',
  index,
  position
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const noteRef = useRef<HTMLDivElement>(null);
  const annotationRef = useRef<HTMLDivElement>(null);
  const rotation = [2, -1, 1.5, -2, 1, -1.5][index % 6];
  
  const isLeft = parseInt(position.left) < 40;

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (!noteRef.current) return;

      gsap.set(noteRef.current, {
        opacity: 0,
        y: 50,
        rotation: rotation + (isLeft ? -5 : 5)
      });

      if (annotationRef.current) {
        gsap.set(annotationRef.current, {
          opacity: 0,
          x: isLeft ? -30 : 30
        });
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: noteRef.current,
          start: 'top 80%',
          end: 'top 20%',
          toggleActions: 'play none none none'
        }
      });

      tl.to(noteRef.current, {
        opacity: 1,
        y: 0,
        rotation: rotation,
        duration: 0.8,
        ease: 'back.out(1.2)'
      });

      if (annotationRef.current && notes) {
        tl.to(annotationRef.current, {
          opacity: 1,
          x: 0,
          duration: 0.6,
          ease: 'power2.out'
        }, '-=0.3');
      }
    });

    return () => ctx.revert();
  }, [rotation, isLeft, notes]);

  return (
    <div 
      ref={noteRef}
      className="absolute flex flex-col items-center"
      style={{
        left: position.left,
        top: `${position.top}px`
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Sticky Note */}
      <div 
        className={`relative bg-white transition-all duration-300 w-80 border-2 border-black shadow-[5px_5px_0_rgba(0,0,0,0.35)] ${
          isHovered ? 'shadow-[8px_8px_0_rgba(0,0,0,0.35)] scale-105 z-10' : ''
        }`}
        style={{ 
          transform: isHovered ? `rotate(${rotation * 1.2}deg) translateY(-6px)` : `rotate(${rotation}deg)`,
          transformOrigin: 'center center',
          padding: '10px'
        }}
      >
        {/* Caption tape on top */}
        {caption && (
          <div
            className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-50/90 px-5 py-1.5 border border-amber-200 shadow-sm"
            style={{ transform: 'translateX(-50%) rotate(-2deg)' }}
          >
            <p className="text-sm font-['Comic_Sans_MS','Chalkboard_SE','Bradley_Hand',cursive] text-gray-800 whitespace-nowrap font-medium">
              {caption}
            </p>
          </div>
        )}
        
        {/* Image */}
        <div className="w-full aspect-square bg-white overflow-hidden">
          <img 
            src={image} 
            alt={caption}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </div>
        
        {/* Caption removed below; now in top tape */}
      </div>

      {/* Handwritten Annotations - Below image */}
      {notes && (
        <div 
          ref={annotationRef}
          className="mt-6 w-64 text-center"
        >
          <div className="font-['Comic_Sans_MS','Chalkboard_SE','Bradley_Hand',cursive] text-base text-gray-700 leading-relaxed whitespace-pre-line">
            {notes}
          </div>
        </div>
      )}
    </div>
  );
};
