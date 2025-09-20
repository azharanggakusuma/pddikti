import type { Metadata } from "next";
import { Lato } from "next/font/google"; // 1. Ganti import menjadi Lato
import "./globals.css";
import { Navbar } from "@/app/components/Navbar";
import { Footer } from "@/app/components/Footer";
import { PageTransitionLoader } from "@/app/components/PageTransitionLoader";
import { StatusProvider } from "@/app/context/StatusContext";
import { StatusPopup } from "@/app/components/StatusPopup";

// 2. Konfigurasi Lato
const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700", "900"], // Pilih ketebalan yang relevan
  display: 'swap',
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
        className={`${lato.className} antialiased bg-gray-50 flex flex-col min-h-screen`} // 3. Gunakan className dari Lato
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