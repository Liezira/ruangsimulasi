import React, { useState } from 'react';
import { Mail, Lock, User, X, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
// Import auth dari file firebase.js kamu
import { auth } from './firebase'; 

const AuthModal = ({ onClose }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // --- LOGIC: REGISTER & LOGIN EMAIL ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isRegister) {
        // REGISTER FLOW
        if (!name.trim()) throw new Error("Nama wajib diisi.");
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Update Nama User di Firebase Auth
        await updateProfile(userCredential.user, { displayName: name });
      } else {
        // LOGIN FLOW
        await signInWithEmailAndPassword(auth, email, password);
      }
      onClose(); // Tutup modal jika sukses
    } catch (err) {
      let msg = "Terjadi kesalahan.";
      if (err.code === 'auth/invalid-email') msg = "Format email salah.";
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') msg = "Email atau password salah.";
      if (err.code === 'auth/email-already-in-use') msg = "Email sudah terdaftar.";
      if (err.code === 'auth/weak-password') msg = "Password minimal 6 karakter.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // --- LOGIC: GOOGLE LOGIN ---
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      onClose();
    } catch (err) {
      console.error(err);
      setError("Gagal login Google.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative">
        
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition text-gray-500">
          <X size={20}/>
        </button>

        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {isRegister ? 'Buat Akun Baru' : 'Selamat Datang'}
            </h2>
            <p className="text-gray-500 text-sm">
              {isRegister ? 'Mulai perjalananmu menuju PTN impian.' : 'Lanjutkan progres belajar kamu.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm font-medium animate-pulse">
              <AlertCircle size={18}/> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 ml-1">Nama Lengkap</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Budi Santoso"/>
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 ml-1">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="nama@email.com"/>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 ml-1">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="••••••••"/>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg flex items-center justify-center gap-2 mt-4">
              {isLoading ? <Loader2 className="animate-spin"/> : (isRegister ? 'Daftar Sekarang' : 'Masuk Akun')} 
              {!isLoading && <ArrowRight size={18}/>}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400">Atau masuk dengan</span></div>
          </div>

          <button type="button" onClick={handleGoogleLogin} disabled={isLoading} className="w-full bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 transition flex items-center justify-center gap-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Google
          </button>

          <p className="text-center text-sm text-gray-500 mt-8">
            {isRegister ? "Sudah punya akun? " : "Belum punya akun? "}
            <button onClick={() => { setIsRegister(!isRegister); setError(''); }} className="text-indigo-600 font-bold hover:underline">
              {isRegister ? "Login disini" : "Daftar sekarang"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
