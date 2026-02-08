import React, { useLayoutEffect, useRef, useMemo } from 'react';
import { gsap } from 'gsap';
import Draggable from 'gsap/Draggable';
import { withBase } from '../constants';
import { PROJECT_COLLAGE_MANIFEST } from '../generated/projectCollageManifest';

gsap.registerPlugin(Draggable);

interface ImageCollageProps {
  projectId: string;
}

export const ImageCollage: React.FC<ImageCollageProps> = ({ projectId }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const collageRef = useRef<HTMLDivElement>(null);
  const baseImages = useMemo(() => {
    const images = PROJECT_COLLAGE_MANIFEST[projectId] ?? [];
    return images.slice(0, 20).map((item) => ({
      ...item,
      src: withBase(item.src)
    }));
  }, [projectId]);

  // Create infinite collage items with original dimensions in 2 non-overlapping rows
  const collageItems = useMemo(() => {
    const items = [];
    const collageImages = baseImages.length > 0 ? baseImages : [];
    
    if (collageImages.length === 0) return items;
    
    // Calculate max height for proper row separation
    const maxImageHeight = Math.max(...collageImages.map(img => img.height));
    const containerHeight = 640; // 80vh ≈ 640px
    const rowGap = 40;
    const topMargin = 40;
    
    // Ensure rows don't overlap by calculating safe positions
    const row1Y = topMargin;
    const row2Y = Math.max(
      row1Y + maxImageHeight + rowGap, // Safe distance from row 1
      containerHeight - maxImageHeight - topMargin // Or align to bottom
    );
    
    // Calculate total width needed for one complete set
    let totalRow1Width = 0;
    let totalRow2Width = 0;
    
    for (let i = 0; i < collageImages.length; i++) {
      const imageData = collageImages[i];
      if (i % 2 === 0) {
        totalRow1Width += imageData.width + 40;
      } else {
        totalRow2Width += imageData.width + 40;
      }
    }
    
    const stripWidth = Math.max(totalRow1Width, totalRow2Width);
    
    // Create horizontal strips for infinite horizontal scroll
    for (let strip = 0; strip < 4; strip++) {
      let row1X = strip * stripWidth;
      let row2X = strip * stripWidth;
      
      // Split images between two rows
      for (let i = 0; i < collageImages.length; i++) {
        const imageData = collageImages[i];
        const isRow1 = i % 2 === 0;
        
        if (isRow1) {
          // Top row
          items.push({
            id: `${strip}-row1-${i}`,
            image: imageData.src,
            x: row1X,
            y: row1Y,
            width: imageData.width,
            height: imageData.height,
          });
          row1X += imageData.width + 40;
        } else {
          // Bottom row
          items.push({
            id: `${strip}-row2-${i}`,
            image: imageData.src,
            x: row2X,
            y: row2Y,
            width: imageData.width,
            height: imageData.height,
          });
          row2X += imageData.width + 40;
        }
      }
    }
    return items;
  }, [baseImages]);

  useLayoutEffect(() => {
    if (!collageRef.current || !containerRef.current) return;
    if (baseImages.length === 0) return;
    
    const ctx = gsap.context(() => {
      const collage = collageRef.current!;
      
      // Calculate grid width based on actual content
      let totalRow1Width = 0;
      let totalRow2Width = 0;
      
      for (let i = 0; i < baseImages.length; i++) {
        const imageData = baseImages[i];
        if (i % 2 === 0) {
          totalRow1Width += imageData.width + 40;
        } else {
          totalRow2Width += imageData.width + 40;
        }
      }
      
      const gridWidth = Math.max(totalRow1Width, totalRow2Width);
      
      // Set initial position
      gsap.set(collage, { x: -gridWidth * 2, y: 0 });
      
      const draggable = Draggable.create(collage, {
        type: "x",
        edgeResistance: 0,
        inertia: {
          resistance: 80,
          minDuration: 0.5,
          maxDuration: 4
        },
        cursor: "grab",
        activeCursor: "grabbing",
        
        onDrag: function() {
          wrapCollage();
        },
        
        onThrowUpdate: function() {
          wrapCollage();
        }
      })[0];
      
      function wrapCollage() {
        const currentX = gsap.getProperty(collage, "x") as number;
        
        let newX = currentX;
        
        // Smoother horizontal wrapping with more buffer
        if (currentX > -gridWidth) {
          newX = currentX - gridWidth;
        } else if (currentX < -gridWidth * 4) {
          newX = currentX + gridWidth;
        }
        
        if (newX !== currentX) {
          gsap.set(collage, { x: newX });
          draggable.update();
        }
      }
      
      // Gentle auto-drift
      let autoDrift: gsap.core.Tween;
      let isUserInteracting = false;
      
      const startAutoDrift = () => {
        if (isUserInteracting) return;
        
        autoDrift = gsap.to(collage, {
          x: "-=" + gridWidth,
          duration: 40,
          ease: "none",
          repeat: -1,
          onUpdate: wrapCollage
        });
      };
      
      const stopAutoDrift = () => {
        if (autoDrift) autoDrift.kill();
      };
      
      draggable.addEventListener("dragstart", () => {
        isUserInteracting = true;
        stopAutoDrift();
      });
      
      draggable.addEventListener("dragend", () => {
        isUserInteracting = false;
        gsap.delayedCall(2, startAutoDrift);
      });
      
      startAutoDrift();
      
      return () => {
        stopAutoDrift();
        draggable.kill();
      };
    }, containerRef);

    return () => ctx.revert();
  }, [collageItems, baseImages]);

  return (
    <div className="w-full h-[600px] mb-20 relative overflow-hidden bg-gray-50" ref={containerRef}>
      <div 
        ref={collageRef}
        className="absolute w-max h-max"
        style={{ width: `${Math.max(2000, collageItems.length > 0 ? Math.max(...collageItems.map(item => item.x + item.width)) : 2000)}px`, height: '600px' }}
      >
        {collageItems.map((item) => (
          <div
            key={item.id}
            className="absolute group cursor-pointer"
            style={{
              left: item.x,
              top: item.y,
              width: item.width,
              height: item.height,
            }}
          >
            {item.image ? (
              <img 
                src={item.image}
                alt="Project image"
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`w-full h-full bg-gray-100 ${item.image ? 'hidden' : ''}`}></div>
          </div>
        ))}
      </div>
    </div>
  );
};
