import { cn } from "@/lib/utils";
import Link from "next/link";

export const BentoGrid = ({
    className,
    children,
}: {
    className?: string;
    children?: React.ReactNode;
}) => {
    return (
        <div
            className={cn(
                "grid md:auto-rows-[20rem] grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto",
                className
            )}
        >
            {children}
        </div>
    );
};

export const BentoGridItem = ({
    className,
    title,
    description,
    header,
    icon,
    slug,
    date,
}: {
    className?: string;
    title?: string | React.ReactNode;
    description?: string | React.ReactNode;
    header?: React.ReactNode;
    icon?: React.ReactNode;
    slug?: string;
    date?: string;
}) => {
    return (
        <Link
            href={`/posts/${slug}`}
            className={cn(
                "friendly-card row-span-1 p-0 flex flex-col justify-between overflow-hidden group/bento",
                className
            )}
        >
            {/* Header / Image Area */}
            <div className="w-full h-48 bg-slate-50 relative overflow-hidden">
                {header}
            </div>

            {/* Content Area */}
            <div className="p-5 flex flex-col flex-1">
                <div className="group-hover/bento:translate-x-1 transition duration-200 flex-1">
                    {icon}
                    <h3 className="font-sans font-bold text-lg text-slate-800 mb-2 leading-tight">
                        {title}
                    </h3>
                    <p className="font-sans font-normal text-slate-600 text-sm line-clamp-2">
                        {description}
                    </p>
                </div>

                {date && (
                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                        <span>{date}</span>
                        <span className="text-blue-400 font-medium group-hover/bento:text-blue-500 transition-colors">
                            記事を読む &rarr;
                        </span>
                    </div>
                )}
            </div>
        </Link>
    );
};
