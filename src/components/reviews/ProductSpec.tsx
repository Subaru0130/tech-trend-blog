
import React from 'react';

export type SpecItem = {
    label: string;
    value: string;
    icon?: string;
};

type ProductSpecProps = {
    specs: SpecItem[];
};

export default function ProductSpec({ specs }: ProductSpecProps) {
    return (
        <div className="overflow-hidden rounded-xl border border-border-color">
            <table className="w-full text-sm text-left">
                <tbody className="divide-y divide-border-color">
                    {specs.map((spec, index) => (
                        <tr key={index} className={index % 2 === 0 ? "bg-surface-subtle" : "bg-white"}>
                            <th className="py-4 px-6 font-bold text-primary w-1/3">
                                {spec.icon && (
                                    // Typically the icon might be bundled with the label, but simple text support first
                                    <span className="hidden opacity-0">{spec.icon}</span>
                                )}
                                {spec.label}
                            </th>
                            <td className="py-4 px-6 text-text-main">{spec.value}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
