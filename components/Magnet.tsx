import React, { useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import Draggable from 'gsap/Draggable';
import { useNavigate } from 'react-router-dom';
import { Project } from '../types';
import { withBase } from '../constants';

// Register GSAP plugin
gsap.registerPlugin(Draggable);

interface Props {
  project: Project;
  forceHover?: boolean;
  isSelected?: boolean;
}

const TAG_COLORS = ['#FF6B6B', '#FFD93D', '#6BCF7F', '#A78BFA', '#FF9ECD'];
const getTagColor = (tag: string) => {
  let hash = 0;
  for (let i = 0; i < tag.length; i += 1) {
    hash = (hash * 31 + tag.charCodeAt(i)) % 2147483647;
  }
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
};

// Get magnet PNG path based on project
const getMagnetImage = (projectId: string): string => {
  return withBase(`/images/magnets/${projectId}.png`);
};

export const Magnet: React.FC<Props> = ({ project, forceHover = false, isSelected = false }) => {
  const magnetRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [postcardPosition, setPostcardPosition] = useState<{ horizontal: 'right' | 'left', verticalOffset: number }>({ horizontal: 'right', verticalOffset: 0 });
  const rotationRef = useRef(Math.random() * 4 - 2);
  
  const showPostcard = forceHover || isHovered;

  // Check postcard position based on magnet location
  const updatePostcardPosition = () => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const postcardWidth = 480;
    const postcardHeight = 320;
    const margin = 20;
    
    const horizontal = rect.right + postcardWidth + margin > viewportWidth ? 'left' : 'right';
    let verticalOffset = 0;
    
    // If too close to top, shift down toward center
    if (rect.top < postcardHeight / 2) {
      verticalOffset = Math.min(120, (postcardHeight - 0.2*rect.top));
    } else if (rect.bottom > viewportHeight - postcardHeight / 2) {
      verticalOffset = Math.min(120, (rect.bottom - (viewportHeight - postcardHeight / 2)));
    }
    
    setPostcardPosition({ horizontal, verticalOffset });
  };

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      Draggable.create(magnetRef.current, {
        type: "x,y",
        edgeResistance: 0.65,
        bounds: containerRef.current,
        inertia: true,
        onDragStart: () => {
            setIsDragging(true);
        },
        onPress: function() {
          gsap.to(this.target, { scale: 1.05, duration: 0.1 });
        },
        onDragEnd: function () {
          setIsDragging(false);
          // Quick snap back
          gsap.to(this.target, {
            x: 0,
            y: 0,
            scale: 1,
            duration: 0.3,
            ease: "back.out(2)"
          });
        },
        onClick: function() {
            // Only navigate if not dragging
            navigate(`/work/${project.id}`);
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, [project, navigate]);

  // Update postcard position on window resize
  React.useEffect(() => {
    const handleResize = () => updatePostcardPosition();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    if (forceHover) updatePostcardPosition();
  }, [forceHover]);

  return (
    <div 
      ref={containerRef} 
      className="absolute" 
      style={{ 
        top: project.coordinates.top, 
        left: project.coordinates.left,
        zIndex: isDragging ? 500 : (showPostcard ? 400 : 20) 
      }}
      onMouseEnter={() => {
        setIsHovered(true);
        updatePostcardPosition();
      }}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        ref={magnetRef}
        className={`relative cursor-pointer group flex flex-col items-center justify-center ${isSelected ? 'scale-110 brightness-110 shadow-2xl' : ''}`}
        title="Drag me!"
      >
        {/* PNG Magnet */}
        <img 
          src={getMagnetImage(project.id)}
          alt={project.title}
          className="max-w-24 max-h-16 md:max-w-32 md:max-h-20 drop-shadow-sm transform cursor-pointer object-contain"
          style={{ transform: `rotate(${Math.random() * 4 - 2}deg) translateZ(8px)` }}
        />

        {/* Postcard hover interface - 2x bigger, horizontal */}
        <div 
          className={`absolute top-1/2 bg-white border-2 border-black shadow-[4px_4px_0_rgba(0,0,0,0.35)] transition-all duration-300 pointer-events-none z-[600] overflow-hidden rounded-sm
            ${postcardPosition.horizontal === 'right' ? 'left-full ml-3' : 'right-full mr-3'}
            ${showPostcard && !isDragging ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
          style={{ 
            width: '500px', 
            height: '380px',
            transformStyle: 'preserve-3d',
            transform: showPostcard && !isDragging 
              ? `translateY(calc(-50% + ${postcardPosition.verticalOffset}px)) translateZ(260px) rotateX(3deg) rotate(${rotationRef.current}deg)` 
              : `translateY(-50%) translateZ(0px) rotateX(-105deg) rotate(${rotationRef.current}deg)`
          }}
        >
            {/* Stickers - Awards/Badges */}
            {project.stickers && project.stickers.length > 0 && showPostcard && (
              <div className="absolute -top-8 -right-8 z-10">
                {project.stickers.map((sticker, index) => (
                  <img 
                    key={index}
                    src={sticker}
                    alt="Award badge"
                    className="w-32 h-32 object-contain drop-shadow-2xl"
                    style={{ 
                      transform: `rotate(${12 + index * 5}deg) scale(0)`,
                      marginLeft: index > 0 ? '-15px' : '0',
                      filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.4))',
                      transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      transitionDelay: `${0.2 + index * 0.1}s`
                    }}
                    ref={(el) => {
                      if (el && showPostcard) {
                        setTimeout(() => {
                          el.style.transform = `rotate(${12 + index * 5}deg) scale(1)`;
                        }, 50);
                      }
                    }}
                  />
                ))}
              </div>
            )}

            {/* Image panel */}
            <div className="w-full h-[56%] border-b-2 border-black">
              <img 
                src={project.image} 
                alt={project.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Info section */}
            <div className="w-full h-[44%] px-6 py-4 flex flex-col justify-between">
              <div className="min-w-0 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="text-2xl font-medium text-black leading-tight">
                    {project.title}
                  </h3>
                  <p className="text-xs text-gray-700 mt-1">
                    {project.venue}
                  </p>
                </div>
                <div className="text-right text-xs flex-shrink-0 leading-tight">
                  <span className="inline-block px-2 py-1 border-2 border-black bg-[#FFD93D] text-black font-semibold">
                    {project.installDate}
                  </span>
                  <span className="inline-block mt-2 px-2 py-1 border-2 border-black bg-white/90 text-[10px] font-semibold tracking-wide text-black">
                    {project.location}
                  </span>
                </div>
              </div>
              {project.tags && project.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2 items-center">
                  {project.tags.slice(0, 4).map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 text-xs font-semibold rounded-full border-2 border-black whitespace-nowrap"
                      style={{
                        backgroundColor: `${getTagColor(tag)}33`,
                        transform: index % 2 === 0 ? 'rotate(-2deg)' : 'rotate(2deg)'
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            </div>
        </div>
      </div>
  );
};
