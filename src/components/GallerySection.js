'use client';

import React from 'react';
import { Camera } from 'lucide-react';

export default function GallerySection() {
  const mockGaleri = [
    {
      id: "g1",
      foto_url: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600",
      keterangan: "Balayage Hair Color & Styling"
    },
    {
      id: "g2",
      foto_url: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600",
      keterangan: "Nail Art & Gel Manicure"
    },
    {
      id: "g3",
      foto_url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600",
      keterangan: "Smoothing & Hair Treatment"
    },
    {
      id: "g4",
      foto_url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600",
      keterangan: "Salon Interior & Comfort Wash Station"
    }
  ];

  return (
    <section id="galeri" className="mb-12">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xl font-bold text-gray-800 border-l-4 border-pink-500 pl-3">
          Galeri Hasil Karya Salon
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {mockGaleri.map((item) => (
          <div key={item.id} className="group relative overflow-hidden rounded-2xl bg-gray-100 shadow-sm border border-gray-100">
            <img 
              src={item.foto_url} 
              alt={item.keterangan}
              className="w-full h-48 object-cover group-hover:scale-105 transition duration-300" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex items-end p-4">
              <p className="text-white text-xs font-medium flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-pink-400" />
                {item.keterangan}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}