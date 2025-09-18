import Link from 'next/link';
import { GraduationCap, Github, Linkedin, Instagram } from 'lucide-react';

export const Footer = () => {
    const navLinks = [
        { href: '/mahasiswa', label: 'Mahasiswa' },
        { href: '/dosen', label: 'Dosen' },
        { href: '/prodi', label: 'Prodi' },
        { href: '/pt', label: 'Perguruan Tinggi' },
    ];

    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white border-t border-gray-200 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Kolom Kiri: Logo dan Deskripsi */}
                    <div className="lg:col-span-1 space-y-4">
                        <Link href="/" className="flex items-center gap-2">
                            <GraduationCap className="h-8 w-8 text-blue-600" />
                            <span className="font-bold text-xl text-gray-800">DataDIKTI</span>
                        </Link>
                        <p className="text-sm text-gray-500 max-w-xs">
                            Platform untuk menjelajahi data Pendidikan Tinggi di Indonesia secara mudah dan cepat.
                        </p>
                    </div>

                    {/* Kolom Kanan: Semua Link */}
                    <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-8">
                        <div>
                            <h3 className="font-semibold text-gray-800 tracking-wider uppercase text-sm">Menu</h3>
                            <ul className="mt-4 space-y-2">
                                {navLinks.map((link) => (
                                    <li key={link.href}>
                                        <Link href={link.href} className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800 tracking-wider uppercase text-sm">Referensi</h3>
                            <ul className="mt-4 space-y-2">
                               <li>
                                    <a href="https://pddikti.kemdiktisaintek.go.id" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                                        PDDIKTI
                                    </a>
                               </li>
                               <li>
                                    <a href="https://api-pddikti.ridwaanhall.com/" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                                        API Publik
                                    </a>
                               </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800 tracking-wider uppercase text-sm">Sosial Media</h3>
                            <div className="flex items-center space-x-4 mt-4">
                                <a href="https://github.com/azharanggakusuma" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 transition-colors">
                                    <Github size={20} />
                                </a>
                                <a href="https://www.instagram.com/azharanggakusuma/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 transition-colors">
                                    <Instagram size={20} />
                                </a>
                                 <a href="https://www.linkedin.com/in/azharanggakusuma/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 transition-colors">
                                    <Linkedin size={20} />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bagian Bawah Footer */}
                <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between">
                    <p className="text-xs text-gray-500 text-center sm:text-left">
                        &copy; {currentYear} Dikembangkan oleh{" "}
                        <a
                            href="https://azharanggakusuma.xyz"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium hover:text-blue-600 transition-colors"
                        >
                            Azharangga Kusuma
                        </a>.
                    </p>
                     <p className="text-xs text-gray-500 mt-4 sm:mt-0">
                        Dibangun dengan <span className="font-semibold">Next.js</span> dan <span className="font-semibold">Tailwind CSS</span>.
                    </p>
                </div>
            </div>
        </footer>
    );
};