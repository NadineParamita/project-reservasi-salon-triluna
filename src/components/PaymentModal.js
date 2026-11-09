'use client';

import React, { useState } from 'react';
import { CreditCard, Wallet, Banknote, CheckCircle, X } from 'lucide-react';

export default function PaymentModal({ isOpen, onClose, bookingData, onPaymentSuccess }) {
  const [selectedMethod, setSelectedMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);

  if (!isOpen || !bookingData) return null;

  const paymentMethods = [
    { id: 'qris', nama: 'QRIS / E-Wallet (Gopay, OVO, ShopeePay)', icon: Wallet },
    { id: 'transfer', nama: 'Transfer Bank (BCA, Mandiri, BRI)', icon: CreditCard },
    { id: 'cash', nama: 'Bayar di Salon (Cash / Tunai)', icon: Banknote },
  ];

  const handlePay = () => {
    if (!selectedMethod) {
      alert('Silakan pilih metode pembayaran!');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsDone(true);
      
      setTimeout(() => {
        onPaymentSuccess();
        setIsDone(false);
        onClose();
      }, 2000);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative animate-in fade-in zoom-in duration-200">
        
        {/* Tombol Close */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {!isDone ? (
          <>
            <h3 className="text-xl font-bold text-gray-800 mb-1">Pembayaran Reservasi</h3>
            <p className="text-xs text-gray-500 mb-4">Selesaikan pembayaran untuk mengonfirmasi jadwal Anda.</p>

            {/* Ringkasan Tagihan */}
            <div className="bg-gray-50 p-4 rounded-xl mb-6 space-y-2 border border-gray-100">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Layanan:</span>
                <span className="font-semibold text-gray-800">{bookingData.layanan?.nama}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Stylist:</span>
                <span className="font-semibold text-gray-800">{bookingData.staf?.nama}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Jadwal:</span>
                <span className="font-semibold text-gray-800">{bookingData.tanggal} ({bookingData.jamMulai} WIB)</span>
              </div>
              <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
                <span className="text-sm font-bold text-gray-800">Total Biaya:</span>
                <span className="text-lg font-extrabold text-pink-600">
                  Rp {bookingData.layanan?.harga.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Pilihan Metode Pembayaran */}
            <div className="space-y-3 mb-6">
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Pilih Metode Pembayaran
              </label>
              {paymentMethods.map((method) => {
                const IconComponent = method.icon;
                return (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`w-full p-3.5 rounded-xl border flex items-center gap-3 text-left transition ${
                      selectedMethod === method.id
                        ? 'border-pink-500 bg-pink-50/50 text-pink-700 ring-1 ring-pink-500'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <IconComponent className={`w-5 h-5 ${selectedMethod === method.id ? 'text-pink-600' : 'text-gray-400'}`} />
                    <span className="text-sm font-medium">{method.nama}</span>
                  </button>
                );
              })}
            </div>

            {/* Tombol Konfirmasi Bayar */}
            <button
              onClick={handlePay}
              disabled={isProcessing || !selectedMethod}
              className={`w-full py-3 rounded-xl font-semibold transition text-sm flex items-center justify-center gap-2 ${
                selectedMethod && !isProcessing
                  ? 'bg-pink-500 hover:bg-pink-600 text-white shadow-md'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isProcessing ? 'Memproses Pembayaran...' : 'Konfirmasi & Bayar Sekarang'}
            </button>
          </>
        ) : (
          /* Tampilan Sukses Pembayaran */
          <div className="text-center py-6">
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-3" />
            <h4 className="text-xl font-bold text-gray-800">Pembayaran Berhasil!</h4>
            <p className="text-sm text-gray-500 mt-1">
              Status reservasi Anda kini <span className="font-semibold text-emerald-600">Lunas / Dikonfirmasi</span>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}