import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "iProduct Repair - Apple Device Repair & Refurbished Devices",
  description: "Premium Apple Service Center in Bangalore. Book doorstep iPhone, MacBook, iPad, iMac, & Apple Watch repair, or shop high-quality certified pre-owned devices at very cheap cost.",
  icons: {
    icon: [
      { url: '/icon.png', type: 'image/png', sizes: '1024x1024' },
    ],
    apple: [
      { url: '/icon.png', type: 'image/png', sizes: '1024x1024' },
    ],
    shortcut: '/icon.png',
  },
};

import Header from "@/components/Header";
import { ThemeProvider } from "@/components/theme-provider";
import HeaderVisibility from "@/components/HeaderVisibility";

import Footer from "@/components/Footer";
import InitialLoader from "@/components/ui/InitialLoader";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Initial Splash Loader for first visit/refresh */}
          <InitialLoader />

          <HeaderVisibility>
            <Header />
          </HeaderVisibility>
          
          <main className="flex-1">
            {children}
          </main>

          <HeaderVisibility>
            <Footer />
          </HeaderVisibility>
        </ThemeProvider>
      </body>
    </html>
  );
}
