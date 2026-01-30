
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

// Data Packages yang akan dibuat
const packages = [
  {
    id: 'pkg_hemat',
    name: 'Paket Hemat',
    credits: 1,
    price: 10000,
    description: '1 Token untuk 1x simulasi UTBK',
    active: true,
    displayOrder: 1,
    color: 'from-blue-500 to-cyan-500',
    createdAt: new Date().toISOString()
  },
  {
    id: 'pkg_pejuang',
    name: 'Paket Pejuang',
    credits: 3,
    price: 20000,
    description: '3 Token untuk latihan intensif',
    active: true,
    displayOrder: 2,
    color: 'from-orange-500 to-red-500',
    best: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'pkg_pro',
    name: 'Paket Sultan',
    credits: 10,
    price: 50000,
    description: '10 Token untuk persiapan maksimal',
    active: true,
    displayOrder: 3,
    color: 'from-purple-500 to-pink-500',
    createdAt: new Date().toISOString()
  }
];

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