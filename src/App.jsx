import React, { useState } from 'react';
import { 
  Brain, Zap, Trophy, BarChart3, Shield, Clock, 
  ChevronRight, CheckCircle, Star, MessageCircle, 
  ArrowRight, Menu, X, Phone, Mail, MapPin, Instagram, 
  Facebook, Twitter, Award, Users, Target, TrendingUp
} from 'lucide-react';

const LandingPage = ({ onGetStarted, onLogin }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Soal Berkualitas Tinggi",
      description: "Ribuan soal berkualitas yang disusun oleh tim expert sesuai kisi-kisi UTBK terbaru.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Analisis Mendalam",
      description: "Dapatkan analisis detail performa kamu di setiap subtest untuk improvement maksimal.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: "Leaderboard Real-time",
      description: "Bandingkan skormu dengan ribuan peserta lain dan lacak perkembanganmu.",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Sistem Aman & Terpercaya",
      description: "Fullscreen mode dengan deteksi kecurangan untuk simulasi ujian yang realistis.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Timer Akurat",
      description: "Sistem timer yang presisi untuk melatih manajemen waktu seperti ujian sesungguhnya.",
      color: "from-indigo-500 to-blue-500"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Akses Fleksibel",
      description: "Kerjakan kapan saja, dimana saja. Token valid 24 jam setelah diaktifkan.",
      color: "from-yellow-500 to-orange-500"
    }
  ];

  const packages = [
    {
      name: "Paket Hemat",
      price: "10.000",
      credits: 1,
      features: ["1 Token Ujian", "Analisis Ujian", "Leaderboard"],
      color: "from-blue-500 to-cyan-500",
      popular: false
    },
    {
      name: "Paket Pejuang",
      price: "20.000",
      credits: 3,
      features: ["3 Token Ujian", "Analisis Ujian", "Leaderboard"],
      color: "from-purple-500 to-pink-500",
      popular: true
    },
    {
      name: "Paket Sultan",
      price: "85.000",
      credits: 10,
      features: ["10 Token Ujian", "Analisis Ujian", "Leaderboard", "Hemat 50%!"],
      color: "from-orange-500 to-red-500",
      popular: false
    }
  ];

  const testimonials = [
    {
      name: "Fayla Zanatun Zahir",
      school: "SMA Negeri 9 Kota Tangerang Selatan",
      text: "Bagus banget!, tampilan dan suasananya mirip kaya UTBK beneran jadi bisa lebih siap mental buat UTBK nanti.",
      rating: 5,
      avatar: "🎓"
    },
    {
      name: "Ravin Syach",
      school: "SMK Negeri 19 JAKARTA (Gapyear)",
      text: "Overall bagus sih antarmukanya udah berasa ngerjain real UTBK. Jujur soal soalnya BERAT BANGET, ini cocok banget buat simulasi karena biar ga kaget ketika berhadapan sama realnya. Highly recommended untuk persiapan UTBK.",
      rating: 5,
      avatar: "📚"
    },
    {
      name: "Damar Fathan Nugraha",
      school: "SMA Negeri 9 Kota Tangerang",
      text: "Timer dan fullscreen mode bikin latihan jadi realistis. Pas ujian beneran nanti udah gak grogi lagi!",
      rating: 5,
      avatar: "🏆"
    }
  ];

  const faqs = [
    {
      question: "Bagaimana cara menggunakan platform ini?",
      answer: "Sangat mudah! Cukup daftar akun, beli credits sesuai kebutuhan, generate token, dan mulai ujian. Setiap token valid 24 jam sejak diaktifkan."
    },
    {
      question: "Apakah soal-soalnya mirip dengan UTBK asli?",
      answer: "Ya! Soal-soal kami disusun oleh tim expert yang mengacu pada kisi-kisi UTBK terbaru. Format, tingkat kesulitan, dan tipe soal disesuaikan dengan ujian sesungguhnya."
    },
    {
      question: "Berapa lama token berlaku?",
      answer: "Setiap token berlaku selama 24 jam sejak pertama kali diaktifkan. Kamu bisa mengerjakan ujian kapan saja dalam periode tersebut."
    },
    {
      question: "Apakah credits bisa hangus?",
      answer: "Credits akan hangus jika tidak digunakan dalam 3 bulan sejak pembelian. Pastikan kamu memanfaatkan credits sebelum periode tersebut."
    },
    {
      question: "Bagaimana sistem pembayarannya?",
      answer: "Kami menggunakan payment gateway Midtrans yang aman dan terpercaya. Kamu bisa bayar via QRIS dari berbagai e-wallet dan mobile banking."
    },
    {
      question: "Apakah ada garansi uang kembali?",
      answer: "Maaf, credits yang sudah dibeli tidak bisa di-refund. Namun kami menjamin kualitas platform dan soal-soal kami."
    }
  ];

  const stats = [
    { number: "10,000+", label: "Siswa Terdaftar", icon: <Users /> },
    { number: "50,000+", label: "Ujian Diselesaikan", icon: <Award /> },
    { number: "4.9/5", label: "Rating Pengguna", icon: <Star /> },
    { number: "95%", label: "Tingkat Kepuasan", icon: <Target /> }
  ];

  return (
    <div className="min-h-screen bg-white">
      
      {/* NAVIGATION */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <div className="flex items-center gap-3">
                <img
                  src="/LogoRuangSimulasi.svg"
                  alt="Logo Ruang Simulasi"
                  className="w-20 h-20"
                />
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-indigo-600 font-medium transition">Fitur</a>
              <a href="#pricing" className="text-gray-600 hover:text-indigo-600 font-medium transition">Harga</a>
              <a href="#testimonials" className="text-gray-600 hover:text-indigo-600 font-medium transition">Testimoni</a>
              <a href="#faq" className="text-gray-600 hover:text-indigo-600 font-medium transition">FAQ</a>
              <button onClick={onLogin} className="text-indigo-600 hover:text-indigo-700 font-semibold">
                Login
              </button>
              <button 
                onClick={onGetStarted}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition"
              >
                Mulai Gratis
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-3 border-t border-gray-100">
              <a href="#features" className="block text-gray-600 hover:text-indigo-600 font-medium py-2">Fitur</a>
              <a href="#pricing" className="block text-gray-600 hover:text-indigo-600 font-medium py-2">Harga</a>
              <a href="#testimonials" className="block text-gray-600 hover:text-indigo-600 font-medium py-2">Testimoni</a>
              <a href="#faq" className="block text-gray-600 hover:text-indigo-600 font-medium py-2">FAQ</a>
              <button onClick={onLogin} className="block w-full text-left text-indigo-600 font-semibold py-2">Login</button>
              <button onClick={onGetStarted} className="block w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-lg">
                Mulai Gratis
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-20 md:py-32">
        {/* Background Decorations */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-indigo-200 mb-6">
              <Zap className="w-4 h-4 text-indigo-600" fill="currentColor" />
              <span className="text-sm font-bold text-indigo-600">Platform Simulasi UTBK Terpercaya #1</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-6 leading-tight">
              Raih Skor
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"> Impian </span>
              di UTBK 2026
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Platform simulasi UTBK terlengkap dengan ribuan soal berkualitas, analisis mendalam, dan sistem yang mirip ujian asli. Persiapkan dirimu dengan maksimal!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={onGetStarted}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg shadow-2xl hover:shadow-indigo-300 transform hover:-translate-y-1 transition flex items-center gap-2 group"
              >
                Daftar Sekarang - Gratis
                <ArrowRight className="group-hover:translate-x-1 transition" />
              </button>
              <button 
                onClick={onLogin}
                className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl border-2 border-indigo-200 transform hover:-translate-y-1 transition"
              >
                Sudah Punya Akun?
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
              {stats.map((stat, idx) => (
                <div key={idx} className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-indigo-100 shadow-lg">
                  <div className="text-indigo-600 mb-2 flex justify-center">{stat.icon}</div>
                  <div className="text-3xl font-black text-gray-900 mb-1">{stat.number}</div>
                  <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">
              Kenapa Pilih <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Kami?</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Fitur-fitur unggulan yang dirancang khusus untuk memaksimalkan persiapan UTBK kamu
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div 
                key={idx}
                className="group bg-white border-2 border-gray-100 rounded-2xl p-8 hover:border-indigo-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="py-20 bg-gradient-to-br from-gray-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">
              Paket <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Terjangkau</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Pilih paket yang sesuai dengan kebutuhanmu. Semakin banyak, semakin hemat!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {packages.map((pkg, idx) => (
              <div 
                key={idx}
                className={`relative bg-white rounded-3xl p-8 border-2 ${
                  pkg.popular ? 'border-purple-300 shadow-2xl scale-105' : 'border-gray-200 shadow-lg'
                } hover:shadow-2xl transition-all duration-300`}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold rounded-full shadow-lg">
                    ⭐ PALING POPULER
                  </div>
                )}
                
                <div className={`w-12 h-12 bg-gradient-to-br ${pkg.color} rounded-xl flex items-center justify-center text-white mb-6 shadow-lg`}>
                  <Zap fill="currentColor" />
                </div>
                
                <h3 className="text-2xl font-black text-gray-900 mb-2">{pkg.name}</h3>
                <div className="flex items-baseline mb-6">
                  <span className="text-4xl font-black text-gray-900">Rp {pkg.price}</span>
                </div>
                
                <div className="text-lg font-bold text-indigo-600 mb-6">
                  {pkg.credits} Credits
                </div>
                
                <ul className="space-y-3 mb-8">
                  {pkg.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button 
                  onClick={onGetStarted}
                  className={`w-full py-3 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition bg-gradient-to-r ${pkg.color}`}
                >
                  Pilih Paket
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">
              Apa Kata <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Mereka?</span>
            </h2>
            <p className="text-lg text-gray-600">
              Ribuan siswa sudah merasakan manfaatnya. Sekarang giliran kamu!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testi, idx) => (
              <div key={idx} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testi.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic leading-relaxed">"{testi.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{testi.avatar}</div>
                  <div>
                    <div className="font-bold text-gray-900">{testi.name}</div>
                    <div className="text-sm text-gray-500">{testi.school}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">
              Pertanyaan <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Umum</span>
            </h2>
            <p className="text-lg text-gray-600">
              Temukan jawaban untuk pertanyaan yang sering diajukan
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-gray-50 transition"
                >
                  <span className="font-bold text-gray-900 pr-4">{faq.question}</span>
                  <ChevronRight 
                    className={`w-5 h-5 text-indigo-600 flex-shrink-0 transition-transform ${
                      activeFaq === idx ? 'rotate-90' : ''
                    }`} 
                  />
                </button>
                {activeFaq === idx && (
                  <div className="px-6 pb-5 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl md:text-5xl font-black mb-6">
            Siap Raih Skor Terbaikmu?
          </h2>
          <p className="text-lg md:text-xl mb-10 opacity-90">
            Bergabunglah dengan ribuan siswa yang sudah merasakan manfaatnya. Mulai persiapan UTBK-mu sekarang!
          </p>
          <button 
            onClick={onGetStarted}
            className="px-10 py-4 bg-white text-indigo-600 rounded-xl font-bold text-lg shadow-2xl hover:shadow-white/20 transform hover:-translate-y-1 transition inline-flex items-center gap-3 group"
          >
            Daftar Gratis Sekarang
            <ArrowRight className="group-hover:translate-x-1 transition" />
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-300 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-black text-white">RuangSimulasi</span>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed max-w-md">
                Platform simulasi UTBK terpercaya yang membantu ribuan siswa mencapai skor impian mereka. Persiapan maksimal untuk masa depan cemerlang.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-indigo-600 transition">
                  <Instagram size={20} />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-indigo-600 transition">
                  <Facebook size={20} />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-indigo-600 transition">
                  <Twitter size={20} />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="hover:text-indigo-400 transition">Fitur</a></li>
                <li><a href="#pricing" className="hover:text-indigo-400 transition">Harga</a></li>
                <li><a href="#testimonials" className="hover:text-indigo-400 transition">Testimoni</a></li>
                <li><a href="#faq" className="hover:text-indigo-400 transition">FAQ</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-bold text-white mb-4">Support</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Phone size={16} className="text-indigo-400" />
                  <a href="https://wa.me/6287789345701" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition">
                    087789345701
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <MessageCircle size={16} className="text-indigo-400" />
                  <a href="https://wa.me/6287789345701" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition">
                    WhatsApp Support
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail size={16} className="text-indigo-400" />
                  <span>lieziragroup@gmail.com</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © 2026 RuangSimulasi. All rights reserved. Created with dedication by LieziraGroup
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="hover:text-indigo-400 transition">Privacy Policy</a>
              <a href="#" className="hover:text-indigo-400 transition">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;