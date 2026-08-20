import React from 'react';

export const StageBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden bg-[#07090e]">
      {/* Subtle deep ambient glow top center */}
      <div 
        className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[700px] h-[350px] rounded-full blur-[140px] opacity-15"
        style={{
          background: 'radial-gradient(circle, rgba(204, 255, 0, 0.4) 0%, transparent 70%)'
        }}
      />

      {/* Clean micro-dot grid pattern */}
      <svg 
        className="absolute inset-0 w-full h-full opacity-[0.18]" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="dot-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#94a3b8" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dot-grid)" />
      </svg>

      {/* Subtle hairline grid overlay */}
      <div 
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.2) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.2) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px'
        }}
      />
    </div>
  );
};
