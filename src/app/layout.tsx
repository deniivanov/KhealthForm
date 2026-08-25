import type { ReactNode } from "react";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@/styles/modernist.css";
import "@/styles/admin.css";
import { archivo } from "@/lib/fonts";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata = {
    title: "Khealth Order Form",
    description: "Форма за поръчка на екипи за спортни клубове на марката KHealth",
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
        <body
            className={`${geistSans.variable} ${geistMono.variable} ${archivo.variable} antialiased`}
        >
        {children}
        <Script src="/h3alth-logo.js" strategy="afterInteractive" />
        </body>
        </html>
    );
}
