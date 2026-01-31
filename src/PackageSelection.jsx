import React from 'react';
import { Zap, X, CheckCircle2, Star } from 'lucide-react';

const PackageSelection = ({ user, onClose }) => {
  // ⚠️ GANTI NOMOR WA ADMIN DI SINI (Format: 628xxx)
  const ADMIN_WHATSAPP = "6281234567890"; 

  // Data Paket (Disamakan dengan setup-packages.js kamu)
  const packages = [
    {
      id: 'pkg_hemat',
      name: 'Paket Hemat',
      subtitle: 'Coba dulu sebelum serius',
      credits: 1,
      price: 10000,
      originalPrice: null,
      features: [
        '1 Token Ujian Simulasi',
        'Analisis Nilai Dasar',
        'Akses Leaderboard'
      ],
      color: 'from-blue-500 to-cyan-500',
      ctaText: 'Coba Sekarang'
    },
    {
      id: 'pkg_pejuang',
      name: 'Paket Pejuang',
      subtitle: 'Paling seimbang & paling dipilih',
      credits: 3,
      price: 25000,
      originalPrice: 30000,
      features: [
        '3 Token Ujian Simulasi',
        'Analisis Nilai & Ranking Akurat',
        'Leaderboard Nasional'
      ],
      color: 'from-purple-600 to-pink-600',
      best: true, // Highlight
      ctaText: 'Mulai Sekarang 🚀'
    },
    {
      id: 'pkg_sultan',
      name: 'Paket Sultan',
      subtitle: 'Paling hemat untuk pejuang serius',
      credits: 10,
      price: 75000,
      originalPrice: 100000,
      features: [
        '10 Token Ujian Simulasi',
        'Analisis Lengkap & Riwayat',
        'Leaderboard Nasional'
      ],
      color: 'from-orange-500 to-red-500',
      ctaText: 'Gas Pol 🚀'
    }
  ];

  const handleBuyManual = (pkg) => {
    // 1. Format Pesan WhatsApp
    const message = `
Halo Admin RuangSimulasi 👋,

Saya ingin Top Up Credit untuk akun:
👤 *Nama:* ${user.displayName || 'Tanpa Nama'}
📧 *Email:* ${user.email}

📦 *Pilihan Paket:*
*${pkg.name}* (${pkg.credits} Credits)
Harga: Rp ${pkg.price.toLocaleString('id-ID')}

Mohon info pembayaran selanjutnya. Terima kasih!
    `.trim();

    // 2. Buka Link WA
    const url = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    
    // 3. Tutup Modal
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl rounded-3xl p-6 md:p-8 max-h-[90vh] overflow-y-auto relative shadow-2xl">
        
        {/* Header Modal */}
        <div className="flex justify-between items-start mb-8 sticky top-0 bg-white z-10 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">Pilih Paket Belajar</h2>
            <p className="text-gray-500 text-sm">Investasi leher ke atas terbaik untuk masa depanmu.</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition text-gray-500"
          >
            <X size={24}/>
          </button>
        </div>

        {/* Grid Paket */}
        <div className="grid md:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div 
              key={pkg.id} 
              className={`
                relative bg-white rounded-3xl p-6 border-2 transition-all duration-300 flex flex-col
                ${pkg.best 
                  ? 'border-purple-400 shadow-xl scale-105 z-10 ring-4 ring-purple-50' 
                  : 'border-gray-100 hover:border-indigo-100 hover:shadow-lg'
                }
              `}
            >
              {/* Badge Best Seller */}
              {pkg.best && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 whitespace-nowrap">
                  <Star size={12} fill="currentColor"/> PALING DIMINATI
                </div>
              )}

              {/* Header Card */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-black text-gray-900 mb-1">{pkg.name}</h3>
                <p className="text-xs text-gray-500 font-medium mb-4">{pkg.subtitle}</p>
                
                <div className="flex items-center justify-center gap-2 mb-1">
                  {pkg.originalPrice && (
                    <span className="text-sm text-gray-400 line-through">Rp {pkg.originalPrice.toLocaleString('id-ID')}</span>
                  )}
                </div>
                <div className="text-3xl font-black text-indigo-900">
                  Rp {pkg.price.toLocaleString('id-ID')}
                </div>
              </div>

              {/* Fitur List */}
              <ul className="space-y-3 mb-8 flex-grow">
                {pkg.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-gray-600">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="font-medium">{feat}</span>
                  </li>
                ))}
              </ul>

              {/* Tombol Beli */}
              <button 
                onClick={() => handleBuyManual(pkg)} 
                className={`
                  w-full py-4 rounded-xl font-bold text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition flex items-center justify-center gap-2
                  bg-gradient-to-r ${pkg.color}
                `}
              >
                {/* Icon WA Kecil */}
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className="opacity-90">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.969.587 1.961.956 3.018.957 3.181 0 5.767-2.587 5.768-5.766 0-3.182-2.586-5.769-5.768-5.769s-5.768 2.586-5.768 5.769c0 0 0 0 0 0zm9.261 5.766c0 5.115-4.161 9.275-9.275 9.275-1.579 0-3.07-.406-4.383-1.127l-4.729 1.24 1.262-4.607c-1.229-1.92-1.92-4.195-1.92-6.529 0-5.115 4.161-9.275 9.275-9.275s9.275 4.161 9.275 9.275z"/>
                </svg>
                {pkg.ctaText}
              </button>
              
              <p className="text-[10px] text-center text-gray-400 mt-3">
                *Pembayaran via Transfer / E-Wallet ke Admin
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PackageSelection;