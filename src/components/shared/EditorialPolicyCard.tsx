import Link from 'next/link';

type EditorialPolicyCardProps = {
    variant: 'ranking' | 'review';
    updatedAt?: string;
    authorName?: string;
    className?: string;
};

const COPY = {
    ranking: {
        title: '記事情報と比較方針',
        how: '価格.comで比較できるスペックを軸に、価格帯、レビュー傾向、利用シーンを照らし合わせて候補を絞っています。AIは下書き整理の補助に使いますが、公開前に比較軸、重複、メタデータ、品質チェックを行っています。',
    },
    review: {
        title: '記事情報とレビュー方針',
        how: '価格.comなどで確認できるスペック、販売ページの情報、レビュー傾向をもとに、比較で見るべき点を整理しています。AIは下書き整理の補助に使いますが、公開前にメリット・デメリット、重複、メタデータ、品質チェックを行っています。',
    },
} as const;

function buildCardClasses(extraClassName?: string): string {
    const classes = [
        'rounded-2xl',
        'border',
        'border-border-color',
        'bg-white',
        'p-5',
        'md:p-6',
        'shadow-sm',
    ];

    if (extraClassName) {
        classes.push(extraClassName);
    }

    return classes.join(' ');
}

export default function EditorialPolicyCard({
    variant,
    updatedAt,
    authorName = 'ChoiceGuide編集部',
    className,
}: EditorialPolicyCardProps) {
    const copy = COPY[variant];

    return (
        <section className={buildCardClasses(className)} aria-label={copy.title}>
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between mb-4">
                <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent mb-2">
                        Editorial Policy
                    </p>
                    <h2 className="text-lg md:text-xl font-black text-primary">
                        {copy.title}
                    </h2>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-text-sub">
                    <span className="rounded-full bg-surface-subtle px-3 py-1 border border-border-color">
                        アフィリエイトリンクを含みます
                    </span>
                    {updatedAt ? (
                        <span className="rounded-full bg-surface-subtle px-3 py-1 border border-border-color">
                            最終更新: {updatedAt}
                        </span>
                    ) : null}
                </div>
            </div>

            <dl className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl bg-surface-subtle/40 p-4 border border-border-color">
                    <dt className="text-xs font-bold text-accent mb-2">公開元</dt>
                    <dd className="text-sm leading-6 text-text-main">
                        {authorName}名義で公開しています。著者情報と編集方針は
                        {' '}
                        <Link className="font-bold text-primary underline decoration-primary/30 underline-offset-4 hover:text-accent hover:decoration-accent" href="/about">
                            About
                        </Link>
                        {' '}
                        に掲載しています。
                    </dd>
                </div>

                <div className="rounded-xl bg-surface-subtle/40 p-4 border border-border-color">
                    <dt className="text-xs font-bold text-accent mb-2">比較方法</dt>
                    <dd className="text-sm leading-6 text-text-main">
                        {copy.how}
                    </dd>
                </div>

                <div className="rounded-xl bg-surface-subtle/40 p-4 border border-border-color">
                    <dt className="text-xs font-bold text-accent mb-2">この記事の目的</dt>
                    <dd className="text-sm leading-6 text-text-main">
                        用途に合う製品を短時間で選びやすくするために、比較ポイントと注意点を先に把握できる形でまとめています。読後に再検索が必要になりにくい、判断材料を残すことを目指しています。
                    </dd>
                </div>
            </dl>
        </section>
    );
}
