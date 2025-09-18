import Link from 'next/link';
import { GraduationCap } from 'lucide-react';

export const Footer = () => {
    return (
        <footer className="bg-white border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row items-center justify-between py-6">
                    
                    {/* Sisi Kiri: Logo dan Nama (disamakan dengan Navbar) */}
                    <div className="flex items-center gap-2 mb-4 sm:mb-0">
                        <GraduationCap className="h-8 w-8 text-blue-600" />
                        <span className="font-bold text-lg text-gray-800">DataDIKTI</span>
                    </div>

                    {/* Sisi Kanan: Kredit dan Disclaimer */}
                    <div className="text-center sm:text-right text-xs text-gray-500">
                         <p className="text-xs">
                            Situs ini menggunakan data dari{" "}
                            <a
                                href="https://pddikti.kemdiktisaintek.go.id"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-gray-700 hover:text-blue-600 transition-colors"
                            >
                                PDDIKTI
                            </a>.
                        </p>
                        <p>
                            Dikembangkan oleh{" "}
                            <a
                                href="https://azharanggakusuma.xyz"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-gray-700 hover:text-blue-600 transition-colors"
                            >
                                Azharangga Kusuma
                            </a>
                        </p>
                    </div>

                </div>
            </div>
        </footer>
    );
};