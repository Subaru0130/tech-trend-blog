import Link from "next/link";
import { cn } from "@/lib/utils";

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
                "grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto ",
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
    slug,
    date,
}: {
    className?: string;
    title?: string | React.ReactNode;
    description?: string | React.ReactNode;
    header?: React.ReactNode;
    slug: string;
    date?: string;
}) => {
    return (
        <Link
            href={`/posts/${slug}`}
            className={cn(
                "row-span-1 rounded-xl group/bento hover:shadow-xl transition duration-200 shadow-input dark:shadow-none p-4 bg-white border border-slate-200 justify-between flex flex-col space-y-4",
                className
            )}
        >
            {header}
            <div className="group-hover/bento:translate-x-2 transition duration-200">
                <div className="font-bold text-slate-600 mb-2 mt-2">
                    {title}
                </div>
                <div className="font-normal text-slate-600 text-xs line-clamp-2 mb-4">
                    {description}
                </div>
                {date && (
                    <div className="flex items-center text-slate-400 text-xs">
                        <span className="bg-slate-100 px-2 py-1 rounded-md">{date}</span>
                    </div>
                )}
            </div>
        </Link>
    );
};
