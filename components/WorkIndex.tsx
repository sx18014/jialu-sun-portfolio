
import React, { useMemo, useState, useEffect } from 'react';
import { FridgeMap } from './FridgeMap';
import { PROJECTS } from '../constants';
import { Link } from 'react-router-dom';

export const WorkIndex: React.FC = () => {
  const [activeProjectId, setActiveProjectId] = useState<string | null>(PROJECTS[0]?.id ?? null);
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    PROJECTS.forEach((project) => {
      project.tags.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet);
  }, []);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(() => new Set(allTags));

  const orderedProjects = useMemo(() => {
    return [...PROJECTS].sort((a, b) => (a.featuredOrder || 999) - (b.featuredOrder || 999));
  }, []);
  const filteredProjects = useMemo(() => {
    if (selectedTags.size === 0) return orderedProjects;
    return orderedProjects.filter((project) =>
      project.tags.some((tag) => selectedTags.has(tag))
    );
  }, [orderedProjects, selectedTags]);

  useEffect(() => {
    if (!filteredProjects.length) {
      setActiveProjectId(null);
      return;
    }
    if (activeProjectId && filteredProjects.some((p) => p.id === activeProjectId)) return;
    setActiveProjectId(filteredProjects[0].id);
  }, [filteredProjects, activeProjectId]);

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          'linear-gradient(#d4d4d4 1px, transparent 1px), linear-gradient(90deg, #d4d4d4 1px, transparent 1px), #fafaf9',
        backgroundSize: '50px 50px'
      }}
    >
      
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-8 pt-32 pb-16">
        <h1 className="text-4xl md:text-6xl font-semibold text-black mb-4 tracking-tight">Selected Work</h1>
        <p className="text-gray-600 text-base md:text-lg max-w-2xl font-normal leading-relaxed">
          A location-first view of my installations across the US, each one rooted in a specific community and built for the people who gather there. Hover a project to highlight its location on the map.
        </p>
        <div className="mt-8 flex flex-wrap gap-2.5">
          {allTags.map((tag, index) => {
            const isActive = selectedTags.has(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() =>
                  setSelectedTags((prev) => {
                    const next = new Set(prev);
                    const allCount = allTags.length;
                    if (next.has(tag)) {
                      if (next.size === allCount) {
                        return new Set([tag]);
                      }
                      if (next.size === 1) {
                        return new Set(allTags);
                      }
                      next.delete(tag);
                      return next.size === 0 ? new Set(allTags) : next;
                    }
                    next.add(tag);
                    return next;
                  })
                }
                className={`px-3 py-1.5 text-xs font-semibold rounded-full border-2 border-black shadow-[4px_4px_0_rgba(0,0,0,0.35)] transition-transform duration-200 ${
                  isActive ? 'bg-white text-black' : 'bg-white/60 text-gray-500'
                }`}
                style={{
                  backgroundColor: isActive
                    ? ['#FF6B6B', '#FFD93D', '#6BCF7F', '#A78BFA', '#FF9ECD'][index % 5] + '33'
                    : '#ffffff',
                  transform: index % 2 === 0 ? 'rotate(-2deg)' : 'rotate(2deg)'
                }}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Map + Project Grid */}
      <div className="max-w-7xl mx-auto px-8 pb-32 relative">
        <div className="flex flex-col lg:flex-row gap-12 items-start relative z-10">
          <div className="w-full lg:w-[40%] lg:sticky lg:top-28">
            <div className="relative overflow-visible">
              <FridgeMap focusedProjectId={activeProjectId} interactive={false} />
            </div>
            <p className="text-center mt-5 text-sm text-slate-400 font-light">
              The map highlights the project you hover.
            </p>
          </div>

          <div className="flex-1">
            <div className="grid gap-8 md:grid-cols-2">
              {filteredProjects.map((project) => (
                <Link
                  key={project.id}
                  to={`/work/${project.id}`}
                  onMouseEnter={() => setActiveProjectId(project.id)}
                  className="group block bg-white border-2 border-black shadow-[4px_4px_0_rgba(0,0,0,0.35)] transition-transform duration-300 hover:-translate-y-1"
                >
                  <div className="aspect-[16/10] w-full border-b-2 border-black overflow-hidden">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <p className="text-xs font-semibold tracking-wide text-gray-600 uppercase">{project.installDate}</p>
                      <span className="text-xs text-gray-500">•</span>
                      <p className="text-xs text-gray-600">{project.location}</p>
                    </div>
                    <h3 className="text-2xl font-semibold text-black mb-2">
                      {project.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">{project.venue}</p>
                    <p className="text-base text-gray-700 leading-relaxed">
                      {project.shortDescription}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
