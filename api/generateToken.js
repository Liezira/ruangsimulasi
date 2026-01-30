// api/generateToken.js
import { db, auth } from './_utils';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  // 1. Verifikasi User (Security)
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // 2. Logic Generate Token (Sama seperti sebelumnya)
    const userRef = db.collection('users').doc(userId);
    
    // Gunakan Transaction
    await db.runTransaction(async (t) => {
      const userDoc = await t.get(userRef);
      if (!userDoc.exists) throw new Error('User not found');
      
      const userData = userDoc.data();
      if ((userData.credits || 0) < 1) throw new Error('Saldo Credit Habis!');

      // Generate Code
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let tokenCode = 'UTBK-';
      for (let i = 0; i < 6; i++) tokenCode += chars.charAt(Math.floor(Math.random() * chars.length));

      // Update DB
      t.update(userRef, { credits: userData.credits - 1 });
      t.set(db.collection('tokens').doc(tokenCode), {
        tokenCode,
        userId,
        studentName: userData.displayName || 'Siswa',
        status: 'active',
        createdAt: new Date().toISOString(),
        score: null
      });

      // Response Sukses
      res.status(200).json({ success: true, tokenCode });
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}