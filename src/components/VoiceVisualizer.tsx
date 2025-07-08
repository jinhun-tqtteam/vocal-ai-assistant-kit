import React from 'react';

interface VoiceVisualizerProps {
  isActive: boolean;
  audioLevel: number;
  mode: 'idle' | 'listening' | 'speaking';
}

const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({ isActive, audioLevel, mode }) => {
  const bars = Array.from({ length: 12 }, (_, i) => i);
  
  return (
    <div className="relative flex items-center justify-center w-80 h-32">
      {/* Glow effect background */}
      <div 
        className={`absolute inset-0 rounded-full transition-all duration-500 ${
          isActive 
            ? 'bg-gradient-glow animate-pulse-glow' 
            : 'bg-transparent'
        }`}
      />
      
      {/* Wave bars */}
      <div className="flex items-center justify-center gap-1 z-10">
        {bars.map((i) => {
          const height = isActive 
            ? Math.max(20, audioLevel * 80 + Math.sin(Date.now() / 200 + i) * 20)
            : 20;
          
          const delay = i * 0.1;
          
          return (
            <div
              key={i}
              className={`w-2 transition-all duration-150 rounded-full ${
                mode === 'listening' 
                  ? 'bg-wave-primary' 
                  : mode === 'speaking'
                  ? 'bg-wave-secondary'
                  : 'bg-voice-inactive'
              } ${isActive ? 'animate-wave' : ''}`}
              style={{
                height: `${height}px`,
                animationDelay: `${delay}s`,
                opacity: isActive ? Math.max(0.4, audioLevel + 0.3) : 0.3
              }}
            />
          );
        })}
      </div>
      
      {/* Center orb */}
      <div 
        className={`absolute w-16 h-16 rounded-full transition-all duration-500 ${
          mode === 'listening'
            ? 'bg-wave-primary shadow-voice animate-pulse-glow'
            : mode === 'speaking'
            ? 'bg-wave-secondary shadow-voice animate-pulse-glow'
            : 'bg-voice-inactive'
        }`}
        style={{
          transform: `scale(${isActive ? 1 + audioLevel * 0.5 : 1})`
        }}
      >
        <div className="absolute inset-2 rounded-full bg-background/20 backdrop-blur-sm" />
      </div>
      
      {/* Ripple effects */}
      {isActive && (
        <>
          <div className="absolute w-24 h-24 rounded-full border-2 border-primary/30 animate-ping" />
          <div className="absolute w-32 h-32 rounded-full border border-primary/20 animate-ping" style={{ animationDelay: '0.5s' }} />
        </>
      )}
    </div>
  );
};

export default VoiceVisualizer;