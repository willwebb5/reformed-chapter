/// Fixed App.js with proper routing, React Helmet setup, global header and footer
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Home from './Home/Home'; // Your existing responsive component
import ChapterDesktop from './ChapterPage/ChapterDesktop'; // Your chapter component
import About from "./About";
import Donate from "./Donate";
import SubmitResource from "./SubmitResource";
import ChapterPage from './ChapterPage/ChapterPage';
import Footer from './Footer/Footer'; // Import your footer component
import Header from './Header/Header'; // Import your header component

function App() {
  return (
    <HelmetProvider>
      <Router>
        <div className="app-container">
          {/* Header will appear on every page */}
          <Header />
          
          {/* All your page content */}
          <main>
            <Routes>
              {/* Home page - must come after specific routes */}
              <Route path="/" element={<Home />} />
              
              {/* About, Donate, Submit pages */}
              <Route path="/about" element={<About />} />
              <Route path="/donate" element={<Donate />} />
              <Route path="/SubmitResource" element={<SubmitResource />} />
              
              {/* Chapter pages - specific book/chapter combinations */}
              <Route path="/:book/:chapter" element={<ChapterPage />} />
              
              {/* Optional: Catch-all route for 404 */}
              <Route path="*" element={<div>Page not found</div>} />
            </Routes>
          </main>
          
          {/* Footer will appear on every page */}
          <Footer />
        </div>
      </Router>
    </HelmetProvider>
  );
}

export default App;