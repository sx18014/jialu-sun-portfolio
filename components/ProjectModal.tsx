import React, { useEffect } from 'react';
import { Project } from '../types';
import { X, MapPin, Tag, Cpu, Heart, Zap } from 'lucide-react';

interface Props {
  project: Project | null;
  onClose: () => void;
}

export const ProjectModal: React.FC<Props> = ({ project, onClose }) => {
  useEffect(() => {
    if (project) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [project]);

  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-ink/90 backdrop-blur-sm transition-all duration-300">
      <div className="bg-paper w-full h-full md:h-auto md:max-h-[90vh] md:max-w-5xl md:rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl relative animate-fade-in-up">
        
        {/* Close Button */}
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-50 bg-white/50 hover:bg-white p-2 rounded-full transition-colors"
        >
            <X size={24} className="text-ink" />
        </button>

        {/* Image Side (Top on mobile, Left on desktop) */}
        <div className="w-full md:w-5/12 h-64 md:h-auto relative">
            <img 
                src={project.image} 
                alt={project.title} 
                className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent md:hidden"></div>
            <div className="absolute bottom-4 left-4 md:hidden text-white">
                 <h2 className="text-3xl font-serif font-bold">{project.title}</h2>
                 <p className="flex items-center gap-1 text-sm opacity-90"><MapPin size={14}/> {project.location}</p>
            </div>
        </div>

        {/* Content Side */}
        <div className="w-full md:w-7/12 overflow-y-auto p-8 md:p-12">
            {/* Desktop Header */}
            <div className="hidden md:block mb-8 border-b border-gray-300 pb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-4xl font-serif font-bold text-ink mb-2">{project.title}</h2>
                        <div className="flex items-center gap-2 text-gray-500 font-mono text-sm">
                            <MapPin size={16} />
                            {project.location}
                        </div>
                    </div>
                    <div className="w-12 h-12 rounded-lg shadow-inner" style={{backgroundColor: project.color}}></div>
                </div>
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

            {/* The 4-Part Story Arc */}
            <div className="space-y-8">
                <div className="group">
                    <h3 className="text-sm font-bold text-accent uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Tag size={16} /> Vision
                    </h3>
                    <p className="text-gray-700 leading-relaxed border-l-2 border-accent/30 pl-4">{project.fullDescription.vision.split('\n').map((line, i, arr) => <React.Fragment key={i}>{line}{i < arr.length - 1 && (line === '' || arr[i + 1] === '' ? <><br /><br /></> : <br />)}</React.Fragment>)}</p>
                </div>

                <div className="group">
                    <h3 className="text-sm font-bold text-tech uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Cpu size={16} /> Technology
                    </h3>
                    <p className="text-gray-700 leading-relaxed border-l-2 border-tech/30 pl-4">{project.fullDescription.tech.split('\n').map((line, i, arr) => <React.Fragment key={i}>{line}{i < arr.length - 1 && (line === '' || arr[i + 1] === '' ? <><br /><br /></> : <br />)}</React.Fragment>)}</p>
                </div>

                <div className="group">
                    <h3 className="text-sm font-bold text-purple-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Zap size={16} /> Experience
                    </h3>
                    <p className="text-gray-700 leading-relaxed border-l-2 border-purple-500/30 pl-4">{project.fullDescription.experience.split('\n').map((line, i, arr) => <React.Fragment key={i}>{line}{i < arr.length - 1 && (line === '' || arr[i + 1] === '' ? <><br /><br /></> : <br />)}</React.Fragment>)}</p>
                </div>

                <div className="group bg-warm/30 p-6 rounded-xl border border-warm">
                    <h3 className="text-sm font-bold text-orange-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Heart size={16} /> Connection & Reflection
                    </h3>
                    <p className="text-gray-800 italic font-serif">{project.fullDescription.connection.split('\n').map((line, i, arr) => <React.Fragment key={i}>{line}{i < arr.length - 1 && (line === '' || arr[i + 1] === '' ? <><br /><br /></> : <br />)}</React.Fragment>)}</p>
                </div>
            </div>
            
        </div>
      </div>
    </div>
  );
};
