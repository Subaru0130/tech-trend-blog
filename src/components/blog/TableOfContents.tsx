'use client';

import { useEffect, useState } from 'react';

export function TableOfContents() {
    const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);
    const [activeId, setActiveId] = useState<string>('');

    useEffect(() => {
        // Select styling H2 and H3 elements within the article
        // Note: In MDX mapping, we need to ensure these have IDs.
        const elements = document.querySelectorAll('article h2, article h3');
        const idMap: { id: string; text: string; level: number }[] = [];

        elements.forEach((elem) => {
            if (!elem.id) {
                // Generate ID if missing (fallback)
                elem.id = elem.textContent?.trim().replace(/\s+/g, '-').toLowerCase() || '';
            }
            if (elem.id) {
                idMap.push({
                    id: elem.id,
                    text: elem.textContent || '',
                    level: parseInt(elem.tagName.substring(1))
                });
            }
        });

        setHeadings(idMap);

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: '-100px 0px -66% 0px' }
        );

        elements.forEach((elem) => observer.observe(elem));

        return () => observer.disconnect();
    }, []);

    if (headings.length === 0) return null;

    return (
        <nav className="hidden lg:block sticky top-24 p-6 bg-white border border-slate-100 rounded-xl max-h-[calc(100vh-120px)] overflow-y-auto">
            <h4 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wide">目次</h4>
            <ul className="space-y-3 text-sm">
                {headings.map((heading) => (
                    <li
                        key={heading.id}
                        className={`transition-colors ${heading.level === 3 ? 'pl-4' : ''}`}
                    >
                        <a
                            href={`#${heading.id}`}
                            className={`block hover:text-blue-600 leading-snug ${activeId === heading.id
                                ? 'text-blue-600 font-bold'
                                : 'text-slate-500'
                                }`}
                        >
                            {heading.text}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
