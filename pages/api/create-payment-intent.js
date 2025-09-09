// api/create-payment-intent.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const { amount, currency = 'usd', metadata = {} } = req.body;

      // Validate amount (amount must be in cents, so 50 = $0.50)
      if (!amount || amount < 50) {
        return res.status(400).json({
          error: 'Amount must be at least $0.50',
          message: 'Invalid amount provided',
        });
      }

      // Create PaymentIntent
      const paymentIntent = await stripe.paymentIntents.create({
        amount, // already in cents from frontend
        currency,
        metadata: {
          ...metadata,
          source: 'reformed-chapter-donation',
        },
        automatic_payment_methods: { enabled: true },
      });

      res.status(200).json({
        client_secret: paymentIntent.client_secret,
        payment_intent_id: paymentIntent.id,
      });
    } catch (error) {
      console.error('Error creating payment intent:', error);
      res.status(500).json({
        error: 'Failed to create payment intent',
        message: error.message,
      });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
