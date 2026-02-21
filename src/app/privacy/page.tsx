import React from 'react';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'プライバシーポリシー',
    description: 'ChoiceGuideのプライバシーポリシーです。個人情報の取り扱い、Cookie利用、アクセス解析ツールについてご説明します。',
    alternates: {
        canonical: 'https://choiceguide.jp/privacy/',
    },
};

export default function PrivacyPage() {
    return (
        <div className="bg-background-light text-text-main antialiased font-sans min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow pt-24 pb-12">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold mb-8 text-primary border-b pb-4 border-stone-200">プライバシーポリシー</h1>

                    <div className="prose prose-stone max-w-none">
                        <h3>個人情報の利用目的</h3>
                        <p>
                            当サイトでは、お問い合わせや記事へのコメントの際、名前やメールアドレス等の個人情報を入力いただく場合がございます。
                            取得した個人情報は、お問い合わせに対する回答や必要な情報を電子メールなどをでご連絡する場合に利用させていただくものであり、これらの目的以外では利用いたしません。
                        </p>

                        <h3>広告について</h3>
                        <p>
                            当サイトでは、第三者配信の広告サービス（Googleアドセンス、A8.net、Amazonアソシエイトなど）を利用しており、
                            ユーザーの興味に応じた商品やサービスの広告を表示するため、クッキー（Cookie）を使用しております。
                            クッキーを使用することで当サイトはお客様のコンピュータを識別できるようになりますが、お客様個人を特定できるものではありません。
                        </p>

                        <h3>アクセス解析ツールについて</h3>
                        <p>
                            当サイトでは、Googleによるアクセス解析ツール「Googleアナリティクス」を利用しています。
                            このGoogleアナリティクスはトラフィックデータの収集のためにクッキー（Cookie）を使用しております。トラフィックデータは匿名で収集されており、個人を特定するものではありません。
                        </p>

                        <h3>免責事項</h3>
                        <p>
                            当サイトからのリンクやバナーなどで移動したサイトで提供される情報、サービス等について一切の責任を負いません。
                            また当サイトのコンテンツ・情報について、できる限り正確な情報を提供するように努めておりますが、正確性や安全性を保証するものではありません。
                            当サイトに掲載された内容によって生じた損害等の一切の責任を負いかねますのでご了承ください。
                        </p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
