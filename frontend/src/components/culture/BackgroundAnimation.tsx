
import React from 'react';

const BackgroundAnimation: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/90" />
      
      {/* Floating geometric shapes */}
      <div className="absolute inset-0">
        {/* Large diamond shape - inspired by the logo */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 transform rotate-45 animate-pulse">
          <div className="w-full h-full border-2 border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-lg animate-[spin_20s_linear_infinite]" />
        </div>
        
        {/* Medium diamond shape */}
        <div className="absolute top-3/4 right-1/4 w-24 h-24 transform rotate-45 animate-pulse" style={{ animationDelay: '2s' }}>
          <div className="w-full h-full border-2 border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-green-500/10 rounded-lg animate-[spin_15s_linear_infinite_reverse]" />
        </div>
        
        {/* Small diamond shapes */}
        <div className="absolute top-1/2 right-1/3 w-16 h-16 transform rotate-45 animate-pulse" style={{ animationDelay: '4s' }}>
          <div className="w-full h-full border-2 border-pink-500/20 bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-lg animate-[spin_25s_linear_infinite]" />
        </div>
        
        <div className="absolute bottom-1/4 left-1/3 w-20 h-20 transform rotate-45 animate-pulse" style={{ animationDelay: '6s' }}>
          <div className="w-full h-full border-2 border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg animate-[spin_18s_linear_infinite_reverse]" />
        </div>
        
        {/* Floating lines - representing the infinity concept */}
        <div className="absolute top-1/3 left-1/2 w-40 h-1 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent animate-[float_8s_ease-in-out_infinite]" />
        <div className="absolute bottom-1/3 right-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent animate-[float_6s_ease-in-out_infinite_reverse]" style={{ animationDelay: '3s' }} />
        
        {/* Animated dots */}
        <div className="absolute top-1/6 right-1/6 w-2 h-2 bg-purple-500/40 rounded-full animate-ping" />
        <div className="absolute bottom-1/6 left-1/6 w-2 h-2 bg-cyan-500/40 rounded-full animate-ping" style={{ animationDelay: '2s' }} />
        <div className="absolute top-2/3 left-1/2 w-1 h-1 bg-pink-500/40 rounded-full animate-ping" style={{ animationDelay: '4s' }} />
      </div>
    </div>
  );
};

export default BackgroundAnimation;
