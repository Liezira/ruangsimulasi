import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate, useSearchParams } from 'react-router-dom';
import { onAuthStateChanged, signOut, sendEmailVerification, applyActionCode } from 'firebase/auth';
import { doc, onSnapshot, collection, query, where, runTransaction } from 'firebase/firestore';
import { auth, db } from './firebase'; 

// --- COMPONENTS ---
import SignUpPages from './SignUpPages'; 
import PackageSelection from './PackageSelection'; 

// --- ICONS ---
import { 
  Brain, Zap, Trophy, BarChart3, Shield, Clock, 
  ChevronRight, CheckCircle, Star, MessageCircle, 
  ArrowRight, Menu, X, Phone, Mail, Users, Award, Target,
  LogOut, Plus, History, Loader2, Ticket, Copy, Instagram, Facebook, Twitter,
  ExternalLink, RefreshCw, CheckCircle2, XCircle, AlertTriangle
} from 'lucide-react';

// ==========================================
// 1. HALAMAN VERIFIKASI (Perbaikan Link & Redirect)
// ==========================================
const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); 

  useEffect(() => {
    const verify = async () => {
      const oobCode = searchParams.get('oobCode');
      if (!oobCode) { setStatus('error'); return; }

      try {
        await applyActionCode(auth, oobCode);
        setStatus('success');
        window.history.replaceState(null, '', '/verify-email'); 
        setTimeout(() => navigate('/dashboard'), 3000);
      } catch (error) {
        console.error(error);
        setStatus('error');
      }
    };
    verify();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white max-w-sm w-full p-8 rounded-3xl shadow-xl text-center border border-gray-100">
        {status === 'verifying' && (
          <>
            <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mx-auto mb-4"/>
            <h2 className="text-xl font-bold text-gray-800">Memverifikasi...</h2>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4"/>
            <h2 className="text-xl font-bold text-gray-800">Berhasil!</h2>
            <p className="text-gray-500 text-sm mt-2">Email terverifikasi. Mengalihkan...</p>
            <button onClick={() => navigate('/dashboard')} className="mt-6 w-full py-3 bg-indigo-600 text-white rounded-xl font-bold">Masuk Dashboard</button>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4"/>
            <h2 className="text-xl font-bold text-gray-800">Link Tidak Valid</h2>
            <button onClick={() => navigate('/')} className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm">Kembali ke Home</button>
          </>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 2. VERIFICATION SCREEN (Dengan Info Spam)
// ==========================================
const VerificationScreen = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const handleResend = async () => {
    setLoading(true);
    try {
      const actionCodeSettings = { url: window.location.origin + '/verify-email', handleCodeInApp: true };
      await sendEmailVerification(user, actionCodeSettings);
      setSent(true);
      alert("Email terkirim! CEK FOLDER SPAM/JUNK.");
    } catch (e) {
      alert("Tunggu sebentar sebelum kirim ulang.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => { await signOut(auth); navigate('/'); };
  const handleReload = () => { window.location.reload(); };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white max-w-md w-full p-8 rounded-3xl shadow-xl text-center border border-gray-100">
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6"><Mail className="text-yellow-600 w-10 h-10" /></div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Verifikasi Email</h2>
        <p className="text-gray-500 mb-6 text-sm leading-relaxed">Halo <b>{user.displayName}</b>, cek emailmu ({user.email}) dan klik link verifikasi.</p>
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-6 flex items-start gap-3 text-left">
          <AlertTriangle className="text-orange-500 w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-orange-700 leading-snug"><b>Tidak ada email?</b> Cek folder <b>SPAM</b> atau <b>JUNK</b>.</p>
        </div>
        <div className="space-y-3">
          <button onClick={handleReload} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2"><RefreshCw size={18}/> Saya Sudah Klik Link</button>
          <button onClick={handleResend} disabled={loading || sent} className="w-full py-3 bg-white border-2 border-indigo-100 text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition">{loading ? 'Mengirim...' : sent ? 'Email Terkirim (Cek Spam)' : 'Kirim Ulang Email'}</button>
          <button onClick={handleLogout} className="text-gray-400 text-sm hover:text-red-500 underline mt-4">Keluar / Ganti Akun</button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. DASHBOARD COMPONENT (LAUNCHER + SKOR)
// ==========================================
const Dashboard = ({ user }) => {
  if (!user.emailVerified) return <VerificationScreen user={user} />;

  const [userData, setUserData] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();
  const EXAM_URL = "https://utbk-simulation-tester-student.vercel.app";

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, 'users', user.uid), (doc) => setUserData(doc.data()));
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'tokens'), where('userId', '==', user.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      const loadedTokens = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
      loadedTokens.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setTokens(loadedTokens);
    });
    return () => unsub();
  }, [user]);

  const handleLogout = async () => { await signOut(auth); navigate('/'); };

  const handleGenerateToken = async () => {
    const credits = userData?.credits || 0;
    if (credits < 1) { alert("Credit tidak cukup!"); setShowPackageModal(true); return; }
    if (!confirm("Gunakan 1 Credit?")) return;
    setIsGenerating(true);
    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists() || (userDoc.data().credits || 0) < 1) throw "Credit tidak valid.";
        const tokenCode = `UTBK-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
        const tokenRef = doc(db, 'tokens', tokenCode);
        transaction.update(userRef, { credits: (userDoc.data().credits || 0) - 1, generatedTokens: [...(userDoc.data().generatedTokens || []), tokenCode] });
        transaction.set(tokenRef, { tokenCode, userId: user.uid, studentName: userDoc.data().displayName, studentSchool: userDoc.data().school, studentPhone: userDoc.data().phone || user.email, status: 'active', score: null, createdAt: new Date().toISOString(), isSent: true, sentMethod: 'DASHBOARD_GENERATE' });
      });
      alert("Token berhasil dibuat!");
    } catch (error) { alert("Gagal: " + error); } finally { setIsGenerating(false); }
  };

  // --- LOGIC LAUNCHER ---
  const handleOpenExamApp = (tokenCode) => {
    navigator.clipboard.writeText(tokenCode);
    window.open(`${EXAM_URL}?token=${tokenCode}`, '_blank');
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <div className="bg-indigo-600 text-white p-8 pb-16 rounded-b-[2.5rem] shadow-xl">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
             <img src="/LogoRuangSimulasi.svg" alt="Logo" className="w-28 h-28 object-contain drop-shadow-lg bg-white/95 backdrop-blur-sm p-3 rounded-2xl shadow-xl ring-1 ring-white/50" />
             <div><h1 className="text-2xl font-bold">Halo, {userData?.displayName?.split(' ')[0] || 'Siswa'} 👋</h1><p className="text-indigo-200 text-sm mt-1">Siap untuk simulasi hari ini?</p></div>
          </div>
          <button onClick={handleLogout} className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition text-white"><LogOut size={20}/></button>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 -mt-10 space-y-6">
        <div className="bg-white rounded-3xl p-6 shadow-xl flex justify-between items-center border border-gray-100">
          <div><p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Sisa Credit</p><p className="text-4xl font-black text-gray-800">{userData?.credits || 0}</p></div>
          <button onClick={() => setShowPackageModal(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition flex items-center gap-2"><Plus size={18}/> Top Up</button>
        </div>
        <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6 text-center">
          <h3 className="font-bold text-indigo-900 mb-2 text-lg">Mulai Simulasi Baru</h3>
          <p className="text-indigo-600/70 text-sm mb-6">Gunakan 1 credit untuk token ujian.</p>
          <button onClick={handleGenerateToken} disabled={isGenerating} className="w-full bg-white text-indigo-600 py-3.5 rounded-xl font-bold shadow-sm hover:shadow-md transition flex items-center justify-center gap-2 border border-indigo-100">{isGenerating ? <Loader2 className="animate-spin" size={20}/> : <Ticket size={20}/>} {isGenerating ? 'Memproses...' : 'Generate Token (-1 Credit)'}</button>
        </div>
        <div>
          <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2 px-2"><History size={20} className="text-gray-400"/> Riwayat Token</h3>
          <div className="space-y-3">
            {tokens.length === 0 && <div className="bg-white p-8 rounded-2xl border border-dashed border-gray-300 text-center text-gray-400 text-sm">Belum ada riwayat ujian.</div>}
            {tokens.map(t => (
              <div key={t.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 transition hover:shadow-md">
                <div className="text-center md:text-left">
                  <div className="font-mono font-bold text-lg text-indigo-600 tracking-wider">{t.tokenCode}</div>
                  <div className="text-xs text-gray-400 mt-1">{new Date(t.createdAt).toLocaleString('id-ID')}</div>
                  {/* TAMPILAN SKOR DI SINI */}
                  {t.score !== null && t.score !== undefined && (
                    <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-bold"><Trophy size={12}/> Skor: {t.score}</div>
                  )}
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <button onClick={() => {navigator.clipboard.writeText(t.tokenCode); alert("Token disalin!")}} className="p-2 border rounded-lg hover:bg-gray-50 text-gray-500" title="Salin Token"><Copy size={18}/></button>
                  {/* LOGIKA TOMBOL LAUNCHER */}
                  {t.score !== null && t.score !== undefined ? (
                    <button onClick={() => handleOpenExamApp(t.tokenCode)} className="flex-1 md:flex-none px-4 py-2 bg-white border-2 border-indigo-100 text-indigo-600 rounded-lg font-bold text-sm hover:bg-indigo-50 transition flex items-center justify-center gap-2">Lihat Hasil <ExternalLink size={14}/></button>
                  ) : (
                    <button onClick={() => handleOpenExamApp(t.tokenCode)} className="flex-1 md:flex-none px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-bold text-sm shadow hover:shadow-lg hover:-translate-y-0.5 transition flex items-center justify-center gap-2">Mulai Ujian <ExternalLink size={14}/></button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {showPackageModal && <PackageSelection user={user} onClose={() => setShowPackageModal(false)} />}
    </div>
  );
};

// ==========================================
// 4. LANDING PAGE COMPONENT (FULL CONTENT RESTORED)
// ==========================================
const LandingPageContent = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const navigate = useNavigate();
  const handleAuth = () => navigate('/signup'); 

  const features = [
    { icon: <Brain className="w-8 h-8" />, title: "Soal Berkualitas Tinggi", description: "Ribuan soal berkualitas yang disusun oleh tim expert sesuai kisi-kisi UTBK terbaru.", color: "from-blue-500 to-cyan-500" },
    { icon: <BarChart3 className="w-8 h-8" />, title: "Analisis Performa", description: "Setiap simulasi langsung dipecah: subtest lemah, waktu terbuang, dan potensi naik skor.", color: "from-purple-500 to-pink-500" },
    { icon: <Trophy className="w-8 h-8" />, title: "Leaderboard Real-time", description: "Bandingkan skormu dengan ribuan peserta lain dan lacak perkembanganmu.", color: "from-orange-500 to-red-500" },
    { icon: <Shield className="w-8 h-8" />, title: "Sistem Aman & Terpercaya", description: "Fullscreen mode dengan deteksi kecurangan untuk simulasi ujian yang realistis.", color: "from-green-500 to-emerald-500" },
    { icon: <Clock className="w-8 h-8" />, title: "Timer Akurat", description: "Sistem timer yang presisi untuk melatih manajemen waktu seperti ujian sesungguhnya.", color: "from-indigo-500 to-blue-500" },
    { icon: <Zap className="w-8 h-8" />, title: "Akses Fleksibel", description: "Kerjakan kapan saja, dimana saja. Token valid 24 jam setelah diaktifkan.", color: "from-yellow-500 to-orange-500" }
  ];

  const packages = [
    { name: 'Paket Hemat', subtitle: 'Coba dulu sebelum serius', credits: 1, price: "10.000", originalPrice: null, description: '1 Token untuk 1x simulasi UTBK', features: ['1 Token Ujian Simulasi', 'Analisis Nilai Dasar', 'Akses Leaderboard'], color: "from-blue-500 to-cyan-500", popular: false },
    { name: 'Paket Pejuang', subtitle: 'Paling seimbang & paling dipilih', credits: 3, price: "25.000", originalPrice: "30.000", description: '3 Token untuk latihan intensif', features: ['3 Token Ujian Simulasi', 'Analisis Nilai & Ranking Akurat', 'Leaderboard Nasional'], color: "from-purple-500 to-pink-500", popular: true },
    { name: 'Paket Sultan', subtitle: 'Paling hemat untuk pejuang serius', credits: 10, price: "75.000", originalPrice: "100.000", description: '10 Token untuk persiapan maksimal', features: ['10 Token Ujian Simulasi', 'Analisis Lengkap & Riwayat', 'Leaderboard Nasional'], color: "from-orange-500 to-red-500", popular: false }
  ];

  const testimonials = [
    { name: "Fayla Zanatun Zahir", school: "SMA Negeri 9 Kota Tangerang Selatan", text: "Bagus banget!, tampilan dan suasananya mirip kaya UTBK beneran jadi bisa lebih siap mental buat UTBK nanti.", rating: 5, avatar: "🎓" },
    { name: "Ravin Syach", school: "SMK Negeri 19 JAKARTA (Gapyear)", text: "Overall bagus sih antarmukanya udah berasa ngerjain real UTBK. Jujur soal soalnya BERAT BANGET, ini cocok banget buat simulasi karena biar ga kaget ketika berhadapan sama realnya. Highly recommended untuk persiapan UTBK.", rating: 5, avatar: "📚" },
    { name: "Damar Fathan Nugraha", school: "SMA Negeri 9 Kota Tangerang", text: "Timer dan fullscreen mode bikin latihan jadi realistis. Pas ujian beneran nanti udah gak grogi lagi!", rating: 5, avatar: "🏆" }
  ];

  const faqs = [
    { question: "Bagaimana cara menggunakan platform ini?", answer: "Sangat mudah! Cukup daftar akun, beli credits sesuai kebutuhan, generate token, dan mulai ujian. Setiap token valid 24 jam sejak diaktifkan." },
    { question: "Apakah soal-soalnya mirip dengan UTBK asli?", answer: "Ya! Soal-soal kami disusun oleh tim expert yang mengacu pada kisi-kisi UTBK terbaru. Format, tingkat kesulitan, dan tipe soal disesuaikan dengan ujian sesungguhnya." },
    { question: "Berapa lama token berlaku?", answer: "Setiap token berlaku selama 24 jam sejak pertama kali diaktifkan. Kamu bisa mengerjakan ujian kapan saja dalam periode tersebut." },
    { question: "Apakah credits bisa hangus?", answer: "Credits akan hangus jika tidak digunakan dalam 3 bulan sejak pembelian. Pastikan kamu memanfaatkan credits sebelum periode tersebut." },
    { question: "Bagaimana sistem pembayarannya?", answer: "Kami menggunakan payment gateway Midtrans yang aman dan terpercaya. Kamu bisa bayar via QRIS dari berbagai e-wallet dan mobile banking." },
    { question: "Apakah ada garansi uang kembali?", answer: "Maaf, credits yang sudah dibeli tidak bisa di-refund. Namun kami menjamin kualitas platform dan soal-soal kami." },
    { question: "Apakah semua paket punya fitur yang sama?", answer: "Ya. Semua paket mendapatkan fitur dan kualitas yang sama. Perbedaannya hanya jumlah token atau kesempatan latihan. Kami percaya semua pejuang UTBK berhak mendapat pengalaman terbaik." }
  ];

  const stats = [
    { number: "10,000+", label: "Siswa Terdaftar", icon: <Users /> },
    { number: "50,000+", label: "Ujian Diselesaikan", icon: <Award /> },
    { number: "4.9/5", label: "Rating Pengguna", icon: <Star /> },
    { number: "95%", label: "Tingkat Kepuasan", icon: <Target /> }
  ];

  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            <div className="flex items-center gap-3"><img src="/LogoRuangSimulasi.svg" alt="Logo Ruang Simulasi" className="w-20 h-20 md:w-28 md:h-28" /></div>
            <div className="hidden md:flex items-center gap-8"><button onClick={handleAuth} className="text-indigo-600 hover:text-indigo-700 font-semibold">Login</button><button onClick={handleAuth} className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-lg">Mulai Gratis</button></div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100">{mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}</button>
          </div>
          {mobileMenuOpen && <div className="md:hidden py-4 space-y-3 border-t border-gray-100 bg-white absolute left-0 right-0 px-4 shadow-xl z-50"><a href="#features" className="block py-2 text-gray-600 font-medium">Fitur</a><a href="#pricing" className="block py-2 text-gray-600 font-medium">Harga</a><a href="#testimonials" className="block py-2 text-gray-600 font-medium">Testimoni</a><a href="#faq" className="block py-2 text-gray-600 font-medium">FAQ</a><button onClick={handleAuth} className="block w-full text-left py-2 font-bold text-indigo-600">Login</button></div>}
        </div>
      </nav>

      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-16 md:py-32">
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-white/60 backdrop-blur-sm rounded-full border border-indigo-200 mb-6"><Zap className="w-4 h-4 text-indigo-600" fill="currentColor" /><span className="text-xs md:text-sm font-bold text-indigo-600">Platform Simulasi UTBK Terpercaya #1</span></div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-gray-900 mb-6 leading-tight">Raih Skor <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"> Impian </span> di UTBK 2026</h1>
            <p className="text-base sm:text-lg md:text-xl mb-8 md:mb-10 text-gray-600 opacity-90">UTBK cuma sekali. Persiapannya jangan coba-coba. Satu simulasi bisa mengubah strategi belajarmu.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button onClick={handleAuth} className="w-full sm:w-auto px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg shadow-2xl hover:shadow-indigo-300 transform hover:-translate-y-1 transition flex items-center justify-center gap-2 group">Daftar Sekarang - Gratis <ArrowRight className="group-hover:translate-x-1 transition" /></button>
              <button onClick={handleAuth} className="w-full sm:w-auto px-6 py-3 md:px-8 md:py-4 bg-white text-indigo-600 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl border-2 border-indigo-200 transform hover:-translate-y-1 transition">Sudah Punya Akun?</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-12 md:mt-16">
              {stats.map((stat, idx) => (<div key={idx} className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-indigo-100 shadow-lg"><div className="text-indigo-600 mb-2 flex justify-center scale-90 md:scale-100">{stat.icon}</div><div className="text-2xl md:text-3xl font-black text-gray-900 mb-1">{stat.number}</div><div className="text-xs md:text-sm text-gray-600 font-medium">{stat.label}</div></div>))}
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16"><h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">Kenapa Pilih <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Kami?</span></h2><p className="text-lg text-gray-600 max-w-2xl mx-auto">Fitur-fitur unggulan yang dirancang khusus untuk memaksimalkan persiapan UTBK kamu</p></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, idx) => (<div key={idx} className="group bg-white border-2 border-gray-100 rounded-2xl p-6 md:p-8 hover:border-indigo-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"><div className={`w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition`}>{feature.icon}</div><h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3><p className="text-gray-600 leading-relaxed text-sm md:text-base">{feature.description}</p></div>))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-16 md:py-20 bg-gradient-to-br from-gray-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16"><h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">Paket <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Terjangkau</span></h2><p className="text-lg text-gray-600 max-w-2xl mx-auto">Pilih paket yang sesuai dengan kebutuhanmu. Semakin banyak, semakin hemat!</p></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-start">
            {packages.map((pkg, idx) => (
              <div key={idx} className={`relative bg-white rounded-3xl p-6 md:p-8 border-2 transition-all duration-300 ${pkg.popular ? 'border-purple-300 shadow-xl md:shadow-2xl z-10 scale-100 md:scale-105 order-first md:order-none' : 'border-gray-200 shadow-lg hover:shadow-xl scale-100'}`}>
                {pkg.popular && <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 md:px-4 md:py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs md:text-sm font-bold rounded-full shadow-lg whitespace-nowrap">⭐ PALING POPULER</div>}
                <div className={`w-12 h-12 bg-gradient-to-br ${pkg.color} rounded-xl flex items-center justify-center text-white mb-6 shadow-lg`}><Zap fill="currentColor" /></div>
                <h3 className="text-2xl font-black text-gray-900 mb-1">{pkg.name}</h3>
                {pkg.popular && <p className="text-sm text-gray-500 mb-4">{pkg.subtitle}</p>}
                <div className="mb-3 pt-2">
                  {pkg.originalPrice && <div className="text-sm text-gray-400 line-through mb-1">Rp {pkg.originalPrice}</div>}
                  <div className="flex items-baseline gap-2 flex-wrap"><span className="text-3xl md:text-4xl font-black text-gray-900">Rp {pkg.price}</span>{pkg.originalPrice && <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-lg">Hemat {Math.round(((Number(pkg.originalPrice.replace('.', '')) - Number(pkg.price.replace('.', ''))) / Number(pkg.originalPrice.replace('.', ''))) * 100)}%</span>}</div>
                </div>
                <div className="text-lg font-bold text-indigo-600 mb-3">{pkg.credits} Credits</div>
                <ul className="space-y-3 mb-8 border-t border-gray-100 pt-6">{pkg.features.map((feature, i) => (<li key={i} className="flex items-center gap-3 text-gray-600 text-sm md:text-base"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /><span>{feature}</span></li>))}</ul>
                <button onClick={handleAuth} className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition bg-gradient-to-r ${pkg.color}`}>{pkg.popular ? 'Mulai Latihan Serius' : 'Pilih Paket'}</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="testimonials" className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16"><h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">Apa Kata <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Mereka?</span></h2></div>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {testimonials.map((testi, idx) => (<div key={idx} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition"><div className="flex items-center gap-1 mb-4">{[...Array(testi.rating)].map((_, i) => <Star key={i} className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" fill="currentColor" />)}</div><span className="inline-block text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-3">Pejuang UTBK</span><p className="text-gray-700 mb-6 italic leading-relaxed text-sm md:text-base">"{testi.text}"</p><div className="flex items-center gap-3"><div className="text-3xl md:text-4xl">{testi.avatar}</div><div><div className="font-bold text-gray-900 text-sm md:text-base">{testi.name}</div><div className="text-xs md:text-sm text-gray-500">{testi.school}</div></div></div></div>))}
          </div>
        </div>
      </section>

      <section id="faq" className="py-16 md:py-24 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16"><h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">Pertanyaan <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Umum</span></h2></div>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (<div key={idx} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all hover:shadow-md"><button onClick={() => setActiveFaq(activeFaq === idx ? null : idx)} className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-gray-50 transition"><span className="font-bold text-gray-900 pr-4 text-sm md:text-base">{faq.question}</span><ChevronRight className={`w-5 h-5 text-indigo-600 flex-shrink-0 transition-transform duration-300 ${activeFaq === idx ? 'rotate-90' : ''}`} /></button><div className={`px-6 text-gray-600 leading-relaxed border-t border-gray-100 overflow-hidden transition-all duration-300 ${activeFaq === idx ? 'max-h-96 py-5 opacity-100' : 'max-h-0 py-0 opacity-0'}`}><p className="text-sm md:text-base">{faq.answer}</p></div></div>))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl md:text-5xl font-black mb-6">Siap Raih Skor Terbaikmu?</h2>
          <p className="text-lg md:text-xl mb-10 opacity-90">Bergabunglah dengan ribuan siswa yang sudah merasakan manfaatnya.</p>
          <button onClick={handleAuth} className="w-full sm:w-auto px-10 py-4 bg-white text-indigo-600 rounded-xl font-bold text-lg shadow-2xl hover:shadow-white/20 transform hover:-translate-y-1 transition inline-flex justify-center items-center gap-3 group">Daftar Gratis Sekarang <ArrowRight className="group-hover:translate-x-1 transition" /></button>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-300 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4"><img src="/LogoRuangSimulasi.svg" alt="Logo Ruang Simulasi" className="w-20 h-20 md:w-28 md:h-28"></img></div>
              <p className="text-gray-400 mb-6 leading-relaxed max-w-md text-sm md:text-base">Platform simulasi UTBK terpercaya yang membantu ribuan siswa mencapai skor impian mereka.</p>
              <div className="flex gap-4"><a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-indigo-600 transition"><Instagram size={20} /></a><a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-indigo-600 transition"><Facebook size={20} /></a><a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-indigo-600 transition"><Twitter size={20} /></a></div>
            </div>
            <div><h4 className="font-bold text-white mb-4">Quick Links</h4><ul className="space-y-2 text-sm md:text-base"><li><a href="#features" className="hover:text-indigo-400">Fitur</a></li><li><a href="#pricing" className="hover:text-indigo-400">Harga</a></li><li><a href="#testimonials" className="hover:text-indigo-400">Testimoni</a></li><li><a href="#faq" className="hover:text-indigo-400">FAQ</a></li></ul></div>
            <div><h4 className="font-bold text-white mb-4">Support</h4><ul className="space-y-3 text-sm md:text-base"><li className="flex items-center gap-2"><Phone size={16} className="text-indigo-400" /><span>087789345701</span></li><li className="flex items-center gap-2"><MessageCircle size={16} className="text-indigo-400" /><span>WhatsApp Support</span></li><li className="flex items-center gap-2"><Mail size={16} className="text-indigo-400" /><span>lieziragroup@gmail.com</span></li></ul></div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500 text-center md:text-left"><p>© 2026 RuangSimulasi. All rights reserved.</p><div className="flex gap-6 justify-center"><a href="#" className="hover:text-white">Privacy Policy</a><a href="#" className="hover:text-white">Terms of Service</a></div></div>
        </div>
      </footer>
    </div>
  );
};

// ==========================================
// 5. MAIN APP ROUTER & AUTH CHECKER (AUTO LOGOUT ADDED)
// ==========================================
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- LOGIC AUTO LOGOUT (30 MENIT) ---
  const handleUserActivity = useCallback(() => {
    clearTimeout(window.inactivityTimer);
    if (auth.currentUser) {
      window.inactivityTimer = setTimeout(() => {
        alert("Sesi berakhir karena tidak aktif selama 30 menit.");
        signOut(auth);
      }, 30 * 60 * 1000); // 30 Menit
    }
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('click', handleUserActivity);

    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      handleUserActivity(); 
    });

    return () => {
      unsub();
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
      clearTimeout(window.inactivityTimer);
    };
  }, [handleUserActivity]);

  if (loading) return <div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

  return (
    <Router>
      <Routes>
        <Route path="/" element={!user ? <LandingPageContent /> : <Navigate to="/dashboard" />} />
        <Route path="/signup" element={!user ? <SignUpPages /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/signup" />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
      </Routes>
    </Router>
  );
}

export default App;
