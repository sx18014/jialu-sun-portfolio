import React, { useMemo, useState, useEffect } from 'react';
import { GALLERY_ITEMS } from '../galleryData';

export const InfiniteGallery: React.FC = () => {
  const [artworks, setArtworks] = useState<{id: string, title: string, description: string, image: string, width: number, height: number}[]>([]);

  const [bubble, setBubble] = useState<{ visible: boolean; x: number; y: number; text: string }>({
    visible: false,
    x: 0,
    y: 0,
    text: ''
  });

  useEffect(() => {
    const loadGalleryImages = async () => {
      const shuffled = [...GALLERY_ITEMS].sort(() => Math.random() - 0.5);
      const existingArtworks = [];
      for (const item of shuffled) {
        try {
          const img = new Image();
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = item.image;
          });
          
          existingArtworks.push({
            id: item.id,
            title: item.title,
            description: item.description,
            image: item.image,
            width: img.width,
            height: img.height
          });
        } catch {
          // Image doesn't exist, continue
        }
      }
      
      setArtworks(existingArtworks);
    };
    
    loadGalleryImages();
  }, []);

  // Single-pass collage layout
  const displayArtworks = useMemo(() => {
    if (artworks.length === 0) return [];
    const sizes = ['small', 'medium', 'large', 'xlarge'];
    return artworks.map((artwork, index) => ({
      ...artwork,
      id: `${artwork.id}-${index}`,
      collageSize: sizes[index % sizes.length]
    }));
  }, [artworks]);



  return (
    <div
      className="min-h-screen px-8 pt-32 pb-20"
      style={{
        background:
          'linear-gradient(#d4d4d4 1px, transparent 1px), linear-gradient(90deg, #d4d4d4 1px, transparent 1px), #fafaf9',
        backgroundSize: '50px 50px'
      }}
    >
      
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-6xl font-semibold text-gray-900 mb-5 tracking-tight">Art Gallery</h1>
        <p className="text-gray-600 text-base md:text-lg max-w-2xl font-normal leading-relaxed mx-auto">
          These drawings are pieces of my heart: traces of places I've traveled, animals I've admired, and small moments that made me feel something.
          <br />
          <span className="italic">Mocha, my orange cat, lives in many of them. He insists on being the star.</span>
        </p>
      </div>

      {/* Masonry-style Collage */}
      <div className="max-w-6xl mx-auto columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 [column-fill:_balance]">
        {displayArtworks.map((artwork, idx) => {
          const tilt = ['-rotate-1', 'rotate-1', '-rotate-2', 'rotate-2', 'rotate-0'][idx % 5];
          return (
            <div
              key={artwork.id}
              className={`group inline-block w-[88%] align-top mb-6 ${tilt}`}
              style={{ breakInside: 'avoid' as const }}
              onMouseEnter={(e) =>
                setBubble({
                  visible: true,
                  x: e.clientX,
                  y: e.clientY,
                  text: `${artwork.description}`
                })
              }
              onMouseMove={(e) =>
                setBubble((prev) => ({
                  ...prev,
                  x: e.clientX,
                  y: e.clientY
                }))
              }
              onMouseLeave={() =>
                setBubble((prev) => ({
                  ...prev,
                  visible: false
                }))
              }
            >
              <div className="relative bg-white border-2 border-black shadow-[6px_6px_0_rgba(0,0,0,0.35)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[8px_8px_0_rgba(0,0,0,0.35)]">
                <img 
                  src={artwork.image} 
                  alt={artwork.title} 
                  className="w-full h-auto object-cover"
                  style={{ aspectRatio: `${artwork.width} / ${artwork.height}` }}
                  loading="lazy"
                />

                {/* Sticky tape pinned top-right */}
                <div className="absolute -top-3 -right-4 rotate-2">
                  <div className="w-16 h-6 bg-amber-50/90 border border-amber-200 shadow-sm rotate-3 origin-center" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Speech bubble tooltip */}
      <div
        className="fixed z-50 pointer-events-none transition-all duration-200 ease-out"
        style={{
          left: bubble.x + 16,
          top: bubble.y - 12,
          transform: `${bubble.visible ? 'scale(1)' : 'scale(0.8)'} translate(0,0)`,
          opacity: bubble.visible ? 1 : 0,
          maxWidth: '280px'
        }}
      >
        <div
          className="relative bg-white text-gray-900 border-2 border-black px-4 py-3 shadow-[4px_4px_0_rgba(0,0,0,0.35)]"
          style={{ borderRadius: '8px', transform: 'rotate(-1deg)' }}
        >
          <div
            className="absolute -left-3 bottom-4 w-4 h-4 bg-white border-l-2 border-b-2 border-black"
            style={{ transform: 'rotate(45deg)' }}
          />
          <p className="text-sm leading-relaxed font-medium">{bubble.text}</p>
        </div>
      </div>
    </div>
  );
};
