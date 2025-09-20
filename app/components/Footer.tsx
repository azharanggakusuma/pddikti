// app/components/Footer.tsx
import Link from 'next/link';
import Image from 'next/image';
import { Github, Linkedin, Instagram } from 'lucide-react';

export const Footer = () => {
    const navLinks = [
        { href: '/mahasiswa', label: 'Mahasiswa' },
        { href: '/dosen', label: 'Dosen' },
        { href: '/prodi', label: 'Prodi' },
        { href: '/pt', label: 'Perguruan Tinggi' },
    ];

    const socialLinks = [
        { href: "https://github.com/azharanggakusuma", icon: <Github size={20} />, label: "GitHub" },
        { href: "https://www.instagram.com/azharanggakusuma/", icon: <Instagram size={20} />, label: "Instagram" },
        { href: "https://www.linkedin.com/in/azharanggakusuma/", icon: <Linkedin size={20} />, label: "LinkedIn" },
    ];

    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    
                    {/* Kolom Kiri: Branding dan Sosial Media */}
                    <div className="lg:col-span-5">
                        {/* --- MODIFICATION START --- */}
                        {/* Menambahkan margin kiri negatif untuk menggeser logo */}
                        <Link href="/" className="inline-flex items-center -ml-1">
                            <div className="relative w-40 h-10">
                                <Image
                                    src="/logo.png"
                                    alt="DataDIKTI Logo"
                                    fill
                                    className="object-contain"
                                />
                             </div>
                        </Link>
                        {/* --- MODIFICATION END --- */}
                        <p className="mt-5 text-base text-gray-500 leading-relaxed max-w-md">
                            Sebuah platform independen untuk menjelajahi data Pendidikan Tinggi di Indonesia dengan antarmuka yang cepat dan modern.
                        </p>
                        <div className="flex items-center space-x-4 mt-8">
                            {socialLinks.map((link) => (
                                <a 
                                    key={link.label}
                                    href={link.href} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full text-gray-500 hover:bg-blue-600 hover:text-white transition-all duration-300"
                                    aria-label={link.label}
                                >
                                    {link.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Kolom Kanan: Navigasi dan Referensi */}
                    <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
                        <div>
                            <h3 className="font-semibold text-gray-900 tracking-wider uppercase text-sm">Menu Utama</h3>
                            <ul className="mt-4 space-y-3">
                                {navLinks.map((link) => (
                                    <li key={link.href}>
                                        <Link href={link.href} className="text-base text-gray-500 hover:text-blue-600 transition-colors">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 tracking-wider uppercase text-sm">Referensi</h3>
                            <ul className="mt-4 space-y-3">
                               <li>
                                    <a href="https://pddikti.kemdikbud.go.id" target="_blank" rel="noopener noreferrer" className="text-base text-gray-500 hover:text-blue-600 transition-colors">
                                        Situs PDDIKTI
                                    </a>
                               </li>
                               <li>
                                    <a href="https://api-pddikti.ridwaanhall.com/" target="_blank" rel="noopener noreferrer" className="text-base text-gray-500 hover:text-blue-600 transition-colors">
                                        API Publik
                                    </a>
                               </li>
                            </ul>
                        </div>
                         <div>
                            <h3 className="font-semibold text-gray-900 tracking-wider uppercase text-sm">Sumber Daya</h3>
                            <ul className="mt-4 space-y-3">
                               <li>
                                    <Link href="/about" className="text-base text-gray-500 hover:text-blue-600 transition-colors">
                                        Tentang Situs Ini
                                    </Link>
                               </li>
                               <li>
                                    <Link href="/faq" className="text-base text-gray-500 hover:text-blue-600 transition-colors">
                                        Pusat Bantuan
                                    </Link>
                               </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bagian Bawah Footer */}
                <div className="mt-16 pt-8 border-t border-gray-200 text-center">
                    <p className="text-sm text-gray-500">
                        &copy; {currentYear} Dikembangkan oleh{" "}
                        <a
                            href="https://azharanggakusuma.xyz"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-gray-600 hover:text-blue-600 transition-colors"
                        >
                            Azharangga Kusuma
                        </a>.
                    </p>
                </div>
            </div>
        </footer>
    );
};