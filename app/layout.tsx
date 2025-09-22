import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageTransitionLoader } from "@/components/PageTransitionLoader";
import { StatusProvider } from "@/lib/context/StatusContext";
import { StatusPopup } from "@/components/StatusPopup";

const open_sans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
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
        className={`${open_sans.className} antialiased bg-gray-50 flex flex-col min-h-screen`}
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