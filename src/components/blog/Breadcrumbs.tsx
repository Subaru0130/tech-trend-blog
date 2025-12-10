'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function Breadcrumbs({ title }: { title: string }) {
    return (
        <nav className="flex text-xs md:text-sm text-slate-500 mb-6 overflow-x-auto whitespace-nowrap pb-2">
            <Link href="/" className="hover:text-slate-900 transition-colors">ホーム</Link>
            <ChevronRight className="w-4 h-4 mx-2 text-slate-300 flex-shrink-0" />
            <span className="text-slate-900 font-bold truncate">{title}</span>
        </nav>
    );
}
