'use client';

import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, CheckCircle2 } from 'lucide-react';
import PaymentModal from './PaymentModal';

export default function BookingForm({ selectedLayanan, selectedStaf }) {
  const [tanggal, setTanggal] = useState('');
  const [jamMulai, setJamMulai] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  const timeSlots = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

  const calculateJamSelesai = (timeStr, durationMinutes) => {
    if (!timeStr || !durationMinutes) return '';
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes + durationMinutes);
    return date.toTimeString().substring(0, 5);
  };

  const jamSelesai = calculateJamSelesai(jamMulai, selectedLayanan?.durasi_menit);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedLayanan || !selectedStaf || !tanggal || !jamMulai) {
      alert('Harap lengkapi semua data reservasi!');
      return;
    }
    // Buka Modal Pembayaran
    setIsModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    setIsPaid(true);
  };

  if (isPaid) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center max-w-lg mx-auto">
        <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-800">Reservasi Terkonfirmasi!</h3>
        <p className="text-gray-500 text-sm mt-2">
          Terima kasih! Reservasi <span className="font-semibold text-gray-700">{selectedLayanan?.nama}</span> bersama <span className="font-semibold text-gray-700">{selectedStaf?.nama}</span> pada <span className="font-semibold text-gray-700">{tanggal}</span> jam <span className="font-semibold text-gray-700">{jamMulai} WIB</span> telah lunas.
        </p>
        <button 
          onClick={() => {
            setIsPaid(false);
            setTanggal('');
            setJamMulai('');
          }}
          className="mt-6 bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg text-sm font-medium transition"
        >
          Reservasi Lainnya
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm max-w-2xl mx-auto">
        <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">
          Jadwal & Konfirmasi Reservasi
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-pink-50/50 p-4 rounded-xl border border-pink-100">
            <div>
              <span className="text-xs text-gray-500 font-medium block">Layanan:</span>
              <span className="font-semibold text-gray-800">{selectedLayanan ? selectedLayanan.nama : 'Belum dipilih'}</span>
              {selectedLayanan && (
                <p className="text-xs text-pink-600 font-bold mt-1">
                  Rp {selectedLayanan.harga.toLocaleString('id-ID')} ({selectedLayanan.durasi_menit} mnt)
                </p>
              )}
            </div>
            <div>
              <span className="text-xs text-gray-500 font-medium block">Staf / Stylist:</span>
              <span className="font-semibold text-gray-800">{selectedStaf ? selectedStaf.nama : 'Belum dipilih'}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-pink-500" /> Pilih Tanggal
            </label>
            <input 
              type="date" 
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
              className="w-full p-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-pink-500" /> Pilih Jam Kedatangan
            </label>
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map((jam) => (
                <button
                  type="button"
                  key={jam}
                  onClick={() => setJamMulai(jam)}
                  className={`py-2 text-sm font-medium rounded-lg border transition ${
                    jamMulai === jam
                      ? 'bg-pink-500 text-white border-pink-500 shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-pink-300'
                  }`}
                >
                  {jam}
                </button>
              ))}
            </div>
            {jamMulai && (
              <p className="text-xs text-gray-500 mt-2">
                Estimasi selesai: <span className="font-semibold text-gray-700">{jamSelesai} WIB</span>
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={!selectedLayanan || !selectedStaf || !tanggal || !jamMulai}
            className={`w-full py-3 rounded-xl font-semibold transition text-sm ${
              selectedLayanan && selectedStaf && tanggal && jamMulai
                ? 'bg-pink-500 hover:bg-pink-600 text-white shadow-md'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Lanjut ke Pembayaran
          </button>
        </form>
      </div>

      {/* Pop Up Modal Pembayaran */}
      <PaymentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        bookingData={{ layanan: selectedLayanan, staf: selectedStaf, tanggal, jamMulai }}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </>
  );
}