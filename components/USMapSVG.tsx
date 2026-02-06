import React from 'react';

export const USMapSVG: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg viewBox="0 0 959 593" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <g opacity="0.3">
        {/* Simplified US Shape - More visible */}
        <path d="M120 50 C 200 20, 350 20, 450 40 C 550 60, 700 40, 850 80 L 900 150 C 920 250, 850 400, 800 500 L 700 550 C 600 540, 500 560, 400 550 C 200 520, 100 450, 50 300 L 40 150 Z" 
              fill="#9CA3AF" 
              stroke="#6B7280" 
              strokeWidth="1" />
      </g>
    </svg>
  );
};
