// App.js - with proper 404 handling
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from "@vuer-ai/react-helmet-async";
import ReactGA from 'react-ga4';
import Home from './Home/Home';
import ChapterDesktop from './ChapterPage/ChapterDesktop';
import ChapterPage from './ChapterPage/ChapterPage';
import About from './About';
import Donate from './Donate';
import SubmitResource from './SubmitResource';
import Header from './Header/Header';
import Footer from './Footer/Footer';

// Initialize GA4 with your Measurement ID
ReactGA.initialize('G-E8B7GY44QG');

// 404 Page Component
function NotFoundPage() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      textAlign: 'center',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '4rem', margin: '0' }}>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you're looking for doesn't exist.</p>
      <a href="/" style={{ 
        marginTop: '20px', 
        padding: '10px 20px', 
        backgroundColor: '#007cba', 
        color: 'white', 
        textDecoration: 'none', 
        borderRadius: '5px' 
      }}>
        Go Home
      </a>
    </div>
  );
}

// Component to track pageviews and detect 404s
function AnalyticsTracker() {
  const location = useLocation();
  const [is404, setIs404] = useState(false);

  useEffect(() => {
    // Check if this is a 404 page
    const validPaths = ['/', '/about', '/donate', '/submitresource'];
    const isValidPath = validPaths.includes(location.pathname) || 
                       location.pathname.match(/^\/[^/]+\/[^/]+$/); // book/chapter format

    setIs404(!isValidPath);

    // GA4 format for page tracking
    ReactGA.send('page_view', {
      page_path: location.pathname + location.search,
      page_title: document.title
    });
  }, [location]);

  return { is404 };
}

function AppContent() {
  const { is404 } = AnalyticsTracker();

  return (
    <div className="app-container">
      {/* Only show header/footer if not 404 */}
      {!is404 && <Header />}

      <main>
        <Routes>
          {/* Specific pages */}
          <Route path="/about" element={<About />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/submitresource" element={<SubmitResource />} />

          {/* Chapter pages */}
          <Route path="/:book/:chapter" element={<ChapterPage />} />

          {/* Home page */}
          <Route path="/" element={<Home />} />

          {/* Catch-all 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {/* Only show header/footer if not 404 */}
      {!is404 && <Footer />}
    </div>
  );
}

function App() {
  // Track initial page load
  useEffect(() => {
    ReactGA.send('page_view', {
      page_path: window.location.pathname + window.location.search,
      page_title: document.title
    });
  }, []);

  return (
    <HelmetProvider>
      <Router>
        <AppContent />
      </Router>
    </HelmetProvider>
  );
}

export default App;