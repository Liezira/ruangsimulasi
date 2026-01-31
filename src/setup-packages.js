
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function setupPackages() {
  console.log('🚀 Mulai setup packages...\n');

  try {
    for (const pkg of packages) {
      const docRef = doc(db, 'packages', pkg.id);
      await setDoc(docRef, pkg);
      console.log(`✅ Created: ${pkg.name} - ${pkg.credits} credits - Rp ${pkg.price.toLocaleString('id-ID')}`);
    }

    console.log('\n✨ Semua packages berhasil dibuat!');
    console.log('\n📋 Next steps:');
    console.log('1. Buka Firebase Console → Firestore Database');
    console.log('2. Verifikasi collection "packages" sudah terisi');
    console.log('3. Lanjut ke fix berikutnya\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('1. Pastikan .env sudah benar');
    console.error('2. Pastikan Firestore sudah enabled di Firebase Console');
    console.error('3. Cek koneksi internet\n');
    process.exit(1);
  }
}

setupPackages();