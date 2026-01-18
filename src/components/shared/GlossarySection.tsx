import React from 'react';

interface GlossaryItem {
    term: string;
    aliases?: string[];  // Alternative terms to match
    reading?: string;
    definition: string;
}

interface GlossarySectionProps {
    category?: string;
    content?: string;  // Article content to scan for terms
    className?: string;
}

// All tech terms - will be filtered based on article content
const allGlossaryTerms: GlossaryItem[] = [
    // イヤホン関連
    { term: 'ノイズキャンセリング', aliases: ['ANC', 'ノイキャン', 'NC'], reading: 'ANC', definition: '周囲の騒音を打ち消してくれる機能です。イヤホンに内蔵されたマイクが外の音を拾い、それと逆の音を出すことで騒音を消します。電車、飛行機、カフェなど騒がしい場所でも音楽に集中できます。' },
    { term: 'ドライバー', aliases: ['ドライバーユニット', 'mm'], definition: '音を出す部品のことで、サイズは「mm（ミリメートル）」で表します。一般的に6mm〜14mm程度。大きいほど低音が豊かになる傾向がありますが、サイズだけで音質は決まりません。' },
    { term: 'コーデック', aliases: ['Bluetooth コーデック'], definition: 'Bluetoothで音楽を送る際の「圧縮方式」のこと。圧縮方法によって音質や遅延が変わります。スマホとイヤホンの両方が同じコーデックに対応している必要があります。' },
    { term: 'AAC', definition: 'iPhoneで標準的に使われるコーデック。音質はそこそこ良く、遅延も少なめ。iPhoneユーザーならAAC対応で十分です。' },
    { term: 'aptX', aliases: ['apt-X', 'aptx'], definition: 'Androidスマホで多く使われるコーデック。AACより高音質で遅延も少ないとされます。ゲームや動画視聴にも向いています。' },
    { term: 'LDAC', definition: 'ソニーが開発した高音質コーデック。CD以上の音質（ハイレゾ相当）で音楽を楽しめます。対応機器が必要ですが、音質にこだわるなら重要なポイントです。' },
    { term: 'ハイレゾ', aliases: ['Hi-Res', 'ハイレゾ対応'], definition: 'CD（44.1kHz/16bit）より高い解像度の音源のこと。より細かい音まで再現できます。ハイレゾ対応のイヤホンと音源が必要です。' },
    { term: 'マルチポイント', aliases: ['マルチポイント接続'], definition: '2台以上の機器に同時接続できる機能。例えばPCとスマホに同時接続しておけば、PC作業中にスマホの着信が来たらそのまま通話できます。切り替え操作が不要で便利です。' },
    { term: '外音取り込み', aliases: ['アンビエント', '外音取込', 'ヒアスルー'], reading: 'アンビエント', definition: 'イヤホンを着けたまま外の音を聞ける機能。マイクで外音を拾ってイヤホン内に流します。駅のアナウンスを聞きたい時やコンビニでの会計時に便利です。' },
    { term: 'IPX', aliases: ['IPX4', 'IPX5', 'IPX7', '防水'], definition: '防水性能を表す規格。IPX4は「水しぶきOK（汗や小雨）」、IPX5は「噴流OK（シャワー程度）」、IPX7は「水没OK（30分程度）」。数字が大きいほど防水性能が高いです。' },
    { term: 'カナル型', aliases: ['カナルタイプ'], definition: '耳の穴にイヤーピースを差し込むタイプ。遮音性が高く、低音もしっかり聴こえます。現在のワイヤレスイヤホンの主流です。' },
    { term: 'インナーイヤー型', aliases: ['インナーイヤータイプ', 'オープンイヤー'], definition: '耳の入り口に引っ掛けるタイプ。圧迫感が少なく長時間でも疲れにくい。ただし遮音性は低めです。' },
    { term: 'ワイヤレス充電', aliases: ['Qi充電', '置くだけ充電'], definition: 'ケーブルを繋がずに充電できる機能。Qi（チー）規格の充電器に置くだけで充電できます。' },
    { term: 'バッテリー持続時間', aliases: ['再生時間', '連続再生'], definition: 'フル充電で何時間使えるかの目安。イヤホン単体とケース込みの2種類があります。' },

    // シャンプー関連
    { term: 'アミノ酸系', aliases: ['アミノ酸シャンプー'], definition: '洗浄成分にアミノ酸を使ったシャンプー。肌と同じ弱酸性でマイルドな洗い上がり。頭皮が敏感な人や乾燥しやすい人におすすめです。' },
    { term: 'ノンシリコン', aliases: ['シリコンフリー'], definition: 'シリコン（コーティング剤）を含まないシャンプー。髪本来のハリ・コシを活かしたい人や、ふんわりとした仕上がりを求める人向け。' },
    { term: 'ラウレス硫酸Na', aliases: ['ラウリル硫酸', '硫酸系'], definition: '洗浄力が強い成分。泡立ちが良くスッキリ洗えますが、敏感肌の人には刺激になることも。' },

    // 共通
    { term: 'コスパ', aliases: ['コストパフォーマンス'], definition: 'コストパフォーマンスの略。価格に対してどれだけ満足できるかを表します。「コスパが良い」＝値段の割に性能や満足度が高いことを意味します。' },
    { term: 'スペック', aliases: ['仕様'], definition: '製品の仕様・性能のこと。サイズ、重量、バッテリー持続時間など、数値で表せる情報を指します。' },
];

const GlossarySection: React.FC<GlossarySectionProps> = ({ content = '', className = '' }) => {
    // Filter terms that appear in the article content
    const matchedTerms = allGlossaryTerms.filter(item => {
        // Check if term or any alias appears in content
        const termsToCheck = [item.term, ...(item.aliases || [])];
        return termsToCheck.some(term => content.includes(term));
    });

    // If no terms found, don't render
    if (matchedTerms.length === 0) return null;

    return (
        <section className={`bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 md:p-8 ${className}`}>
            <div className="flex items-center gap-3 mb-6">
                <div className="size-10 bg-white dark:bg-gray-700 rounded-xl flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-primary">menu_book</span>
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">用語解説</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">この記事で使われている専門用語（{matchedTerms.length}件）</p>
                </div>
            </div>

            <div className="space-y-4">
                {matchedTerms.map((item, index) => (
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
