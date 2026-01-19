
import { getAllProducts, getProductById } from '@/lib/data';
import { notFound } from 'next/navigation';

// Static Generation for all products to support output: export
export async function generateStaticParams() {
    const products = getAllProducts();
    return products.map((product) => ({
        id: product.id,
    }));
}

type Props = {
    params: Promise<{ id: string }>;
};

export default async function LinkPage({ params }: Props) {
    const { id } = await params;
    const product = getProductById(id);

    if (!product || !product.affiliateLinks?.amazon) {
        return notFound();
    }

    const targetUrl = product.affiliateLinks.amazon;

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
            {/* Meta Refresh as reliable fallback for static pages */}
            <meta httpEquiv="refresh" content={`0;url=${targetUrl}`} />

            <div className="space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
                <h1 className="text-xl font-bold text-primary">Amazonへ移動中...</h1>
                <p className="text-text-sub text-sm">ページが切り替わらない場合は、<a href={targetUrl} className="text-accent underline hover:text-accent-dark">こちらをクリック</a>してください。</p>
            </div>

            {/* JavaScript Redirect */}
            <script
                dangerouslySetInnerHTML={{
                    __html: `window.location.replace("${targetUrl}");`
                }}
            />
        </div>
    );
}
