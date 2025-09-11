import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ChapterDesktop from './ChapterDesktop';
import ChapterMobile from './ChapterMobile';
import SEOHead from '../SEOHead'; // Adjust path as needed
import { bibleBooks, urlToBook } from '../Constants'; // Adjust path as needed

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
      padding: '20px',
      backgroundColor: '#ffffff',
      color: '#000000'
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

function ChapterPage() {
  const [isMobile, setIsMobile] = useState(false);
  const [debugInfo, setDebugInfo] = useState({});
  
  // Get URL parameters
  const { book, chapter } = useParams();
  
  // All hooks must be called before any conditional logic
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const userAgent = navigator.userAgent;
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const mobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      
      // Force mobile for testing - UNCOMMENT THIS LINE TO TEST
      // const shouldUseMobile = true;
      
      // Normal detection
      const shouldUseMobile = width <= 768;
      
      setIsMobile(shouldUseMobile);
      setDebugInfo({
        width,
        height,
        isTouchDevice,
        mobileUserAgent,
        shouldUseMobile,
        userAgent: userAgent.substr(0, 50) + '...'
      });
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // Validate book exists (after hooks)
  const bookName = urlToBook(book);
  if (!bookName) {
    return <NotFoundPage />;
  }
  
  // Find the book info
  const bookInfo = bibleBooks.find(b => b.name === bookName);
  if (!bookInfo) {
    return <NotFoundPage />;
  }
  
  // Validate chapter number
  const chapterNum = parseInt(chapter);
  if (isNaN(chapterNum) || chapterNum < 1 || chapterNum > bookInfo.chapters) {
    return <NotFoundPage />;
  }
  
  // Capitalize book name for display
  const formattedBookName = bookName;

  return (
    <div>
      {/* SEO Head - this will work for both mobile and desktop */}
      <SEOHead 
        key={`${book}-${chapter}`} // Force re-render when URL changes
        bookName={formattedBookName}
        chapter={chapter}
        pageType="chapter"
        resourceCount={0} // You can calculate this based on your data
      />
      
      {isMobile ? <ChapterMobile /> : <ChapterDesktop />}
    </div>
  );
}

export default ChapterPage;