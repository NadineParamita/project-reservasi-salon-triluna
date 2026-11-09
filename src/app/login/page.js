'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Scissors, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = (e) => {
    e.preventDefault();
    console.log('Credential Login:', { email, password });
    alert('Login berhasil!');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-pink-50/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full p-8">
        
        {/* Header Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-pink-100 text-pink-600 rounded-full mb-2">
            <Scissors className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Selamat Datang Kembali</h2>
          <p className="text-xs text-gray-500 mt-1">Masuk untuk mengelola reservasi dan akun Anda</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Input Email */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input 
                type="email" 
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>
          </div>

          {/* Input Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2.5 rounded-lg transition text-sm shadow-md mt-2"
          >
            Masuk ke Akun
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-6">
          Belum memiliki akun?{' '}
          <Link href="/register" className="text-pink-600 font-semibold hover:underline">
            Daftar akun baru
          </Link>
        </p>
      </div>
    </div>
  );
}