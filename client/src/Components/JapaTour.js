import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ArrowRight, Check,  Heart } from 'lucide-react';
import styled, { keyframes } from 'styled-components';

const guideImage = '/images/rk2.png';

const JapaTour = ({ onComplete, elements }) => {
    const [step, setStep] = useState(0);
    const [style, setStyle] = useState({});
    const [messagePosition, setMessagePosition] = useState({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });
    const [isAnimating, setIsAnimating] = useState(false);
    const [showBlessing, setShowBlessing] = useState(false);
    const [isReady, setIsReady] = useState(false);

    const tourSteps = useMemo(() => [
        {
            targetRef: elements.page,
            title: '🙏 Welcome, Dear Devotee',
            content: "I am Krishna, and beside me stands Radha. We have come to guide you on this sacred journey of divine love and devotion.",
            position: 'center',
            speaker: 'Krishna',
            mood: 'welcoming',
        },
        {
            targetRef: elements.counterBtn,
            title: '✨ The Sacred Counter',
            content: "This blessed circle pulses with divine energy. Each time you chant 'Hare Krishna', tap here and feel our presence growing stronger.",
            position: 'right',
            speaker: 'Radha',
            mood: 'instructive',
        },
        {
            targetRef: elements.counterBtn,
            title: '🌺 Complete One Mala',
            content: 'Chant 108 times - one full mala - and watch as divine light fills your soul. We will count with you, step by step.',
             position: 'right',
            speaker: 'Krishna',
            mood: 'encouraging',
        },
        {
            targetRef: elements.saveBtn,
            title: '💫 Preserve Your Devotion',
            content: "When your heart feels complete, press 'Save' and your sacred offering will be recorded in the divine ledger.",
            position: 'top',
            speaker: 'Radha',
            mood: 'gentle',
        },
        {
            targetRef: elements.resetBtn,
            title: '🔄 Begin Anew',
            content: "Should you wish to start fresh, use 'Reset' without worry. There is no failure in devotion - only the beautiful journey of trying again.",
            position: 'topleft',
            speaker: 'Krishna',
            mood: 'compassionate',
        },
        {
            targetRef: elements.page,
            title: '🌟 Start Your Sacred Practice',
            content: 'Now begin chanting with love in your heart. Hare Krishna, Hare Krishna, Krishna Krishna, Hare Hare. We are always with you. 🙏✨',
            position: 'center',
            speaker: 'Both',
            mood: 'blessing',
        },
    ], [elements]);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);
 const updatePositions = useCallback(() => {
        const currentStep = tourSteps[step];
        if (!currentStep) return;

        const targetNode = currentStep.targetRef?.current;
        const viewportWidth = window.innerWidth;
        const isMobile = viewportWidth < 768; // We check the screen size here.
        
        // --- CHANGE 3: The logic for centered/no-target steps is slightly modified.
        // WHY: This ensures your original centered position is used on laptops, but a more standard center is used on mobile.
        if (!targetNode || currentStep.position === 'center') {
            setStyle({
                position: 'fixed', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)', width: 0, height: 0,
               boxShadow: '0 0 0 9999px rgba(15, 10, 5, 0.85), 0 0 60px 10px rgba(255, 170, 0, 0.4) inset',
    
    
                transition: isReady ? 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
            });
            
            // This 'if/else' block is new.
            if (!targetNode) { // When there is no element to point to.
                setMessagePosition({ top: '35%', left: '50%', transform: 'translate(-50%, -50%)' });
            } else { // When position is explicitly 'center'.
                 setMessagePosition({ 
                    top: isMobile ? '50%' : '25%', // Use 50% on mobile, but your original 25% on laptop.
                    left: isMobile ? '50%' : '39%', // Use 50% on mobile, but your original 39% on laptop.
                    transform: 'translate(-50%, -50%)' 
                });
            }
            setIsReady(true);
            return;
        }
        
        const rect = targetNode.getBoundingClientRect();
        // --- CHANGE 4: Your original padding value is restored for the highlight box.
        const padding = 20; 
        setStyle({
            position: 'absolute',
            top: `${rect.top - padding}px`,
            left: `${rect.left - padding}px`,
            width: `${rect.width + padding * 2}px`,
            height: `${rect.height + padding * 2}px`,
            boxShadow: '0 0 0 9999px rgba(15, 10, 5, 0.85), 0 0 60px 10px rgba(255, 170, 0, 0.4) inset',
            borderRadius: '2rem',
            transition: isReady ? 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
        });

        const margin = 20;
        
        // --- CHANGE 5: This is the main responsive logic.
        // We check if the screen is mobile. If it is, we run a simple logic. If not, we run YOUR original complex logic.
        if (isMobile) {
            // --- THIS CODE RUNS ONLY ON MOBILE ---
            // It simply places the message box above or below the element.
            if (window.innerHeight - rect.bottom > 250) {
                 setMessagePosition({ top: `${rect.bottom + margin}px`, left: '50%', transform: 'translateX(-50%)' });
           
                }else if (currentStep.position === 'topleft') {
                 setMessagePosition({ top: `${rect.center + margin}px`, right: '50%', transform: 'translateX(-50%)' });
           
            }else{
               setMessagePosition({ top: `${rect.center + margin}px`, left: '50%', transform: 'translateX(-50%)' });
            
            }
        } else {
            // --- THIS ENTIRE BLOCK IS YOUR 100% UNCHANGED LAPTOP CODE ---
            // It runs only on screens wider than 768px. Nothing inside this 'else' block was changed.
            const viewportHeight = window.innerHeight;
            const modalHeight = 400;
            
            if (currentStep.position === 'top') {
                const topPos = Math.max(100, rect.top - margin);
                const clampedTop = Math.min(topPos, viewportHeight * 0.4);
                setMessagePosition({
                    top: `${clampedTop}px`,
                    left: '50%',
                    transform: 'translate(-50%, -100%)',
                });
            } else if (currentStep.position === 'topleft') {
                const topPos = Math.max(100, rect.top - margin);
                const clampedTop = Math.min(topPos, viewportHeight * 0.4);
                setMessagePosition({
                    top: `${clampedTop}px`,
                    right: '50%',
                    transform: 'translate(-50%, -100%)',
                });
            } else if (currentStep.position === 'right') {
                setMessagePosition({
                    top: `${rect.top + rect.height / 2}px`,
                    left: `${rect.right + margin}px`,
                    transform: 'translateY(-50%)',
                });
            } else { // Default to bottom
                const idealTop = rect.bottom + margin;
                const maxAllowedTop = viewportHeight - modalHeight - 40;
                const clampedTop = Math.min(idealTop, Math.min(viewportHeight * 0.45, maxAllowedTop));
                setMessagePosition({
                    top: `${clampedTop}px`,
                    left: '50%',
                    transform: 'translateX(-50%)',
                });
            }
        }
        setIsReady(true);
    }, [step, tourSteps, isReady]);

    // --- CHANGE 6: The useEffect hooks are updated to use the new 'updatePositions' function correctly.
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        window.addEventListener('resize', updatePositions); // This now works without error.
        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('resize', updatePositions);
        };
    }, [updatePositions]); // The hook depends on the function.

    useEffect(() => {
        updatePositions(); // This calls the function when the step changes.
    }, [updatePositions]);

    const handleNext = () => {
        setIsAnimating(true);
        setIsReady(false);
        if (step === tourSteps.length - 1) {
            setShowBlessing(true);
            setTimeout(() => {
                onComplete();
            }, 2000);
        } else {
            setTimeout(() => {
                setStep(prev => prev + 1);
                setIsAnimating(false);
            }, 400);
        }
    };

    const currentStep = tourSteps[step];
    if (!currentStep) return null;
    const isLastStep = step === tourSteps.length - 1;

    return (
        <Wrapper>
            <div className="cosmic-particles">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="particle"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${3 + Math.random() * 4}s`,
                        }}
                    />
                ))}
            </div>
            <div className="divine-rays">
                {[...Array(8)].map((_, i) => (
                    <div
                        key={i}
                        className="ray"
                        style={{
                            transform: `rotate(${i * 45}deg)`,
                            animationDelay: `${i * 0.2}s`,
                        }}
                    />
                ))}
            </div>
            <div style={style} className="tour-highlight">
                <div className="highlight-glow" />
                <div className="highlight-particles">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="highlight-particle" />
                    ))}
                </div>
            </div>
            <MessageBox
                style={messagePosition}
                className={`${isAnimating ? 'animating' : ''} ${isReady ? 'ready' : ''}`}
                $mood={currentStep.mood}
            >
                <div className="message-glow" />
                <div className="message-content">
                    <div className="guide-avatar-section">
                        <div className="avatar-glow-ring" />
                        <div className="avatar-container">
                            <img src={guideImage} alt="Radha Krishna" className="guide-image" />
                            <div className="avatar-shimmer" />
                        </div>
                    </div>
                    <div className="text-content">
                        <div className="speaker-badge">
                            <Heart size={20} className="heart-icon" />
                            <span className=" top-2">{currentStep.speaker}</span>
                            <Heart size={20} className="heart-icon" />
                        </div>
                        <h3 className="message-title">{currentStep.title}</h3>
                        <p className="message-text">{currentStep.content}</p>
                        <div className="message-footer">
                            <div className="progress-indicator">
                                <div className="progress-dots">
                                    {tourSteps.map((_, i) => (
                                        <div
                                            key={i}
                                            className={`dot ${i === step ? 'active' : ''} ${i < step ? 'completed' : ''}`}
                                        />
                                    ))}
                                </div>
                                <span className="step-text">
                                    {step + 1}/{tourSteps.length}
                                </span>
                            </div>
                            <button onClick={handleNext} className="next-button" disabled={isAnimating}>
                                <span className="button-glow" />
                                <span className="button-text top-2">
                                    {isLastStep ? 'Begin' : 'Next'}
                                </span>
                                {isLastStep ? (
                                    <Check size={16} className="button-icon" />
                                ) : (
                                    <ArrowRight size={16} className="button-icon" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
                <div className="floating-petals">
                    {[...Array(3)].map((_, i) => (
                        <div
                            key={i}
                            className="petal"
                            style={{
                                left: `${25 + i * 25}%`,
                                animationDelay: `${i * 1.2}s`,
                            }}
                        />
                    ))}
                </div>
            </MessageBox>
            {showBlessing && (
                <BlessingOverlay>
                    <div className="blessing-content">
                        <div className="blessing-glow" />
                        <div className="blessing-text">
                            <h2>🙏 Blessed Be Your Journey 🙏</h2>
                            <p>May divine love guide your every chant</p>
                        </div>
                    </div>
                </BlessingOverlay>
            )}
        </Wrapper>
    );
};

const float = keyframes`
  0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.4; }
  50% { transform: translateY(-20px) rotate(180deg); opacity: 0.8; }
`;
const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;
const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
`;
const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;
const glow = keyframes`
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
`;
const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
`;
const petalFall = keyframes`
  0% { transform: translateY(-20px) rotate(0deg); opacity: 0; }
  50% { opacity: 0.7; }
  100% { transform: translateY(300px) rotate(360deg); opacity: 0; }
`;
const rayPulse = keyframes`
  0%, 100% { opacity: 0.1; }
  50% { opacity: 0.3; }
`;

const Wrapper = styled.div`
  position: fixed;
  inset: 0;
  z-index: 100;
  pointer-events: none;
  .cosmic-particles { position: absolute; inset: 0; overflow: hidden; }
  .particle { position: absolute; width: 3px; height: 3px; background: radial-gradient(circle, #fbbf24, transparent); border-radius: 50%; animation: ${float} linear infinite; }
  .divine-rays { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 100%; height: 100%; }
  .ray { position: absolute; top: 50%; left: 50%; width: 2px; height: 50%; background: linear-gradient(to bottom, rgba(255, 200, 0, 0.3), transparent); transform-origin: top center; animation: ${rayPulse} 3s ease-in-out infinite; }
  .tour-highlight { pointer-events: none; z-index: 101; }
  .highlight-glow { position: absolute; inset: -10px; border-radius: inherit; background: linear-gradient(45deg, #ff6b35, #f7931e, #fbbf24, #ff6b35); background-size: 300% 300%; filter: blur(20px); opacity: 0.4; animation: ${glow} 2s ease-in-out infinite; }
  .highlight-particles { position: absolute; inset: 0; }
  .highlight-particle {
    position: absolute; width: 5px; height: 5px; background: #fbbf24; border-radius: 50%; box-shadow: 0 0 8px #fbbf24;
    &:nth-child(1) { top: 10%; left: 10%; animation: ${float} 2s ease-in-out infinite; }
    &:nth-child(2) { top: 20%; right: 15%; animation: ${float} 2.5s ease-in-out infinite; }
    &:nth-child(3) { bottom: 15%; left: 20%; animation: ${float} 3s ease-in-out infinite; }
    &:nth-child(4) { bottom: 20%; right: 10%; animation: ${float} 2.2s ease-in-out infinite; }
    &:nth-child(5) { top: 50%; left: 5%; animation: ${float} 2.8s ease-in-out infinite; }
    &:nth-child(6) { top: 50%; right: 5%; animation: ${float} 2.6s ease-in-out infinite; }
  }
`;

const MessageBox = styled.div`
  position: fixed;
  pointer-events: auto;
  z-index: 102;
  max-width: min(320px, 90vw);
  opacity: 0;

  &.ready {
    animation: ${fadeIn} 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    transition: top 0.6s cubic-bezier(0.4, 0, 0.2, 1), left 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &.animating { animation: ${pulse} 0.4s ease-in-out; }
  .message-glow { position: absolute; inset: -20px; background: radial-gradient(circle, rgba(255, 170, 0, 0.3) 0%, rgba(255, 107, 53, 0.2) 30%, transparent 70%); filter: blur(30px); animation: ${glow} 3s ease-in-out infinite; }
  .message-content {
    position: relative; background: linear-gradient(135deg, rgba(255, 248, 240, 0.98) 0%, rgba(255, 243, 224, 0.98) 50%, rgba(255, 237, 213, 0.98) 100%);
    border-radius: 1rem; padding: 0.875rem;
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 200, 100, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.8);
    border: 2px solid; border-image: linear-gradient(135deg, #ff6b35, #fbbf24, #ff6b35) 1;
    display: flex; gap: 0.75rem; align-items: flex-start;
  }
  .guide-avatar-section { position: relative; flex-shrink: 0; }
  .avatar-glow-ring { position: absolute; inset: -6px; border-radius: 50%; background: conic-gradient(from 0deg, #ff6b35, #f7931e, #fbbf24, #ff6b35); animation: ${rotate} 6s linear infinite; filter: blur(10px); opacity: 0.5; }
  .avatar-container {
    position: relative; width: 50px; height: 50px; border-radius: 50%; overflow: hidden; border: 2px solid #fff;
    box-shadow: 0 6px 20px rgba(255, 107, 53, 0.4), 0 0 0 3px rgba(255, 200, 100, 0.2), inset 0 0 10px rgba(255, 255, 255, 0.5);
  }
  .guide-image { width: 100%; height: 100%; object-fit: cover; animation: ${pulse} 4s ease-in-out infinite; }
  .avatar-shimmer { position: absolute; inset: 0; background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent); animation: ${shimmer} 3s ease-in-out infinite; }
  .text-content { flex: 1; display: flex; flex-direction: column; gap: 0.4rem; min-width: 0; }
  .speaker-badge {
    display: inline-flex; align-items: center; gap: 0.25rem; padding: 0.25rem ;
    background: linear-gradient(135deg, #ff6b35, #f7931e); border-radius: 2rem;
    color: white; font-weight: 700; font-size: 0.625rem;
    box-shadow: 0 2px 8px rgba(255, 107, 53, 0.4); align-self: flex-start;
    animation: ${pulse} 2s ease-in-out infinite;
    .heart-icon { animation: ${pulse} 1s ease-in-out infinite; }
  }
  .message-title { font-size: 0.9375rem; font-weight: 800; color: #b45309; line-height: 1.2; text-shadow: 0 1px 2px rgba(180, 83, 9, 0.2); margin: 0; }
  .message-text { font-size: 0.75rem; line-height: 1.45; color: #78350f; font-weight: 500; text-align: left; margin: 0; }
  .message-footer { display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.25rem; }
  .progress-indicator { display: flex; flex-direction: column; gap: 0.25rem; }
  .progress-dots { display: flex; gap: 0.25rem; }
  .dot {
    width: 5px; height: 5px; border-radius: 50%; background: rgba(180, 83, 9, 0.2); transition: all 0.3s ease;
    &.completed { background: linear-gradient(135deg, #10b981, #059669); box-shadow: 0 0 6px rgba(16, 185, 129, 0.5); }
    &.active { background: linear-gradient(135deg, #ff6b35, #f7931e); box-shadow: 0 0 8px rgba(255, 107, 53, 0.6); transform: scale(1.2); }
  }
  .step-text { font-size: 0.625rem; font-weight: 600; color: #92400e; }
  .next-button {
    position: relative; display: flex; align-items: center; gap: 0.375rem; padding: 7.5px;
    background: linear-gradient(135deg, #ff6b35, #f7931e, #fbbf24); background-size: 200% 200%;
    border: none; border-radius: 0.625rem; color: white; font-weight: 700; font-size: 0.75rem;
    cursor: pointer; overflow: hidden;
    box-shadow: 0 6px 15px rgba(255, 107, 53, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.5);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    &:hover:not(:disabled) { transform: translateY(-2px) scale(1.03); box-shadow: 0 8px 20px rgba(255, 107, 53, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.5); }
    &:active:not(:disabled) { transform: translateY(-1px) scale(1.01); }
    &:disabled { opacity: 0.7; cursor: not-allowed; }
    .button-glow { position: absolute; inset: 0; background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent); animation: ${shimmer} 2s ease-in-out infinite; }
    .button-text, .button-icon { position: relative; z-index: 1; }
  }
  .floating-petals { position: absolute; inset: 0; pointer-events: none; overflow: hidden; border-radius: 1rem; }
  .petal { position: absolute; width: 6px; height: 6px; background: radial-gradient(circle, #fbbf24, #ff6b35); border-radius: 50% 0 50% 0; animation: ${petalFall} 6s linear infinite; }
`;

const BlessingOverlay = styled.div`
  position: fixed; inset: 0; z-index: 103;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(10px);
  animation: ${fadeIn} 0.5s ease; pointer-events: none;
  .blessing-content { position: relative; text-align: center; padding: 1rem; }
  .blessing-glow { position: absolute; inset: -80px; background: radial-gradient(circle, rgba(255, 200, 0, 0.4), transparent 60%); filter: blur(50px); animation: ${glow} 2s ease-in-out infinite; }
  .blessing-text {
    position: relative;
    h2 {
      font-size: 1.75rem; font-weight: 900; background: linear-gradient(135deg, #fbbf24, #ff6b35, #fbbf24);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
      margin-bottom: 0.75rem; animation: ${pulse} 2s ease-in-out infinite;
      @media (max-width: 640px) { font-size: 1.5rem; }
    }
    p { font-size: 1rem; color: white; font-weight: 600; @media (max-width: 640px) { font-size: 0.9375rem; } }
  }
    `;



export default JapaTour;
