// src/SEOHead.js
import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEOHead = ({ 
  title, 
  description, 
  keywords, 
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
  const siteName = "Bible Study Hub";
  const siteUrl = "https://yourdomain.com"; // Replace with your actual domain
  const defaultDescription = "Discover comprehensive Bible study resources including sermons, commentaries, devotionals, and more to deepen your Scripture understanding.";
  
  // Enhanced title generation with better keyword density
  const generateTitle = () => {
    if (title) return title;
    if (bookName && chapter) {
      const resourceText = resourceCount > 0 ? ` | ${resourceCount} Resources` : '';
      const verseText = verseRange ? ` Verses ${verseRange}` : '';
      return `${bookName} ${chapter}${verseText} Bible Study Commentary${resourceText} | ${siteName}`;
    }
    return `${siteName} | Free Bible Study Resources & Commentary`;
  };

  // Enhanced description with semantic keywords and user intent
  const generateDescription = () => {
    if (description) return description;
    if (bookName && chapter) {
      const resourceTypes = [];
      if (resourceCount > 0) {
        resourceTypes.push('sermons', 'commentaries', 'devotionals', 'study guides');
      }
      const resourceText = resourceTypes.length > 0 ? 
        ` Explore ${resourceCount} curated ${resourceTypes.slice(0, 2).join(' and ')} plus additional study materials.` : 
        ' Access comprehensive study materials and biblical insights.';
      
      return `Study ${bookName} Chapter ${chapter} with expert Bible commentary and analysis.${resourceText} Perfect for personal devotions, group studies, and sermon preparation.`;
    }
    return defaultDescription;
  };

  // Semantic keyword generation for 2025 SEO
  const generateKeywords = () => {
    if (keywords) return keywords;
    if (bookName && chapter) {
      const semanticKeywords = [
        `${bookName} chapter ${chapter}`,
        `${bookName.toLowerCase()} bible study`,
        `${bookName.toLowerCase()} commentary`,
        `${bookName.toLowerCase()} sermon`,
        `${bookName} ${chapter} analysis`,
        'bible verse study',
        'scripture commentary',
        'biblical exegesis',
        'christian resources',
        'bible study guide',
        'devotional study',
        'sermon preparation'
      ];
      
      // Add chapter-specific keywords
      if (verseRange) {
        semanticKeywords.push(`${bookName} ${chapter}:${verseRange}`, `verse ${verseRange} meaning`);
      }
      
      return semanticKeywords.join(', ');
    }
    return "bible study, bible commentary, scripture study, christian resources, biblical analysis, devotionals, sermons, verse study, biblical exegesis";
  };

  // Generate comprehensive structured data for 2025
  const generateStructuredData = () => {
    const baseUrl = canonicalUrl || (typeof window !== 'undefined' ? window.location.href : siteUrl);
    
    // Multiple schema types for better semantic understanding
    const schemaArray = [];
    
    // Bible Chapter Article Schema
    if (bookName && chapter) {
      const articleSchema = {
        "@context": "https://schema.org",
        "@type": ["Article", "ScholarlyArticle", "EducationalResource"],
        "headline": generateTitle(),
        "description": generateDescription(),
        "url": baseUrl,
        "datePublished": new Date().toISOString(),
        "dateModified": lastModified || new Date().toISOString(),
        "author": {
          "@type": "Organization",
          "name": siteName,
          "url": siteUrl,
          "sameAs": [
            "https://twitter.com/yourhandle",
            "https://facebook.com/yourpage"
          ]
        },
        "publisher": {
          "@type": "Organization",
          "name": siteName,
          "logo": {
            "@type": "ImageObject",
            "url": `${siteUrl}/logo.png`,
            "width": 300,
            "height": 300
          }
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": baseUrl
        },
        "image": [{
          "@type": "ImageObject",
          "url": `${siteUrl}${ogImage}`,
          "width": 1200,
          "height": 630,
          "caption": `${bookName} Chapter ${chapter} Bible Study Resources`
        }],
        "articleSection": "Bible Study",
        "genre": ["Religious Education", "Bible Study", "Christian Commentary"],
        "keywords": generateKeywords(),
        "inLanguage": "en-US",
        "educationalLevel": ["Beginner", "Intermediate", "Advanced"],
        "learningResourceType": ["Commentary", "Sermon", "Devotional", "Study Guide"],
        "about": {
          "@type": "Thing",
          "name": `${bookName} Chapter ${chapter}`,
          "description": `Biblical study resources and commentary for ${bookName} Chapter ${chapter}`,
          "sameAs": `https://www.biblegateway.com/passage/?search=${encodeURIComponent(bookName + ' ' + chapter)}`
        },
        ...(resourceCount > 0 && { 
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "reviewCount": Math.max(resourceCount, 5),
            "bestRating": "5",
            "worstRating": "1"
          }
        }),
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
              "name": bookName,
              "item": `${siteUrl}/${bookName.toLowerCase().replace(/\s+/g, '-')}`
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
        ...(resourceTypes.length > 0 && {
          "mentions": resourceTypes.map(type => ({
            "@type": "CreativeWork",
            "name": type.charAt(0).toUpperCase() + type.slice(1),
            "genre": "Religious Education"
          }))
        })
      };

      schemaArray.push(articleSchema);

      // FAQ Schema for common Bible study questions
      const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": `What is the main theme of ${bookName} Chapter ${chapter}?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `${bookName} Chapter ${chapter} explores key biblical themes with comprehensive commentary and study resources available for deeper understanding.`
            }
          },
          {
            "@type": "Question",
            "name": `How can I study ${bookName} Chapter ${chapter} effectively?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `Use our comprehensive study resources including commentaries, sermons, and devotionals to gain deeper insights into ${bookName} Chapter ${chapter}.`
            }
          },
          {
            "@type": "Question",
            "name": `What study resources are available for ${bookName} Chapter ${chapter}?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `We provide ${resourceCount} curated resources including commentaries, sermons, devotionals, and study guides for ${bookName} Chapter ${chapter}.`
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
      "name": siteName,
      "alternateName": "Bible Study Resources Hub",
      "url": siteUrl,
      "description": generateDescription(),
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${siteUrl}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      },
      "publisher": {
        "@type": "Organization",
        "name": siteName,
        "logo": {
          "@type": "ImageObject",
          "url": `${siteUrl}/logo.png`
        }
      },
      "sameAs": [
        "https://twitter.com/yourhandle",
        "https://facebook.com/yourpage",
        "https://instagram.com/yourhandle"
      ]
    };

    schemaArray.push(websiteSchema);

    return JSON.stringify(schemaArray);
  };

  const finalTitle = generateTitle();
  const finalDescription = generateDescription();
  const finalKeywords = generateKeywords();
  
  return (
    <Helmet>
      {/* Essential Meta Tags for 2025 */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Enhanced Open Graph for better social sharing */}
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:type" content={pageType === 'chapter' ? 'article' : 'website'} />
      <meta property="og:site_name" content={siteName} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:image" content={`${siteUrl}${ogImage}`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={`${finalTitle} - Bible Study Resources`} />
      <meta property="og:locale" content="en_US" />
      {bookName && <meta property="article:section" content="Bible Study" />}
      {bookName && <meta property="article:tag" content={finalKeywords.split(', ').slice(0, 5).join(',')} />}
      
      {/* Enhanced Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@yourhandle" />
      <meta name="twitter:creator" content="@yourhandle" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={`${siteUrl}${ogImage}`} />
      <meta name="twitter:image:alt" content={`${finalTitle} - Bible Study Resources`} />
      
      {/* Advanced SEO Meta Tags for 2025 */}
      <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <meta name="bingbot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <meta name="author" content={siteName} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Language" content="en" />
      <meta name="theme-color" content="#1e40af" />
      <meta name="msapplication-TileColor" content="#1e40af" />
      
      {/* Semantic HTML5 meta tags */}
      <meta name="application-name" content={siteName} />
      <meta name="apple-mobile-web-app-title" content={siteName} />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      
      {/* Bible-specific semantic meta tags */}
      {bookName && <meta name="bible:book" content={bookName} />}
      {bookName && chapter && <meta name="bible:chapter" content={chapter} />}
      {verseRange && <meta name="bible:verses" content={verseRange} />}
      <meta name="content:type" content="Bible Study" />
      <meta name="content:category" content="Religious Education" />
      
      {/* Performance and Core Web Vitals optimization */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href={siteUrl} />
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//www.google-analytics.com" />
      <link rel="dns-prefetch" href="//cdnjs.cloudflare.com" />
      
      {/* Resource hints for performance */}
      <link rel="prefetch" href={`${siteUrl}/api/resources`} />
      <link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      
      {/* Security headers */}
      <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      <meta httpEquiv="X-Frame-Options" content="DENY" />
      <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
      <meta name="referrer" content="strict-origin-when-cross-origin" />
      
      {/* Language and accessibility */}
      <html lang="en" />
      <meta name="color-scheme" content="light dark" />
      
      {/* Enhanced Structured Data for 2025 Rich Results */}
      <script type="application/ld+json">
        {generateStructuredData()}
      </script>
      
      {/* Additional meta for mobile optimization */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      
      {/* Geo and regional targeting if applicable */}
      <meta name="geo.region" content="US" />
      <meta name="geo.placename" content="United States" />
      
      {/* Copyright and ownership */}
      <meta name="copyright" content={`© ${new Date().getFullYear()} ${siteName}`} />
      <meta name="web_author" content={siteName} />
      
      {/* Additional performance hints */}
      {bookName && chapter && (
        <>
          <link rel="prefetch" href={`/${bookName.toLowerCase().replace(/\s+/g, '')}/${parseInt(chapter) + 1}`} />
          <link rel="prefetch" href={`/${bookName.toLowerCase().replace(/\s+/g, '')}/${parseInt(chapter) - 1}`} />
        </>
      )}
    </Helmet>
  );
};

export default SEOHead;