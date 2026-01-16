import React from 'react';

interface AuthorProfileProps {
    className?: string;
}

const AuthorProfile: React.FC<AuthorProfileProps> = ({ className = '' }) => {
    return (
        <div className={`bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 mt-12 ${className}`}>
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-3xl">person</span>
                    </div>
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-gray-900 dark:text-white">ChoiceGuide 編集部</h3>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">公式</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                        デジタル家電から生活用品まで、「失敗しない選び方」を提案するレビュー・比較メディア。
                        Amazon・価格.comなどの実際の購入者レビューを分析し、客観的なデータに基づいた製品比較情報をお届けします。
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <a href="/about" className="hover:text-primary transition-colors flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">info</span>
                            運営者情報
                        </a>
                        <a href="/contact" className="hover:text-primary transition-colors flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">mail</span>
                            お問い合わせ
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthorProfile;
