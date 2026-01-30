// api/createPayment.js
import { db, auth } from './_utils';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;
    const { packageId } = req.body;

    // Ambil Data Paket
    const pkgDoc = await db.collection('packages').doc(packageId).get();
    if (!pkgDoc.exists) throw new Error('Paket tidak ditemukan');
    const pkgData = pkgDoc.data();

    // Setup Midtrans
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const authString = Buffer.from(serverKey + ':').toString('base64');
    const orderId = `ORDER-${Date.now()}-${userId.substring(0,4)}`;

    // Request ke Midtrans
    const midtransRes = await fetch(
      process.env.MIDTRANS_IS_PRODUCTION === 'true' 
        ? 'https://api.midtrans.com/v2/charge' 
        : 'https://api.sandbox.midtrans.com/v2/charge',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${authString}`
        },
        body: JSON.stringify({
          payment_type: 'qris',
          transaction_details: { order_id: orderId, gross_amount: pkgData.price },
          customer_details: { email: decodedToken.email }
        })
      }
    );

    const midtransData = await midtransRes.json();

    // Simpan Transaksi ke Firestore
    await db.collection('transactions').add({
      userId,
      packageId,
      amount: pkgData.price,
      credits: pkgData.credits,
      orderId,
      status: 'pending',
      qrisUrl: midtransData.actions?.[0]?.url, 
      createdAt: new Date().toISOString()
    });

    res.status(200).json({ 
      success: true, 
      qrisUrl: midtransData.actions?.[0]?.url,
      amount: pkgData.price
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}