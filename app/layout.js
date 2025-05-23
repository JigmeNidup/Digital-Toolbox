import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Digital Tools",
  description: "Digital toolbox for document conversion application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="bg-black shadow-md p-2 flex items-center justify-between">
          <Link href={"/"}>
            <div className="flex items-center">
              <img
                src="/images/logo.png"
                alt="iLovePDF Logo"
                className="h-12 mr-2"
              />
            </div>
          </Link>
        </header>
        <main className="min-h-screen">{children}</main>
        <footer className="bg-gray-800 text-white py-8">
          {/* Copyright */}
          <div className="border-t border-gray-700 pt-6 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} DT. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
