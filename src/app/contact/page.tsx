import React from 'react';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';

export default function ContactPage() {
    return (
        <div className="bg-background-light text-text-main antialiased font-sans min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow pt-24 pb-12">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold mb-8 text-primary border-b pb-4 border-stone-200">お問い合わせ</h1>

                    <p className="mb-8 text-stone-600 text-sm leading-relaxed">
                        当サイトに関するご質問、広告掲載のご依頼、プレスリリースの送付等は、以下のフォームよりお気軽にお問い合わせください。<br />
                        通常、3営業日以内に担当者よりご返信させていただきます。
                    </p>

                    <form className="space-y-6 bg-white p-8 rounded-xl border border-stone-200 shadow-sm">
                        <div>
                            <label htmlFor="name" className="block text-sm font-bold text-stone-700 mb-1">お名前 <span className="text-accent">*</span></label>
                            <input type="text" id="name" name="name" required className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all outline-none" placeholder="山田 太郎" />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-bold text-stone-700 mb-1">メールアドレス <span className="text-accent">*</span></label>
                            <input type="email" id="email" name="email" required className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all outline-none" placeholder="example@choiceguide.jp" />
                        </div>

                        <div>
                            <label htmlFor="subject" className="block text-sm font-bold text-stone-700 mb-1">件名</label>
                            <select id="subject" name="subject" className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all outline-none cursor-pointer">
                                <option>記事内容に関するご質問</option>
                                <option>広告掲載について</option>
                                <option>プレスリリースの送付</option>
                                <option>その他のお問い合わせ</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="message" className="block text-sm font-bold text-stone-700 mb-1">お問い合わせ内容 <span className="text-accent">*</span></label>
                            <textarea id="message" name="message" rows={5} required className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all outline-none resize-none" placeholder="お問い合わせ内容をご記入ください"></textarea>
                        </div>

                        <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all transform active:scale-[0.99]">
                            送信する
                        </button>
                    </form>
                </div>
            </main>
            <Footer />
        </div>
    );
}
