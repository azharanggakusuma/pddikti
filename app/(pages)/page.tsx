// app/(pages)/page.tsx
"use client";

import Link from "next/link";
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  GraduationCap,
  School,
  User,
  ArrowRight,
  Loader2,
  Info,
  Search,
  ChevronDown,
  ArrowUp,
} from "lucide-react";
import { useState, FormEvent, useEffect, useRef } from "react";
import { motion, useInView, useSpring } from "framer-motion";
import { NewFeaturePopup } from "@/components/popups/NewFeaturePopup"; // Perubahan di sini

// Tipe props untuk MenuItem
type MenuItemProps = {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
};

// Tipe untuk data statistik
type StatsData = {
    mahasiswa: number;
    dosen: number;
    prodi: number;
    pt: number;
};

// Komponen MenuItem (tidak berubah)
const MenuItem = ({ href, icon, title, description }: MenuItemProps) => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Link
      href={href}
      className="group block"
      onClick={() => setIsLoading(true)}
    >
      <div
        className={`bg-white p-6 rounded-2xl border border-gray-200/80 h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1.5 hover:shadow-blue-500/10 relative overflow-hidden`}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div
          className={`transition-all duration-300 ${
            isLoading ? "opacity-50 cursor-wait" : ""
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm transition-colors duration-300 group-hover:bg-blue-50 group-hover:border-blue-200">
              {icon}
            </div>
            {isLoading ? (
              <Loader2 className="animate-spin text-blue-600" size={20} />
            ) : (
              <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full transform scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300">
                <ArrowRight className="text-gray-500" size={18} />
              </div>
            )}
          </div>
          <div className="mt-5">
            <h3 className="font-bold text-lg text-gray-800">{title}</h3>
            <p className="text-gray-500 text-sm mt-1">{description}</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

// Komponen untuk animasi angka (tidak berubah)
const AnimatedCounter = ({ value }: { value: number }) => {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true });
    const spring = useSpring(0, {
        damping: 20,
        stiffness: 100,
        mass: 1
    });

    useEffect(() => {
        if (isInView) {
            spring.set(value);
        }
    }, [isInView, value, spring]);

    useEffect(() => {
        const unsubscribe = spring.on("change", (latest) => {
            if (ref.current) {
                ref.current.textContent = new Intl.NumberFormat('id-ID').format(
                    Math.round(latest)
                );
            }
        });
        return () => unsubscribe();
    }, [spring]);


    return <span ref={ref}>0</span>;
};

// --- SKELETON STATISTIK (GAYA MINIMALIS) ---
const StatCardSkeleton = () => (
    <div className="bg-white p-6 rounded-2xl border border-gray-200/80 text-center animate-pulse">
        <div className="h-10 w-10 bg-gray-200 rounded-lg mx-auto mb-4"></div>
        <div className="h-8 w-24 bg-gray-200 rounded-md mx-auto"></div>
        <div className="h-4 w-20 bg-gray-200 rounded-md mx-auto mt-2"></div>
    </div>
);

// --- KARTU STATISTIK (GAYA MINIMALIS) ---
const StatCard = ({ icon, value, label, href }: { icon: React.ReactNode, value: number, label: string, href: string }) => {
    return (
        <Link href={href} className="group block">
            <div className="bg-white p-6 rounded-2xl border border-gray-200/80 text-center transition-all duration-300 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/10 h-full flex flex-col justify-center">
                <div className="flex justify-center items-center mb-4">
                     <div className="p-2 bg-gray-50 rounded-lg border border-gray-200 text-gray-500 transition-colors duration-300 group-hover:text-blue-600 group-hover:bg-blue-50 group-hover:border-blue-200">
                        {icon}
                    </div>
                </div>
                <div>
                    <p className="text-3xl font-bold text-gray-800">
                        <AnimatedCounter value={value} />
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{label}</p>
                </div>
            </div>
        </Link>
    );
};


export default function Home() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchCategory, setSearchCategory] = useState('semua');
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [stats, setStats] = useState<StatsData | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/stats');
                const data = await response.json();
                setStats(data);
            } catch (error) {
                console.error("Gagal mengambil data statistik:", error);
            }
        };

        fetchStats();

        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 400);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        let path = '';
        switch (searchCategory) {
            case 'mahasiswa': path = '/mahasiswa'; break;
            case 'dosen': path = '/dosen'; break;
            case 'prodi': path = '/prodi'; break;
            case 'pt': path = '/pt'; break;
            default: path = '/search'; break;
        }
        router.push(`${path}?q=${encodeURIComponent(searchQuery)}`);
    };

  return (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen w-full antialiased bg-gray-50 text-gray-800 flex flex-col"
    >
      <NewFeaturePopup />
      <div
        className="absolute top-0 left-0 w-full h-full bg-repeat -z-10 opacity-50"
        style={{ backgroundImage: 'url(\'data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%23e2e8f0" fill-opacity="0.4"%3E%3Cpath d="M.5 1.5l1-1M2.5 3.5l1-1"/%3E%3C/g%3E%3C/svg%3E\')' }}
      ></div>

      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24 flex-grow">
        <header className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-100 text-amber-800 rounded-full text-xs font-medium tracking-wide mb-8 border border-amber-200">
            <Info size={14} className="text-amber-600" />
            <span>Situs ini bukan laman resmi dari Kemdiktisaintek.</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900">
            Jelajahi Data
            <span className="mt-2 block text-blue-600">Pendidikan Tinggi</span>
          </h1>
          <p className="mt-6 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Cari data mahasiswa, dosen, program studi, dan perguruan tinggi
            di seluruh Indonesia dengan cepat, mudah, dan terintegrasi langsung
            dari data PDDikti.
          </p>
        </header>

        <div className="mt-12 w-full max-w-2xl mx-auto">
            <form onSubmit={handleSearch} className="w-full bg-white rounded-xl shadow-sm border border-gray-200/80 transition-all duration-300 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center w-full">
                    <div className="relative flex items-center w-full sm:w-auto border-b sm:border-b-0 border-gray-200/80">
                        <select
                            value={searchCategory}
                            onChange={(e) => setSearchCategory(e.target.value)}
                            className="w-full pl-5 pr-10 py-4 appearance-none bg-transparent text-gray-700 font-semibold text-sm focus:outline-none cursor-pointer"
                            aria-label="Pilih kategori pencarian"
                        >
                            <option value="semua">Semua</option>
                            <option value="mahasiswa">Mahasiswa</option>
                            <option value="dosen">Dosen</option>
                            <option value="prodi">Prodi</option>
                            <option value="pt">Perguruan Tinggi</option>
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1-2 -translate-y-1-2 text-gray-400 pointer-events-none" />
                    </div>
                    <div className="hidden sm:block w-px bg-gray-200 h-8"></div>
                    <div className="flex items-center w-full">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Ketikkan kata kunci..."
                            className="w-full pl-4 pr-2 py-4 bg-transparent focus:outline-none text-base text-gray-800 placeholder-gray-500"
                        />
                        <button
                            type="submit"
                            disabled={isSearching}
                            className="mr-2 ml-1 px-4 sm:px-5 h-11 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
                            aria-label="Cari"
                        >
                            {isSearching ? <Loader2 size={20} className="animate-spin" /> : <><Search size={20} className="sm:mr-2 transition-all"/><span className="hidden sm:inline font-semibold">Cari</span></>}
                        </button>
                    </div>
                </div>
            </form>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-16">
          <MenuItem
            href="/mahasiswa"
            icon={<GraduationCap size={24} className="text-gray-500 group-hover:text-blue-600 transition-colors"/>}
            title="Pencarian Mahasiswa"
            description="Cari data mahasiswa di seluruh Indonesia berdasarkan nama atau NIM."
          />
          <MenuItem
            href="/dosen"
            icon={<User size={24} className="text-gray-500 group-hover:text-blue-600 transition-colors"/>}
            title="Pencarian Dosen"
            description="Telusuri data dosen, NIDN, beserta riwayat aktivitas mengajarnya."
          />
          <MenuItem
            href="/prodi"
            icon={<BookOpen size={24} className="text-gray-500 group-hover:text-blue-600 transition-colors"/>}
            title="Pencarian Program Studi"
            description="Dapatkan informasi lengkap mengenai program studi dan akreditasinya."
          />
          <MenuItem
            href="/pt"
            icon={<School size={24} className="text-gray-500 group-hover:text-blue-600 transition-colors"/>}
            title="Pencarian Perguruan Tinggi"
            description="Temukan profil, alamat, dan detail lain dari perguruan tinggi."
          />
        </div>

        {/* --- SEKSI STATISTIK GAYA MINIMALIS --- */}
        <section className="mt-24">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                    Statistik Nasional
                </h2>
                <p className="mt-3 text-base text-gray-600 max-w-2xl mx-auto">
                    Data agregat dari PDDikti yang diperbarui secara berkala.
                </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                {stats ? (
                    <>
                        <StatCard href="/mahasiswa" icon={<GraduationCap size={24}/>} value={stats.mahasiswa} label="Mahasiswa Aktif" />
                        <StatCard href="/dosen" icon={<User size={24}/>} value={stats.dosen} label="Dosen Aktif" />
                        <StatCard href="/prodi" icon={<BookOpen size={24}/>} value={stats.prodi} label="Program Studi" />
                        <StatCard href="/pt" icon={<School size={24}/>} value={stats.pt} label="Perguruan Tinggi" />
                    </>
                ) : (
                    <>
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                    </>
                )}
            </div>
        </section>

      </main>
      {showBackToTop && (
            <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="fixed bottom-8 right-8 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-110"
                style={{ animation: 'fadeInUp 0.5s ease-out' }}
            >
                <ArrowUp size={24} />
            </button>
      )}
    </motion.div>
  );
}