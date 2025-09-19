import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/app/components/Navbar";
import { Footer } from "@/app/components/Footer";
import { PageTransitionLoader } from "@/app/components/PageTransitionLoader";
import { StatusProvider } from "@/app/context/StatusContext";
import { StatusPopup } from "@/app/components/StatusPopup";

// Inisialisasi font Poppins
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ['400', '500', '600', '700'], // Tentukan weight yang akan dipakai
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
        // --- INI BAGIAN YANG DIPERBAIKI ---
        className={`${poppins.variable} ${poppins.className} antialiased bg-gray-50 flex flex-col min-h-screen`}
      >
        <StatusProvider>
          <PageTransitionLoader />
          <Navbar />
          <StatusPopup />
          <main className="flex-grow w-full">
            {children}
          </main>
          <Footer />
        </StatusProvider>
      </body>
    </html>
  );
}