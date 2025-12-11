'use client';

import React, { useEffect, useState } from 'react';
import { BookOpen, Trophy, Scale } from 'lucide-react';

export function ArticleStickyNav() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Show nav after scrolling past the header (approx 300px)
            setIsVisible(window.scrollY > 300);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const offset = 80; // height of sticky nav + header
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = element.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    if (!isVisible) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-transform duration-300 transform translate-y-0">
            <div className="max-w-md mx-auto grid grid-cols-3 text-xs font-bold text-slate-600">
                <button
                    onClick={() => scrollToSection('guide-section')}
                    className="flex flex-col items-center justify-center py-3 border-b-2 border-transparent hover:text-blue-600 hover:border-blue-600 active:text-blue-700"
                >
                    <BookOpen className="w-5 h-5 mb-1" />
                    選び方
                </button>
                <button
                    onClick={() => scrollToSection('ranking-section')}
                    className="flex flex-col items-center justify-center py-3 border-b-2 border-transparent hover:text-amber-500 hover:border-amber-500 active:text-amber-600"
                >
                    <Trophy className="w-5 h-5 mb-1 text-amber-500" />
                    ランキング
                </button>
                <button
                    onClick={() => scrollToSection('comparison-section')}
                    className="flex flex-col items-center justify-center py-3 border-b-2 border-transparent hover:text-emerald-600 hover:border-emerald-600 active:text-emerald-700"
                >
                    <Scale className="w-5 h-5 mb-1 text-emerald-500" />
                    徹底比較
                </button>
            </div>
        </div>
    );
}
