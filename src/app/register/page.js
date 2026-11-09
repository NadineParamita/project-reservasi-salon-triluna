'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Scissors, User, Mail, Lock, Phone, UserCheck } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    password: '',
    no_hp: '',
    jenis_kelamin: 'perempuan'
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Data Registrasi:', formData);
    alert('Pendaftaran berhasil! Silakan login.');
  };

  return (
    <div className="min-h-screen bg-pink-50/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full p-8">
        
        {/* Header Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-pink-100 text-pink-600 rounded-full mb-2">
            <Scissors className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Daftar Akun Salon</h2>
          <p className="text-xs text-gray-500 mt-1">Buat akun untuk mulai membuat reservasi perawatan</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Input Nama */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Nama Lengkap</label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input 
                type="text" 
                name="nama"
                placeholder="Nama Anda"
                value={formData.nama}
                onChange={handleChange}
                required
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>
          </div>

          {/* Input Email */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input 
                type="email" 
                name="email"
                placeholder="nama@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>
          </div>

          {/* Input No HP */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Nomor HP / WhatsApp</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input 
                type="tel" 
                name="no_hp"
                placeholder="08123456789"
                value={formData.no_hp}
                onChange={handleChange}
                required
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>
          </div>

          {/* Input Jenis Kelamin */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Jenis Kelamin</label>
            <div className="relative">
              <UserCheck className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <select
                name="jenis_kelamin"
                value={formData.jenis_kelamin}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white"
              >
                <option value="perempuan">Perempuan</option>
                <option value="laki-laki">Laki-Laki</option>
              </select>
            </div>
          </div>

          {/* Input Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input 
                type="password" 
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2.5 rounded-lg transition text-sm shadow-md mt-2"
          >
            Daftar Akun Sekarang
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-6">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-pink-600 font-semibold hover:underline">
            Login di sini
          </Link>
        </p>
      </div>
    </div>
  );
}