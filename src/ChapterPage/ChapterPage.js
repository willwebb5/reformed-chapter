import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ChapterDesktop from './ChapterDesktop';
import ChapterMobile from './ChapterMobile';
import SEOHead from '../SEOHead'; // Adjust path as needed

function ChapterPage() {
  const [isMobile, setIsMobile] = useState(false);
  const [debugInfo, setDebugInfo] = useState({});
  
  // Get URL parameters
  const { book, chapter } = useParams();
  
  // Capitalize book name for display
  const formattedBookName = book ? book.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ') : '';
  
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

  return (
    <div>
      {/* SEO Head - this will work for both mobile and desktop */}
      <SEOHead 
        key={`${book}-${chapter}`} // Force re-render when URL changes
        bookName={formattedBookName}
        chapter={chapter}
        pageType="chapter"
        resourceCount={0} // You can calculate this based on your data
        canonicalUrl={`https://yourdomain.com/${book}/${chapter}`} // Replace with your actual domain
      />
      
      {/* Temporary debug to verify URL params are working */}
      <div style={{background: 'lightblue', padding: '10px', margin: '10px', fontSize: '12px'}}>
        DEBUG: Book="{book}", Chapter="{chapter}", Formatted="{formattedBookName}"
      </div>
      
      {isMobile ? <ChapterMobile /> : <ChapterDesktop />}
    </div>
  );
}

export default ChapterPage;