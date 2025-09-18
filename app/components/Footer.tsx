import Link from 'next/link';

export const Footer = () => {
    return (
        <footer className="w-full text-center py-8 text-sm text-gray-500 bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
                <div className="border-t border-gray-200 pt-8">
                    <p>
                        Dikembangkan oleh{" "}
                        <a
                            href="https://azharanggakusuma.dev"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-blue-600 hover:underline"
                        >
                            Azharangga Kusuma
                        </a>{" "}
                        menggunakan <span className="font-semibold">Next.js</span> dan{" "}
                        <span className="font-semibold">Tailwind CSS</span>
                    </p>
                </div>
            </div>
        </footer>
    );
};