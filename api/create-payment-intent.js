// api/create-payment-intent.js
const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async function handler(req, res) {
  console.log('API called with method:', req.method);
  console.log('Request body:', req.body);

  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ 
      error: { message: 'Method Not Allowed. Use POST.' } 
    });
  }

  try {
    const { amount, currency = 'usd', metadata = {} } = req.body;

    console.log('Creating payment intent for:', { amount, currency, metadata });

    // Validate amount (amount must be in cents)
    if (!amount || amount < 50) {
      return res.status(400).json({
        error: { 
          message: 'Amount must be at least $0.50' 
        }
      });
    }

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata: {
        ...metadata,
        source: 'reformed-chapter-donation',
      },
      automatic_payment_methods: { enabled: true },
    });

    console.log('Payment intent created:', paymentIntent.id);

    // Send JSON response
    return res.status(200).json({
      client_secret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return res.status(500).json({
      error: { 
        message: error.message || 'Failed to create payment intent' 
      }
    });
  }
};