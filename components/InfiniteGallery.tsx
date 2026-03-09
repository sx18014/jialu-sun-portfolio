import React, { useEffect, useMemo, useState } from 'react';
import { GALLERY_ITEMS, buildGalleryItems, type GalleryItem, type GalleryManifestLikeItem } from '../galleryData';

export const InfiniteGallery: React.FC = () => {
  const [bubble, setBubble] = useState<{ visible: boolean; x: number; y: number; text: string }>({
    visible: false,
    x: 0,
    y: 0,
    text: ''
  });
  const [selectedArtworkId, setSelectedArtworkId] = useState<string | null>(null);
  const [activeRefIndex, setActiveRefIndex] = useState(0);
  const [devManifest, setDevManifest] = useState<GalleryManifestLikeItem[] | null>(null);

  useEffect(() => {
    if (!import.meta.env.DEV) return;

    let isCancelled = false;

    const fetchDevManifest = async () => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}__dev-gallery-manifest`, { cache: 'no-store' });
        if (!response.ok) return;
        const data = (await response.json()) as GalleryManifestLikeItem[];
        if (!isCancelled) {
          setDevManifest(data);
        }
      } catch {
        // Keep static manifest fallback on fetch errors.
      }
    };

    void fetchDevManifest();

    return () => {
      isCancelled = true;
    };
  }, []);

  const galleryItems: GalleryItem[] = useMemo(() => {
    if (import.meta.env.DEV && devManifest) {
      return buildGalleryItems(devManifest);
    }
    return GALLERY_ITEMS;
  }, [devManifest]);

  // Single-pass collage layout
  const displayArtworks = useMemo(() => {
    const sizes = ['small', 'medium', 'large', 'xlarge'];
    const shuffled = [...galleryItems].sort(() => Math.random() - 0.5);
    return shuffled.map((artwork, index) => ({
      ...artwork,
      collageSize: sizes[index % sizes.length]
    }));
  }, [galleryItems]);

  const selectedArtwork = useMemo(
    () => displayArtworks.find((artwork) => artwork.id === selectedArtworkId) ?? null,
    [displayArtworks, selectedArtworkId]
  );

  useEffect(() => {
    setActiveRefIndex(0);
  }, [selectedArtworkId]);

  useEffect(() => {
    if (!selectedArtwork) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedArtworkId(null);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedArtwork]);

  const getReferenceCount = (artwork: (typeof displayArtworks)[number]) => artwork.story?.references?.length ?? 0;



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
      <div className="mb-12 text-left max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-semibold text-gray-900 mb-5 tracking-tight">Art Gallery</h1>
        <p className="text-gray-600 text-base md:text-lg max-w-2xl font-normal leading-relaxed">
        When I’m not working, I draw.
        It’s how I archive feeling - small memories from travel, nature, and the people I love. Mocha, my orange cat, is a frequent guest star.
          <br />
        </p>
        <div className="inline-flex items-center gap-2 mt-4 px-3 py-1.5 bg-white border-2 border-black shadow-[3px_3px_0_rgba(0,0,0,0.2)] text-xs md:text-sm text-[#2f2f2f]">
          <span>Click artworks with</span>
          <span
            aria-hidden
            className="inline-flex items-center justify-center w-6 h-6 -mt-1 rounded-full border-2 border-black bg-[#FFD93D] font-semibold text-[11px] shadow-[2px_2px_0_rgba(0,0,0,0.25)] rotate-6"
          >
            i
          </span>
          <span>for extra story and references.</span>
        </div>
      </div>

      {/* Masonry-style Collage */}
      <div className="max-w-6xl mx-auto columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 [column-fill:_balance]">
        {displayArtworks.map((artwork, idx) => {
          const tilt = ['-rotate-1', 'rotate-1', '-rotate-2', 'rotate-2', 'rotate-0'][idx % 5];
          const hasDetail = (artwork.story?.references?.length ?? 0) > 0;
          const refCount = getReferenceCount(artwork);
          return (
            <div
              key={artwork.id}
              className={`group inline-block w-[88%] align-top mb-6 ${tilt} ${hasDetail ? 'cursor-zoom-in' : 'cursor-default'}`}
              style={{ breakInside: 'avoid' as const }}
              role={hasDetail ? 'button' : undefined}
              tabIndex={hasDetail ? 0 : undefined}
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
              onClick={hasDetail ? () => setSelectedArtworkId(artwork.id) : undefined}
              onKeyDown={(e) => {
                if (!hasDetail) return;
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedArtworkId(artwork.id);
                }
              }}
            >
              <div className="relative bg-white border-2 border-black shadow-[6px_6px_0_rgba(0,0,0,0.35)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[8px_8px_0_rgba(0,0,0,0.35)]">
                {hasDetail ? (
                  <span
                    className="absolute -top-3 -right-3 z-10 inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#FFD93D] border-2 border-black text-[13px] font-semibold shadow-[3px_3px_0_rgba(0,0,0,0.28)] rotate-6 transition-transform duration-200 group-hover:scale-105 group-hover:rotate-12"
                    title={refCount === 1 ? 'More info (1 reference)' : `More info (${refCount} references)`}
                  >
                    i
                  </span>
                ) : null}
                <picture>
                  {artwork.imageAvif && artwork.imageAvif.toLowerCase().endsWith('.avif') ? (
                    <source srcSet={artwork.imageAvif} type="image/avif" />
                  ) : null}
                  {artwork.imageWebp.toLowerCase().endsWith('.webp') ? (
                    <source srcSet={artwork.imageWebp} type="image/webp" />
                  ) : null}
                  <img 
                    src={artwork.imageWebp} 
                    alt={artwork.title} 
                    className="w-full h-auto object-cover"
                    style={{ aspectRatio: `${artwork.width} / ${artwork.height}` }}
                    width={artwork.width}
                    height={artwork.height}
                    loading="lazy"
                    decoding="async"
                  />
                </picture>

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

      {selectedArtwork ? (
        <div
          className="fixed inset-0 z-[60] bg-black/45 backdrop-blur-[1px] px-4 py-6 md:px-8 md:py-10 flex items-center justify-center"
          onClick={() => setSelectedArtworkId(null)}
        >
          <div
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#fdfcf8] border-2 border-black shadow-[10px_10px_0_rgba(0,0,0,0.35)] p-3 md:p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#FFD93D] border-2 border-black px-3 py-2 mb-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-lg md:text-xl font-semibold text-[#1f1f1f] tracking-tight truncate">{selectedArtwork.title}</h2>
                <p className="text-xs md:text-sm text-[#2f2f2f] leading-relaxed mt-0.5">{selectedArtwork.description}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedArtworkId(null)}
                className="shrink-0 px-2.5 py-1.5 text-xs font-semibold border-2 border-black bg-white shadow-[3px_3px_0_rgba(0,0,0,0.3)] hover:-translate-y-0.5 transition-transform"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_260px] gap-3">
              <div className="bg-white border-2 border-black p-2 shadow-[4px_4px_0_rgba(0,0,0,0.25)]">
                <picture>
                  {selectedArtwork.imageAvif && selectedArtwork.imageAvif.toLowerCase().endsWith('.avif') ? (
                    <source srcSet={selectedArtwork.imageAvif} type="image/avif" />
                  ) : null}
                  {selectedArtwork.imageWebp.toLowerCase().endsWith('.webp') ? (
                    <source srcSet={selectedArtwork.imageWebp} type="image/webp" />
                  ) : null}
                  <img
                    src={selectedArtwork.imageWebp}
                    alt={selectedArtwork.title}
                    className="w-full h-auto object-contain max-h-[56vh]"
                    width={selectedArtwork.width}
                    height={selectedArtwork.height}
                  />
                </picture>
              </div>

              <div className="bg-white border-2 border-black p-3 shadow-[4px_4px_0_rgba(0,0,0,0.25)]">
                {selectedArtwork.story ? (
                  <>
                    <p className="text-xs font-semibold tracking-[0.12em] text-[#444] mb-1">MORE INFO</p>
                    <p className="text-[11px] text-[#666] mb-2">
                      {selectedArtwork.story.mode === 'sequence'
                        ? 'Story sequence'
                        : `${selectedArtwork.story.references?.length ?? 0} reference${(selectedArtwork.story.references?.length ?? 0) === 1 ? '' : 's'}`}
                    </p>
                    {selectedArtwork.story.notes ? (
                      <p className="text-xs leading-relaxed text-[#2b2b2b] mb-3">{selectedArtwork.story.notes}</p>
                    ) : null}

                    {selectedArtwork.story.references && selectedArtwork.story.references.length > 0 ? (
                      <>
                        <div className="border-2 border-black bg-[#f7f7f7] p-1.5 mb-2 h-40 flex items-center justify-center">
                          <img
                            src={selectedArtwork.story.references[activeRefIndex].src}
                            alt={
                              selectedArtwork.story.references[activeRefIndex].caption ??
                              `${selectedArtwork.title} reference ${activeRefIndex + 1}`
                            }
                            className="max-w-full max-h-full object-contain"
                            loading="lazy"
                          />
                        </div>
                        <p className="text-[11px] text-[#4a4a4a] mb-2 min-h-6">
                          {selectedArtwork.story.references[activeRefIndex].caption ??
                            `Reference ${activeRefIndex + 1}`}
                        </p>
                        <div className="flex gap-2 overflow-x-auto pb-1">
                          {selectedArtwork.story.references.map((ref, index) => (
                            <button
                              key={`${selectedArtwork.id}-ref-${index}`}
                              type="button"
                              onClick={() => setActiveRefIndex(index)}
                              className={`h-12 w-12 shrink-0 border-2 overflow-hidden transition-transform ${
                                activeRefIndex === index
                                  ? 'border-black scale-105'
                                  : 'border-black/40 hover:border-black'
                              }`}
                              aria-label={`View reference ${index + 1}`}
                            >
                              <img
                                src={ref.src}
                                alt={ref.caption ?? `Reference ${index + 1}`}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            </button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-[#444]">No reference images added yet.</p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-[#444]">This artwork currently uses quick-view mode only.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
