import React, { useState, useEffect, useMemo } from "react";
import { createClient } from '@supabase/supabase-js';
import Header from '../Header/Header';
import LoadingScreen from '../LoadingScreen';
import { typeLabels, bibleBooks, exampleAuthors, resourceTypes } from '../Constants';
import SortFilter from '../SortFilter';
import Intro from "../Intro";
import { supabase } from '../SupaBaseInfo'; // adjust the path to where your file actually is
import { parseSecondaryScripture, sortByVerse, normalizeBookName } from '../Logic';

function App() {
  const [selectedBook, setSelectedBook] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fixed filter state initialization
  const [sortBy, setSortBy] = useState("");
  const [filters, setFilters] = useState({
    types: new Set(resourceTypes.map((t) => t.toLowerCase())),
    authors: new Set(),
    price: new Set()
  });

  // Separate state for primary and secondary scripture resources
  const [primaryResources, setPrimaryResources] = useState({
    sermons: [],
    commentaries: [],
    devotionals: [],
    books: [],
    videos: [],
  });

  const [secondaryResources, setSecondaryResources] = useState({
    sermons: [],
    commentaries: [],
    devotionals: [],
    books: [],
    videos: [],
  });

  const chaptersCount =
    bibleBooks.find((book) => book.name === selectedBook)?.chapters || 0;

  const fetchResources = async () => {
    if (!selectedBook || !selectedChapter) return;

    setLoading(true);
    setError("");

    try {
      const selectedChapterNum = parseInt(selectedChapter);
      
      // Fetch all resources for the book
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .limit(10000);

      if (error) throw error;

      console.log("Data from Supabase:", data);
      
      const primaryData = data.filter(resource => {
        if (resource.book !== selectedBook) return false;

        // If no chapter specified, treat as whole book
        if (!resource.chapter) return true;

        const start = parseInt(resource.chapter);
        const end = resource.chapter_end ? parseInt(resource.chapter_end) : start;
        return selectedChapterNum >= start && selectedChapterNum <= end;
      });

      const secondaryData = data.filter(resource => {
        if (!resource.secondary_scripture) return false;
        
        console.log(`\nChecking resource: "${resource.title}"`);
        console.log(`  Secondary scripture: "${resource.secondary_scripture}"`);
        
        const secondaryMatch = parseSecondaryScripture(resource.secondary_scripture, selectedBook, selectedChapterNum);
        console.log(`  Match result: ${secondaryMatch}`);
        
        return secondaryMatch;
      });

      console.log("Primary Resources:", primaryData);
      console.log("Secondary Resources:", secondaryData);

      const normalize = (str) => str.toLowerCase().trim().replace(/s$/, '');

      // Group primary resources by type
      const groupedPrimaryResources = {
        sermons: primaryData.filter(r => normalize(r.type) === 'sermon'),
        books: primaryData.filter(r => normalize(r.type) === 'book'),
        commentaries: primaryData.filter(r => normalize(r.type) === 'commentary'),
        devotionals: primaryData.filter(r => normalize(r.type) === 'devotional'),
        videos: primaryData.filter(r => normalize(r.type) === 'video'),
      };

      // Group secondary resources by type
      const groupedSecondaryResources = {
        sermons: secondaryData.filter(r => normalize(r.type) === 'sermon'),
        books: secondaryData.filter(r => normalize(r.type) === 'book'),
        commentaries: secondaryData.filter(r => normalize(r.type) === 'commentary'),
        devotionals: secondaryData.filter(r => normalize(r.type) === 'devotional'),
        videos: secondaryData.filter(r => normalize(r.type) === 'video'),
      };

      setPrimaryResources(groupedPrimaryResources);
      setSecondaryResources(groupedSecondaryResources);
    } catch (err) {
      setError(`Error fetching resources: ${err.message}`);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [selectedBook, selectedChapter]);

  // Improved filtering and sorting function
  const filterAndSortResources = useMemo(() => {
    return (items) => {
      if (!items || items.length === 0) return [];

      let filtered = items.filter(item => {
        // Type filter
        const normalize = (str) => str.toLowerCase().trim().replace(/s$/, '');
        const getFilterType = (databaseType) => {
          const normalized = normalize(databaseType);
          if (normalized === 'commentary') return 'commentaries';
          return normalized + 's';
        };
        
        const filterType = getFilterType(item.type);
        const typeMatch = filters.types.has(filterType);
        
        // Author filter
        const authorMatch = filters.authors.size === 0 || filters.authors.has(item.author);
        
        // Price filter
        let priceMatch = true;
        if (filters.price.size > 0) {
          const itemPrice = !item.price || item.price === "0" || item.price.toLowerCase() === "free" ? "free" : "paid";
          priceMatch = filters.price.has(itemPrice);
        }

        return typeMatch && authorMatch && priceMatch;
      });

      // Apply sorting
      switch (sortBy) {
        case 'alphabetical':
          filtered.sort((a, b) => a.title.localeCompare(b.title));
          break;
        case 'date':
        case 'newest':
          filtered.sort((a, b) => {
            const yearA = parseInt(a.published_year) || 0;
            const yearB = parseInt(b.published_year) || 0;
            return yearB - yearA; // newest first
          });
          break;
        case 'oldest':
          filtered.sort((a, b) => {
            const yearA = parseInt(a.published_year) || 0;
            const yearB = parseInt(b.published_year) || 0;
            return yearA - yearB; // oldest first
          });
          break;
        case 'scripture':
          filtered.sort((a, b) => {
            const aChapter = parseInt(a.chapter) || 0;
            const bChapter = parseInt(b.chapter) || 0;

            if (aChapter !== bChapter) return aChapter - bChapter;

            const aVerse = parseInt(a.verse_start) || 0;
            const bVerse = parseInt(b.verse_start) || 0;

            return aVerse - bVerse;
          });
          break;
        default:
          // Default order - no sorting
          break;
      }

      return filtered;
    };
  }, [filters, sortBy]);

  const addResource = async (resourceData) => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .insert([{
          book: resourceData.book,
          chapter: resourceData.chapter,
          chapter_end: resourceData.chapter_end,
          verse_start: resourceData.verse_start,
          verse_end: resourceData.verse_end,
          secondary_scripture: resourceData.secondary_scripture,
          type: resourceData.type,
          title: resourceData.title,
          author: resourceData.author,
          url: resourceData.url,
          description: resourceData.description,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

      fetchResources();
      return { success: true, data };
    } catch (err) {
      console.error('Error adding resource:', err);
      return { success: false, error: err.message };
    }
  };

  const toggleFilter = (category, value) => {
    setFilters((prev) => {
      const newSet = new Set(prev[category]);
      if (newSet.has(value)) {
        newSet.delete(value);
      } else {
        newSet.add(value);
      }
      return { ...prev, [category]: newSet };
    });
  };

  const bubbleStyle = {
    backgroundColor: "#e0e0e0",
    padding: "0.35rem 0.75rem",
    borderRadius: "999px",
    fontSize: "0.7rem",
    fontWeight: "500",
    color: "#333",
  };

  const ResourceCard = ({ resource, isSecondary = false }) => {
    const {
      title,
      author,
      url,
      price,
      book,
      chapter,
      chapter_end,
      verse_start,
      verse_end,
      secondary_scripture,
      description,
      image,
      published_year
    } = resource;

    const formattedReference = book
      ? chapter
        ? chapter_end && chapter_end !== chapter
          ? `${book} ${chapter}` +
            (verse_start ? `:${verse_start}` : '') +
            `–${chapter_end}` +
            (verse_end ? `:${verse_end}` : '')
          : `${book} ${chapter}` +
            (verse_start ? `:${verse_start}` : '') +
            (verse_end && verse_end !== verse_start ? `–${verse_end}` : '')
        : `${book}` // For whole-book resources, just show the book
      : null;
    
    return (
      <div
        style={{
          display: "flex",
          backgroundColor: "white",
          padding: "1rem",
          border: "2px solid black",
          borderRadius: "12px",
          fontSize: "0.95rem",
          transition: "all 0.2s ease",
          cursor: "pointer",
          maxWidth: "700px",
          marginBottom: "1.5rem",
        }}
      >
        {image && (
          <img
            src={image}
            alt={title}
            style={{
              width: "auto",
              height: "100px",
              objectFit: "scale-down",
              borderRadius: "8px",
              marginRight: "1rem",
              display: "flex",
              alignItems: "center",
            }}
          />
        )}

        <div style={{ flex: 1, display: "flex" }}>
          <div style={{ flex: 1 }}>
            <h4
              style={{
                margin: "0 0 0.25rem 0",
                color: "#000",
                fontSize: "1.2rem",
                textDecoration: "underline",
                marginBottom: "1rem"
              }}
            >
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#000", textDecoration: "underline" }}
              >
                {title}
              </a>
            </h4>
            
            {description && (
              <p style={{ margin: 0, color: "#444", fontSize: "1rem", fontStyle: "italic" }}>
                {description}
              </p>
            )}

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "1rem" }}>
              {author && (
                <span style={bubbleStyle}>
                  👤 {author}
                </span>
              )}

              {formattedReference && (
                <span style={bubbleStyle}>📖 {formattedReference}</span>
              )}

              {price && (
                <span style={bubbleStyle}>
                  <span style={{ color: "green", marginRight: "0.25rem" }}>💲</span>
                  {price.toLowerCase() === "free" ? "Free" : price}
                </span>
              )}

              {published_year && (
                <span style={bubbleStyle}>📅 {published_year}</span>
              )}
            </div>
          </div>

          {secondary_scripture && (
            <div style={{
              flexBasis: "30%",
              paddingLeft: "1.5rem",
              paddingTop: "0.5rem",
              minWidth: "200px",
              wordWrap: "break-word",
              whiteSpace: "normal",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              fontSize: "0.8rem",
              fontStyle: "italic",
              color: "#555",
              textAlign: "left"
            }}>
              <strong style={{ fontStyle: "normal", color: "#333", fontWeight: "600" }}>
                Secondary Scripture:
              </strong>
              <span>{secondary_scripture}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const ResourceGrid = ({ title, primaryItems, secondaryItems }) => {
    const filteredPrimaryItems = filterAndSortResources(primaryItems);
    const filteredSecondaryItems = filterAndSortResources(secondaryItems);
    const totalItems = filteredPrimaryItems.length + filteredSecondaryItems.length;

    return (
      <section
        style={{
          width: "100%",
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: "1rem",
          marginBottom: "1.5rem",
          backgroundColor: "#f9f9f9",
          flexDirection: "column"
        }}
      >
        <h2 style={{ marginTop: 0, color: "black" }}>
          {title} ({totalItems})
        </h2>
        {loading ? (
          <p style={{ fontStyle: "italic", color: "#666" }}>Loading...</p>
        ) : totalItems === 0 ? (
          <p style={{ fontStyle: "italic", color: "#666" }}>
            No resources available
          </p>
        ) : (
          <div>
            {/* Primary scripture resources first */}
            {filteredPrimaryItems.map((resource) => (
              <ResourceCard key={`primary-${resource.id}`} resource={resource} />
            ))}
            
            {/* Secondary scripture resources below */}
            {filteredSecondaryItems.map((resource) => (
              <ResourceCard key={`secondary-${resource.id}`} resource={resource} isSecondary={true} />
            ))}
          </div>
        )}
      </section>
    );
  };

  return (
    <div style={{ padding: "0rem 2rem 2rem", textAlign: "center" }}>
      <Header />
      {loading && selectedBook && selectedChapter && (
        <LoadingScreen 
          selectedBook={selectedBook} 
          selectedChapter={selectedChapter}
          faviconUrl="/favicon.ico"
        />
      )}
      
      {error && (
        <div style={{
          backgroundColor: "#ffebee",
          color: "#c62828",
          padding: "1rem",
          borderRadius: "4px",
          margin: "1rem 0",
          maxWidth: "600px",
          marginLeft: "auto",
          marginRight: "auto"
        }}>
          {error}
        </div>
      )}

      <div style={{ paddingTop: "80px", textAlign: "center" }}>
  {/* Wrapper for Intro + selects */}
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "36px", // very small vertical gap
      maxWidth: "900px",
      marginLeft: "auto",
      marginRight: "auto",
    }}
  >
    {/* Intro bubble */}
    <Intro />

    {/* Book and Chapter selects */}
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "1rem", // horizontal spacing between selects
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      {/* Book select */}
      <div>
        <label htmlFor="book-select" style={{ fontWeight: "bold", color:"black" }}>
          Choose a book:
        </label>
        <br />
        <select
          id="book-select"
          value={selectedBook}
          onChange={(e) => {
            setSelectedBook(e.target.value);
            setSelectedChapter("");
          }}
          style={{
            padding: "0.6rem 1rem",
            fontSize: "1rem",
            borderRadius: "12px",
            border: "1.5px solid black",
            backgroundColor: "white",
            cursor: "pointer",
            outline: "none",
            transition: "all 0.3s ease",
          }}
        >
          <option value="">-- Book --</option>
          {bibleBooks.map((book) => (
            <option key={book.name} value={book.name}>
              {book.name}
            </option>
          ))}
        </select>
      </div>

      {/* Chapter select */}
      <div>
        <label htmlFor="chapter-select" style={{ fontWeight: "bold" }}>
          Choose a chapter:
        </label>
        <br />
        <select
          id="chapter-select"
          value={selectedChapter}
          onChange={(e) => setSelectedChapter(parseInt(e.target.value))}
          disabled={!selectedBook}
          style={{
            padding: "0.6rem 1rem",
            fontSize: "1rem",
            borderRadius: "12px",
            border: "1.5px solid black",
            backgroundColor: "white",
            cursor: "pointer",
            outline: "none",
            transition: "all 0.3s ease",
          }}
        >
          <option value="">##</option>
          {Array.from({ length: chaptersCount }, (_, i) => i + 1).map(
            (num) => (
              <option key={num} value={num}>
                {num}
              </option>
            )
          )}
        </select>
      </div>
    </div>
  </div>
</div>
      
      <div
        style={{
          maxWidth: "900px",
          marginLeft: "auto",
          marginRight: "auto",
          marginTop: "2rem",
          textAlign: "left",
        }}
      >
        {/* Use the SortFilter component */}
        <SortFilter 
          sortBy={sortBy}
          setSortBy={setSortBy}
          filters={filters}
          setFilters={setFilters}
          toggleFilter={toggleFilter}
        />
        
        {selectedBook && selectedChapter && (
          <>
            {Object.keys(typeLabels).map((typeKey) => {
              if (!filters.types.has(typeKey)) return null;

              return (
                <ResourceGrid
                  key={typeKey}
                  title={typeLabels[typeKey]}
                  primaryItems={primaryResources[typeKey] || []}
                  secondaryItems={secondaryResources[typeKey] || []}
                />
              );
            })}
          </>
        )}
        
        {(!selectedBook || !selectedChapter) && (
          <p style={{ 
            textAlign: "center", 
            color: "#666", 
            fontStyle: "italic",
            padding: "2rem"
          }}>
            Please select a book and chapter to view resources.
          </p>
        )}
      </div>
    </div>
  );
}

export default App;