// app/(pages)/page.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { NewFeaturePopup } from "@/components/popups/NewFeaturePopup";

// ---------- Types ----------
type MenuItemProps = {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
};

type StatsData = {
  mahasiswa: number;
  dosen: number;
  prodi: number;
  pt: number;
};

// ---------- Components ----------
const MenuItem = ({ href, icon, title, description }: MenuItemProps) => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Link href={href} className="group block" onClick={() => setIsLoading(true)}>
      <article className="relative h-full overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:shadow-blue-500/10">
        <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-blue-400 to-indigo-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className={isLoading ? "cursor-wait opacity-50 transition-all" : "transition-all"}>
          <div className="flex items-start justify-between">
            <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-colors duration-300 group-hover:border-blue-200 group-hover:bg-blue-50">
              {icon}
            </div>
            {isLoading ? (
              <Loader2 className="text-blue-600 animate-spin" size={20} />
            ) : (
              <div className="flex h-8 w-8 scale-75 items-center justify-center rounded-full bg-gray-100 opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
                <ArrowRight className="text-gray-500" size={18} />
              </div>
            )}
          </div>
          <div className="mt-5">
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          </div>
        </div>
      </article>
    </Link>
  );
};

const AnimatedCounter = ({ value }: { value: number }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const spring = useSpring(0, { damping: 20, stiffness: 100, mass: 1 });

  useEffect(() => {
    if (isInView) spring.set(value);
  }, [isInView, value, spring]);

  useEffect(() => {
    const unsub = spring.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = new Intl.NumberFormat("id-ID").format(Math.round(latest));
      }
    });
    return () => unsub();
  }, [spring]);

  return <span ref={ref}>0</span>;
};

const StatCardSkeleton = () => (
  <div className="animate-pulse rounded-2xl border border-gray-200/80 bg-white p-6 text-center">
    <div className="mx-auto mb-4 h-10 w-10 rounded-lg bg-gray-200" />
    <div className="mx-auto h-8 w-24 rounded-md bg-gray-200" />
    <div className="mx-auto mt-2 h-4 w-20 rounded-md bg-gray-200" />
  </div>
);

const StatCard = ({
  icon,
  value,
  label,
  href,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  href: string;
}) => (
  <Link href={href} className="group block">
    <div className="flex h-full flex-col justify-center rounded-2xl border border-gray-200/80 bg-white p-6 text-center transition-all duration-300 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/10">
      <div className="mb-4 flex items-center justify-center">
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-2 text-gray-500 transition-colors duration-300 group-hover:border-blue-200 group-hover:bg-blue-50 group-hover:text-blue-600">
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900">
        <AnimatedCounter value={value} />
      </p>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
    </div>
  </Link>
);

// ---------- Page ----------
export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState("semua");
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // --- Select open/close control (reliable) ---
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const categoryWrapRef = useRef<HTMLDivElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);
  const ignoreNextFocusRef = useRef(false); // prevent reopen after closing via click

  const [stats, setStats] = useState<StatsData | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/stats");
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Gagal mengambil data statistik:", err);
      }
    };
    fetchStats();

    const onScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || isSearching) return;
    setIsSearching(true);

    try {
      const response = await fetch("/api/search/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (!response.ok) throw new Error("Gagal memulai sesi pencarian.");
      const { key } = await response.json();

      let path = "/search";
      switch (searchCategory) {
        case "mahasiswa":
          path = "/mahasiswa";
          break;
        case "dosen":
          path = "/dosen";
          break;
        case "prodi":
          path = "/prodi";
          break;
        case "pt":
          path = "/pt";
          break;
      }
      router.push(`${path}?key=${key}`);
    } catch (error) {
      console.error("Search initiation failed:", error);
      setIsSearching(false);
    }
  };

  // Close select BEFORE other elements process the click → ensures arrow animation
  const handleFormPointerDownCapture = (e: React.PointerEvent<HTMLFormElement>) => {
    if (!categoryWrapRef.current) return;
    const clickedInside = categoryWrapRef.current.contains(e.target as Node);
    if (!clickedInside) setIsSelectOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4 }}
      className="relative flex min-h-screen w-full flex-col bg-gray-50 text-gray-900 antialiased"
    >
      {/* subtle pattern */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-gradient-to-b from-blue-100/50 to-transparent" />
      <div
        className="absolute left-0 top-0 -z-20 h-full w-full bg-repeat opacity-40"
        style={{
          backgroundImage:
            "url('data:image/svg+xml,%3Csvg width=\\'60\\' height=\\'60\\' viewBox=\\'0 0 60 60\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'%23e2e8f0\\' fill-opacity=\\'0.4\\'%3E%3Cpath d=\\'M.5 1.5l1-1M2.5 3.5l1-1\\'/%3E%3C/g%3E%3C/svg%3E')",
        }}
        aria-hidden="true"
      />

      <NewFeaturePopup />

      <main className="mx-auto flex w-full max-w-4xl flex-grow flex-col px-4 pb-16 pt-16 sm:px-6 sm:pb-24 sm:pt-24">
        {/* Header */}
        <header className="text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-100 px-3 py-1.5 text-xs font-medium tracking-wide text-amber-800">
            <Info size={14} className="text-amber-600" />
            <span>Situs ini bukan laman resmi dari Kemdiktisaintek.</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
            Jelajahi Data
            <span className="mt-2 block text-blue-600">Pendidikan Tinggi</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-gray-600 sm:text-lg">
            Temukan informasi mahasiswa, dosen, program studi, dan perguruan tinggi di Indonesia secara cepat dan terintegrasi dengan data PDDikti.
          </p>
        </header>

        {/* Search */}
        <div className="mx-auto mt-12 w-full max-w-2xl">
          <form
            onSubmit={handleSearch}
            onPointerDownCapture={handleFormPointerDownCapture}
            className="w-full overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm transition-all duration-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
            role="search"
            aria-label="Pencarian DataDikti"
          >
            <div className="flex w-full flex-col sm:flex-row sm:items-center">
              {/* Category */}
              <div
                ref={categoryWrapRef}
                className="relative w-full border-b border-gray-200/80 sm:w-auto sm:border-b-0 group"
              >
                <select
                  ref={selectRef}
                  name="kategori"
                  value={searchCategory}
                  onChange={(e) => {
                    setSearchCategory(e.target.value);
                    setIsSelectOpen(false); // close on option select
                  }}
                  onFocus={() => {
                    if (ignoreNextFocusRef.current) {
                      ignoreNextFocusRef.current = false;
                      return; // prevent reopen after click-to-close
                    }
                    setIsSelectOpen(true);
                  }}
                  onBlur={() => setIsSelectOpen(false)}
                  onMouseDown={() => {
                    if (isSelectOpen) {
                      // click on select to close while focused (desktop): no blur fires
                      ignoreNextFocusRef.current = true;
                      setIsSelectOpen(false); // trigger arrow close animation
                    } else {
                      // opening
                      setIsSelectOpen(true);
                    }
                  }}
                  className="w-full appearance-none bg-transparent px-5 py-4 text-sm font-semibold text-gray-700 outline-none"
                  aria-label="Pilih kategori pencarian"
                  aria-expanded={isSelectOpen}
                >
                  <option value="semua">Semua</option>
                  <option value="mahasiswa">Mahasiswa</option>
                  <option value="dosen">Dosen</option>
                  <option value="prodi">Prodi</option>
                  <option value="pt">Perguruan Tinggi</option>
                </select>

                <motion.span
                  aria-hidden="true"
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2"
                  animate={{ rotate: isSelectOpen ? 180 : 0, scale: isSelectOpen ? 1.05 : 1 }}
                  whileHover={{ scale: 1.06 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                >
                  <ChevronDown size={16} className="text-gray-400" />
                </motion.span>
              </div>

              {/* Divider */}
              <div className="hidden h-8 w-px bg-gray-200 sm:block" />

              {/* Query + submit */}
              <div className="flex w-full items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSelectOpen(false)} // ensure close when focusing input
                  placeholder="Ketikkan kata kunci..."
                  className="w-full bg-transparent px-4 py-4 text-base text-gray-900 placeholder-gray-500 outline-none"
                  aria-label="Kata kunci"
                />
                <button
                  type="submit"
                  disabled={isSearching}
                  className="ml-1 mr-2 flex h-11 items-center justify-center rounded-lg bg-blue-600 px-4 text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-blue-400 sm:px-5"
                  aria-label="Cari"
                  onFocus={() => setIsSelectOpen(false)} // ensure close when focusing button
                >
                  {isSearching ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      <Search size={20} className="transition-all sm:mr-2" />
                      <span className="hidden font-semibold sm:inline">Cari</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Quick links */}
        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <MenuItem
            href="/mahasiswa"
            icon={<GraduationCap size={24} className="transition-colors text-gray-500 group-hover:text-blue-600" />}
            title="Pencarian Mahasiswa"
            description="Cari data mahasiswa di seluruh Indonesia berdasarkan nama atau NIM."
          />
          <MenuItem
            href="/dosen"
            icon={<User size={24} className="transition-colors text-gray-500 group-hover:text-blue-600" />}
            title="Pencarian Dosen"
            description="Telusuri data dosen, NIDN, beserta riwayat aktivitas mengajarnya."
          />
          <MenuItem
            href="/prodi"
            icon={<BookOpen size={24} className="transition-colors text-gray-500 group-hover:text-blue-600" />}
            title="Pencarian Program Studi"
            description="Dapatkan informasi lengkap mengenai program studi dan akreditasinya."
          />
          <MenuItem
            href="/pt"
            icon={<School size={24} className="transition-colors text-gray-500 group-hover:text-blue-600" />}
            title="Pencarian Perguruan Tinggi"
            description="Temukan profil, alamat, dan detail lain dari perguruan tinggi."
          />
        </div>

        {/* Stats */}
        <section className="mt-24">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Statistik Nasional</h2>
            <p className="mx-auto mt-3 max-w-2xl text-base text-gray-600">
              Data agregat dari PDDikti yang diperbarui secara berkala.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
            {stats ? (
              <>
                <StatCard href="/mahasiswa" icon={<GraduationCap size={24} />} value={stats.mahasiswa} label="Mahasiswa Aktif" />
                <StatCard href="/dosen" icon={<User size={24} />} value={stats.dosen} label="Dosen Aktif" />
                <StatCard href="/prodi" icon={<BookOpen size={24} />} value={stats.prodi} label="Program Studi" />
                <StatCard href="/pt" icon={<School size={24} />} value={stats.pt} label="Perguruan Tinggi" />
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

      {/* Back to top */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-8 right-8 rounded-full bg-blue-600 p-3 text-white shadow-lg transition-all duration-300 hover:scale-110 hover:bg-blue-700"
          aria-label="Kembali ke atas"
        >
          <ArrowUp size={24} />
        </button>
      )}
    </motion.div>
  );
} 
