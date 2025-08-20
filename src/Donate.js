import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

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
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          currency: 'usd',
          metadata: {
            type: 'donation',
            timestamp: new Date().toISOString(),
          },
        }),
      });

      const { clientSecret, error: serverError } = await response.json();

      if (serverError) {
        throw new Error(serverError.message || 'Server error');
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
        setMessage(error.message);
        onError?.(error);
      } else if (paymentIntent.status === 'succeeded') {
        setMessage('Donation successful! Thank you for your support.');
        onSuccess?.(paymentIntent);
      }
    } catch (err) {
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
    invalid: { color: '#9e2146' },
  },
};

  return (
    <form onSubmit={handleSubmit} className="donation-form">
      <div className="card-element-container">
        <CardElement options={cardElementOptions} />
      </div>
      
      <button
        type="submit"
        disabled={!stripe || processing}
        className="donate-button"
      >
        {processing ? 'Processing...' : `Donate $${amount}`}
      </button>
      
      {message && (
        <div className={`message ${message.includes('successful') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}
    </form>
  );
};

const DonateComponent = () => {
  const [amount, setAmount] = useState(25);
  const [customAmount, setCustomAmount] = useState('');
  const [showForm, setShowForm] = useState(false);

  const presetAmounts = [10, 25, 50, 100];

  // Show error if Stripe key is missing
  if (!publishableKey) {
    return (
      <div style={{ 
        maxWidth: '500px', 
        margin: '50px auto', 
        padding: '20px', 
        textAlign: 'center',
        background: '#fee',
        border: '1px solid #fcc',
        borderRadius: '8px'
      }}>
        <h2>⚠️ Stripe Configuration Missing</h2>
        <p>Please check your <code>.env.local</code> file and make sure you have:</p>
        <pre style={{background: '#f0f0f0', padding: '10px', textAlign: 'left'}}>
          NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
        </pre>
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
    // You can add success handling here (e.g., show thank you message, redirect, etc.)
    setShowForm(false);
  };

  const handleError = (error) => {
    console.error('Payment error:', error);
    // Handle error (already shown in form, but you can add additional handling)
  };

  return (
    <div className="donate-container">
      <h2>Make a Donation</h2>
      
      {!showForm ? (
        <div className="amount-selection">
          <h3>Select Amount</h3>
          
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
            <label htmlFor="custom-amount">Custom Amount:</label>
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
            Donate ${amount}
          </button>
        </div>
      ) : (
        <div className="payment-form">
          <h3>Donate ${amount}</h3>
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
            ← Back to Amount Selection
          </button>
        </div>
      )}
      
      <style jsx>{`
        .donate-container {
          max-width: 600px;
          margin: 0 auto;
          padding: 40px 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          color: white;
          position: relative;
          overflow: hidden;
        }
        
        .donate-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><g fill="%23ffffff" fill-opacity="0.05"><circle cx="30" cy="30" r="4"/></g></svg>') repeat;
          pointer-events: none;
        }
        
        .donate-container > * {
          position: relative;
          z-index: 1;
        }
        
        .donate-container h2 {
          text-align: center;
          font-size: 2.5em;
          margin-bottom: 10px;
          background: linear-gradient(45deg, #fff, #f0f8ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 700;
        }
        
        .amount-selection {
          text-align: center;
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          padding: 30px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.2);
        }
        
        .amount-selection h3 {
          font-size: 1.4em;
          margin-bottom: 25px;
          color: #fff;
          font-weight: 600;
        }
        
        .preset-amounts {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
          gap: 15px;
          margin: 30px 0;
        }
        
        .amount-button {
          padding: 16px 20px;
          border: 2px solid rgba(255,255,255,0.3);
          background: rgba(255,255,255,0.1);
          color: white;
          border-radius: 12px;
          cursor: pointer;
          font-size: 18px;
          font-weight: 600;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(5px);
          position: relative;
          overflow: hidden;
        }
        
        .amount-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s;
        }
        
        .amount-button:hover::before {
          left: 100%;
        }
        
        .amount-button:hover {
          background: rgba(255,255,255,0.2);
          border-color: rgba(255,255,255,0.5);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        
        .amount-button.selected {
          background: rgba(255,255,255,0.9);
          color: #667eea;
          border-color: white;
          transform: scale(1.05);
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        
        .custom-amount {
          margin: 30px 0;
        }
        
        .custom-amount label {
          display: block;
          margin-bottom: 12px;
          font-weight: 600;
          font-size: 1.1em;
          color: #fff;
        }
        
        .custom-amount input {
          padding: 16px 20px;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 12px;
          font-size: 18px;
          width: 250px;
          max-width: 100%;
          background: rgba(255,255,255,0.1);
          color: white;
          text-align: center;
          font-weight: 600;
          backdrop-filter: blur(5px);
          transition: all 0.3s;
        }
        
        .custom-amount input::placeholder {
          color: rgba(255,255,255,0.7);
        }
        
        .custom-amount input:focus {
          outline: none;
          border-color: white;
          background: rgba(255,255,255,0.2);
          box-shadow: 0 0 20px rgba(255,255,255,0.3);
        }
        
        .proceed-button, .back-button {
          padding: 18px 40px;
          background: linear-gradient(45deg, #ff6b6b, #ff8e8e);
          color: white;
          border: none;
          border-radius: 50px;
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
          margin: 15px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
          position: relative;
          overflow: hidden;
        }
        
        .proceed-button::before, .back-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: left 0.5s;
        }
        
        .proceed-button:hover::before, .back-button:hover::before {
          left: 100%;
        }
        
        .proceed-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 35px rgba(255, 107, 107, 0.6);
        }
        
        .proceed-button:disabled {
          background: rgba(255,255,255,0.3);
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
        
        .back-button {
          background: linear-gradient(45deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1));
          border: 2px solid rgba(255,255,255,0.3);
          box-shadow: 0 6px 20px rgba(0,0,0,0.1);
        }
        
        .back-button:hover {
          background: rgba(255,255,255,0.3);
          transform: translateY(-3px);
          box-shadow: 0 12px 35px rgba(0,0,0,0.2);
        }
        
        .payment-form {
          text-align: center;
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          padding: 30px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.2);
        }
        
        .payment-form h3 {
          font-size: 1.8em;
          margin-bottom: 25px;
          color: #fff;
          font-weight: 600;
        }
        
        .donation-form {
          max-width: 450px;
          margin: 0 auto;
        }
        
        .card-element-container {
          padding: 20px;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 12px;
          margin: 25px 0;
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(10px);
          transition: all 0.3s;
        }
        
        .card-element-container:focus-within {
          border-color: #667eea;
          box-shadow: 0 0 20px rgba(102, 126, 234, 0.3);
        }
        
        .donate-button {
          width: 100%;
          padding: 20px;
          background: linear-gradient(45deg, #ff6b6b, #ff8e8e);
          color: white;
          border: none;
          border-radius: 50px;
          font-size: 20px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
          position: relative;
          overflow: hidden;
        }
        
        .donate-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: left 0.5s;
        }
        
        .donate-button:hover:not(:disabled)::before {
          left: 100%;
        }
        
        .donate-button:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 15px 40px rgba(255, 107, 107, 0.6);
        }
        
        .donate-button:disabled {
          background: rgba(255,255,255,0.3);
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
        
        .message {
          margin-top: 20px;
          padding: 16px 20px;
          border-radius: 12px;
          text-align: center;
          font-weight: 600;
          backdrop-filter: blur(10px);
        }
        
        .message.success {
          background: rgba(72, 187, 120, 0.2);
          color: #68d391;
          border: 2px solid rgba(72, 187, 120, 0.3);
          box-shadow: 0 4px 15px rgba(72, 187, 120, 0.2);
        }
        
        .message.error {
          background: rgba(245, 101, 101, 0.2);
          color: #fc8181;
          border: 2px solid rgba(245, 101, 101, 0.3);
          box-shadow: 0 4px 15px rgba(245, 101, 101, 0.2);
        }
        
        @media (max-width: 640px) {
          .donate-container {
            margin: 20px;
            padding: 30px 20px;
          }
          
          .donate-container h2 {
            font-size: 2em;
          }
          
          .preset-amounts {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .custom-amount input {
            width: 100%;
          }
          
          .proceed-button, .back-button {
            width: calc(100% - 30px);
            margin: 10px 15px;
          }
        }
      `}</style>
    </div>
  );
};

export default DonateComponent;