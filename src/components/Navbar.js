import React from 'react';
import Link from 'next/link';
import { Calendar, User, Scissors, Image as GalleryIcon } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Scissors className="h-6 w-6 text-pink-500" />
            <span className="font-bold text-xl text-gray-800 tracking-wide">
              BeautySalon
            </span>
          </Link>

          {/* Navigasi Links */}
          <div className="flex space-x-6 text-sm font-medium text-gray-600">
            <a href="/#layanan" className="hover:text-pink-500 transition">Layanan</a>
            <a href="/#staf" className="hover:text-pink-500 transition">Staf</a>
            <a href="/#galeri" className="hover:text-pink-500 transition flex items-center gap-1">
              <GalleryIcon className="w-4 h-4" /> Galeri
            </a>
            <a href="/#reservasi" className="hover:text-pink-500 transition flex items-center gap-1">
              <Calendar className="w-4 h-4" /> Reservasi
            </a>
          </div>

          {/* Tombol Akun Saya mengarah ke /dashboard */}
          <div>
            <Link 
              href="/dashboard" 
              className="flex items-center gap-2 bg-pink-50 text-pink-600 px-4 py-2 rounded-full font-medium text-sm hover:bg-pink-600 hover:text-white transition"
            >
              <User className="w-4 h-4" /> Akun Saya
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}