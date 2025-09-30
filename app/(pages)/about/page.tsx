// app/about/page.tsx
"use client";

import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Info, Database, Zap, Code, ArrowRight } from "lucide-react";
import { ReactNode } from "react";

const FeatureCard = ({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) => (
  <article
    className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    role="article"
  >
    <div className="flex items-center gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-600">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-gray-900">{title}</h3>
    </div>
    <p className="mt-4 text-gray-600 leading-relaxed">{children}</p>
  </article>
);

export default function AboutPage() {
  const breadcrumbItems = [{ label: "Tentang Situs Ini" }];

  return (
    <div className="relative min-h-screen bg-gray-50 p-4 antialiased sm:p-8">
      {/* Subtle top gradient */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-gradient-to-b from-blue-100/50 to-transparent" />

      <main className="mx-auto max-w-4xl">
        <Breadcrumbs items={breadcrumbItems} />

        {/* Header */}
        <header className="my-8 text-center sm:my-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Tentang <span className="text-blue-600">DataDikti</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-600">
            Misi kami adalah menyajikan data Pendidikan Tinggi di Indonesia secara cepat,
            mudah diakses, dan dengan antarmuka yang modern bagi siapa saja.
          </p>
        </header>

        {/* Feature grid */}
        <section
          aria-label="Fitur dan informasi"
          className="mt-12 grid grid-cols-1 gap-6 sm:mt-16 md:grid-cols-2"
        >
          <FeatureCard icon={<Info size={24} />} title="Apa Itu DataDikti?">
            DataDikti adalah proyek independen yang menjadi pintu gerbang alternatif
            untuk mengakses data dari Pangkalan Data Pendidikan Tinggi (PDDikti). Kami
            percaya data publik harus mudah diakses dan disajikan secara ramah pengguna.
          </FeatureCard>

          <FeatureCard icon={<Database size={24} />} title="Sumber Data Kami">
            Seluruh informasi bersumber dari data publik PDDikti. Kami mengaksesnya lewat
            API publik pihak ketiga yang dikelola oleh{" "}
            <a
              href="https://api-pddikti.ridwaanhall.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-blue-600 underline decoration-blue-200 underline-offset-2 hover:text-blue-700"
            >
              Ridwan Hall
            </a>
            , yang berkontribusi besar mempermudah akses data.
          </FeatureCard>

          <FeatureCard icon={<Zap size={24} />} title="Teknologi di Baliknya">
            Situs dibangun dengan Next.js dan Tailwind CSS untuk pengalaman cepat dan
            responsif. Fokus kami: performa, kemudahan penggunaan, dan desain yang bersih.
          </FeatureCard>

          <FeatureCard icon={<Code size={24} />} title="Pengembang">
            Proyek didesain & dikembangkan oleh{" "}
            <a
              href="https://azharanggakusuma.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-blue-600 underline decoration-blue-200 underline-offset-2 hover:text-blue-700"
            >
              Azharangga Kusuma
            </a>
            . Saran/pertanyaan? Silakan hubungi lewat tautan media sosial di footer.
          </FeatureCard>
        </section>

        {/* CTA */}
        <section className="mt-16 rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm sm:mt-20">
          <h2 className="text-2xl font-bold text-gray-900">Punya Pertanyaan Lain?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-gray-600">
            Kunjungi Pusat Bantuan untuk menemukan jawaban atas pertanyaan umum.
          </p>
          <Link
            href="/faq"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Kunjungi Pusat Bantuan
            <ArrowRight size={18} className="translate-x-0 transition group-hover:translate-x-0.5" />
          </Link>
        </section>
      </main>
    </div>
  );
}
