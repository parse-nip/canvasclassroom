import React, { useEffect, useState, useRef } from 'react';
import { FaArrowRight, FaArrowLeft, FaXmark, FaCheck, FaHandPointer, FaCircleCheck } from 'react-icons/fa6';
import { Button } from './ui/Button';

export interface SubStep {
  targetId: string;
  label: string;
  description: string;
}

export interface TutorialStep {
  targetId: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  requireClick?: boolean;
  features?: string[];
  substeps?: SubStep[];
}

interface TutorialOverlayProps {
  steps: TutorialStep[];
  isOpen: boolean;
  onClose: () => void;
  currentStepIndex: number;
  onNextStep: () => void;
  onTabClick?: (tabId: string) => void;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  steps,
  isOpen,
  onClose,
  currentStepIndex,
  onNextStep,
  onTabClick
}) => {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [waitingForClick, setWaitingForClick] = useState(false);
  const [currentSubstep, setCurrentSubstep] = useState(0);
  const [substepRect, setSubstepRect] = useState<DOMRect | null>(null);
  
  // New state for dynamic positioning
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [calculatedStyle, setCalculatedStyle] = useState<{
    tooltip: React.CSSProperties;
    arrow: React.CSSProperties;
    placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
  }>({
    tooltip: {},
    arrow: {},
    placement: 'bottom'
  });

  const step = steps[currentStepIndex];
  
  // Use refs to avoid stale closures in event handlers
  const waitingForClickRef = useRef(waitingForClick);
  waitingForClickRef.current = waitingForClick;
  
  const onTabClickRef = useRef(onTabClick);
  onTabClickRef.current = onTabClick;
  
  const onNextStepRef = useRef(onNextStep);
  onNextStepRef.current = onNextStep;
  
  const stepRef = useRef(step);
  stepRef.current = step;

  useEffect(() => {
    setCurrentSubstep(0);
    setSubstepRect(null);
  }, [currentStepIndex]);

  useEffect(() => {
    if (isOpen && step) {
      const element = document.getElementById(step.targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        const updateRect = () => {
          setTargetRect(element.getBoundingClientRect());
        };
        
        setTimeout(updateRect, 500);

        element.classList.add('z-[60]', 'relative');

        const handleClick = () => {
          const currentStep = stepRef.current;
          const isWaiting = waitingForClickRef.current;
          console.log('[TutorialOverlay] handleClick called, requireClick:', currentStep?.requireClick, 'waitingForClick:', isWaiting);
          
          if (currentStep?.requireClick && isWaiting) {
            console.log('[TutorialOverlay] Calling onTabClick with:', currentStep.targetId);
            if (onTabClickRef.current && currentStep.targetId) {
              onTabClickRef.current(currentStep.targetId);
            }
            setWaitingForClick(false);
            setCurrentSubstep(0);
            setTimeout(() => {
              if (!currentStep.substeps || currentStep.substeps.length === 0) {
                console.log('[TutorialOverlay] No substeps, calling onNextStep');
                onNextStepRef.current();
              } else {
                console.log('[TutorialOverlay] Has substeps, staying on this step');
              }
            }, 300);
          }
        };

        if (step.requireClick) {
          setWaitingForClick(true);
          element.style.cursor = 'pointer';
          element.addEventListener('click', handleClick);
        }
        
        window.addEventListener('resize', updateRect);
        window.addEventListener('scroll', updateRect);
        
        return () => {
          element.classList.remove('z-[60]', 'relative');
          element.style.cursor = '';
          element.removeEventListener('click', handleClick);
          window.removeEventListener('resize', updateRect);
          window.removeEventListener('scroll', updateRect);
          setWaitingForClick(false);
        }
      } else {
        setTargetRect(null);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, step, currentStepIndex]);

  useEffect(() => {
    if (!isOpen || !step?.substeps || waitingForClick) {
      setSubstepRect(null);
      return;
    }

    const substep = step.substeps[currentSubstep];
    if (!substep) {
      setSubstepRect(null);
      return;
    }

    const element = document.getElementById(substep.targetId);
    
    // Clean up old highlights
    document.querySelectorAll('.tutorial-substep-highlight').forEach(el => {
      el.classList.remove('tutorial-substep-highlight', 'z-[65]', 'relative');
    });

    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('tutorial-substep-highlight', 'z-[65]', 'relative');
      
      const updateSubstepRect = () => {
        setSubstepRect(element.getBoundingClientRect());
      };
      
      setTimeout(updateSubstepRect, 300);
      window.addEventListener('resize', updateSubstepRect);
      window.addEventListener('scroll', updateSubstepRect);

      return () => {
        element.classList.remove('tutorial-substep-highlight', 'z-[65]', 'relative');
        window.removeEventListener('resize', updateSubstepRect);
        window.removeEventListener('scroll', updateSubstepRect);
      };
    } else {
      setSubstepRect(null);
    }
  }, [isOpen, step, currentSubstep, waitingForClick]);

  // New Effect for positioning
  const isInSubstepMode = !waitingForClick && step?.substeps && step.substeps.length > 0;
  const highlightRect = isInSubstepMode && substepRect ? substepRect : targetRect;

  useEffect(() => {
    if (!highlightRect) {
       setCalculatedStyle({
        tooltip: {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          margin: 0 
        },
        arrow: { display: 'none' },
        placement: 'center'
      });
      return;
    }

    const updatePosition = () => {
      if (!tooltipRef.current || !highlightRect) return;
      
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const gap = 12;

      // Decide placement
      // Default to bottom, but check if it fits
      let placement = step?.position || 'bottom';
      
      // Auto-flip logic
      if (placement === 'bottom' && highlightRect.bottom + gap + tooltipRect.height > viewportHeight) {
        placement = 'top';
      } else if (placement === 'top' && highlightRect.top - gap - tooltipRect.height < 0) {
        placement = 'bottom';
      }
      // Add more logic for left/right if needed, but top/bottom are most common

      let top = 0;
      let left = 0;
      const arrowStyle: React.CSSProperties = { position: 'absolute', width: '16px', height: '16px', background: 'inherit', transform: 'rotate(45deg)', zIndex: -1 };

      switch (placement) {
        case 'bottom':
          top = highlightRect.bottom + gap;
          left = highlightRect.left + (highlightRect.width / 2) - (tooltipRect.width / 2);
          // Clamp left
          left = Math.max(20, Math.min(left, viewportWidth - tooltipRect.width - 20));
          
          arrowStyle.top = '-8px';
          // Calculate arrow left relative to tooltip
          arrowStyle.left = `${Math.max(10, Math.min(highlightRect.left + (highlightRect.width / 2) - left, tooltipRect.width - 26))}px`;
          arrowStyle.borderLeft = '1px solid rgba(0,0,0,0.1)';
          arrowStyle.borderTop = '1px solid rgba(0,0,0,0.1)';
          break;
        case 'top':
          top = highlightRect.top - gap - tooltipRect.height;
          left = highlightRect.left + (highlightRect.width / 2) - (tooltipRect.width / 2);
          // Clamp left
          left = Math.max(20, Math.min(left, viewportWidth - tooltipRect.width - 20));

          arrowStyle.bottom = '-8px';
          arrowStyle.left = `${Math.max(10, Math.min(highlightRect.left + (highlightRect.width / 2) - left, tooltipRect.width - 26))}px`;
          arrowStyle.borderRight = '1px solid rgba(0,0,0,0.1)';
          arrowStyle.borderBottom = '1px solid rgba(0,0,0,0.1)';
          break;
        case 'left':
          // ... implementation for left if needed
          break;
        case 'right':
          // ... implementation for right if needed
          break;
      }

      setCalculatedStyle({
        tooltip: { top, left },
        arrow: arrowStyle,
        placement
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);

  }, [highlightRect, step?.position]);

  const handleSubstepNext = () => {
    if (step?.substeps && currentSubstep < step.substeps.length - 1) {
      setCurrentSubstep(prev => prev + 1);
    } else {
      setCurrentSubstep(0);
      onNextStep();
    }
  };

  const handleSubstepPrev = () => {
    if (currentSubstep > 0) {
      setCurrentSubstep(prev => prev - 1);
    }
  };

  if (!isOpen || !step) return null;

  const activeSubstep = isInSubstepMode && step?.substeps ? step.substeps[currentSubstep] : null;

  const padding = 8;
  // highlightRect is already defined above

  // Enhanced spotlight style with cleaner border/glow
  const borderColor = isInSubstepMode ? '#fbbf24' : '#6366f1'; // amber-400 : indigo-500
  const glowColor = isInSubstepMode ? 'rgba(251, 191, 36, 0.5)' : 'rgba(99, 102, 241, 0.5)';

  const spotlightStyle: React.CSSProperties = highlightRect ? {
    position: 'absolute',
    top: highlightRect.top - padding,
    left: highlightRect.left - padding,
    width: highlightRect.width + padding * 2,
    height: highlightRect.height + padding * 2,
    borderRadius: '12px',
    boxShadow: `0 0 0 2px ${borderColor}, 0 0 20px ${glowColor}, 0 0 0 9999px rgba(15, 23, 42, 0.75)`,
    pointerEvents: 'none',
    transition: 'all 0.3s ease-in-out', // Smooth transition
    animation: 'pulse-ring 2s infinite',
  } : {};

  return (
    <div className="fixed inset-0 z-[50]" style={{ pointerEvents: 'none' }}>
      {highlightRect && <div style={spotlightStyle} className="animate-pulse" />}
      
      {!highlightRect && (
        <div 
          className="absolute inset-0 bg-slate-900/75" 
          style={{ pointerEvents: 'auto' }}
          onClick={step.requireClick ? undefined : onClose}
        />
      )}

      <div 
        ref={tooltipRef}
        className={`absolute w-80 bg-white dark:bg-slate-800 p-5 rounded-xl shadow-2xl border ${isInSubstepMode ? 'border-amber-400/50' : 'border-indigo-500/50'} animate-in fade-in zoom-in-95 duration-300 z-[70]`}
        style={{ 
          ...calculatedStyle.tooltip,
          pointerEvents: 'auto',
          transition: 'top 0.3s ease-out, left 0.3s ease-out'
        }}
      >
        {/* Arrow Element */}
        {highlightRect && (
          <div 
            className={`bg-white dark:bg-slate-800 ${isInSubstepMode ? 'border-amber-400/50' : 'border-indigo-500/50'}`} 
            style={calculatedStyle.arrow} 
          />
        )}

        <div className="flex justify-between items-start mb-3 relative z-10">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Step {currentStepIndex + 1} of {steps.length}
            </span>
            {isInSubstepMode && (
              <span className="text-[10px] font-medium text-amber-500 mt-0.5">
                Feature {currentSubstep + 1} of {step.substeps!.length}
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
            <FaXmark />
          </button>
        </div>
        
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{step.title}</h3>
        
        {isInSubstepMode && activeSubstep ? (
          <>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-semibold rounded">
                {activeSubstep.label}
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">{activeSubstep.description}</p>
          </>
        ) : (
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">{step.content}</p>
        )}

        {waitingForClick && step.substeps && step.substeps.length > 0 && (
          <div className="mb-3 p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Features you'll explore:</p>
            <ul className="space-y-1">
              {step.substeps.map((ss, idx) => (
                <li key={idx} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <FaCircleCheck className="text-indigo-400 flex-shrink-0" size={10} />
                  {ss.label}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="flex justify-between items-center gap-2">
          {waitingForClick ? (
            <div className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 font-medium animate-pulse">
              <FaHandPointer className="text-lg" />
              <span>Click the tab to explore</span>
            </div>
          ) : isInSubstepMode ? (
            <div className="flex gap-2 w-full">
              <Button 
                onClick={handleSubstepPrev} 
                disabled={currentSubstep === 0}
                variant="secondary"
                className="flex-1"
              >
                <FaArrowLeft className="mr-1" /> Back
              </Button>
              <Button 
                onClick={handleSubstepNext} 
                className="flex-1 shadow-lg shadow-amber-500/20 bg-amber-500 hover:bg-amber-600"
              >
                {currentSubstep === step.substeps!.length - 1 ? (
                  <>Next Tab <FaArrowRight className="ml-1" /></>
                ) : (
                  <>Next Feature <FaArrowRight className="ml-1" /></>
                )}
              </Button>
            </div>
          ) : (
            <Button onClick={onNextStep} className="shadow-lg shadow-indigo-500/30 w-full">
              {currentStepIndex === steps.length - 1 ? (
                <>Finish <FaCheck className="ml-2" /></>
              ) : (
                <>Next <FaArrowRight className="ml-2" /></>
              )}
            </Button>
          )}
        </div>
        
        {highlightRect && (
          <div className={`absolute w-4 h-4 bg-white dark:bg-slate-800 transform rotate-45 border-l border-t ${isInSubstepMode ? 'border-amber-400/50' : 'border-indigo-500/30'} -top-2 left-6`}></div>
        )}
      </div>
    </div>
  );
};

export default TutorialOverlay;