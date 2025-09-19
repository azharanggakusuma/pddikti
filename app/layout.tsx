import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/app/components/Navbar";
import { Footer } from "@/app/components/Footer";
import { PageTransitionLoader } from "@/app/components/PageTransitionLoader";
// --- 1. Impor Provider dan Popup (ganti Banner) ---
import { StatusProvider } from "@/app/context/StatusContext";
import { StatusPopup } from "@/app/components/StatusPopup"; // Ganti import ini

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DataDIKTI",
  description: "Search for university data in the PDDIKTI database",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 flex flex-col min-h-screen`}
      >
        <StatusProvider>
          <PageTransitionLoader />
          <Navbar />
          {/* --- 2. Ganti StatusBanner dengan StatusPopup --- */}
          <StatusPopup />
          <main className="flex-grow w-full"> {/* Padding atas tidak lagi diperlukan */}
            {children}
          </main>
          <Footer />
        </StatusProvider>
      </body>
    </html>
  );
}