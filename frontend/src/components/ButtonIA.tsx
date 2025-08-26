import React, { useCallback, useRef } from 'react';
import { Diamond } from 'lucide-react';

interface ButtonIAProps {
  onToggleSidebar?: () => void;
}

function ButtonIA({ onToggleSidebar }: ButtonIAProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.classList.add('ripple-effect');

    button.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
    if (onToggleSidebar) {
      onToggleSidebar();
    }
  }, [onToggleSidebar]);

  const handleMouseEnter = useCallback(() => {
    if (buttonRef.current) {
      hoverTimeoutRef.current = setTimeout(() => {
        if (buttonRef.current) {
          buttonRef.current.classList.add('morphing', 'morphing-after');
        }
      }, 50);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    if (buttonRef.current) {
      buttonRef.current.classList.remove('morphing', 'morphing-after');
    }
  }, []);

  return (
    <div className="gemini-button-wrapper">
      <button 
        ref={buttonRef}
        className="gemini-button" 
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
            <Diamond className="gemini-icon" />
      </button>
      <style jsx>{`
        .gemini-button-wrapper {
          position: relative;
          display: inline-block;
        }

        .gemini-button {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          padding: 0;
          background: transparent;
          color: #4285f4;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          overflow: visible;
          -webkit-user-select: none;
          user-select: none;
          z-index: 2;
        }

        .gemini-button:hover {
          transform: translateY(-2px) scale(1.05);
          color: white;
        }

        .gemini-button.morphing {
          animation: 
              geminiGradient 4s ease-in-out infinite, 
              morphShape 8s ease-in-out infinite;
        }

        .gemini-button:active {
          transform: translateY(0) scale(1.02);
        }

        .gemini-icon {
          width: 16px;
          height: 16px;
          fill: currentColor;
        }

        /* Fundo animado que cresce/diminui APENAS no hover */
        .gemini-button::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          background: linear-gradient(135deg, 
              #4285f4, #9b72cb, #d96570, #9b72cb, #4285f4);
          background-size: 400% 400%;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          z-index: -1;
          transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          animation: geminiGradient 8s ease-in-out infinite;
          opacity: 0;
        }

        .gemini-button:hover::after {
          width: 32px;
          height: 32px;
          opacity: 1;
        }

        .gemini-button.morphing-after::after {
          animation: 
              geminiGradient 4s ease-in-out infinite, 
              morphShapeAfter 8s ease-in-out infinite;
        }

        /* Overlay brilhante sutil */
        .gemini-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, 
              rgba(255,255,255,0.2) 0%, 
              transparent 50%, 
              rgba(255,255,255,0.1) 100%);
          border-radius: inherit;
          opacity: 0;
          transition: opacity 0.4s ease;
          z-index: 1;
        }

        .gemini-button:hover::before {
          opacity: 1;
        }

        @keyframes geminiGradient {
          0% { background-position: 0% 50%; }
          25% { background-position: 100% 50%; }
          50% { background-position: 100% 100%; }
          75% { background-position: 0% 100%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes morphShape {
          0% { 
              border-radius: 50%; 
              transform: rotate(0deg); 
          }
          10% { 
              border-radius: 68% 32% 74% 26% / 55% 78% 22% 45%;
          }
          20% { 
              border-radius: 16px 50% 84% 12px / 32% 16px 84% 68%; 
          }
          30% { 
              border-radius: 12px 88% 12px 88% / 88% 12px 88% 12px;
          }
          40% { 
              border-radius: 76% 24% 68% 32% / 24% 76% 32% 68%;
          }
          50% { 
              border-radius: 24px 76% 24px 76% / 76% 24px 76% 24px;
          }
          60% { 
              border-radius: 84% 16% 92% 8% / 16% 84% 8% 92%;
          }
          70% { 
              border-radius: 8px 92% 8px 92% / 58% 42% 58% 42%;
          }
          80% { 
              border-radius: 72% 28% 84% 16% / 42% 58% 42% 58%;
          }
          90% { 
              border-radius: 44% 56% 32% 68% / 78% 22% 78% 22%;
          }
          100% { 
              border-radius: 50%; 
              transform: rotate(360deg); 
          }
        }

        @keyframes morphShapeAfter {
          0% { border-radius: 50%; }
          12.5% { border-radius: 42% 62% 52% 72%; }
          25% { border-radius: 14px; }
          37.5% { border-radius: 10px; }
          50% { border-radius: 52% 10px 52% 10px; }
          62.5% { border-radius: 18px 52% 18px 52%; }
          75% { border-radius: 22px; }
          87.5% { border-radius: 62% 42% 72% 32%; }
          100% { border-radius: 50%; }
        }

        .ripple-effect {
          position: absolute;
          border-radius: 50%;
          background-color: rgba(255,255,255,0.3);
          transform: scale(0);
          animation: ripple 0.6s linear;
          pointer-events: none;
          z-index: 1;
        }

        @keyframes ripple {
          to { 
              transform: scale(2); 
              opacity: 0; 
          }
        }
      `}</style>
    </div>
  );
}

export default ButtonIA;