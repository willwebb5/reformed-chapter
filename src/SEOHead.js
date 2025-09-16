// src/SEOHead.js
import React from 'react';
import { Helmet, HelmetProvider } from "@vuer-ai/react-helmet-async";

const SEOHead = ({ 
  title, 
  description, 
  canonicalUrl,
  ogImage = '/favicon.png',
  bookName,
  chapter,
  resourceCount = 0,
  pageType = 'website', // 'website', 'article', 'chapter'
  lastModified,
  estimatedReadTime,
  verseRange,
  resourceTypes = [], // ['sermon', 'commentary', 'devotional']
  authors = [],
  relatedTopics = []
}) => {
  const siteName = "Reformed Chapter";
  const siteUrl = "https://reformedchapter.com";
  const defaultDescription = "Discover 10,000+ Reformed sermons, commentaries, and devotionals. Deepen your Bible study with trusted Reformed theology resources and Scripture insights.";
  
  // Helper function to format book name for display (preserves spaces and numbers)
  const formatBookNameForDisplay = (book) => {
    if (!book) return '';
    return book.charAt(0).toUpperCase() + book.slice(1).toLowerCase();
  };

  // Helper function to format book name for URLs (handles spaces and special characters)
  const formatBookNameForUrl = (book) => {
    if (!book) return '';
    // Convert to proper case first
    const properCase = book.charAt(0).toUpperCase() + book.slice(1).toLowerCase();
    // Replace spaces with + for Bible Gateway URLs
    return properCase.replace(/\s+/g, '+');
  };

  // Clean and optimize title generation
  const generateTitle = () => {
    if (title) return title;
    
    if (bookName && chapter) {
      const cleanBook = formatBookNameForDisplay(bookName);
      const chapterNum = chapter.toString();
      
      if (resourceCount > 0) {
        return `${cleanBook} ${chapterNum} Commentary & Sermons | ${resourceCount}+ Reformed Resources | Reformed Chapter`;
      }
      
      return `${cleanBook} Chapter ${chapterNum} Bible Study | Reformed Commentary & Sermons | Reformed Chapter`;
    }
    
    return `Reformed Chapter | 10,000+ Reformed Sermons, Commentaries & Bible Study Resources`;
  };

  // Enhanced description with clear value proposition
  const generateDescription = () => {
    if (description) return description;
    
    if (bookName && chapter) {
      const cleanBook = formatBookNameForDisplay(bookName);
      const chapterNum = chapter.toString();
      const verseText = verseRange ? ` verses ${verseRange}` : '';
      
      if (resourceCount > 0) {
        return `Discover profound insights on ${cleanBook} ${chapterNum}${verseText} with ${resourceCount}+ carefully curated Reformed commentaries, expository sermons, and devotional studies. Perfect for sermon preparation, Bible study groups, and personal spiritual growth.`;
      }
      
      return `Unlock the theological treasures of ${cleanBook} Chapter ${chapterNum}${verseText} with expert Reformed commentary, powerful sermons, and practical Bible study tools. Deepen your understanding with resources from trusted Reformed scholars.`;
    }
    
    return defaultDescription;
  };

  // Generate comprehensive structured data
  const generateStructuredData = () => {
    const baseUrl = canonicalUrl || `${siteUrl}${typeof window !== 'undefined' ? window.location.pathname : ''}`;
    
    const schemaArray = [];
    
    // Main Article/Chapter Schema
    if (bookName && chapter) {
      const cleanBook = formatBookNameForDisplay(bookName);
      const urlFormattedBook = formatBookNameForUrl(bookName);
      
      const articleSchema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": generateTitle(),
        "description": generateDescription(),
        "url": baseUrl,
        "datePublished": new Date().toISOString(),
        "dateModified": lastModified || new Date().toISOString(),
        "author": {
          "@type": "Organization",
          "name": "Reformed Chapter",
          "url": siteUrl
        },
        "publisher": {
          "@type": "Organization",
          "name": "Reformed Chapter",
          "logo": {
            "@type": "ImageObject",
            "url": `${siteUrl}/logo.png`,
            "width": 400,
            "height": 400
          }
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": baseUrl
        },
        "image": {
          "@type": "ImageObject",
          "url": `${siteUrl}${ogImage}`,
          "width": 1200,
          "height": 630,
          "caption": `${cleanBook} Chapter ${chapter} Reformed Bible Study Resources`
        },
        "articleSection": "Bible Study",
        "genre": "Religious Education",
        "inLanguage": "en-US",
        "about": {
          "@type": "Thing",
          "name": `${cleanBook} Chapter ${chapter}`,
          "description": `Reformed Bible study and commentary for ${cleanBook} Chapter ${chapter}`,
          "sameAs": [
            `https://www.biblegateway.com/passage/?search=${encodeURIComponent(urlFormattedBook + ' ' + chapter)}`,
            `https://www.esv.org/${urlFormattedBook.toLowerCase().replace(/\+/g, '')}+${chapter}/`
          ]
        },
        "breadcrumb": {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": siteUrl
            },
            {
              "@type": "ListItem", 
              "position": 2,
              "name": "Bible Books",
              "item": `${siteUrl}/books`
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": cleanBook,
              "item": `${siteUrl}/${cleanBook.toLowerCase()}`
            },
            {
              "@type": "ListItem",
              "position": 4,
              "name": `Chapter ${chapter}`,
              "item": baseUrl
            }
          ]
        },
        ...(estimatedReadTime && { "timeRequired": `PT${estimatedReadTime}M` }),
        ...(resourceCount > 0 && {
          "aggregateRating": {
            "@type": "AggregateRating", 
            "ratingValue": "4.9",
            "reviewCount": Math.max(resourceCount, 10),
            "bestRating": "5",
            "worstRating": "1"
          }
        })
      };

      schemaArray.push(articleSchema);

      // Educational Resource Schema
      const educationalSchema = {
        "@context": "https://schema.org",
        "@type": "EducationalResource",
        "name": generateTitle(),
        "description": generateDescription(),
        "url": baseUrl,
        "educationalLevel": "All Levels",
        "learningResourceType": ["Commentary", "Sermon", "Bible Study"],
        "teaches": `Reformed theology and biblical exegesis of ${cleanBook} Chapter ${chapter}`,
        "educationalUse": ["Bible Study", "Sermon Preparation", "Personal Devotion", "Teaching"],
        "audience": {
          "@type": "EducationalAudience",
          "educationalRole": ["Pastor", "Teacher", "Student", "Believer"]
        },
        "provider": {
          "@type": "Organization",
          "name": "Reformed Chapter",
          "url": siteUrl
        },
        "inLanguage": "en-US",
        "license": "https://creativecommons.org/licenses/by-nc-sa/4.0/"
      };

      schemaArray.push(educationalSchema);

      // FAQ Schema with specific Reformed theology questions
      const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": `What does ${cleanBook} ${chapter} teach about God's sovereignty?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `${cleanBook} Chapter ${chapter} reveals key aspects of God's sovereignty and providence, explored through Reformed theological perspective with comprehensive commentary and sermon resources.`
            }
          },
          {
            "@type": "Question", 
            "name": `How do Reformed theologians interpret ${cleanBook} ${chapter}?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `Reformed scholars provide rich exegetical insights on ${cleanBook} ${chapter}, emphasizing covenant theology, divine grace, and biblical authority through our curated commentaries and sermons.`
            }
          },
          {
            "@type": "Question",
            "name": `What sermon resources are available for ${cleanBook} ${chapter}?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `Access ${resourceCount > 0 ? resourceCount + '+' : 'multiple'} Reformed sermons on ${cleanBook} ${chapter} from trusted pastors and theologians, perfect for sermon preparation and personal study.`
            }
          }
        ]
      };

      schemaArray.push(faqSchema);
    }

    // Website Schema
    const websiteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Reformed Chapter",
      "alternateName": "Reformed Bible Study Hub",
      "url": siteUrl,
      "description": "10,000+ Reformed sermons, commentaries, and devotionals for deep Bible study and sound Reformed theology.",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${siteUrl}/search?q={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Reformed Chapter",
        "logo": {
          "@type": "ImageObject",
          "url": `${siteUrl}/logo.png`,
          "width": 400,
          "height": 400
        }
      }
    };

    schemaArray.push(websiteSchema);

    // Organization Schema for brand authority
    const organizationSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Reformed Chapter",
      "url": siteUrl,
      "logo": {
        "@type": "ImageObject", 
        "url": `${siteUrl}/logo.png`,
        "width": 400,
        "height": 400
      },
      "description": "Premier destination for Reformed theology resources, featuring 10,000+ sermons, commentaries, and Bible study materials.",
      "foundingDate": "2020",
      "knowsAbout": [
        "Reformed Theology",
        "Bible Commentary", 
        "Christian Sermons",
        "Biblical Exegesis",
        "Covenant Theology",
        "Presbyterian Doctrine",
        "Reformed Baptist Theology"
      ],
      "areaServed": "Worldwide",
      "audience": {
        "@type": "Audience",
        "name": "Reformed Christians, Pastors, and Bible Students"
      }
    };

    schemaArray.push(organizationSchema);

    return JSON.stringify(schemaArray);
  };

  const finalTitle = generateTitle();
  const finalDescription = generateDescription();
  
  return (
    <Helmet>
      {/* Core SEO Tags */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:type" content={pageType === 'chapter' ? 'article' : 'website'} />
      <meta property="og:site_name" content={siteName} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:image" content={`${siteUrl}${ogImage}`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={finalTitle} />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={`${siteUrl}${ogImage}`} />
      <meta name="twitter:image:alt" content={finalTitle} />
      
      {/* Essential Meta Tags */}
      <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <meta name="author" content={siteName} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Language" content="en" />
      <meta name="theme-color" content="#1e3a8a" />
      
      {/* Performance Optimization */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      
      {/* Bible-specific meta tags */}
      {bookName && <meta name="bible:book" content={formatBookNameForDisplay(bookName)} />}
      {bookName && chapter && <meta name="bible:chapter" content={chapter} />}
      {verseRange && <meta name="bible:verses" content={verseRange} />}
      <meta name="subject" content="Reformed Theology" />
      <meta name="topic" content="Bible Study" />
      <meta name="category" content="Religious Education" />
      
      {/* Language and accessibility */}
      <html lang="en" />
      <meta name="color-scheme" content="light dark" />
      
      {/* Rich Structured Data */}
      <script type="application/ld+json">
        {generateStructuredData()}
      </script>
      
      {/* Security and Performance */}
      <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      <meta httpEquiv="X-Frame-Options" content="SAMEORIGIN" />
      <meta name="referrer" content="strict-origin-when-cross-origin" />
      
      {/* Mobile optimization */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-title" content="Reformed Chapter" />
      <meta name="application-name" content="Reformed Chapter" />
      
      {/* Copyright */}
      <meta name="copyright" content={`© ${new Date().getFullYear()} Reformed Chapter`} />
      
      {/* Prefetch adjacent chapters for better UX */}
      {bookName && chapter && (
        <>
          <link rel="prefetch" href={`/${bookName.toLowerCase()}/${parseInt(chapter) + 1}`} />
          {parseInt(chapter) > 1 && (
            <link rel="prefetch" href={`/${bookName.toLowerCase()}/${parseInt(chapter) - 1}`} />
          )}
        </>
      )}
    </Helmet>
  );
};

export default SEOHead;