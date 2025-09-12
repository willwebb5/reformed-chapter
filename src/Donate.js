import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import Header from './Header/Header';

// Load Stripe outside of component to avoid recreating on every render
const publishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

const CheckoutForm = ({ amount, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setMessage('');

    try {
      // Create payment intent on your server
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST', // ✅ must be POST
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // convert $ to cents
          currency: 'usd',
          metadata: { type: 'donation' },
        }),
      });

const data = await response.json();
console.log(data.client_secret); // use this for Stripe.js

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response error:', response.status, errorText);
        throw new Error(`Server error (${response.status}): ${errorText || 'Unknown error'}`);
      }

      // Check if response content-type is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.error('Non-JSON response received:', responseText);
        throw new Error('Server returned non-JSON response. Please check your backend endpoint.');
      }

      let responseData;
      try {
        responseData = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', jsonError);
        throw new Error('Invalid JSON response from server. Please check your backend endpoint.');
      }

      const { client_secret: clientSecret, error: serverError } = responseData;

      if (serverError) {
        throw new Error(serverError.message || 'Server error occurred');
      }

      // Fixed: Use clientSecret instead of finalClientSecret
      if (!clientSecret) {
        console.error('Missing client_secret in response:', responseData);
        throw new Error('Invalid response from server: missing client_secret');
      }

      // Confirm the payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            // You can collect billing details if needed
          },
        },
      });

      if (error) {
        console.error('Stripe payment error:', error);
        setMessage(error.message);
        onError?.(error);
      } else if (paymentIntent.status === 'succeeded') {
        setMessage('Thank you for your generous donation!');
        onSuccess?.(paymentIntent);
      }
    } catch (err) {
      console.error('Payment processing error:', err);
      setMessage(err.message || 'An unexpected error occurred.');
      onError?.(err);
    }

    setProcessing(false);
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': { color: '#aab7c4' },
      },
      invalid: { color: '#dc2626' },
    },
  };

  return (
    <div className="donation-form">
      <div className="card-element-container">
        <CardElement options={cardElementOptions} />
      </div>
      
      <button
        onClick={handleSubmit}
        disabled={!stripe || processing}
        className="donate-button"
      >
        {processing ? 'Processing...' : `Donate $${amount}`}
      </button>
      
      {message && (
        <div className={`message ${message.includes('Thank you') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}
    </div>
  );
};

const ReformedChapterDonate = () => {
  const [amount, setAmount] = useState(25);
  const [customAmount, setCustomAmount] = useState('');
  const [showForm, setShowForm] = useState(false);

  const presetAmounts = [15, 25, 50, 100];

  // Show error if Stripe key is missing
  if (!publishableKey) {
    return (
      <div className="error-container">
        <h2>⚠️ Stripe Configuration Missing</h2>
        <p>Please check your <code>.env.local</code> file and make sure you have:</p>
        <pre>REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here</pre>
        <p>Then restart your server with <code>npm run dev</code></p>
      </div>
    );
  }

  const handleAmountSelect = (selectedAmount) => {
    setAmount(selectedAmount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value;
    setCustomAmount(value);
    if (value && !isNaN(value) && parseFloat(value) > 0) {
      setAmount(parseFloat(value));
    }
  };

  const handleSuccess = (paymentIntent) => {
    console.log('Payment successful:', paymentIntent);
    setShowForm(false);
  };

  const handleError = (error) => {
    console.error('Payment error:', error);
  };

  return (
    <div className="page-container">
      <Header />
      
      {/* Support Message Bubble */}
      <div className="support-message">
  <h2>Support Reformed Chapter</h2>
  <p>
    Reformed Chapter is a personal project created to make Reformed biblical 
    resources more accessible to believers around the world. All of the content 
    on this site is provided free of charge, and your support helps cover the 
    costs of hosting, development, and continued growth.
  </p>
  <p>
    If you’ve found this resource valuable, would you prayerfully consider 
    supporting it? Every gift—large or small—directly helps me continue building 
    and improving Reformed Chapter for the good of the church.
  </p>
  <div className="verse">
    <em>
      "Each of you should give what you have decided in your heart to give, not 
      reluctantly or under compulsion, for God loves a cheerful giver." 
      – 2 Corinthians 9:7
    </em>
  </div>
</div>

      {/* Donation Form */}
      <div className="donate-container">
        <h3>Make a Donation</h3>
        
        {!showForm ? (
          <div className="amount-selection">
            <div className="preset-amounts">
              {presetAmounts.map((presetAmount) => (
                <button
                  key={presetAmount}
                  onClick={() => handleAmountSelect(presetAmount)}
                  className={`amount-button ${amount === presetAmount ? 'selected' : ''}`}
                >
                  ${presetAmount}
                </button>
              ))}
            </div>
            
            <div className="custom-amount">
              <label htmlFor="custom-amount">Other Amount:</label>
              <input
                id="custom-amount"
                type="number"
                min="1"
                step="0.01"
                placeholder="Enter amount"
                value={customAmount}
                onChange={handleCustomAmountChange}
              />
            </div>
            
            <button
              onClick={() => setShowForm(true)}
              disabled={!amount || amount <= 0}
              className="proceed-button"
            >
              Continue with ${amount}
            </button>
          </div>
        ) : (
          <div className="payment-form">
            <div className="donation-summary">
              <h4>Donation Amount: ${amount}</h4>
              <p>Thank you for supporting Reformed Chapter</p>
            </div>
            
            <Elements stripe={stripePromise}>
              <CheckoutForm
                amount={amount}
                onSuccess={handleSuccess}
                onError={handleError}
              />
            </Elements>
            
            <button
              onClick={() => setShowForm(false)}
              className="back-button"
            >
              ← Change Amount
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .page-container {
          max-width: 700px;
          margin: 0 auto;
          padding: 20px;
          padding-top: 100px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
        }

        .support-message {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 30px;
          margin-bottom: 30px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .support-message h2 {
          color: #2d3748;
          margin-top: 0;
          margin-bottom: 20px;
          font-size: 1.5em;
          font-weight: 600;
        }

        .support-message p {
          margin-bottom: 15px;
          color: #4a5568;
        }

        .verse {
          background: #edf2f7;
          border-left: 4px solid #4a5568;
          padding: 15px 20px;
          margin-top: 20px;
          border-radius: 0 8px 8px 0;
          color: #2d3748;
          font-size: 0.95em;
        }

        .donate-container {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .donate-container h3 {
          text-align: center;
          margin-bottom: 25px;
          color: #2d3748;
          font-size: 1.3em;
          font-weight: 600;
        }

        .amount-selection {
          text-align: center;
        }

        .preset-amounts {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
          gap: 12px;
          margin-bottom: 25px;
        }

        .amount-button {
          padding: 12px 16px;
          border: 2px solid #e2e8f0;
          background: white;
          color: #4a5568;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 500;
          transition: all 0.2s;
        }

        .amount-button:hover {
          border-color: #cbd5e0;
          background: #f7fafc;
        }

        .amount-button.selected {
          background: #4a5568;
          color: white;
          border-color: #4a5568;
        }

        .custom-amount {
          margin-bottom: 25px;
        }

        .custom-amount label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #4a5568;
        }

        .custom-amount input {
          padding: 12px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 16px;
          width: 200px;
          max-width: 100%;
          box-sizing: border-box;
          text-align: center;
          transition: border-color 0.2s;
        }

        .custom-amount input:focus {
          outline: none;
          border-color: #4a5568;
        }

        .proceed-button {
          background: #4a5568;
          color: white;
          border: none;
          padding: 14px 28px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .proceed-button:hover:not(:disabled) {
          background: #2d3748;
        }

        .proceed-button:disabled {
          background: #cbd5e0;
          cursor: not-allowed;
        }

        .payment-form {
          text-align: center;
        }

        .donation-summary {
          background: #f7fafc;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 25px;
        }

        .donation-summary h4 {
          margin-bottom: 8px;
          color: #2d3748;
          font-size: 1.2em;
        }

        .donation-summary p {
          color: #4a5568;
          margin: 0;
        }

        .donation-form {
          max-width: 400px;
          margin: 0 auto;
        }

        .card-element-container {
          padding: 16px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          margin-bottom: 20px;
          background: white;
          transition: border-color 0.2s;
        }

        .card-element-container:focus-within {
          border-color: #4a5568;
        }

        .donate-button {
          width: 100%;
          padding: 16px;
          background: #4a5568;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .donate-button:hover:not(:disabled) {
          background: #2d3748;
        }

        .donate-button:disabled {
          background: #cbd5e0;
          cursor: not-allowed;
        }

        .back-button {
          background: transparent;
          color: #4a5568;
          border: 2px solid #e2e8f0;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
          margin-top: 15px;
          transition: all 0.2s;
        }

        .back-button:hover {
          border-color: #cbd5e0;
          background: #f7fafc;
        }

        .message {
          margin-top: 15px;
          padding: 12px 16px;
          border-radius: 8px;
          font-weight: 500;
        }

        .message.success {
          background: #f0fff4;
          color: #38a169;
          border: 1px solid #c6f6d5;
        }

        .message.error {
          background: #fed7d7;
          color: #e53e3e;
          border: 1px solid #feb2b2;
        }

        .error-container {
          max-width: 500px;
          margin: 50px auto;
          padding: 20px;
          background: #fed7d7;
          border: 1px solid #feb2b2;
          border-radius: 8px;
          text-align: center;
        }

        .error-container pre {
          background: #f7fafc;
          padding: 10px;
          text-align: left;
          border-radius: 4px;
          font-size: 14px;
        }

        @media (max-width: 640px) {
          .page-container {
            padding: 15px;
            padding-top: 80px;
          }

          .support-message {
            padding: 20px;
            margin-bottom: 20px;
          }

          .support-message h2 {
            font-size: 1.3em;
          }

          .support-message p {
            font-size: 0.95em;
          }

          .verse {
            padding: 12px 15px;
            font-size: 0.9em;
          }

          .donate-container {
            padding: 20px;
          }

          .donate-container h3 {
            font-size: 1.2em;
          }

          .preset-amounts {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }

          .amount-button {
            padding: 14px 12px;
            font-size: 15px;
          }

          .custom-amount input {
            width: calc(100% - 4px);
            max-width: none;
          }

          .proceed-button {
            width: 100%;
            padding: 16px;
          }

          .donation-form {
            max-width: none;
          }

          .back-button {
            width: 100%;
            margin-top: 20px;
          }

          .donation-summary {
            padding: 15px;
          }

          .donation-summary h4 {
            font-size: 1.1em;
          }
        }
      `}</style>
    </div>
    
  );
};

export default ReformedChapterDonate;