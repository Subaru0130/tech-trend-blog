import { ShieldCheck } from 'lucide-react';

export function AuthorProfile() {
    return (
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-6">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-slate-200 rounded-full overflow-hidden">
                    {/* Placeholder Avatar */}
                    <div className="w-full h-full flex items-center justify-center bg-slate-800 text-white font-bold">
                        Ed
                    </div>
                </div>
                <div>
                    <h3 className="font-bold text-slate-900 leading-tight">Best Buy Guide<br />編集部</h3>
                </div>
            </div>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                「失敗しない買い物」をサポートする検証チーム。
                膨大な製品スペックとユーザーレビューを徹底分析し、客観的なデータに基づいて「本当に良いもの」を厳選しています。
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-700 bg-blue-50 px-3 py-2 rounded-lg">
                <ShieldCheck className="w-4 h-4" />
                <span>客観的データ分析ポリシー準拠</span>
            </div>
        </div>
    );
}
