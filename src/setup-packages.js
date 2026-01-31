
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

// Data Packages (Optimized for UI & Conversion)
const packages = [
  {
    id: 'pkg_hemat',
    name: 'Paket Hemat',
    subtitle: 'Coba dulu sebelum serius',
    credits: 1,
    price: 10000,
    originalPrice: null,
    pricePerToken: 10000,
    description: '1 Token untuk 1x simulasi UTBK',
    highlight: 'Pas buat first try & kenalan dengan sistem',
    features: [
      '1 Token Ujian Simulasi',
      'Analisis Nilai Dasar',
      'Akses Leaderboard'
    ],
    active: true,
    displayOrder: 1,
    color: 'from-blue-500 to-cyan-500',
    ctaText: 'Coba Sekarang',
    createdAt: new Date().toISOString()
  },
  {
    id: 'pkg_pejuang',
    name: 'Paket Pejuang',
    subtitle: 'Paling seimbang & paling dipilih',
    credits: 3,
    price: 25000,
    originalPrice: 30000,
    pricePerToken: 8333,
    description: '3 Token untuk latihan intensif',
    highlight: 'Ideal untuk uji strategi sebelum all-in UTBK',
    features: [
      '3 Token Ujian Simulasi',
      'Analisis Nilai & Ranking Akurat',
      'Leaderboard Nasional'
    ],
    active: true,
    displayOrder: 2,
    color: 'from-purple-600 to-pink-600',
    best: true,
    ctaText: 'Mulai Sekarang 🚀',
    createdAt: new Date().toISOString()
  },
  {
    id: 'pkg_sultan',
    name: 'Paket Sultan',
    subtitle: 'Paling hemat untuk pejuang serius',
    credits: 10,
    price: 75000,
    originalPrice: 100000,
    pricePerToken: 7500,
    description: '10 Token untuk persiapan maksimal',
    highlight: 'Lebih hemat dibanding beli satuan',
    features: [
      '10 Token Ujian Simulasi',
      'Analisis Lengkap & Riwayat',
      'Leaderboard Nasional'
    ],
    active: true,
    displayOrder: 3,
    color: 'from-orange-500 to-red-500',
    ctaText: 'Gas Pol 🚀',
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