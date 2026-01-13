"use client";

import React, { useState } from 'react';

type Heading = {
    level: number;
    text: string;
    id: string;
};

export default function TableOfContents({ headings }: { headings: Heading[] }) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (headings.length === 0) return null;

    const INITIAL_COUNT = 5;
    const visibleHeadings = isExpanded ? headings : headings.slice(0, INITIAL_COUNT);
    const hiddenCount = headings.length - INITIAL_COUNT;

    return (
        <div className="bg-surface-subtle p-6 rounded-2xl mb-8 border border-border-color">
            <div className="flex items-center justify-between gap-2 mb-4">
                <h2 className="text-lg font-bold text-primary flex items-center gap-2">
                    <span className="material-symbols-outlined text-accent">list</span>
                    目次
                </h2>
            </div>
            <ul className="space-y-2">
                {visibleHeadings.map((h, i) => {
                    // Detect rank from text (第1位, 第2位, 第3位)
                    const rankMatch = h.text.match(/第(\d+)位/);
                    const rank = rankMatch ? parseInt(rankMatch[1]) : null;

                    // Determine styling based on rank
                    let badgeStyle = '';
                    let icon = null;

                    if (rank === 1) {
                        badgeStyle = 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white font-bold rounded-full px-2 py-0.5 text-xs mr-2';
                        icon = '🥇';
                    } else if (rank === 2) {
                        badgeStyle = 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700 font-bold rounded-full px-2 py-0.5 text-xs mr-2';
                        icon = '🥈';
                    } else if (rank === 3) {
                        badgeStyle = 'bg-gradient-to-r from-orange-300 to-orange-400 text-white font-bold rounded-full px-2 py-0.5 text-xs mr-2';
                        icon = '🥉';
                    }

                    return (
                        <li key={i} className={`${h.level > 2 ? 'ml-4' : ''}`}>
                            <a
                                href={`#${h.id}`}
                                className={`text-sm hover:text-accent underline-offset-4 hover:underline transition-colors block py-1 flex items-center ${rank && rank <= 3 ? 'text-primary font-semibold' : 'text-text-main'}`}
                            >
                                {icon && <span className="mr-1">{icon}</span>}
                                {rank && rank <= 3 && <span className={badgeStyle}>{rank}位</span>}
                                {rank && rank <= 3 ? h.text.replace(/第\d+位\s*/, '') : h.text}
                            </a>
                        </li>
                    );
                })}
            </ul>

            {!isExpanded && hiddenCount > 0 && (
                <div className="mt-4 pt-4 border-t border-border-color/50">
                    <button
                        onClick={() => setIsExpanded(true)}
                        className="w-full bg-white hover:bg-white/80 text-primary font-bold py-3 rounded-xl border border-border-color transition-all hover:shadow-sm flex items-center justify-center gap-2 group text-sm"
                    >
                        <span>目次をすべて見る（残り{hiddenCount}項目）</span>
                        <span className="material-symbols-outlined group-hover:translate-y-0.5 transition-transform text-lg">expand_more</span>
                    </button>
                </div>
            )}
        </div>
    );
}
