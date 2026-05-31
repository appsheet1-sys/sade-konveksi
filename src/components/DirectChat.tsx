import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, X, User, ShieldCheck, CheckCheck } from 'lucide-react';
import { ChatMessage } from '../types';

interface DirectChatProps {
  storeName: string;
}

export default function DirectChat({ storeName }: DirectChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init-1',
      sender: 'admin',
      text: `Halo! Selamat datang di ${storeName}. Kami siap melayani pembuatan baju, jas almamater, jaket, kaos polo, kemeja PDL, dan kustom konveksi lainnya.`,
      time: '09:00'
    },
    {
      id: 'msg-init-2',
      sender: 'admin',
      text: 'Minimal pemesanan kami adalah 5 pcs per desain. Ada yang bisa kami bantu mengenai detail spesifikasi bahan atau perkiraan harga?',
      time: '09:01'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: 'msg-user-' + Date.now(),
      sender: 'customer',
      text: inputText,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate smart owner response based on keywords
    setTimeout(() => {
      let botResponse = 'Terima kasih atas pesonanya! Tim desainer & penjahit kami akan segera memeriksa detail pertanyaan Anda. Silakan isi juga detail pesanan Anda melalui katalog di halaman utama.';
      const textLower = userMsg.text.toLowerCase();

      if (textLower.includes('bahan') || textLower.includes('kain') || textLower.includes('material')) {
        botResponse = 'Untuk bahan, kami memakai Drill High Twist (Almamater), Taslan Balon Waterproof & Baby Canvas (Jaket), serta Cotton Combed 30s & Pique Premium (Kaos & Polo). Semua bahan premium bersertifikat nyaman dipake!';
      } else if (textLower.includes('harga') || textLower.includes('biaya') || textLower.includes('ongkir') || textLower.includes('ongkos')) {
        botResponse = 'Harga dipengaruhi oleh jumlah pesanan (makin banyak makin murah!), jenis bahan, dan detail bordiran. Di menu detail produk kami juga mencantumkan harga spesifik per ukuran m, l, xl lho!';
      } else if (textLower.includes('cepat') || textLower.includes('buru-buru') || textLower.includes('deadline') || textLower.includes('berapa hari')) {
        botResponse = 'Rata-rata waktu pengerjaan kami berkisar antara 7 hingga 14 hari kerja setelah desain disepakati dan pembayaran DP diterima. Jika mendesak, bisa kami koordinasikan dengan tim produksi kilat!';
      } else if (textLower.includes('minimal') || textLower.includes('paling dikit') || textLower.includes('min order')) {
        botResponse = 'Batas minimal order adalah 5 pcs per satu jenis produk. Anda dapat mengombinasikan berbagai ukuran (misalnya 2 M, 2 L, 1 XL) dalam satu transaksi tersebut sesuai kebutuhan!';
      } else if (textLower.includes('baju') || textLower.includes('almamater') || textLower.includes('jaket')) {
        botResponse = 'Tentu saja! Kami adalah spesialis jaket bomber, almamater kampus/organisasi, polo shirt seragam, dan kemeja kerja lapangan PDL. Anda bisa memilih warna kustom apa saja!';
      } else if (textLower.includes('halo') || textLower.includes('siang') || textLower.includes('pagi') || textLower.includes('hai')) {
        botResponse = 'Halo! Senang bisa menyapa Anda kembali. Ada yang bisa diproduksikan hari ini? Kami siap buatkan desain draf mockup gratis!';
      }

      const ownerMsg: ChatMessage = {
        id: 'msg-admin-' + Date.now(),
        sender: 'admin',
        text: botResponse,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      };

      setIsTyping(false);
      setMessages(prev => [...prev, ownerMsg]);
    }, 1200);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        id="btn-floating-chat"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-teal-600 hover:bg-slate-900 text-white rounded-full p-4 shadow-2xl flex items-center justify-center space-x-2 border-2 border-teal-500/20 transition-all duration-300 hover:scale-105 active:scale-95 group"
      >
        <MessageSquare className="w-6 h-6 animate-pulse group-hover:scale-110" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 font-medium text-sm whitespace-nowrap">
          Hubungi Pemilik (Aktif)
        </span>
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border border-white" />
      </button>

      {/* Chat Window modal */}
      {isOpen && (
        <div
          id="chat-modal-window"
          className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-2rem)] h-[500px] z-50 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 to-teal-950 p-4 border-b border-slate-800 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center border border-teal-400">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-slate-900" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm truncate">{storeName}</h4>
                <p className="text-[10px] text-emerald-400 flex items-center font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-ping" />
                  Pemilik Toko Online
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Message Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/60 styled-scrollbar">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'customer' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center space-x-1 text-[10px] text-slate-500 mb-1 px-1">
                  {msg.sender === 'admin' ? (
                    <>
                      <span className="font-semibold text-teal-400">Pemilik Toko</span>
                      <span>•</span>
                    </>
                  ) : (
                    <>
                      <span className="font-semibold text-teal-300">Anda (Pelanggan)</span>
                      <span>•</span>
                    </>
                  )}
                  <span>{msg.time}</span>
                </div>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-md line-clamp-none ${
                    msg.sender === 'customer'
                      ? 'bg-teal-600 text-white rounded-tr-none'
                      : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700/50'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                </div>
                {msg.sender === 'customer' && (
                  <div className="text-[10px] text-teal-400 mt-1 flex items-center font-mono space-x-1 mr-1">
                    <span>Terkirim</span>
                    <CheckCheck className="w-3 h-3" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex flex-col items-start">
                <div className="text-[10px] text-slate-400 mb-1 px-1 font-mono">
                  Pemilik sedang mengetik...
                </div>
                <div className="bg-slate-800 text-slate-300 rounded-2xl rounded-tl-none px-4 py-3 text-sm border border-slate-700 flex space-x-1 items-center">
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick FAQ Suggestor Badges */}
          <div className="bg-slate-950 p-2 border-t border-slate-800/60 overflow-x-auto whitespace-nowrap flex space-x-2">
            {[
              'Minimal Order?',
              'Tanya Detail Bahan Kain 🧵',
              'Perkiraan Harga & Ongkos?',
              'Berapa Lama Pengerjaan? 📅',
              'Apakah Bisa Bordir Logo?'
            ].map((badgeText, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setInputText(badgeText);
                }}
                className="text-xs bg-slate-900 border border-slate-800 hover:border-teal-500/50 text-slate-300 px-3 py-1.5 rounded-full transition-all duration-200 active:scale-95"
              >
                {badgeText}
              </button>
            ))}
          </div>

          {/* Footer Input Form */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-slate-950 border-t border-slate-850 flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ketik pesan koordinasi anda..."
              className="flex-grow bg-slate-900 text-slate-200 rounded-xl px-4 py-2 text-sm border border-slate-800 focus:outline-none focus:border-teal-600 transition"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="bg-teal-600 hover:bg-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white p-2.5 rounded-xl transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
