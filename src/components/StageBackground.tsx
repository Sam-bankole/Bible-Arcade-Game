import React from 'react';

export const StageBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
      
      {/* Top Center Stage Spotlight */}
      <div 
        className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[1000px] h-[500px] rounded-full blur-[140px] opacity-25"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.6) 0%, rgba(6, 182, 212, 0.4) 50%, transparent 80%)'
        }}
      />

      {/* Top Left Violet Aurora */}
      <div 
        className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full blur-[120px] opacity-30"
        style={{
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.7) 0%, transparent 70%)'
        }}
      />

      {/* Bottom Right Cyan Glow */}
      <div 
        className="absolute -bottom-32 -right-32 w-[650px] h-[650px] rounded-full blur-[130px] opacity-25"
        style={{
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.6) 0%, transparent 70%)'
        }}
      />

      {/* Center Subtle Electric Lime Pulse */}
      <div 
        className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px] opacity-10"
        style={{
          background: 'radial-gradient(circle, rgba(204, 255, 0, 0.5) 0%, transparent 70%)'
        }}
      />

      {/* SVG Isometric Cyber Hex / Dot Matrix Mesh Overlay */}
      <svg 
        className="absolute inset-0 w-full h-full opacity-40" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Hexagonal Pattern */}
          <pattern 
            id="hex-grid" 
            width="40" 
            height="69.282" 
            patternUnits="userSpaceOnUse"
            patternTransform="scale(1)"
          >
            <path 
              d="M 40 0 L 20 11.547 L 0 0 L 0 23.094 L 20 34.641 L 40 23.094 Z M 0 34.641 L 20 46.188 L 40 34.641 L 40 57.735 L 20 69.282 L 0 57.735 Z" 
              fill="none" 
              stroke="rgba(148, 163, 184, 0.12)" 
              strokeWidth="0.8"
            />
            <circle cx="20" cy="34.641" r="1.2" fill="rgba(204, 255, 0, 0.25)" />
            <circle cx="0" cy="0" r="1" fill="rgba(6, 182, 212, 0.2)" />
            <circle cx="40" cy="0" r="1" fill="rgba(139, 92, 246, 0.2)" />
          </pattern>

          {/* Precision Micro Dot Matrix */}
          <pattern id="dot-matrix" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="0.8" fill="rgba(255, 255, 255, 0.12)" />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#hex-grid)" />
        <rect width="100%" height="100%" fill="url(#dot-matrix)" opacity="0.6" />
      </svg>

      {/* Cyber Grid Lines Horizon */}
      <div 
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px'
        }}
      />

    </div>
  );
};
