// src/app/(marketing)/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/ui/Header";
import { VideoPreloadProvider } from "@/contexts/VideoPreloadContent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Edición Persuasiva - Gana $2,000+ editando videos con pocos clientes",
  description:
    "Para editores que quieran lograr más y cobrar mucho más. Aprende cómo ganar mínimo $2,000 dólares mensuales editando y con pocos clientes.",
};

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <VideoPreloadProvider>
      <div
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Header />
        {children}
      </div>
    </VideoPreloadProvider>
  );
}
