// Reusable animation styles for all pages
export const animationStyles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-8px);
    }
  }
  @keyframes pulse-glow {
    0%, 100% {
      box-shadow: 0 0 15px rgba(249, 115, 22, 0.2);
    }
    50% {
      box-shadow: 0 0 30px rgba(249, 115, 22, 0.4);
    }
  }
  @keyframes shimmer {
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  }
  .animate-fadeInUp {
    animation: fadeInUp 0.6s ease-out forwards;
  }
  .animate-slideInLeft {
    animation: slideInLeft 0.6s ease-out forwards;
  }
  .animate-slideInRight {
    animation: slideInRight 0.6s ease-out forwards;
  }
  .animate-scaleIn {
    animation: scaleIn 0.5s ease-out forwards;
  }
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
  .animate-pulse-glow {
    animation: pulse-glow 2s ease-in-out infinite;
  }
  .animate-shimmer {
    animation: shimmer 2s infinite;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    background-size: 1000px 100%;
  }
  .hover-lift {
    transition: all 0.3s ease;
  }
  .hover-lift:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  }
  .transition-smooth {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
`;

// Hook to use animations in components
export const usePageAnimations = () => {
  return {
    fadeInUp: 'animate-fadeInUp',
    slideInLeft: 'animate-slideInLeft',
    slideInRight: 'animate-slideInRight',
    scaleIn: 'animate-scaleIn',
    float: 'animate-float',
    pulseGlow: 'animate-pulse-glow',
    shimmer: 'animate-shimmer',
    hoverLift: 'hover-lift',
    transitionSmooth: 'transition-smooth',
  };
};

// Helper to get staggered animation delay
export const getAnimationDelay = (index, delayMs = 100) => {
  return `${(index * delayMs) / 1000}s`;
};
