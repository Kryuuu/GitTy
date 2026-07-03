// ============================================
// GitTy — Root Layout
// ============================================
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "GitTy — AI-Native SaaS Platform",
  description:
    "Build, automate, and scale with intelligent AI agents. The all-in-one platform for teams that think in AI.",
  keywords: [
    "AI platform",
    "SaaS",
    "AI agents",
    "automation",
    "workflow",
    "team collaboration",
  ],
  openGraph: {
    title: "GitTy — AI-Native SaaS Platform",
    description:
      "Build, automate, and scale with intelligent AI agents.",
    type: "website",
    url: process.env.NEXT_PUBLIC_APP_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans`}>{children}</body>
    </html>
  );
}
