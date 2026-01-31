import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { onAuthStateChanged, signOut, sendEmailVerification } from 'firebase/auth'; // <--- Update Import
import { doc, onSnapshot, collection, query, where, runTransaction, orderBy } from 'firebase/firestore';
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
  ExternalLink, AlertTriangle, RefreshCw // <--- Update Icon
} from 'lucide-react';

// ==========================================
// 1. VERIFICATION SCREEN (KOMPONEN BARU)
// ==========================================
const VerificationScreen = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const handleResend = async () => {
    setLoading(true);
    try {
      await sendEmailVerification(user);
      setSent(true);
      alert("Email verifikasi dikirim ulang! Silakan cek inbox/spam.");
    } catch (e) {
      alert("Terlalu banyak request. Tunggu beberapa saat.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white max-w-md w-full p-8 rounded-3xl shadow-xl text-center border border-gray-100">
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="text-yellow-600 w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Verifikasi Email</h2>
        <p className="text-gray-500 mb-6 text-sm leading-relaxed">
          Halo <b>{user.displayName}</b>, demi keamanan, mohon verifikasi emailmu 
          (<span className="font-mono text-indigo-600 bg-indigo-50 px-1 rounded">{user.email}</span>) 
          sebelum mengakses dashboard.
        </p>

        <div className="space-y-3">
          <button 
            onClick={handleReload}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
          >
            <RefreshCw size={18}/> Saya Sudah Verifikasi
          </button>
          
          <button 
            onClick={handleResend} 
            disabled={loading || sent}
            className="w-full py-3 bg-white border-2 border-indigo-100 text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition"
          >
            {loading ? 'Mengirim...' : sent ? 'Email Terkirim' : 'Kirim Ulang Email'}
          </button>
          
          <button onClick={handleLogout} className="text-gray-400 text-sm hover:text-red-500 underline mt-4">
            Keluar / Ganti Akun
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. DASHBOARD COMPONENT
// ==========================================
const Dashboard = ({ user }) => {
  // --- LOGIC KEAMANAN: CEK VERIFIKASI EMAIL ---
  if (!user.emailVerified) {
    return <VerificationScreen user={user} />;
  }

  const [userData, setUserData] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();

  // Link Ujian Tujuan
  const EXAM_URL = "https://utbk-simulation-tester-student.vercel.app";

  // 1. Ambil Data User
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      setUserData(doc.data());
    });
    return () => unsub();
  }, [user]);

  // 2. Ambil Riwayat Token
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'tokens'), where('userId', '==', user.uid));
    
    const unsub = onSnapshot(q, (snapshot) => {
      const loadedTokens = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
      // Sort client-side
      loadedTokens.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setTokens(loadedTokens);
    });
    return () => unsub();
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const handleGenerateToken = async () => {
    const credits = userData?.credits || 0;
    if (credits < 1) {
        alert("Credit tidak cukup! Silakan Top Up credit terlebih dahulu.");
        setShowPackageModal(true);
        return;
    }

    if (!confirm("Gunakan 1 Credit untuk membuat token ujian baru?")) return;

    setIsGenerating(true);

    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await transaction.get(userRef);
        
        if (!userDoc.exists()) throw "User tidak ditemukan!";
        const latestCredits = userDoc.data().credits || 0;
        
        if (latestCredits < 1) throw "Credit tidak cukup.";

        const randomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
        const tokenCode = `UTBK-${randomCode}`;
        const tokenRef = doc(db, 'tokens', tokenCode);

        transaction.update(userRef, { 
          credits: latestCredits - 1,
          generatedTokens: [...(userDoc.data().generatedTokens || []), tokenCode] 
        });

        transaction.set(tokenRef, {
          tokenCode: tokenCode,
          userId: user.uid,
          studentName: userDoc.data().displayName,
          studentSchool: userDoc.data().school,
          studentPhone: userDoc.data().phone || user.email,
          status: 'active',
          score: null,
          createdAt: new Date().toISOString(),
          isSent: true, 
          sentMethod: 'DASHBOARD_GENERATE'
        });
      });
      alert("Token berhasil dibuat!");
    } catch (error) {
      alert("Gagal membuat token: " + error);
    } finally {
      setIsGenerating(false);
    }
  };

  // --- LOGIC AUTO FILL URL ---
  const handleStartExam = (tokenCode) => {
    // 1. Copy Token ke Clipboard (Backup)
    navigator.clipboard.writeText(tokenCode);
    
    // 2. Buka Link dengan Parameter Token (?token=...)
    window.open(`${EXAM_URL}?token=${tokenCode}`, '_blank');
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      
      {/* Header Melengkung */}
      <div className="bg-indigo-600 text-white p-8 pb-16 rounded-b-[2.5rem] shadow-xl">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
             <img 
                src="/LogoRuangSimulasi.svg" 
                alt="Logo" 
                className="w-28 h-28 object-contain drop-shadow-lg bg-white/95 backdrop-blur-sm p-3 rounded-2xl shadow-xl ring-1 ring-white/50" 
             />
             
             <div>
                <h1 className="text-2xl font-bold">Halo, {userData?.displayName?.split(' ')[0] || 'Siswa'} 👋</h1>
                <p className="text-indigo-200 text-sm mt-1">Siap untuk simulasi hari ini?</p>
             </div>
          </div>
          <button onClick={handleLogout} className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition text-white">
            <LogOut size={20}/>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 -mt-10 space-y-6">
        
        {/* Card Saldo */}
        <div className="bg-white rounded-3xl p-6 shadow-xl flex justify-between items-center border border-gray-100">
          <div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Sisa Credit</p>
            <p className="text-4xl font-black text-gray-800">{userData?.credits || 0}</p>
          </div>
          <button onClick={() => setShowPackageModal(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition flex items-center gap-2">
            <Plus size={18}/> Top Up
          </button>
        </div>

        {/* Card Generate */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6 text-center">
          <h3 className="font-bold text-indigo-900 mb-2 text-lg">Mulai Simulasi Baru</h3>
          <p className="text-indigo-600/70 text-sm mb-6">Gunakan 1 credit untuk mendapatkan token ujian Tryout UTBK Fullset.</p>
          <button onClick={handleGenerateToken} disabled={isGenerating} className="w-full bg-white text-indigo-600 py-3.5 rounded-xl font-bold shadow-sm hover:shadow-md transition flex items-center justify-center gap-2 border border-indigo-100">
            {isGenerating ? <Loader2 className="animate-spin" size={20}/> : <Ticket size={20}/>}
            {isGenerating ? 'Memproses...' : 'Generate Token (-1 Credit)'}
          </button>
        </div>

        {/* List Riwayat Token */}
        <div>
          <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2 px-2">
            <History size={20} className="text-gray-400"/> Riwayat Token
          </h3>
          
          <div className="space-y-3">
            {tokens.length === 0 && (
              <div className="bg-white p-8 rounded-2xl border border-dashed border-gray-300 text-center text-gray-400 text-sm">
                Belum ada riwayat ujian. Klik Generate Token diatas.
              </div>
            )}
            
            {tokens.map(t => (
              <div key={t.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 transition hover:shadow-md">
                
                {/* Info Token */}
                <div className="text-center md:text-left">
                  <div className="font-mono font-bold text-lg text-indigo-600 tracking-wider">{t.tokenCode}</div>
                  <div className="text-xs text-gray-400 mt-1">{new Date(t.createdAt).toLocaleString('id-ID')}</div>
                </div>

                {/* Tombol Aksi */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                  
                  <button 
                    onClick={() => {navigator.clipboard.writeText(t.tokenCode); alert("Token disalin!")}} 
                    className="p-2 border rounded-lg hover:bg-gray-50 text-gray-500" 
                    title="Salin Token"
                  >
                    <Copy size={18}/>
                  </button>

                  {/* Tombol Mulai Ujian (Auto Fill) */}
                  {t.status === 'active' ? (
                    <button 
                      onClick={() => handleStartExam(t.tokenCode)}
                      className="flex-1 md:flex-none px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-bold text-sm shadow hover:shadow-lg hover:-translate-y-0.5 transition flex items-center justify-center gap-2"
                    >
                      Mulai Ujian <ExternalLink size={14}/>
                    </button>
                  ) : (
                    <span className="px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-xs font-bold border border-gray-200 cursor-not-allowed">
                      Selesai
                    </span>
                  )}
                  
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {showPackageModal && (
        <PackageSelection user={user} onClose={() => setShowPackageModal(false)} />
      )}
    </div>
  );
};

// ==========================================
// 3. LANDING PAGE COMPONENT
// ==========================================
const LandingPageContent = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const navigate = useNavigate();

  const handleAuth = () => navigate('/signup'); 

  // --- Static Data ---
  const features = [
    { icon: <Brain className="w-8 h-8" />, title: "Soal Berkualitas Tinggi", description: "Ribuan soal berkualitas yang disusun oleh tim expert sesuai kisi-kisi UTBK terbaru.", color: "from-blue-500 to-cyan-500" },
    { icon: <BarChart3 className="w-8 h-8" />, title: "Analisis Performa", description: "Setiap simulasi langsung dipecah: subtest lemah, waktu terbuang, dan potensi naik skor.", color: "from-purple-500 to-pink-500" },
    { icon: <Trophy className="w-8 h-8" />, title: "Leaderboard Real-time", description: "Bandingkan skormu dengan ribuan peserta lain dan lacak perkembanganmu.", color: "from-orange-500 to-red-500" },
    { icon: <Shield className="w-8 h-8" />, title: "Sistem Aman & Terpercaya", description: "Fullscreen mode dengan deteksi kecurangan untuk simulasi ujian yang realistis.", color: "from-green-500 to-emerald-500" },
    { icon: <Clock className="w-8 h-8" />, title: "Timer Akurat", description: "Sistem timer yang presisi untuk melatih manajemen waktu seperti ujian sesungguhnya.", color: "from-indigo-500 to-blue-500" },
    { icon: <Zap className="w-8 h-8" />, title: "Akses Fleksibel", description: "Kerjakan kapan saja, dimana saja. Token valid 24 jam setelah diaktifkan.", color: "from-yellow-500 to-orange-500" }
  ];

  const packages = [
    { name: 'Paket Hemat', subtitle: 'Coba dulu sebelum serius', credits: 1, price: "10.000", originalPrice: null, description: '1 Token untuk 1x simulasi UTBK', features: ['1 Token Ujian Simulasi', 'Analisis Nilai Dasar', 'Akses Leaderboard'], color: "from-blue-50