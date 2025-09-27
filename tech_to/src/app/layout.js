import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "TechTO Hackathon App -- OperAid",
  description: "AI-powered assistant for surgeons",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-gray-50 min-h-screen flex flex-col`}
      >
        {/* Header */}
        <header className="w-full py-6 px-8 shadow-md bg-white backdrop-blur-md fixed top-0 left-0 z-20 border-b border-gray-200">
          <h1 className="text-3xl font-semibold text-gray-800 inline-block">
            OperAid •
          </h1>
          <h1 className="text-3xl font-semibold text-gray-800 inline-block ml-2">
            TechTO Hackathon App
          </h1>
          <h2 className="text-lg text-gray-600 mt-1">
            AI-powered assistant for surgeons
          </h2>
        </header>

        {/* Main content container */}
        <main className="flex-1 pt-32 w-full max-w-5xl mx-auto px-6 md:px-8 lg:px-12">
          {children}
        </main>

        {/* Footer */}
        <footer className="w-full py-6 mt-12 text-center text-gray-500 text-sm border-t border-gray-200">
          © {new Date().getFullYear()} TechTO Hackathon
        </footer>
      </body>
    </html>
  );
}
