import { useState, useRef, useEffect, useCallback } from 'react';
import { RotateCcw, Save, ArrowLeft } from 'lucide-react';
import { useAuth } from '../Context/AuthContext';
import { toast } from 'react-toastify';
import JapaTour from '../Components/Layouts/JapaTour';
import { useNavigate } from 'react-router-dom';
import api from "../utils/api";
import '../Styles/JapaPage.css';

// OPTIMIZATION: Memoize the Modal to prevent re-renders when parent state changes
import React from 'react';

const ConfirmModal = React.memo(({ isOpen, onClose, onConfirm, count }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-sm w-full">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Reset Count?</h2>
                <p className="text-gray-600 mb-6">
                    Are you sure you want to reset the current count of{' '}
                    <span className="font-bold text-orange-600">{count}</span>?
                </p>
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2 rounded-lg font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className="px-5 py-2 rounded-lg font-semibold text-white bg-rose-500 hover:bg-rose-600 transition-colors">
                        Confirm Reset
                    </button>
                </div>
            </div>
        </div>
    );
});

function JapaPage() {
    const [count, setCount] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [isTourOpen, setIsTourOpen] = useState(false);

    const pageRef = useRef(null);
    const counterBtnRef = useRef(null);
    const saveBtnRef = useRef(null);
    const resetBtnRef = useRef(null);

    const { user } = useAuth();
    const navigate = useNavigate();

    // OPTIMIZATION: Check tour status only once on mount
    useEffect(() => {
        const hasSeenTour = localStorage.getItem('hasSeenJapaTour');
        if (!hasSeenTour) {
            setIsTourOpen(true);
        }
    }, []);

    const handleTourComplete = useCallback(() => {
        localStorage.setItem('hasSeenJapaTour', 'true');
        setIsTourOpen(false);
    }, []);

    // OPTIMIZATION: Memoize tour elements object to prevent unnecessary prop updates
    // However, refs are stable, so standard object creation is generally fine here.
    // We'll keep it simple to avoid over-engineering.
    const tourElements = {
        page: pageRef,
        counterBtn: counterBtnRef,
        saveBtn: saveBtnRef,
        resetBtn: resetBtnRef,
    };

    const handleClick = () => {
        setCount(prev => prev + 1);
    };

    const handleReset = () => {
        if (count > 0) {
            setIsResetModalOpen(true);
        }
    };

    const confirmReset = useCallback(() => {
        setCount(0);
        setIsResetModalOpen(false);
    }, []);

    const handleSave = async () => {
        if (!user) {
            toast.info("Please log in to save your Japa count");
            navigate("/login");
            return;
        }

        if (count <= 0) {
            toast.warn("Count must be greater than zero to save.");
            return;
        }

        setIsSaving(true);
        try {
            const res = await api.put(
                'japaCount/update-japa',
                { count: count }
                // api.js handles credentials automatically
            );

            if (res.data && res.data.ok) {
                toast.success(`Saved! Your new total is ${res.data.japaCount}.`);
                setCount(0);
            } else {
                toast.error(res.data?.message || "Failed to save count. Please try again.");
            }
        } catch (err) {
            console.error('handleSave error', err);
            toast.error(err?.response?.data?.message || "A network error occurred.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <ConfirmModal
                isOpen={isResetModalOpen}
                onClose={() => setIsResetModalOpen(false)}
                onConfirm={confirmReset}
                count={count}
            />
            {isTourOpen && <JapaTour onComplete={handleTourComplete} elements={tourElements} />}

            <div ref={pageRef} className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center">
                <button
                    onClick={() => window.history.back()}
                    className="absolute top-4 left-4 z-30 h-12 w-12 rounded-full bg-white/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 border-2 border-orange-200/50 flex items-center justify-center group"
                    aria-label="Go back"
                >
                    <ArrowLeft className="w-6 h-6 text-amber-700 group-hover:-translate-x-1 transition-transform duration-300" />
                </button>

                {/* Background animations */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {Array.from({ length: 40 }, (_, i) => (
                        <div
                            key={i}
                            className="absolute light-orb"
                            style={{
                                left: `${10 + (i * 67) % 80}%`,
                                top: `${5 + (i * 83) % 90}%`,
                                '--delay': `${i * 0.25}s`,
                                '--duration': `${5 + (i % 4) * 2}s`,
                                '--size': `${6 + (i % 4) * 3}px`,
                            }}
                        />
                    ))}
                </div>
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {Array.from({ length: 12 }, (_, i) => (
                        <div
                            key={i}
                            className="absolute om-float text-6xl opacity-10 text-orange-500"
                            style={{
                                left: `${(i * 23) % 100}%`,
                                top: `${(i * 37) % 100}%`,
                                animationDelay: `${i * 0.8}s`,
                                animationDuration: `${8 + (i % 4) * 2}s`
                            }}
                        >
                            ॐ
                        </div>
                    ))}
                </div>

                <div className="relative z-10 flex flex-col items-center justify-center gap-8 p-8 pb-24 md:pb-8">
                    {/* Central Counter Button */}
                    <div className="relative mt-32 mb-8">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                            {Array.from({ length: 8 }, (_, i) => (
                                <div
                                    key={i}
                                    className="absolute ripple-ring"
                                    style={{ animationDelay: `${i * 1.2}s` }}
                                />
                            ))}
                        </div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                            {Array.from({ length: 72 }, (_, i) => (
                                <div
                                    key={i}
                                    className="absolute particle-burst"
                                    style={{
                                        '--angle': `${(i * 360) / 72}deg`,
                                        '--delay': `${(i % 12) * 0.12}s`,
                                        '--distance': `${250 + (i % 6) * 60}px`,
                                    }}
                                />
                            ))}
                        </div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                            {Array.from({ length: 3 }, (_, i) => (
                                <div
                                    key={i}
                                    className="absolute energy-spiral"
                                    style={{
                                        '--rotation-delay': `${i * 2}s`,
                                        '--spiral-index': i,
                                    }}
                                />
                            ))}
                        </div>
                        <div className="absolute  -top-36 -left-36 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                            <svg width="500" height="500" viewBox="0 0 500 500" className="mandala-rotate">
                                {Array.from({ length: 12 }, (_, i) => {
                                    const angle = (i * 30);
                                    return (
                                        <g key={i}>
                                            <circle
                                                cx="250" cy="100" r="15" fill="none"
                                                stroke="rgba(251, 146, 60, 0.3)" strokeWidth="2"
                                                transform={`rotate(${angle} 250 250)`} className="mandala-circle"
                                                style={{ animationDelay: `${i * 0.1}s` }}
                                            />
                                            <line
                                                x1="250" y1="250" x2="250" y2="120"
                                                stroke="rgba(251, 146, 60, 0.2)" strokeWidth="1"
                                                transform={`rotate(${angle} 250 250)`} className="mandala-line"
                                                style={{ animationDelay: `${i * 0.1}s` }}
                                            />
                                        </g>
                                    );
                                })}
                            </svg>
                        </div>
                        <button
                            ref={counterBtnRef}
                            onClick={handleClick}
                            className="relative w-56 h-56 rounded-full bg-gradient-to-br from-orange-500 via-rose-500 to-amber-500 shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 hover:scale-105 active:scale-95 group overflow-hidden glow-pulse-btn"
                        >
                            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/20 to-transparent shimmer"></div>
                            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-orange-400 via-rose-400 to-amber-400 flex items-center justify-center shadow-inner">
                                <div className="text-center">
                                    <div className="text-7xl font-bold text-white drop-shadow-lg group-hover:scale-110 transition-transform">
                                        {count}
                                    </div>
                                    <div className="text-white/90 text-sm font-medium mt-1 tracking-wider">
                                        JAPA
                                    </div>
                                </div>
                            </div>
                            <div className="absolute inset-0 rounded-full bg-orange-400/30 animate-ping-slow"></div>
                        </button>
                    </div>

                    {/* Control Buttons */}
                    <div className="fixed lg:bottom-0 bottom-2 left-0 z-20 w-full flex justify-evenly items-center p-12   md:relative md:z-auto md:w-auto md:border-none md:bg-transparent md:backdrop-blur-none md:mt-28 md:p-0 md:gap-6">
                        <button
                            ref={resetBtnRef}
                            onClick={handleReset}
                            className="group relative px-8  bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 border-2 border-orange-200/50 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative flex items-center gap-3">
                                <RotateCcw className="w-5 h-5 text-orange-600 group-hover:rotate-180 transition-transform duration-500" />
                                <span className="font-semibold text-orange-900 mt-4">Reset</span>
                            </div>
                        </button>

                        <button
                            ref={saveBtnRef}
                            onClick={handleSave}
                            disabled={isSaving}
                            className="group relative px-8  bg-gradient-to-r from-orange-500 to-rose-500 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity shimmer"></div>
                            <div className="relative flex items-center gap-3">
                                <Save className="w-5 h-5 text-white" />
                                <span className="font-semibold text-white mt-4">{isSaving ? 'Saving...' : 'Save'}</span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Floating particles */}
                <div className="absolute inset-0 pointer-events-none">
                    {Array.from({ length: 20 }, (_, i) => (
                        <div
                            key={i}
                            className="absolute w-2 h-2 bg-orange-400/20 rounded-full particle-float"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 5}s`,
                                animationDuration: `${10 + Math.random() * 10}s`
                            }}
                        ></div>
                    ))}
                </div>
            </div>
        </>
    );
}

export default JapaPage;