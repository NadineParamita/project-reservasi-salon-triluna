'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Search, Filter, CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react';

export default function AdminTransaksiPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('semua');

  const [transaksiList, setTransaksiList] = useState([
    {
      id: "RES-001",
      pelanggan: "Annisa Putri",
      noHp: "081234567890",
      layanan: "Potong & Styling Hair",
      staf: "Siti Rahma",
      tanggal: "2026-11-12",
      jam: "10:00 WIB",
      totalBiaya: 75000,
      metodePembayaran: "QRIS",
      status: "pending"
    },
    {
      id: "RES-002",
      pelanggan: "Rina Wijaya",
      noHp: "085712345678",
      layanan: "Hair Spa & Creambath",
      staf: "Dewi Lestari",
      tanggal: "2026-11-10",
      jam: "14:00 WIB",
      totalBiaya: 120000,
      metodePembayaran: "Transfer Bank",
      status: "lunas"
    },
    {
      id: "RES-003",
      pelanggan: "Budi Pratama",
      noHp: "089698765432",
      layanan: "Gel Manicure Premium",
      staf: "Dewi Lestari",
      tanggal: "2026-11-08",
      jam: "11:00 WIB",
      totalBiaya: 90000,
      metodePembayaran: "Cash",
      status: "selesai"
    }
  ]);

  const handleUpdateStatus = (id, statusBaru) => {
    setTransaksiList(prev => 
      prev.map(item => item.id === id ? { ...item, status: statusBaru } : item)
    );
  };

  const filteredTransaksi = transaksiList.filter(item => {
    const matchSearch = item.pelanggan.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = filterStatus === 'semua' || item.status === filterStatus;
    return matchSearch && matchFilter;
  });

  return (
    <main className="min-h-screen bg-gray-50 pb-12">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 mt-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard Admin: Kelola Transaksi</h1>
            <p className="text-xs text-gray-500">Konfirmasi reservasi, perbarui status pembayaran, dan rekap data</p>
          </div>
        </div>

        {/* Filter & Pencarian */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input 
              type="text" 
              placeholder="Cari berdasarkan nama pelanggan atau Kode ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="p-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pink-300 text-gray-700"
            >
              <option value="semua">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="lunas">Lunas</option>
              <option value="selesai">Selesai</option>
              <option value="dibatalkan">Dibatalkan</option>
            </select>
          </div>
        </div>

        {/* Tabel Data Transaksi */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs uppercase font-bold text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="p-4">ID / Pelanggan</th>
                  <th className="p-4">Layanan & Stylist</th>
                  <th className="p-4">Jadwal</th>
                  <th className="p-4">Total Biaya</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Aksi Konfirmasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTransaksi.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center p-8 text-gray-400">
                      Tidak ada data transaksi yang ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredTransaksi.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition">
                      <td className="p-4">
                        <span className="font-bold text-gray-800 block">{item.pelanggan}</span>
                        <span className="text-xs text-gray-400">{item.id} • {item.noHp}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-gray-700 block">{item.layanan}</span>
                        <span className="text-xs text-pink-600">Stylist: {item.staf}</span>
                      </td>
                      <td className="p-4">
                        <span className="block text-gray-700">{item.tanggal}</span>
                        <span className="text-xs text-gray-400">{item.jam}</span>
                      </td>
                      <td className="p-4 font-bold text-gray-800">
                        Rp {item.totalBiaya.toLocaleString('id-ID')}
                        <span className="block text-xs font-normal text-gray-400">{item.metodePembayaran}</span>
                      </td>
                      <td className="p-4">
                        {item.status === 'pending' && <span className="px-2.5 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-semibold border border-amber-200">Pending</span>}
                        {item.status === 'lunas' && <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-semibold border border-emerald-200">Lunas</span>}
                        {item.status === 'selesai' && <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold border border-blue-200">Selesai</span>}
                        {item.status === 'dibatalkan' && <span className="px-2.5 py-1 bg-red-50 text-red-600 rounded-full text-xs font-semibold border border-red-200">Dibatalkan</span>}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {item.status === 'pending' && (
                            <button 
                              onClick={() => handleUpdateStatus(item.id, 'lunas')}
                              className="p-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg text-xs font-medium transition flex items-center gap-1"
                              title="Tandai Lunas"
                            >
                              <CheckCircle className="w-4 h-4" /> Konfirmasi Bayar
                            </button>
                          )}
                          {item.status === 'lunas' && (
                            <button 
                              onClick={() => handleUpdateStatus(item.id, 'selesai')}
                              className="p-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-xs font-medium transition flex items-center gap-1"
                              title="Tandai Selesai"
                            >
                              <CheckCircle className="w-4 h-4" /> Selesaikan
                            </button>
                          )}
                          {item.status !== 'dibatalkan' && item.status !== 'selesai' && (
                            <button 
                              onClick={() => handleUpdateStatus(item.id, 'dibatalkan')}
                              className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-medium transition"
                              title="Batalkan Transaksi"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}