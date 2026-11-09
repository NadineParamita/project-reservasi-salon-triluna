'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import ServiceCard from '@/components/ServiceCard';
import StaffCard from '@/components/StaffCard';
import BookingForm from '@/components/BookingForm';
import GallerySection from '@/components/GallerySection';
import { mockLayanan, mockStaf } from '@/data/mockData';

export default function Home() {
  const [selectedLayanan, setSelectedLayanan] = useState(null);
  const [selectedStaf, setSelectedStaf] = useState(null);

  return (
    <main className="min-h-screen bg-gray-50 pb-16">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 mt-8">
        {/* Banner Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Sistem Reservasi Salon
          </h1>
          <p className="text-gray-500 mt-2">
            Pilih layanan, tentukan staf favoritmu, dan nikmati perawatan rambut & kecantikan terbaik.
          </p>
        </div>

        {/* 1. Katalog Layanan */}
        <section id="layanan" className="mb-12">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-l-4 border-pink-500 pl-3">
            1. Pilih Layanan Salon
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mockLayanan.map((item) => (
              <ServiceCard 
                key={item.id} 
                layanan={item} 
                onSelect={(layanan) => {
                  setSelectedLayanan(layanan);
                  document.getElementById('staf')?.scrollIntoView({ behavior: 'smooth' });
                }} 
              />
            ))}
          </div>
        </section>

        {/* 2. Pilih Staf */}
        <section id="staf" className="mb-12">
          <h2 className="text-xl font-bold text-gray-800 mb-2 border-l-4 border-pink-500 pl-3">
            2. Pilih Staf / Hair Stylist
          </h2>
          {selectedLayanan && (
            <p className="text-sm text-pink-600 mb-4 font-medium">
              Layanan terpilih: <span className="underline">{selectedLayanan.nama}</span>
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mockStaf.map((staf) => (
              <StaffCard 
                key={staf.id} 
                staf={staf} 
                isSelected={selectedStaf?.id === staf.id}
                onSelect={(staf) => {
                  setSelectedStaf(staf);
                  document.getElementById('reservasi')?.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            ))}
          </div>
        </section>

        {/* 3. Galeri Foto Hasil Salon */}
        <GallerySection />

        {/* 4. Jadwal & Konfirmasi Reservasi */}
        <section id="reservasi">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-l-4 border-pink-500 pl-3">
            3. Jadwal & Konfirmasi Reservasi
          </h2>
          <BookingForm 
            selectedLayanan={selectedLayanan}
            selectedStaf={selectedStaf}
          />
        </section>
      </div>
    </main>
  );
}