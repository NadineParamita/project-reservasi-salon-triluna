'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Calendar, Clock, User, CheckCircle2, XCircle, AlertCircle, Trash2 } from 'lucide-react';

export default function DashboardPelanggan() {
  const [reservasiList, setReservasiList] = useState([
    {
      id: "res-001",
      layanan: "Potong & Styling Hair",
      staf: "Siti Rahma",
      tanggal: "2026-11-12",
      jamMulai: "10:00",
      jamSelesai: "10:45",
      totalBiaya: 75000,
      status: "pending" 
    },
    {
      id: "res-002",
      layanan: "Hair Spa & Creambath",
      staf: "Dewi Lestari",
      tanggal: "2026-10-20",
      jamMulai: "14:00",
      jamSelesai: "15:00",
      totalBiaya: 120000,
      status: "lunas"
    },
    {
      id: "res-003",
      layanan: "Gel Manicure Premium",
      staf: "Dewi Lestari",
      tanggal: "2026-09-15",
      jamMulai: "11:00",
      jamSelesai: "11:50",
      totalBiaya: 90000,
      status: "selesai"
    }
  ]);

  const handleCancelBooking = (id) => {
    const konfirmasi = confirm("Apakah Anda yakin ingin membatalkan reservasi ini?");
    if (konfirmasi) {
      setReservasiList(prev => 
        prev.map(item => item.id === id ? { ...item, status: "dibatalkan" } : item)
      );
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'lunas':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" /> Lunas / Dikonfirmasi
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-600 border border-amber-200 rounded-full text-xs font-semibold">
            <AlertCircle className="w-3.5 h-3.5" /> Menunggu Pembayaran
          </span>
        );
      case 'selesai':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded-full text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" /> Selesai
          </span>
        );
      case 'dibatalkan':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 text-red-600 border border-red-200 rounded-full text-xs font-semibold">
            <XCircle className="w-3.5 h-3.5" /> Dibatalkan
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-12">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 mt-8">
        {/* Profile Card Header */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-bold text-xl">
              <User className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Akun Saya</h1>
              <p className="text-xs text-gray-500">Kelola dan lihat riwayat reservasi Anda</p>
            </div>
          </div>
        </div>

        {/* Daftar Reservasi */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-800 border-l-4 border-pink-500 pl-3">
            Riwayat & Status Reservasi
          </h2>

          {reservasiList.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center text-gray-500 border border-gray-100">
              Belum ada riwayat reservasi.
            </div>
          ) : (
            reservasiList.map((item) => (
              <div 
                key={item.id} 
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg text-gray-800">{item.layanan}</h3>
                    {getStatusBadge(item.status)}
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-gray-400" /> Stylist: <strong className="text-gray-700">{item.staf}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" /> Tanggal: <strong className="text-gray-700">{item.tanggal}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-400" /> Jam: <strong className="text-gray-700">{item.jamMulai} - {item.jamSelesai} WIB</strong>
                    </span>
                  </div>

                  <div className="text-sm font-extrabold text-pink-600 pt-1">
                    Total: Rp {item.totalBiaya.toLocaleString('id-ID')}
                  </div>
                </div>

                {/* Tombol Pembatalan */}
                <div>
                  {item.status === 'pending' && (
                    <button
                      onClick={() => handleCancelBooking(item.id)}
                      className="w-full md:w-auto px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5"
                    >
                      <Trash2 className="w-4 h-4" /> Batalkan Reservasi
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}