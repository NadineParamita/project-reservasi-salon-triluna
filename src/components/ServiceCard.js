import React from 'react';
import { Clock } from 'lucide-react';

export default function ServiceCard({ layanan, onSelect }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-gray-800">{layanan.nama}</h3>
          <span className="bg-pink-50 text-pink-600 text-xs font-semibold px-2.5 py-1 rounded-full">
            {layanan.kategori}
          </span>
        </div>
        <p className="text-gray-600 text-sm mb-4 leading-relaxed">{layanan.deskripsi}</p>
      </div>

      <div>
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4 pt-3 border-t border-gray-50">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>{layanan.durasi_menit} Menit</span>
          </div>
          <div className="font-bold text-lg text-pink-600">
            Rp {layanan.harga.toLocaleString('id-ID')}
          </div>
        </div>

        <button 
          onClick={() => onSelect(layanan)}
          className="w-full bg-pink-500 hover:bg-pink-600 text-white font-medium py-2 rounded-lg transition text-sm"
        >
          Pilih Layanan
        </button>
      </div>
    </div>
  );
}