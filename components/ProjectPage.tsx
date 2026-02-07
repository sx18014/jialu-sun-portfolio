import React, { useLayoutEffect, useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PROJECTS, parseText, withBase } from '../constants';
import { ImageCollage } from './ImageCollage';
import { PrototypeSection } from './PrototypeSection';

// Helper to detect if hero media is video or image
const getHeroMediaType = (path: string): 'video' | 'image' => {
  const ext = path.split('.').pop()?.toLowerCase();
  return ext === 'mp4' || ext === 'webm' || ext === 'mov' ? 'video' : 'image';
};

export const ProjectPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [heroMedia, setHeroMedia] = useState<string | null>(null);

  const actionButtonBase =
    'inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium border-2 border-black shadow-[0_3px_10px_rgba(0,0,0,0.24)] transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(0,0,0,0.28)]';
  
  const project = PROJECTS.find(p => p.id === id);
  const nextProjectIndex = PROJECTS.findIndex(p => p.id === id) + 1;
  const nextProject = PROJECTS[nextProjectIndex % PROJECTS.length];

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Auto-detect hero media (video or image)
  useEffect(() => {
    if (!id) return;
    
    const checkHeroMedia = async () => {
      const extensions = ['mp4', 'webm', 'mov', 'jpg', 'jpeg', 'png', 'gif'];
      const patterns = ['hero', 'cover', 'main'];
      
      for (const pattern of patterns) {
        for (const ext of extensions) {
          const path = withBase(`/projects/${id}/${pattern}.${ext}`);
          try {
            if (ext === 'mp4' || ext === 'webm' || ext === 'mov') {
              const video = document.createElement('video');
              await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => reject(new Error('timeout')), 3000);
                video.onloadedmetadata = () => { clearTimeout(timeout); resolve(true); };
                video.onerror = () => { clearTimeout(timeout); reject(new Error('load error')); };
                video.src = path;
              });
            } else {
              const img = new Image();
              await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => reject(new Error('timeout')), 5000);
                img.onload = () => { clearTimeout(timeout); resolve(true); };
                img.onerror = () => { clearTimeout(timeout); reject(new Error('load error')); };
                img.src = path;
              });
            }
            setHeroMedia(path);
            return;
          } catch {}
        }
      }
    };
    
    checkHeroMedia();
  }, [id]);

  // Auto-detect approach images and videos
  const [approachMedia, setApproachMedia] = useState<Array<{path: string, type: 'video' | 'image'}>>([]);
  useEffect(() => {
    if (!id) return;
    
    const checkApproachMedia = async () => {
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif'];
      const videoExtensions = ['mp4', 'webm', 'mov'];
      const allExtensions = [...videoExtensions, ...imageExtensions];
      const media: Array<{path: string, type: 'video' | 'image'}> = [];
      
      for (let i = 1; i <= 10; i++) {
        const num = i.toString().padStart(2, '0');
        for (const ext of allExtensions) {
          const path = withBase(`/projects/${id}/approach/${num}.${ext}`);
          
          if (videoExtensions.includes(ext)) {
            // Check for video
            const video = document.createElement('video');
            await new Promise((resolve) => {
              const timeout = setTimeout(() => resolve(false), 1000);
              video.onloadedmetadata = () => {
                clearTimeout(timeout);
                media.push({path, type: 'video'});
                resolve(true);
              };
              video.onerror = () => {
                clearTimeout(timeout);
                resolve(false);
              };
              video.src = path;
            });
          } else {
            // Check for image
            const img = new Image();
            await new Promise((resolve) => {
              const timeout = setTimeout(() => resolve(false), 1000);
              img.onload = () => {
                clearTimeout(timeout);
                media.push({path, type: 'image'});
                resolve(true);
              };
              img.onerror = () => {
                clearTimeout(timeout);
                resolve(false);
              };
              img.src = path;
            });
          }
          
          if (media.length > i - 1) break;
        }
      }
      setApproachMedia(media);
    };
    
    checkApproachMedia();
  }, [id]);

  if (!project) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white text-black">
            <h1 className="text-4xl font-semibold mb-4">Project Not Found</h1>
            <Link to="/work" className="text-gray-500 hover:text-black transition-colors">Back to Work</Link>
        </div>
    );
  }

  return (
    <div className="bg-white min-h-screen" style={{ background: '#fafaf9', backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' seed=\'2\' /%3E%3CfeDisplacementMap in=\'SourceGraphic\' scale=\'0.3\' /%3E%3C/filter%3E%3Crect width=\'100\' height=\'100\' fill=\'%23fafaf9\' filter=\'url(%23noiseFilter)\' opacity=\'0.05\' /%3E%3C/svg%3E")', backgroundSize: '200px 200px' }}>
      
      {/* Hero Media - Full Screen */}
      <div className="relative w-full h-screen">
        {heroMedia ? (
          getHeroMediaType(heroMedia) === 'video' ? (
            <video 
              src={heroMedia}
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
            />
          ) : (
            <img 
              src={heroMedia}
              alt={project.title}
              className="w-full h-full object-cover"
            />
          )
        ) : (
          <div className="w-full h-full bg-gray-900"></div>
        )}
        
        {/* Back Button removed (nav bar handles navigation) */}
      </div>

      {/* Title and Description Section */}
      <div className="px-8 py-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16">
          {/* Left Column - Title and Metadata */}
          <div>
            <h1 className="text-4xl md:text-6xl font-semibold text-black mb-6 tracking-tight">
              {project.title}
            </h1>
            
            {/* Metadata */}
            <div className="mb-6">
              <div className="flex items-baseline gap-3 mb-3 flex-wrap">
                <p className="text-lg text-gray-900 font-medium">
                  {project.venue}
                </p>
                {project.venueUrl && (
                  <a 
                    href={project.venueUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`${actionButtonBase} bg-black text-white`}
                  >
                    Visit the Spot →
                  </a>
                )}
              </div>
              <p className="text-sm text-gray-500 mb-1">
                {project.location}
              </p>
              <p className="text-sm text-gray-500">
                Installed {project.installDate}
              </p>
            </div>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2.5 mb-8">
              {project.tags.map((tag, idx) => (
                <span
                  key={tag}
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

            {/* My Role */}
            {project.myRole && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-2xl font-semibold text-black mb-3">
                  My Role
                </h3>
                <p className="text-base text-gray-900 font-medium mb-4">
                  {project.myRole.title}
                </p>
                <ul className="space-y-2">
                  {project.myRole.responsibilities.map((item, index) => (
                    <li key={index} className="text-sm text-gray-600 leading-relaxed flex">
                      <span className="text-gray-400 mr-2">•</span>
                      <span>
                        {parseText(item).map((part, j) => {
                          if (part.type === 'bold') return <strong key={j} className="font-semibold text-gray-900">{part.content}</strong>;
                          if (part.type === 'link') return <a key={j} href={part.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{part.content}</a>;
                          return <span key={j}>{part.content}</span>;
                        })}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          {/* Right Column - Description */}
          <div>
            {/* One sentence summary */}
            <p className="text-xl text-gray-700 font-normal mb-8 leading-relaxed">
              {project.shortDescription}
            </p>
            
            {/* Overview */}
            <div className="mb-6">
              <h3 className="text-2xl font-semibold text-black mb-4">
                Overview
              </h3>
              <p className="text-base text-gray-600 font-normal leading-relaxed">
                {project.fullDescription.vision.split('\n').map((line, i, arr) => <React.Fragment key={i}>{line}{i < arr.length - 1 && (line === '' || arr[i + 1] === '' ? <><br /><br /></> : <br />)}</React.Fragment>)}
              </p>
            </div>
            
            {/* Award */}
            {project.award && (
              <div className="mb-6 flex items-center gap-6 flex-wrap">
                {project.award.logo && (
                  <img src={project.award.logo} alt="Award" className="w-24 h-24 object-contain" />
                )}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">{project.award.title}</h4>
                  <p className="text-sm text-gray-500 mb-2">{project.award.category}</p>
                  {project.award.url && (
                    <a
                      href={project.award.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${actionButtonBase} bg-[#FFD93D] text-black`}
                    >
                      Award Glow →
                    </a>
                  )}
                </div>
              </div>
            )}
            
            {/* Experience removed */}
          </div>
        </div>
      </div>

      {/* Full Width Image Collage Section */}
      <ImageCollage projectId={project.id} />

      <div className="max-w-6xl mx-auto px-8 pb-20">
        {/* Approach Section with Side Images */}
        <div className="mb-20 grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-semibold text-black mb-8">
              Approach
            </h2>
            <p className="text-gray-700 font-normal leading-relaxed">
              {project.fullDescription.approach.split('\n').map((line, i, arr) => (
                <React.Fragment key={i}>
                  {parseText(line).map((part, j) => {
                    if (part.type === 'bold') return <strong key={j} className="font-semibold">{part.content}</strong>;
                    if (part.type === 'link') return <a key={j} href={part.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{part.content}</a>;
                    return <span key={j}>{part.content}</span>;
                  })}
                  {i < arr.length - 1 && (line === '' || arr[i + 1] === '' ? <><br /><br /></> : <br />)}
                </React.Fragment>
              ))}
            </p>
          </div>
          {approachMedia.length > 0 && (
            <div className="grid grid-cols-2 gap-6">
              {approachMedia.map((media, index) => {
                const rotations = [2, -1.5, 1, -2, 1.5, -1, 2.5, -0.5, 1.2, -1.8];
                const offsets = [
                  { x: 0, y: 0 },
                  { x: 8, y: -4 },
                  { x: -6, y: 2 },
                  { x: 4, y: -6 },
                  { x: -8, y: 4 },
                  { x: 6, y: -2 },
                  { x: -4, y: 6 },
                  { x: 8, y: 2 },
                  { x: -6, y: -4 },
                  { x: 4, y: 4 }
                ];
                return (
                  <div 
                    key={index}
                    className="relative group cursor-pointer"
                    style={{
                      transform: `rotate(${rotations[index % rotations.length]}deg) translate(${offsets[index % offsets.length].x}px, ${offsets[index % offsets.length].y}px)`,
                      transition: 'transform 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = `rotate(0deg) translate(0px, -8px) scale(1.05)`;
                      e.currentTarget.style.zIndex = '10';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = `rotate(${rotations[index % rotations.length]}deg) translate(${offsets[index % offsets.length].x}px, ${offsets[index % offsets.length].y}px)`;
                      e.currentTarget.style.zIndex = '0';
                    }}
                  >
                    <div
                      className="bg-white border-2 border-black shadow-[4px_4px_0_rgba(0,0,0,0.35)]"
                      style={{ padding: '10px 10px 14px 10px' }}
                    >
                      {media.type === 'video' ? (
                        <video 
                          src={media.path} 
                          className="w-full h-auto object-cover" 
                          autoPlay 
                          loop 
                          muted 
                          playsInline 
                        />
                      ) : (
                        <img 
                          src={media.path} 
                          alt="" 
                          className="w-full h-auto object-cover" 
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Early Stage Prototypes */}
        <PrototypeSection projectId={project.id} prototypeData={project.prototypes} />

        {/* Impact removed */}

        {/* Final Image */}
        <div className="w-full h-80 bg-gray-50"></div>

      </div>

      {/* Next Project */}
      <div className="border-t border-gray-200 py-16 px-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">
            NEXT PROJECT
          </p>
          <button 
            onClick={() => navigate(`/work/${nextProject.id}`)}
            className="text-2xl md:text-4xl font-semibold text-black hover:text-gray-600 transition-transform duration-300 hover:scale-110 hover:rotate-1"
          >
            {nextProject.title}
          </button>
        </div>
      </div>

    </div>
  );
};
