import React from 'react';

interface GlossaryItem {
    term: string;
    reading?: string;
    definition: string;
}

interface GlossarySectionProps {
    category?: string;
    className?: string;
}

// Common tech terms by category
const glossaryData: Record<string, GlossaryItem[]> = {
    'イヤホン': [
        { term: 'ノイズキャンセリング', reading: 'ANC', definition: '周囲の騒音を打ち消す技術。マイクで外音を拾い、逆位相の音で相殺します。' },
        { term: 'ドライバー', definition: '音を出す振動板のサイズ。一般的に大きいほど低音が豊かになります。' },
        { term: 'コーデック', definition: 'Bluetooth音声の圧縮方式。AAC、aptX、LDACなど。高品質なほど遅延が少なく音質が良い傾向。' },
        { term: 'マルチポイント', definition: '2台以上の機器に同時接続できる機能。PCとスマホの切り替えが不要になります。' },
        { term: 'LDAC', definition: 'ソニーが開発した高音質コーデック。最大990kbpsでハイレゾ相当の音質を実現。' },
    ],
    'シャンプー': [
        { term: 'アミノ酸系', definition: '洗浄成分にアミノ酸を使用。マイルドな洗い上がりで頭皮に優しい。' },
        { term: 'ノンシリコン', definition: 'シリコンを含まないシャンプー。髪本来のハリ・コシを活かしたい方向け。' },
        { term: 'CMADK', definition: '毛髪補修成分の一種。ダメージ部分に吸着し、内部から補修します。' },
    ],
    'default': [
        { term: 'コスパ', definition: 'コストパフォーマンスの略。価格に対する性能や満足度の高さ。' },
        { term: 'スペック', definition: '製品の仕様・性能を表す数値や機能の総称。' },
    ]
};

const GlossarySection: React.FC<GlossarySectionProps> = ({ category = 'default', className = '' }) => {
    // カテゴリに応じた用語を取得、なければdefault
    const terms = glossaryData[category] || glossaryData['default'];

    if (!terms || terms.length === 0) return null;

    return (
        <section className={`bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 md:p-8 ${className}`}>
            <div className="flex items-center gap-3 mb-6">
                <div className="size-10 bg-white dark:bg-gray-700 rounded-xl flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-primary">menu_book</span>
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">用語解説</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">この記事で使われている専門用語</p>
                </div>
            </div>

            <div className="space-y-4">
                {terms.map((item, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="font-bold text-gray-900 dark:text-white">{item.term}</span>
                            {item.reading && (
                                <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded">
                                    {item.reading}
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                            {item.definition}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default GlossarySection;
