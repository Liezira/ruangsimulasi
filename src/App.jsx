import React, { useState, useEffect } from 'react';
import { 
  CreditCard, LayoutDashboard, LogOut, CheckCircle2, Zap, 
  ShieldCheck, Brain, Rocket, ChevronRight, Menu, X, Star, 
  History, Plus, Loader2, Copy, BarChart3, Clock, AlertTriangle 
} from 'lucide-react';

// --- IMPORT DARI FIREBASE SDK ---
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { 
  doc, onSnapshot, setDoc, query, collection, 
  where, orderBy, runTransaction, getDoc 
} from 'firebase/firestore';

// --- IMPORT DARI FILE CONFIG KAMU (PENTING!) ---
import { auth, db } from './firebase'; 

// --- IMPORT COMPONENT AUTH ---
import AuthModal from './AuthModal'; 

const EXAM_APP_URL = "https://utbk-simulation-tester-student.vercel.app/"; 

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('landing'); 
  
  const [pendingPayment, setPendingPayment] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // --- CEK STATUS LOGIN ---
  useEffect(() => {
    // Menggunakan 'auth' yang di-import dari ./firebase
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setView('dashboard');
        
        // Simpan/Update data user ke Firestore
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const snap = await getDoc(userRef);
          if (!snap.exists()) {
            await setDoc(userRef, {
              displayName: currentUser.displayName || 'Siswa Baru',
              email: currentUser.email,
              photoURL: currentUser.photoURL || '',
              credits: 0, 
              role: 'student',
              createdAt: new Date().toISOString()
            });
          }
        } catch (e) {
          console.error("Gagal sync user:", e);
        }
      } else {
        setUser(null);
        setView('landing');
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => { await signOut(auth); };

  // Logic: Klik Beli -> Cek Login -> Buka Modal jika belum
  const handleBuyIntent = (packetName) => {
    if (!user) {
      setPendingPayment(packetName); 
      setShowAuthModal(true); 
    } else {
      setView('dashboard');
      setPendingPayment(packetName); 
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="animate-spin text-indigo-600 h-10 w-10"/>
    </div>
  );

  return (
    <div className="font-sans text-gray-800 bg-gray-50 min-h-screen flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* MODAL AUTH */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

      {/* NAVBAR */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${view === 'landing' ? 'bg-white/80 backdrop-blur-md border-b border-gray-100' : 'bg-white border-b border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView(user ? 'dashboard' : 'landing')}>
              <div className="bg-indigo-600 text-white p-2 rounded-xl shadow-lg shadow-indigo-200"><Brain size={24} /></div>
              <span className="font-bold text-xl tracking-tight text-gray-900">Ruang<span className="text-indigo-600">Simulasi</span></span>
            </div>

            {/* Menu Kanan */}
            <div>
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="hidden md:flex flex-col text-right">
                    <span className="text-sm font-bold text-gray-800">{user.displayName}</span>
                    <span className="text-[10px] text-gray-500 bg-gray-100 px-2 rounded-full w-fit ml-auto">Student</span>
                  </div>
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-10 h-10 rounded-full border-2 border-indigo-100" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg border-2 border-indigo-200">
                      {user.displayName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition" title="Keluar"><LogOut size={20}/></button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <a href="#pricing" className="hidden md:block text-sm font-medium text-gray-600 hover:text-indigo-600 transition">Harga Paket</a>
                  <button onClick={() => setShowAuthModal(true)} className="bg-gray-900 text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-gray-800 transition shadow-lg flex items-center gap-2">
                    Masuk / Daftar <ChevronRight size={16}/>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* KONTEN */}
      <main className="flex-grow pt-16">
        {view === 'landing' ? (
          <LandingPage onBuy={handleBuyIntent} onLogin={() => setShowAuthModal(true)} />
        ) : (
          <StudentDashboard user={user} autoOpenPayment={pendingPayment} clearPending={() => setPendingPayment(null)} />
        )}
      </main>

      {/* FOOTER */}
      {view === 'landing' && (
        <footer className="bg-white border-t py-12">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <div className="flex justify-center items-center gap-2 mb-4 opacity-50">
              <Brain size={24} />
              <span className="font-bold text-xl tracking-tight text-gray-900">Ruang<span className="text-indigo-600">Simulasi</span></span>
            </div>
            <p className="text-gray-400 text-sm mb-6">Platform Simulasi UTBK SNBT Paling Akurat & Terpercaya.</p>
            <p className="text-gray-300 text-xs">© {new Date().getFullYear()} Liezira.Tech All rights reserved.</p>
          </div>
        </footer>
      )}
    </div>
  );
};

// ==========================================
// HALAMAN 1: LANDING PAGE
// ==========================================
const LandingPage = ({ onBuy, onLogin }) => {
  return (
    <div className="animate-in fade-in duration-700">
      {/* HERO SECTION */}
      <section className="relative pt-20 pb-32 px-4 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-indigo-100/50 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-8 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Sistem Terbaru UTBK 2026
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-8 leading-tight tracking-tight">
            Jangan Biarkan Skor UTBK <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Hancur Karena Kaget.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            90% siswa gagal bukan karena tidak pintar, tapi karena <strong>tidak terbiasa</strong> dengan tekanan waktu dan format soal Blocking Time. Latih mentalmu di sini sekarang.
          </p>
          
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <button onClick={onLogin} className="px-8 py-4 rounded-full bg-indigo-600 text-white font-bold text-lg hover:bg-indigo-700 transition shadow-xl shadow-indigo-200 flex items-center justify-center gap-2 transform hover:-translate-y-1">
              Coba Simulasi Sekarang <ChevronRight size={20}/>
            </button>
            <a href="#features" className="px-8 py-4 rounded-full bg-white text-gray-700 font-bold text-lg border border-gray-200 hover:bg-gray-50 transition flex items-center justify-center gap-2">
              Pelajari Fitur
            </a>
          </div>

          <div className="mt-12 flex items-center justify-center gap-8 opacity-60 grayscale hover:grayscale-0 transition duration-500">
             <span className="font-bold text-xl text-gray-400">UI</span>
             <span className="font-bold text-xl text-gray-400">ITB</span>
             <span className="font-bold text-xl text-gray-400">UGM</span>
             <span className="font-bold text-xl text-gray-400">ITS</span>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-24 px-4 bg-white relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Kenapa Harus <span className="font-bold text-xl tracking-tight text-gray-900">Ruang<span className="text-indigo-600">Simulasi?</span></span></h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Pengalaman ujian yang sesungguhnya agar kamu tidak kaget di hari H.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-3xl hover:bg-indigo-50 transition duration-300 border border-gray-100 group">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-md mb-6 group-hover:scale-110 transition">
                <Clock size={28} className="text-blue-600"/>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Sistem Blocking Time</h3>
              <p className="text-gray-600 leading-relaxed">Persis seperti aslinya. Kamu tidak bisa kembali ke subtes sebelumnya jika waktu habis.</p>
            </div>
            <div className="bg-gray-50 p-8 rounded-3xl hover:bg-indigo-50 transition duration-300 border border-gray-100 group">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-md mb-6 group-hover:scale-110 transition">
                <BarChart3 size={28} className="text-purple-600"/>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Penilaian IRT Realtime</h3>
              <p className="text-gray-600 leading-relaxed">Skor keluar detik itu juga menggunakan metode Item Response Theory. Tidak perlu menunggu besok.</p>
            </div>
            <div className="bg-gray-50 p-8 rounded-3xl hover:bg-indigo-50 transition duration-300 border border-gray-100 group">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-md mb-6 group-hover:scale-110 transition">
                <Zap size={28} className="text-yellow-500"/>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Akses Cepat & Ringan</h3>
              <p className="text-gray-600 leading-relaxed">Tanpa aplikasi berat. Akses langsung dari browser HP atau Laptop. UI bersih dan fokus.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="py-24 px-4 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Investasi Masa Depanmu</h2>
              <p className="text-gray-400 max-w-xl">Biaya tryout lebih murah daripada harga kopi, tapi dampaknya seumur hidup.</p>
            </div>
            <div className="bg-gray-800 p-1 rounded-lg inline-flex">
              <button className="px-4 py-2 bg-indigo-600 rounded-md text-xs font-bold">Sistem Credit</button>
              <button className="px-4 py-2 text-gray-400 text-xs font-bold">Langganan (Soon)</button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Paket 1 */}
            <div className="bg-gray-800 border border-gray-700 rounded-3xl p-8 hover:border-gray-500 transition">
              <div className="mb-4"><span className="text-sm font-bold text-indigo-400 uppercase tracking-wider">Pemula</span></div>
              <h3 className="text-2xl font-bold mb-2">Paket Hemat</h3>
              <div className="flex items-baseline gap-1 mb-6"><span className="text-4xl font-black">Rp 10.000</span></div>
              <p className="text-gray-400 text-sm mb-8">Cocok untuk yang baru mau coba simulasi pertama kali.</p>
              <ul className="space-y-4 mb-8 text-sm text-gray-300">
                <li className="flex gap-3"><CheckCircle2 size={18} className="text-indigo-400"/> 1 Credit Ujian</li>
                <li className="flex gap-3"><CheckCircle2 size={18} className="text-indigo-400"/> Akses 24 Jam</li>
                <li className="flex gap-3"><CheckCircle2 size={18} className="text-indigo-400"/> Pembahasan Singkat</li>
              </ul>
              <button onClick={() => onBuy("Hemat")} className="w-full py-4 rounded-xl bg-white text-gray-900 font-bold hover:bg-gray-200 transition">Beli Sekarang</button>
            </div>

            {/* Paket 2 */}
            <div className="bg-indigo-600 rounded-3xl p-8 transform md:-translate-y-4 shadow-2xl shadow-indigo-900/50 relative">
              <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white">PALING POPULER</div>
              <div className="mb-4"><span className="text-sm font-bold text-indigo-200 uppercase tracking-wider">Pejuang PTN</span></div>
              <h3 className="text-2xl font-bold mb-2">Paket Fokus</h3>
              <div className="flex items-baseline gap-1 mb-6"><span className="text-4xl font-black">Rp 25.000</span></div>
              <p className="text-indigo-100 text-sm mb-8">Pilihan terbaik untuk evaluasi progress mingguan.</p>
              <ul className="space-y-4 mb-8 text-sm text-white font-medium">
                <li className="flex gap-3"><CheckCircle2 size={18} className="text-white"/> <strong>3 Credit Ujian</strong> (Hemat 5rb)</li>
                <li className="flex gap-3"><CheckCircle2 size={18} className="text-white"/> Berlaku Selamanya</li>
                <li className="flex gap-3"><CheckCircle2 size={18} className="text-white"/> Analisis Peluang</li>
              </ul>
              <button onClick={() => onBuy("Pejuang")} className="w-full py-4 rounded-xl bg-white text-indigo-700 font-bold hover:bg-gray-50 transition shadow-lg">Beli Sekarang</button>
            </div>

            {/* Paket 3 */}
            <div className="bg-gray-800 border border-gray-700 rounded-3xl p-8 hover:border-gray-500 transition">
              <div className="mb-4"><span className="text-sm font-bold text-yellow-500 uppercase tracking-wider">Ambisius</span></div>
              <h3 className="text-2xl font-bold mb-2">Paket Sultan</h3>
              <div className="flex items-baseline gap-1 mb-6"><span className="text-4xl font-black">Rp 75.000</span></div>
              <p className="text-gray-400 text-sm mb-8">Untuk kamu yang ingin hajar semua materi sampai tuntas.</p>
              <ul className="space-y-4 mb-8 text-sm text-gray-300">
                <li className="flex gap-3"><CheckCircle2 size={18} className="text-yellow-500"/> <strong>10 Credit Ujian</strong></li>
                <li className="flex gap-3"><CheckCircle2 size={18} className="text-yellow-500"/> Prioritas Server</li>
                <li className="flex gap-3"><CheckCircle2 size={18} className="text-yellow-500"/> Konsultasi Jurusan</li>
              </ul>
              <button onClick={() => onBuy("Sultan")} className="w-full py-4 rounded-xl bg-gray-700 text-white font-bold hover:bg-gray-600 transition">Beli Sekarang</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// ==========================================
// HALAMAN 2: DASHBOARD (PRIVATE)
// ==========================================
const StudentDashboard = ({ user, autoOpenPayment, clearPending }) => {
  const [userData, setUserData] = useState(null);
  const [myTokens, setMyTokens] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);

  // AUTO-OPEN PAYMENT IF PENDING
  useEffect(() => {
    if (autoOpenPayment) {
      setShowTopUpModal(true);
      clearPending(); 
    }
  }, [autoOpenPayment]);

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = onSnapshot(doc(db, 'users', user.uid), (doc) => setUserData(doc.data()));
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user?.uid) return;
    const q = query(collection(db, 'tokens'), where('studentEmail', '==', user.email), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => setMyTokens(snap.docs.map(d => ({id: d.id, ...d.data()}))));
    return () => unsub();
  }, [user]);

  const handleGenerateToken = async () => {
    if ((userData?.credits || 0) < 1) { setShowTopUpModal(true); return; }
    if (!confirm("Gunakan 1 Credit untuk token baru?")) return;

    setIsGenerating(true);
    try {
      const newTokenCode = `UTBK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const userRef = doc(db, 'users', user.uid);
      const tokenRef = doc(db, 'tokens', newTokenCode);

      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        const currentCredits = userDoc.data().credits || 0;
        if (currentCredits < 1) throw "Saldo habis!";
        
        transaction.update(userRef, { credits: currentCredits - 1 });
        transaction.set(tokenRef, {
          tokenCode: newTokenCode,
          studentName: user.displayName,
          studentEmail: user.email,
          studentPhone: '-',
          status: 'active',
          createdAt: new Date().toISOString(),
          isSent: false,
          sentMethod: 'Self-Generated',
          score: null,
          createdBy: 'STUDENT'
        });
      });
      alert("Token Berhasil Dibuat!");
    } catch (error) { alert("Gagal: " + error); } finally { setIsGenerating(false); }
  };

  const handlePaymentMockup = (plan) => {
    alert(`[MOCKUP] Midtrans Payment: ${plan.name} (Rp ${plan.price})`);
    if(confirm("Simulasi: Anggap bayar sukses?")) {
        const userRef = doc(db, 'users', user.uid);
        runTransaction(db, async(t) => {
            const u = await t.get(userRef);
            t.update(userRef, { credits: (u.data().credits || 0) + plan.credit });
        });
        setShowTopUpModal(false);
    }
  };

  const startExam = (token) => { window.location.href = `${EXAM_APP_URL}/?token=${token}`; };
  const copyToken = (code) => { navigator.clipboard.writeText(code); alert("Token disalin!"); };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      {/* HEADER DASHBOARD */}
      <div className="bg-gradient-to-br from-indigo-900 to-indigo-700 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">Halo, {user.displayName} 🚀</h2>
            <p className="text-indigo-200">Saldo Credit: <strong>{userData?.credits || 0}</strong></p>
          </div>
          <button onClick={() => setShowTopUpModal(true)} className="bg-white text-indigo-700 px-6 py-3 rounded-xl font-bold shadow-md hover:bg-indigo-50 transition flex items-center gap-2">
            <Plus size={20}/> Top Up Credit
          </button>
        </div>
      </div>

      {/* GENERATE TOKEN */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Mulai Ujian Mandiri</h3>
        <p className="text-gray-500 mb-6 text-sm">Tukarkan 1 Credit untuk mendapatkan Token Ujian.</p>
        <button 
          onClick={handleGenerateToken} 
          disabled={isGenerating || (userData?.credits || 0) < 1}
          className={`mx-auto px-8 py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-3 transition transform hover:-translate-y-1 ${(userData?.credits || 0) > 0 ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
        >
          {isGenerating ? <Loader2 className="animate-spin"/> : <Zap fill="currentColor"/>}
          {isGenerating ? 'Memproses...' : 'Generate Token (-1 Credit)'}
        </button>
      </div>

      {/* HISTORY */}
      <div className="space-y-4">
        <h3 className="font-bold text-gray-700 flex items-center gap-2"><History size={20}/> Token Saya</h3>
        {myTokens.map((token) => (
          <div key={token.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
                <div className="font-mono font-bold text-lg text-indigo-600">{token.tokenCode}</div>
                <div className="text-xs text-gray-400">{new Date(token.createdAt).toLocaleString()}</div>
            </div>
            {token.status === 'active' ? (
                <div className="flex gap-2">
                    <button onClick={() => copyToken(token.tokenCode)} className="px-4 py-2 border rounded-lg hover:bg-gray-50"><Copy size={16}/></button>
                    <button onClick={() => startExam(token.tokenCode)} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-md">Mulai Ujian</button>
                </div>
            ) : (
                <span className="font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full text-xs">Selesai (Skor: {token.score})</span>
            )}
          </div>
        ))}
        {myTokens.length === 0 && <div className="text-center py-10 text-gray-400 italic">Belum ada history.</div>}
      </div>

      {/* MODAL TOP UP */}
      {showTopUpModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl text-gray-900">Pilih Paket</h3>
              <button onClick={()=>setShowTopUpModal(false)} className="bg-gray-100 p-2 rounded-full"><X size={20}/></button>
            </div>
            <div className="space-y-3">
              {[ {name: "Paket Hemat", credit: 1, price: 10000}, {name: "Paket Pejuang", credit: 3, price: 25000, best: true}, {name: "Paket Sultan", credit: 10, price: 75000} ].map((pkt, idx) => (
                <div key={idx} onClick={() => handlePaymentMockup(pkt)} className={`p-4 rounded-xl border-2 cursor-pointer flex justify-between items-center hover:border-indigo-500 ${pkt.best ? 'border-indigo-200 bg-indigo-50' : 'border-gray-100'}`}>
                  <div>
                    <h4 className="font-bold">{pkt.name} {pkt.best && <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded ml-2">BEST</span>}</h4>
                    <p className="text-sm text-gray-500">{pkt.credit}x Tryout</p>
                  </div>
                  <span className="font-bold text-lg">Rp {pkt.price.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
