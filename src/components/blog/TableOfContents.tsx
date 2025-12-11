'use client';

import { useEffect, useState } from 'react';

export function TableOfContents() {
    const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);
    const [activeId, setActiveId] = useState<string>('');
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Select styling H2 and H3 elements within the article body ONLY
        const elements = document.querySelectorAll('#article-body h2, #article-body h3');
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
        <>
            {/* Mobile Collapsible ToC */}
            <div className="lg:hidden mb-8 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center justify-between p-4 bg-slate-50 font-bold text-slate-800"
                >
                    <span className="flex items-center gap-2">
                        <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full">目次</span>
                        記事の内容
                    </span>
                    <svg
                        className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <ul className="p-4 space-y-3 text-sm bg-white border-t border-slate-100">
                        {headings.map((heading) => (
                            <li key={heading.id} className={`${heading.level === 3 ? 'pl-4' : ''}`}>
                                <a
                                    href={`#${heading.id}`}
                                    onClick={() => setIsOpen(false)}
                                    className="block text-slate-700 hover:text-blue-600 py-1 border-b border-slate-50 last:border-0"
                                >
                                    {heading.text}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Desktop Sticky ToC */}
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
        </>
    );
}
