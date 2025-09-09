// ChapterDesktop.js
import SEOHead from '../SEOHead';
import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../Header/Header";
import LoadingScreen from "../LoadingScreen";
import SortFilter from "../SortFilter";
import { supabase } from "../SupaBaseInfo";
import Intro from "../Intro";
import {
  typeLabels,
  bibleBooks,
  resourceTypes,
  urlToBook,
  bookToUrl,
} from "../Constants";
import { parseSecondaryScripture } from "../Logic";

function ChapterDesktop() {
  const { book, chapter } = useParams();
  
  const bookName = urlToBook(book);
  const chapterNum = parseInt(chapter);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [filters, setFilters] = useState({
    types: new Set(resourceTypes.map((t) => t.toLowerCase())),
    authors: new Set(),
    price: new Set(),
  });
  const [availableAuthors, setAvailableAuthors] = useState(new Set());
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

  // Add selected book/chapter state for the dropdowns
  const [selectedBook, setSelectedBook] = useState(bookName);
  const [selectedChapter, setSelectedChapter] = useState(chapterNum);

  const bookInfo = bibleBooks.find((b) => b.name === bookName);
  const totalChapters = bookInfo?.chapters || 1;
  const chaptersCount = bibleBooks.find((book) => book.name === selectedBook)?.chapters || 0;

  const normalize = (str) => str.toLowerCase().trim().replace(/s$/, "");

  const fetchResources = async () => {
    if (!bookName || !chapterNum) return;

    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.from("resources").select("*");
      if (error) throw error;

      // Extract authors
      const uniqueAuthors = new Set();
      data.forEach((r) => {
        if (r.author?.trim()) uniqueAuthors.add(r.author.trim());
      });
      setAvailableAuthors(uniqueAuthors);

      // Helper to map resource fields
      const processResource = (r) => ({
        ...r,
        formattedReference: r.reference || "",
        secondary_scripture: r.secondary_scripture || "",
      });

      // Filter primary resources for this chapter
      const primaryData = data
        .filter((r) => {
          if (r.book !== bookName) return false;
          if (!r.chapter) return true;
          const start = parseInt(r.chapter);
          const end = r.chapter_end ? parseInt(r.chapter_end) : start;
          return chapterNum >= start && chapterNum <= end;
        })
        .map(processResource);

      // Filter secondary resources
      const secondaryData = data
        .filter(
          (r) =>
            r.secondary_scripture &&
            parseSecondaryScripture(r.secondary_scripture, bookName, chapterNum)
        )
        .map(processResource);

      // Group by type
      const groupResources = (items) => ({
        sermons: items.filter((r) => normalize(r.type) === "sermon"),
        commentaries: items.filter((r) => normalize(r.type) === "commentary"),
        devotionals: items.filter((r) => normalize(r.type) === "devotional"),
        books: items.filter((r) => normalize(r.type) === "book"),
        videos: items.filter((r) => normalize(r.type) === "video"),
      });

      setPrimaryResources(groupResources(primaryData));
      setSecondaryResources(groupResources(secondaryData));
    } catch (err) {
      setError(`Error fetching resources: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [bookName, chapterNum]);

  // Update selected states when URL changes
  useEffect(() => {
    if (bookName) setSelectedBook(bookName);
    if (chapterNum && !isNaN(chapterNum)) setSelectedChapter(chapterNum);
  }, [bookName, chapterNum]);

  const filterAndSortResources = useMemo(() => {
    return (items) => {
      if (!items || !items.length) return [];

      let filtered = items.filter((item) => {
        const filterType = item.type.toLowerCase().replace(/s$/, "");
        const typeMatch = filters.types.has(
          filterType === "commentary" ? "commentaries" : filterType + "s"
        );

        const authorMatch =
          !filters.authors.size || filters.authors.has(item.author?.trim());
        const priceMatch =
          !filters.price.size ||
          filters.price.has(
            !item.price || item.price.toLowerCase() === "free" ? "free" : "paid"
          );

        return typeMatch && authorMatch && priceMatch;
      });

      if (sortBy === "alphabetical") filtered.sort((a, b) => a.title.localeCompare(b.title));
      if (sortBy === "newest")
        filtered.sort(
          (a, b) => (parseInt(b.published_year) || 0) - (parseInt(a.published_year) || 0)
        );

      return filtered;
    };
  }, [filters, sortBy]);

  const toggleFilter = (category, value) => {
    setFilters((prev) => {
      const newSet = new Set(prev[category]);
      newSet.has(value) ? newSet.delete(value) : newSet.add(value);
      return { ...prev, [category]: newSet };
    });
  };

  const prevChapter = chapterNum > 1 ? chapterNum - 1 : null;
  const nextChapter = chapterNum < totalChapters ? chapterNum + 1 : null;

  if (!bookName) return <div style={{ backgroundColor: "#ffffff", color: "#000000" }}>Book not found</div>;

  const bubbleStyle = {
    backgroundColor: "#f5f5f5",
    padding: "0.3rem 0.6rem",
    borderRadius: "16px",
    fontSize: "0.65rem",
    fontWeight: "500",
    color: "#555",
    border: "1px solid #e0e0e0",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.25rem"
  };

  const ResourceCard = ({ resource, isSecondary }) => {
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
          backgroundColor: "#ffffff", // Explicitly white
          color: "#000000", // Explicitly black text
          padding: "1.25rem",
          border: "1px solid #e5e7eb",
          borderRadius: "16px",
          fontSize: "0.95rem",
          transition: "all 0.2s ease",
          cursor: "pointer",
          maxWidth: "700px",
          marginBottom: "1.5rem",
          minHeight: description ? "auto" : "90px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
          e.currentTarget.style.transform = "translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)";
          e.currentTarget.style.transform = "translateY(0)";
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

        <div style={{ flex: 1, display: "flex", gap: "1rem" }}>
          <div style={{ 
            flex: 1, 
            display: "flex", 
            flexDirection: "column",
            minWidth: 0 // Allows flex item to shrink below its content size
          }}>
            <div style={{ flex: "1" }}>
              <h4
                style={{
                  margin: "0",
                  color: "#000000", // Explicitly black
                  fontSize: "1.3rem",
                  fontWeight: "600",
                  lineHeight: "1.3",
                  marginBottom: description ? "0.8rem" : "0.6rem"
                }}
              >
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ 
                    color: "#2563eb", 
                    textDecoration: "none",
                    borderBottom: "2px solid transparent",
                    transition: "border-color 0.2s ease"
                  }}
                  onMouseEnter={(e) => e.target.style.borderBottomColor = "#2563eb"}
                  onMouseLeave={(e) => e.target.style.borderBottomColor = "transparent"}
                >
                  {title}
                </a>
              </h4>
              
              <p
                style={{
                  margin: "0",
                  color: "#666666", // Explicitly gray
                  fontSize: "0.95rem",
                  fontStyle: "italic",
                  lineHeight: "1.4"
                }}
              >
                {description && description.trim() !== ""
                  ? description
                  : "No description available."}
              </p>
            </div>

            <div style={{ 
              display: "flex", 
              flexWrap: "nowrap", 
              gap: "0.6rem", 
              marginTop: description ? "1.2rem" : "auto",
              alignItems: "center",
              overflow: "hidden" // Prevents bubbles from overflowing
            }}>
              {author && (
                <span style={bubbleStyle}>
                  <span style={{ fontSize: "0.8rem" }}>👤</span>
                  {author}
                </span>
              )}

              {formattedReference && (
                <span style={bubbleStyle}>
                  <span style={{ fontSize: "0.8rem" }}>📖</span>
                  {formattedReference}
                </span>
              )}

              {price && (
                <span style={bubbleStyle}>
                  <span style={{ fontSize: "0.8rem" }}>💲</span>
                  {price.toLowerCase() === "free" ? "Free" : price}
                </span>
              )}

              {published_year && (
                <span style={bubbleStyle}>
                  <span style={{ fontSize: "0.8rem" }}>📅</span>
                  {published_year}
                </span>
              )}
            </div>
          </div>

          {secondary_scripture && (
            <div style={{
              flexShrink: 0,
              width: "180px", // Fixed width instead of percentage
              paddingLeft: "1rem",
              paddingTop: "0.5rem",
              borderLeft: "2px solid #e5e7eb", // Visual separator
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              fontSize: "0.8rem",
              fontStyle: "italic",
              color: "#666666", // Explicitly gray
              textAlign: "left"
            }}>
              <strong style={{ 
                fontStyle: "normal", 
                color: "#374151", // Explicitly dark gray
                fontWeight: "600",
                marginBottom: "0.3rem",
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em"
              }}>
                Secondary Scripture
              </strong>
              <span style={{ fontSize: "0.85rem", fontWeight: "500" }}>
                {secondary_scripture}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const ResourceGrid = ({ title, primaryItems, secondaryItems }) => {
    const filteredPrimary = filterAndSortResources(primaryItems);
    const filteredSecondary = filterAndSortResources(secondaryItems);
    const totalItems = filteredPrimary.length + filteredSecondary.length;

    return (
      <section
        style={{
          width: "100%",
          border: "1px solid #cccccc",
          borderRadius: "8px",
          padding: "1rem",
          marginBottom: "1.5rem",
          backgroundColor: "#f9f9f9",
          flexDirection: "column"
        }}
      >
        <h2 style={{ marginTop: 0, color: "#000000" }}> {/* Explicitly black */}
          {title} ({totalItems})
        </h2>
        {loading ? (
          <p style={{ fontStyle: "italic", color: "#666666" }}>Loading...</p>
        ) : totalItems === 0 ? (
          <p style={{ fontStyle: "italic", color: "#666666" }}>
            No resources available
          </p>
        ) : (
          <div>
            {filteredPrimary.map((resource) => (
              <ResourceCard key={`primary-${resource.id}`} resource={resource} />
            ))}
            {filteredSecondary.map((resource) => (
              <ResourceCard key={`secondary-${resource.id}`} resource={resource} isSecondary={true} />
            ))}
          </div>
        )}
      </section>
    );
  };

  return (
    <div style={{ 
      padding: "0rem 2rem 2rem", 
      textAlign: "center", 
      backgroundColor: "#ffffff", // Explicitly white background
      color: "#000000", // Explicitly black text
      minHeight: "100vh" // Ensure full page coverage
    }}>
      <Header />
      
      {/* Intro positioned above everything else */}
      <div style={{ paddingTop: "80px", textAlign: "center" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "36px",
            maxWidth: "900px",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          {/* Intro bubble - moved to top */}
          <Intro />
        </div>
      </div>
      
      {loading && (
        <LoadingScreen 
          selectedBook={bookName} 
          selectedChapter={chapter} 
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

      <div style={{ paddingTop: "20px", textAlign: "center" }}>
        {/* Wrapper for navigation controls */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "36px",
            maxWidth: "900px",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          {/* Navigation controls: Book and Chapter selects with Prev/Next buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "1rem",
              flexWrap: "wrap",
              alignItems: "flex-end",
            }}
          >
            {/* Book select */}
            <div>
              <label htmlFor="book-select" style={{ fontWeight: "bold", color: "#000000" }}> {/* Explicitly black */}
                Choose a book:
              </label>
              <br />
              <select
                id="book-select"
                value={selectedBook}
                onChange={(e) => {
                  setSelectedBook(e.target.value);
                  setSelectedChapter("");
                  // Navigate to new book/chapter if both are selected
                  if (e.target.value && selectedChapter) {
                    window.location.href = `/${bookToUrl(e.target.value)}/${selectedChapter}`;
                  }
                }}
                style={{
                  padding: "0.6rem 1rem",
                  fontSize: "1rem",
                  borderRadius: "12px",
                  border: "1.5px solid #000000", // Explicitly black border
                  backgroundColor: "#ffffff", // Explicitly white
                  color: "#000000", // Explicitly black text
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
              <label htmlFor="chapter-select" style={{ fontWeight: "bold", color: "#000000" }}> {/* Explicitly black */}
                Choose a chapter:
              </label>
              <br />
              <select
                id="chapter-select"
                value={selectedChapter}
                onChange={(e) => {
                  setSelectedChapter(parseInt(e.target.value));
                  // Navigate to new book/chapter if both are selected
                  if (selectedBook && e.target.value) {
                    window.location.href = `/${bookToUrl(selectedBook)}/${e.target.value}`;
                  }
                }}
                disabled={!selectedBook}
                style={{
                  padding: "0.6rem 1rem",
                  fontSize: "1rem",
                  borderRadius: "12px",
                  border: "1.5px solid #000000", // Explicitly black border
                  backgroundColor: "#ffffff", // Explicitly white
                  color: "#000000", // Explicitly black text
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

            {/* Previous/Next Navigation */}
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end" }}>
              {prevChapter && (
                <Link 
                  to={`/${bookToUrl(bookName)}/${prevChapter}`} 
                  style={{ 
                    color: "#2563eb", 
                    textDecoration: "none", 
                    padding: "0.6rem 1rem", 
                    border: "1.5px solid #000000", // Explicitly black border
                    borderRadius: "12px",
                    fontSize: "1rem",
                    fontWeight: "500",
                    transition: "all 0.3s ease",
                    backgroundColor: "#ffffff", // Explicitly white
                    display: "inline-block",
                    textAlign: "center",
                    minWidth: "70px"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#e5e7eb";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#ffffff";
                  }}
                >
                  ← Prev
                </Link>
              )}

              {nextChapter && (
                <Link 
                  to={`/${bookToUrl(bookName)}/${nextChapter}`} 
                  style={{ 
                    color: "#2563eb", 
                    textDecoration: "none", 
                    padding: "0.6rem 1rem", 
                    border: "1.5px solid #000000", // Explicitly black border
                    borderRadius: "12px",
                    fontSize: "1rem",
                    fontWeight: "500",
                    transition: "all 0.3s ease",
                    backgroundColor: "#ffffff", // Explicitly white
                    display: "inline-block",
                    textAlign: "center",
                    minWidth: "70px"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#e5e7eb";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#ffffff";
                  }}
                >
                  Next →
                </Link>
              )}
            </div>
          </div>

          {/* Resources header */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: ".5rem",
            marginBottom: ".5rem"
          }}>
            <div style={{
              background: "linear-gradient(135deg, rgba(217, 196, 140, 0.15) 0%, rgba(142, 119, 39, 0.1) 100%)",
              padding: "1.25rem 2.5rem",
              borderRadius: "16px",
              border: "2px solid #d9c48c",
              boxShadow: "0 4px 6px rgba(142, 119, 39, 0.1)"
            }}>
              <h1 style={{ 
                fontWeight: "700", 
                color: "#000000", // Explicitly black
                fontSize: "2rem",
                textAlign: "center",
                margin: "0",
                textShadow: "none", // Remove text shadow that might cause issues
              }}>
                Resources for {bookName} {chapterNum}
              </h1>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div style={{
          maxWidth: "900px",
          marginLeft: "auto",
          marginRight: "auto",
          textAlign: "left",
          marginTop: "2rem"
        }}>
          <SortFilter 
            sortBy={sortBy} 
            setSortBy={setSortBy} 
            filters={filters} 
            setFilters={setFilters} 
            toggleFilter={toggleFilter} 
            availableAuthors={availableAuthors} 
          />

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
        </div>
      </div>
    </div>
  );
}

export default ChapterDesktop;