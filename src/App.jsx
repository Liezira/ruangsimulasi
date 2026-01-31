import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { auth, db } from './firebase'; // Pastikan path firebase benar

// --- COMPONENTS ---
import SignUpPages from './SignUpPages'; 
import PackageSelection from './PackageSelection'; // File Modal WA yang tadi
// import UTBKStudentApp from './UTBKStudentApp'; // Import File Ujian Kamu (Jika ada)

// --- ICONS ---
import { 
  Brain, Zap, Trophy, BarChart3, Shield, Clock, 
  ChevronRight, CheckCircle, Star, MessageCircle, 
  ArrowRight, Menu, X, Phone, Mail, Users, Award, Target,
  LogOut, Plus, History, Copy, User
} from 'lucide-react';

// ==========================================
// 1. DASHBOARD COMPONENT (Halaman Setelah Login)
// ==========================================
const Dashboard = ({ user }) => {
  const [userData, setUserData] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const navigate = useNavigate();

  // Listen Data User (Realtime Credit Update)
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      setUserData(doc.data());
    });
    return () => unsub();
  }, [user]);

  // Listen Token History
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'tokens'), where('studentPhone', '==', user.email)); // Note: Sesuaikan field query
    // Karena query user tokens agak kompleks, kita fetch manual simple dulu:
    const fetchTokens = async () => {
       // Opsional: Implementasi fetch token history
    };
    fetchTokens();
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const handleGenerateToken = () => {
    // Logic generate token (Panggil API Vercel / Cloud Function)
    // Untuk sementara bisa pakai alert
    if ((userData?.credits || 0) < 1) {
        alert("Credit tidak cukup! Silakan Top Up.");
        setShowPackageModal(true);
        return;
    }
    // Panggil fungsi generate di sini (sesuai backend kamu)
    alert("Fitur generate token akan memotong 1 credit.");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar Dashboard */}
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-2 font-bold text-xl text-gray-800">
          <Brain className="text-indigo-600"/> RuangSimulasi
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:block text-right">
            <div className="text-sm font-bold">{userData?.displayName || user.email}</div>
            <div className="text-xs text-green-600 font-bold">Student</div>
          </div>
          <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 transition"><LogOut size={20}/></button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-6 space-y-8">
        
        {/* Credit Card Banner */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h2 className="text-3xl font-bold mb-1">Halo, Pejuang PTN!</h2>
            <p className="text-indigo-100">Siap untuk simulasi hari ini?</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 flex items-center gap-6">
            <div>
              <p className="text-xs text-indigo-200 uppercase font-bold">Sisa Credit</p>
              <p className="text-4xl font-black">{userData?.credits || 0}</p>
            </div>
            <button onClick={() => setShowPackageModal(true)} className="bg-white text-indigo-700 px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-50 transition flex items-center gap-2">
              <Plus size={18}/> Beli Credit
            </button>
          </div>
        </div>

        {/* Action Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-indigo-200 transition">
            <h3 className="font-bold text-lg text-gray-800 mb-2 flex items-center gap-2"><Zap className="text-yellow-500"/> Mulai Ujian Baru</h3>
            <p className="text-gray-500 text-sm mb-6">Tukarkan 1 credit untuk mendapatkan token ujian Tryout UTBK Fullset.</p>
            <button onClick={handleGenerateToken} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition">
              Generate Token (-1 Credit)
            </button>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg text-gray-800 mb-2 flex items-center gap-2"><History className="text-blue-500"/> Riwayat Token</h3>
            <div className="h-32 flex items-center justify-center text-gray-400 text-sm italic bg-gray-50 rounded-xl">
              Belum ada riwayat ujian.
            </div>
          </div>
        </div>

      </div>

      {/* Modal Paket (Manual WA) */}
      {showPackageModal && (
        <PackageSelection user={user} onClose={() => setShowPackageModal(false)} />
      )}
    </div>
  );
};

// ==========================================
// 2. LANDING PAGE COMPONENT (Original Kamu)
// ==========================================
const LandingPageContent = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const navigate = useNavigate();

  const handleAuth = () => { navigate('/signup'); };

  // ... (DATA FEATURES, PACKAGES, TESTIMONIALS - Gunakan data asli kamu di sini) ...
  // AGAR KODENYA TIDAK KEPANJANGAN, SAYA PERSINGKAT DATA DUMMY-NYA
  // PASTIKAN KAMU PAKAI DATA ASLI DARI FILE SEBELUMNYA
  
  const features = [ { icon: <Brain/>, title: "Soal Berkualitas", description: "Sesuai kisi-kisi terbaru.", color: "from-blue-500" }, { icon: <BarChart3/>, title: "Analisis", description: "Lengkap & Akurat.", color: "from-purple-500" } ];
  const packages = [ { name: 'Paket Hemat', credits: 1, price: "10.000", features: ['1 Token'], color: "from-blue-500", popular: false }, { name: 'Paket Pejuang', credits: 3, price: "25.000", features: ['3 Token'], color: "from-purple-500", popular: true } ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 font-black text-xl text-gray-900"><Brain className="text-indigo-600"/> RuangSimulasi</div>
            <div className="hidden md:flex gap-6">
               <a href="#features" className="hover:text-indigo-600">Fitur</a>
               <a href="#pricing" className="hover:text-indigo-600">Harga</a>
               <button onClick={handleAuth} className="font-bold text-indigo-600">Login</button>
               <button onClick={handleAuth} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold">Daftar</button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-20 pb-32 text-center px-4 bg-gradient-to-b from-indigo-50 to-white">
         <h1 className="text-5xl font-black text-gray-900 mb-6">Raih Skor UTBK <span className="text-indigo-600">Impian</span></h1>
         <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">Platform simulasi paling akurat dengan sistem blocking time dan penilaian IRT.</p>
         <button onClick={handleAuth} className="bg-indigo-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:bg-indigo-700 transition">Mulai Simulasi Gratis</button>
      </section>

      {/* Features & Pricing (Render Map) */}
      {/* ... Silakan paste konten section Landing Page kamu yang lengkap di sini ... */}
      
    </div>
  );
};

// ==========================================
// 3. MAIN APP ROUTER & AUTH CHECKER
// ==========================================
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

  return (
    <Router>
      <Routes>
        {/* Halaman Publik */}
        <Route path="/" element={!user ? <LandingPageContent /> : <Navigate to="/dashboard" />} />
        <Route path="/signup" element={!user ? <SignUpPages /> : <Navigate to="/dashboard" />} />
        
        {/* Halaman Private (Butuh Login) */}
        <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/signup" />} />
        
        {/* Route Ujian (Nanti diintegrasikan) */}
        {/* <Route path="/ujian" element={user ? <UTBKStudentApp /> : <Navigate to="/" />} /> */}
      </Routes>
    </Router>
  );
}

export default App;