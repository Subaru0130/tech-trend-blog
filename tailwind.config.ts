import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": "#3E3B38", // Dark earthy charcoal (Warm black)
                "primary-hover": "#292524",
                "accent": "#5E8C6A", // Sage Green - Clean & Natural
                "accent-dark": "#43694D",
                "accent-light": "#F0F5F1", // Very pale green
                "accent-subtle": "#E2EBE5", // Added from HTML
                "rank-gold": "#C5A059", // Muted elegant gold
                "rank-silver": "#9CA3AF", // Cool grey
                "rank-bronze": "#A87964", // Terracotta
                "background-light": "#F9F9F8", // Warm stone white
                "background-white": "#FFFFFF",
                "surface-light": "#FFFFFF",
                "surface-subtle": "#F5F5F4", // Warm Grey 100
                "text-main": "#44403C", // Stone 700
                "text-sub": "#78716C", // Stone 500
                "border-color": "#E7E5E4", // Stone 200
                "brand-brown": "#8D7B68", // Earthy brown for badges
                "pros-bg": "#E8F5E9",
                "pros-text": "#2E7D32",
                "cons-bg": "#FFEBEE",
                "cons-text": "#C62828",
            },
            fontFamily: {
                "sans": ["var(--font-manrope)", "var(--font-noto-sans-jp)", "sans-serif"], // Fixed order
            },
            boxShadow: {
                "soft": "0 4px 20px -2px rgba(62, 59, 56, 0.04), 0 0 0 1px rgba(0,0,0,0.02)",
                "card": "0 1px 3px rgba(0,0,0,0.02), 0 1px 2px rgba(0,0,0,0.04)",
                "card-hover": "0 20px 40px -12px rgba(94, 140, 106, 0.12), 0 0 0 1px rgba(94, 140, 106, 0.05)", // Fixed
                "float": "0 30px 60px -15px rgba(62, 59, 56, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.8) inset", // Fixed
            },
            animation: {
                'fade-in-up': 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            },
            keyframes: {
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                }
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
};
export default config;
