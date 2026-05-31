import React, { useState } from 'react';
import { PlusCircle, Calendar, LineChart, FileSpreadsheet } from 'lucide-react';
import { ManualSale } from '../types';

interface ManualSalesFormProps {
  onAddSale: (sale: Omit<ManualSale, 'id'>) => void;
}

export default function ManualSalesForm({ onAddSale }: ManualSalesFormProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('Baju');
  const [amount, setAmount] = useState<number>(0);
  const [qty, setQty] = useState<number>(10);
  const [description, setDescription] = useState('');
  const [successMsg, setSuccessMsg] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || qty <= 0 || !description.trim()) return;

    onAddSale({
      date,
      category,
      amount,
      qty,
      description
    });

    setSuccessMsg(true);
    setDescription('');
    setAmount(0);
    setQty(10);

    setTimeout(() => {
      setSuccessMsg(false);
    }, 3000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl text-white">
      <div className="flex items-center space-x-2.5 mb-4">
        <PlusCircle className="w-5 h-5 text-teal-400" />
        <h4 className="font-semibold text-sm tracking-wide uppercase text-slate-200">
          Input Penjualan Manual (Offline / Cash)
        </h4>
      </div>

      <p className="text-xs text-slate-400 mb-5 leading-relaxed">
        Gunakan formulir ini untuk mencatat hasil transaksi yang diterima secara langsung / tunai (via telepon, toko fisik, atau event) agar pelaporan keuangan bulanan dan tahunan di sistem dashboard tetap akurat.
      </p>

      {successMsg && (
        <div className="mb-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-lg text-xs font-semibold flex items-center">
          <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-ping" />
          Data transaksi offline berhasil disimpan ke laporan keuangan!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tanggal Penjualan */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1 text-slate-500" />
              Tanggal Transaksi
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Kategori Produk */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Kategori Produk
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-500"
            >
              <option value="Baju">Baju</option>
              <option value="Almamater">Almamater</option>
              <option value="Jaket">Jaket</option>
              <option value="Kaos">Kaos & Polo</option>
              <option value="Kemeja">Kemeja PDL / PDH</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Jumlah Pcs (Qty) */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Jumlah Produk (Order Pcs)
            </label>
            <input
              type="number"
              min="1"
              required
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              placeholder="Contoh: 15"
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-500 font-mono"
            />
          </div>

          {/* Total Nilai Uang */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Total Nominal Omzet (Rupiah)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-mono">Rp</span>
              <input
                type="number"
                min="1000"
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="Total nilai pembayaran..."
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-teal-500 font-mono text-emerald-400"
              />
            </div>
          </div>
        </div>

        {/* Keterangan Detail */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Keterangan Klien & Spesifikasi Pesanan
          </label>
          <input
            type="text"
            required
            placeholder="Contoh: Pembuatan 15 stel jas kemeja Dinas Pajak, lunas tunai di tempat"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-500"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 text-slate-100 font-semibold py-2.5 px-4 rounded-lg text-xs tracking-wider uppercase transition-all duration-200 active:scale-95 shadow-md flex items-center justify-center space-x-2"
        >
          <span>Simpan Transaksi Ke Database Laporan</span>
        </button>
      </form>
    </div>
  );
}
