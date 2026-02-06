import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Magnet } from './Magnet';
import { PROJECTS } from '../constants';
import { ThreeUSMap, ThreeUSMapRef } from './ThreeUSMap';

// Map project locations to US state names
const LOCATION_TO_STATE: Record<string, string> = {
  'Missoula, MT': 'Montana',
  'Pittsburgh, PA': 'Pennsylvania',
  'Redwood City, CA': 'California',
  'New York, NY': 'New York',
  'Boise, ID': 'Idaho'
};

interface FridgeMapProps {
  focusedProjectId?: string | null;
  selectedProjectId?: string | null;
  onSelectProject?: (projectId: string | null) => void;
  interactive?: boolean;
}

export const FridgeMap: React.FC<FridgeMapProps> = ({
  focusedProjectId = null,
  selectedProjectId,
  onSelectProject,
  interactive = true
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ThreeUSMapRef>(null);
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [autoHoveredProject, setAutoHoveredProject] = useState<string | null>(null);
  const [selectedProjectInternal, setSelectedProjectInternal] = useState<string | null>(null);
  const [isAmbientActive, setIsAmbientActive] = useState(true);
  const [hasManualHover, setHasManualHover] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentIndexRef = useRef(0);
  const selectedProject = selectedProjectId !== undefined ? selectedProjectId : selectedProjectInternal;
  const focusedProject = focusedProjectId ? PROJECTS.find((p) => p.id === focusedProjectId) : null;
  const focusedState = focusedProject ? LOCATION_TO_STATE[focusedProject.location] : null;

  useEffect(() => {
    // Smooth fade-in animation
    if (mapRef.current) {
      mapRef.current.style.opacity = '0';
      mapRef.current.style.transform = 'scale(0.95)';
      
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.style.transition = 'all 1.5s ease-out';
          mapRef.current.style.opacity = '1';
          mapRef.current.style.transform = 'scale(1)';
        }
      }, 300);
    }
  }, []);

  const handleProjectHover = (projectId: string, isEntering: boolean) => {
    const project = PROJECTS.find(p => p.id === projectId);
    if (project) {
      const stateName = LOCATION_TO_STATE[project.location];
      setHoveredState(isEntering && stateName ? stateName : null);
    }
  };

  const handleProjectClick = (projectId: string) => {
    if (!interactive) return;
    const next = selectedProject === projectId ? null : projectId;
    if (onSelectProject) {
      onSelectProject(next);
    } else {
      setSelectedProjectInternal(next);
    }
    handleUserInteraction();
  };

  // Ambient attract mode
  useEffect(() => {
    if (!interactive || !isAmbientActive || hasManualHover || selectedProject || focusedProjectId) return;

    const showNextPostcard = () => {
      const project = PROJECTS[currentIndexRef.current];
      const stateName = LOCATION_TO_STATE[project.location];
      
      setAutoHoveredProject(project.id);
      if (stateName) setHoveredState(stateName);
      
      timerRef.current = setTimeout(() => {
        setAutoHoveredProject(null);
        setHoveredState(null);
        currentIndexRef.current = (currentIndexRef.current + 1) % PROJECTS.length;
        timerRef.current = setTimeout(showNextPostcard, 2000);
      }, 3000);
    };
    
    timerRef.current = setTimeout(showNextPostcard, 3000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isAmbientActive, hasManualHover, selectedProject, focusedProjectId]);

  useEffect(() => {
    if (!focusedProjectId) return;
    setAutoHoveredProject(null);
    setHoveredState(null);
  }, [focusedProjectId]);


  const handleUserInteraction = () => {
    if (!interactive) return;
    setIsAmbientActive(false);
    setAutoHoveredProject(null);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    
    inactivityTimerRef.current = setTimeout(() => {
      setIsAmbientActive(true);
    }, 5000);
  };

  useEffect(() => {
    return () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, []);

  const handleParallax = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive) return;
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relX = (event.clientX - rect.left) / rect.width - 0.5;
    const relY = (event.clientY - rect.top) / rect.height - 0.5;
    const maxOffset = 10;

    gsap.to(containerRef.current, {
      x: relX * maxOffset,
      y: relY * maxOffset,
      duration: 0.4,
      ease: 'power2.out'
    });
  };

  const resetParallax = () => {
    if (!interactive) return;
    if (!containerRef.current) return;
    gsap.to(containerRef.current, { x: 0, y: 0, duration: 0.5, ease: 'power2.out' });
  };

  const mapTiltStyle = !interactive
    ? {
        transform: 'rotateX(8deg) scale(1.02)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        transition: 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.6s ease',
        transformOrigin: '50% 100%'
      }
    : selectedProject
    ? {
        transform: 'rotateX(50deg) scale(1.12)',
        boxShadow: '0 28px 80px rgba(0,0,0,0.25)',
        transition: 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.6s ease',
        transformOrigin: '50% 100%'
      }
    : {
        transform: 'rotateX(18deg) scale(1.1)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.16)',
        transition: 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.6s ease',
        transformOrigin: '50% 100%'
      };

  return (
    <div
      ref={containerRef}
      className="relative w-full flex items-center justify-center animate-fade-in"
      onMouseLeave={resetParallax}
      style={{
        perspective: '1800px',
        perspectiveOrigin: '50% 70%'
      }}
    >
        {/* Map Container */}
        <div 
          className="relative w-full aspect-[4/3] bg-[#f8f6f1] overflow-visible border-2 border-black/10"
          style={mapTiltStyle}
          onMouseMove={(e) => {
            handleUserInteraction();
            handleParallax(e);
          }}
          onMouseLeave={resetParallax}
        >
            
            {/* ECharts US Map */}
            <div 
              ref={mapRef}
              className="absolute inset-0 w-full h-full"
            >
              <ThreeUSMap ref={chartRef} highlightedState={focusedState ?? hoveredState} selectedProject={selectedProject} />
            </div>

            {/* Magnets Layer */}
            {interactive && (
              <div
                className="absolute inset-0 w-full h-full z-10"
                onMouseMove={handleUserInteraction}
              >
                  {PROJECTS.map((project) => (
                      <div
                        key={project.id}
                        onMouseEnter={() => {
                          handleUserInteraction();
                          setHasManualHover(true);
                          handleProjectHover(project.id, true);
                        }}
                        onMouseLeave={() => {
                          setHasManualHover(false);
                          handleProjectHover(project.id, false);
                        }}
                        onClick={() => handleProjectClick(project.id)}
                      >
                        <Magnet 
                          project={project} 
                          forceHover={(focusedProjectId ? focusedProjectId === project.id : autoHoveredProject === project.id)}
                          isSelected={selectedProject === project.id}
                        />
                      </div>
                  ))}
              </div>
            )}


        </div>
    </div>
  );
};
