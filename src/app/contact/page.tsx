import React from 'react';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'お問い合わせ | BestChoice',
    description: 'BestChoiceに関するお問い合わせはこちらからお願いします。',
    alternates: {
        canonical: 'https://choiceguide.jp/contact',
    },
};

export default function ContactPage() {
    const email = "subaruu0130@gmail.com";

    return (
        <div className="bg-background-light text-text-main antialiased font-sans min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow pt-24 pb-12">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold mb-8 text-primary border-b pb-4 border-stone-200">お問い合わせ</h1>

                    <p className="mb-8 text-stone-600 text-sm leading-relaxed">
                        当サイトに関するご質問、広告掲載のご依頼、プレスリリースの送付等は、以下のメールアドレスよりお気軽にお問い合わせください。<br />
                        通常、3営業日以内にご返信させていただきます。
                    </p>

                    <div className="bg-white p-8 rounded-xl border border-stone-200 shadow-sm">
                        <h2 className="text-lg font-bold text-primary mb-4">メールでのお問い合わせ</h2>

                        <a
                            href={`mailto:${email}?subject=[ChoiceGuide] お問い合わせ`}
                            className="flex items-center gap-3 p-4 bg-accent/10 hover:bg-accent/20 rounded-lg transition-colors group"
                        >
                            <span className="material-symbols-outlined text-accent text-2xl">mail</span>
                            <div>
                                <p className="text-sm text-stone-500">メールアドレス</p>
                                <p className="text-lg font-bold text-primary group-hover:text-accent transition-colors">{email}</p>
                            </div>
                        </a>

                        <div className="mt-6 p-4 bg-stone-50 rounded-lg">
                            <h3 className="text-sm font-bold text-stone-700 mb-2">お問い合わせの種類</h3>
                            <ul className="text-sm text-stone-600 space-y-1">
                                <li>・記事内容に関するご質問</li>
                                <li>・広告掲載について</li>
                                <li>・プレスリリースの送付</li>
                                <li>・その他のお問い合わせ</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
