// App.js - fixed with routing, Vuer Helmet, header/footer, and GA4 analytics
import React, { useEffect } from 'react';
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
ReactGA.initialize('G-E8B7GY44QG'); // <-- replace with your GA4 Measurement ID

// Component to track pageviews on route changes
function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    ReactGA.send({ hitType: 'pageview', page: location.pathname + location.search });
  }, [location]);

  return null;
}

function App() {
  return (
    <HelmetProvider>
      <Router>
        <AnalyticsTracker />
        <div className="app-container">
          {/* Global header */}
          <Header />

          {/* Main content / routes */}
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
              <Route path="*" element={<div>Page not found</div>} />
            </Routes>
          </main>

          {/* Global footer */}
          <Footer />
        </div>
      </Router>
    </HelmetProvider>
  );
}

export default App;
