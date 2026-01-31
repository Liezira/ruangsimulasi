import React, { useState } from 'react';
import { 
  User, School, Mail, Lock, Loader2, ArrowRight, Sparkles, Brain, X, AlertCircle, CheckCircle2 
} from 'lucide-react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile,
  sendPasswordResetEmail, // <--- Import Baru
  sendEmailVerification   // <--- Import Baru
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore'; 
import { auth, db } from './firebase'; 

const SignUpPages = () => {
  const [mode, setMode] = useState('login'); 
  const [loading, setLoading] = useState(false);
  
  // State Forgot Password
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState(null); // 'success' | 'error'

  const [formData, setFormData] = useState({ 
    email: '', 
    password: '', 
    displayName: '', 
    school: '' 
  });

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (mode === 'login') {
        // --- LOGIN ---
        const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;

        // Auto-Heal Database (Jaga-jaga data hilang)
        const userDocRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userDocRef);

        if (!userSnap.exists()) {
          await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || 'Siswa',
            school: '-',
            role: 'student',
            credits: 0,
            createdAt: new Date().toISOString(),
            generatedTokens: []
          });
        }

      } else {
        // --- REGISTER ---
        if (!formData.displayName || !formData.school) {
          throw new Error("Nama dan Sekolah wajib diisi");
        }

        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;

        await updateProfile(user, { displayName: formData.displayName });

        // Simpan ke Database
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: formData.email,
          displayName: formData.displayName,
          school: formData.school,
          role: 'student',
          credits: 0,
          createdAt: new Date().toISOString(),
          generatedTokens: []
        });

        // 🔥 KIRIM EMAIL VERIFIKASI
        await sendEmailVerification(user);
        alert("Akun berhasil dibuat! Silakan cek email Anda untuk verifikasi sebelum login.");
      }
    } catch (err) {
      console.error(err);
      let msg = err.message;
      if (err.code === 'auth/invalid-credential') msg = "Email atau password salah.";
      if (err.code === 'auth/email-already-in-use') msg = "Email sudah terdaftar.";
      if (err.code === 'auth/weak-password') msg = "Password minimal 6 karakter.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIC LUPA PASSWORD ---
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if(!forgotEmail) return;
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, forgotEmail);
      setForgotStatus('success');
    } catch (error) {
      setForgotStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] relative flex items-center justify-center p-4 overflow-hidden font-sans">
      
      {/* Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-pulse delay-1000"></div>
      
      {/* --- MAIN CARD --- */}
      <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 p-8 md:p-10 rounded-[2.5rem] w-full max-w-md shadow-2xl z-10">
        
        {/* LOGO */}
        <div className="flex flex-col items-center justify-center mb-8 relative">
          <div className="absolute inset-0 bg-indigo-500 blur-[50px] opacity-20 rounded-full w-24 h-24 mx-auto top-4"></div>
          
          <div className="absolute -left-2 top-0 animate-bounce delay-700 opacity-60"><Sparkles className="text-yellow-400 w-6 h-6" /></div>
          <div className="absolute -right-2 top-8 animate-bounce delay-1000 opacity-60"><Brain className="text-pink-400 w-6 h-6" /></div>

          <img src="/LogoRuangSimulasi.svg" alt="Logo" className="w-32 h-32 md:w-40 md:h-40 object-contain relative z-10 drop-shadow-2xl" />
          
          <div className="text-center mt-4">
            <h1 className="text-3xl font-black text-white tracking-tight">
              {mode === 'login' ? 'Selamat Datang' : 'Mulai Sekarang'}
            </h1>
            <p className="text-indigo-200/80 text-sm mt-1 font-medium">Platform Simulasi UTBK #1</p>
          </div>
        </div>
        
        {/* FORM UTAMA */}
        <form onSubmit={handleAuth} className="space-y-4">
          
          {mode === 'register' && (
            <div className="space-y-4 animate-in slide-in-from-bottom-2 fade-in duration-300">
              <div className="relative">
                <User className="absolute left-4 top-3.5 text-indigo-300 w-5 h-5" />
                <input type="text" placeholder="Nama Lengkap" className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" required value={formData.displayName} onChange={e=>setFormData({...formData, displayName:e.target.value})} />
              </div>
              <div className="relative">
                <School className="absolute left-4 top-3.5 text-indigo-300 w-5 h-5" />
                <input type="text" placeholder="Asal Sekolah" className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" required value={formData.school} onChange={e=>setFormData({...formData, school:e.target.value})} />
              </div>
            </div>
          )}
          
          <div className="relative">
            <Mail className="absolute left-4 top-3.5 text-indigo-300 w-5 h-5" />
            <input type="email" placeholder="Email Kamu" className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" required value={formData.email} onChange={e=>setFormData({...formData, email:e.target.value})} />
          </div>
          
          <div className="relative">
            <Lock className="absolute left-4 top-3.5 text-indigo-300 w-5 h-5" />
            <input type="password" placeholder="Password" className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" required value={formData.password} onChange={e=>setFormData({...formData, password:e.target.value})} />
          </div>

          {/* LINK LUPA PASSWORD */}
          {mode === 'login' && (
            <div className="text-right">
              <button 
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-xs text-indigo-300 hover:text-white transition"
              >
                Lupa Password?
              </button>
            </div>
          )}
          
          <button disabled={loading} className="w-full py-3.5 mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 transform hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2 disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin"/> : (
              <> {mode === 'login' ? 'Masuk Dashboard' : 'Daftar Akun'} <ArrowRight size={18} /> </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-white/60 text-sm mb-2">{mode === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'}</p>
          <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="text-white font-semibold hover:text-indigo-300 transition-colors border-b border-transparent hover:border-indigo-300">
            {mode === 'login' ? 'Buat Akun Baru' : 'Login Sekarang'}
          </button>
        </div>
      </div>

      {/* --- MODAL LUPA PASSWORD --- */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1E293B] border border-white/10 w-full max-w-md rounded-3xl p-6 relative shadow-2xl animate-in zoom-in-95">
            <button onClick={() => {setShowForgotModal(false); setForgotStatus(null);}} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24}/></button>
            
            <h3 className="text-xl font-bold text-white mb-2">Reset Password</h3>
            <p className="text-gray-400 text-sm mb-6">Masukkan email yang terdaftar. Kami akan mengirimkan link untuk mereset passwordmu.</p>
            
            {forgotStatus === 'success' ? (
              <div className="bg-green-500/10 border border-green-500/50 rounded-xl p-4 text-center">
                <CheckCircle2 className="mx-auto text-green-400 mb-2" size={32} />
                <p className="text-green-200 font-medium">Link reset berhasil dikirim!</p>
                <p className="text-green-200/60 text-xs mt-1">Cek inbox atau folder spam emailmu.</p>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 text-indigo-300 w-5 h-5" />
                  <input type="email" placeholder="Email Terdaftar" className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" required value={forgotEmail} onChange={e=>setForgotEmail(e.target.value)} />
                </div>
                {forgotStatus === 'error' && (
                  <div className="flex items-center gap-2 text-red-400 text-xs bg-red-400/10 p-2 rounded-lg"><AlertCircle size={14}/> Email tidak ditemukan atau terjadi kesalahan.</div>
                )}
                <button disabled={loading} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg transition flex justify-center">
                  {loading ? <Loader2 className="animate-spin"/> : 'Kirim Link Reset'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default SignUpPages;