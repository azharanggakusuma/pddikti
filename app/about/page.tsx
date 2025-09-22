// app/about/page.tsx
import { Info, Database, Zap, Code } from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import Link from 'next/link';

const FeatureCard = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
    <div className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="flex items-center gap-4">
            <div className="flex-shrink-0 h-12 w-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                {icon}
            </div>
            <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        </div>
        <p className="mt-4 text-gray-600">
            {children}
        </p>
    </div>
);


export default function AboutPage() {
    const breadcrumbItems = [{ label: "Tentang Situs Ini" }];

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8 antialiased">
            <main className="max-w-4xl mx-auto">
                <Breadcrumbs items={breadcrumbItems} />

                <header className="text-center my-8 sm:my-12">
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">
                        Tentang <span className="text-blue-600">DataDikti</span>
                    </h1>
                    <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
                        Misi kami adalah menyajikan data Pendidikan Tinggi di Indonesia secara cepat, mudah diakses, dan dengan antarmuka yang modern bagi siapa saja.
                    </p>
                </header>

                <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FeatureCard icon={<Info size={24} />} title="Apa Itu DataDikti?">
                        DataDikti adalah sebuah proyek independen yang bertujuan untuk menjadi pintu gerbang alternatif dalam mengakses data dari Pangkalan Data Pendidikan Tinggi (PDDikti). Kami percaya bahwa data publik harus mudah diakses dan disajikan dengan cara yang ramah pengguna.
                    </FeatureCard>
                    <FeatureCard icon={<Database size={24} />} title="Sumber Data Kami">
                        Seluruh informasi yang ditampilkan di situs ini bersumber dari data publik yang disediakan oleh PDDikti. Kami mengambil data ini melalui API publik pihak ketiga yang dikelola oleh <a href="https://api-pddikti.ridwaanhall.com/" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 hover:underline">Ridwan Hall</a>, yang telah melakukan pekerjaan luar biasa dalam membuat data ini lebih mudah diakses.
                    </FeatureCard>
                     <FeatureCard icon={<Zap size={24} />} title="Teknologi di Baliknya">
                        Situs ini dibangun menggunakan teknologi web modern seperti Next.js dan Tailwind CSS untuk memberikan pengalaman pengguna yang cepat dan responsif. Kami fokus pada kecepatan, kemudahan penggunaan, dan desain yang bersih.
                    </FeatureCard>
                    <FeatureCard icon={<Code size={24} />} title="Pengembang">
                        Proyek ini didesain dan dikembangkan oleh <a href="https://azharanggakusuma.xyz" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 hover:underline">Azharangga Kusuma</a>. Jika Anda memiliki pertanyaan atau masukan, jangan ragu untuk menghubunginya melalui media sosial yang tertera di footer.
                    </FeatureCard>
                </div>

                 <div className="mt-20 text-center">
                    <h2 className="text-2xl font-bold text-gray-800">Punya Pertanyaan Lain?</h2>
                    <p className="mt-3 text-gray-600">
                        Kunjungi Pusat Bantuan kami untuk menemukan jawaban atas pertanyaan umum.
                    </p>
                    <Link href="/faq" className="mt-6 inline-block bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                        Kunjungi Pusat Bantuan
                    </Link>
                </div>

            </main>
        </div>
    );
}