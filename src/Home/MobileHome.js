import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "../SupaBaseInfo";
import Header from "../Header/Header";
import Intro from "../Intro";
import LoadingScreen from "../LoadingScreen";
import SortFilter from "../SortFilter";
import { typeLabels, bibleBooks, resourceTypes } from "../Constants";
import { parseSecondaryScripture } from "../Logic";

function MobileHome() {
  const [selectedBook, setSelectedBook] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [sortBy, setSortBy] = useState("");
  const [filters, setFilters] = useState({
    types: new Set(resourceTypes.map((t) => t.toLowerCase())),
    authors: new Set(),
    price: new Set(),
  });

  const [primaryResources, setPrimaryResources] = useState({});
  const [secondaryResources, setSecondaryResources] = useState({});

  const chaptersCount =
    bibleBooks.find((book) => book.name === selectedBook)?.chapters || 0;

  // -----------------------
  // Fetch Resources
  // -----------------------
  const fetchResources = async () => {
    if (!selectedBook || !selectedChapter) return;

    setLoading(true);
    setError("");

    try {
      const selectedChapterNum = parseInt(selectedChapter);

      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .limit(10000);

      if (error) throw error;

      // Primary match
      const primaryData = data.filter((r) => {
        if (r.book !== selectedBook) return false;
        if (!r.chapter) return true;

        const start = parseInt(r.chapter);
        const end = r.chapter_end ? parseInt(r.chapter_end) : start;
        return selectedChapterNum >= start && selectedChapterNum <= end;
      });

      // Secondary match
      const secondaryData = data.filter((r) =>
        r.secondary_scripture
          ? parseSecondaryScripture(
              r.secondary_scripture,
              selectedBook,
              selectedChapterNum
            )
          : false
      );

      const normalize = (str) =>
        str.toLowerCase().trim().replace(/s$/, "");

      const groupByType = (list) => ({
        sermons: list.filter((r) => normalize(r.type) === "sermon"),
        books: list.filter((r) => normalize(r.type) === "book"),
        commentaries: list.filter((r) => normalize(r.type) === "commentary"),
        devotionals: list.filter((r) => normalize(r.type) === "devotional"),
        videos: list.filter((r) => normalize(r.type) === "video"),
      });

      setPrimaryResources(groupByType(primaryData));
      setSecondaryResources(groupByType(secondaryData));
    } catch (err) {
      setError(`Error fetching resources: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [selectedBook, selectedChapter]);

  // -----------------------
  // Filtering & Sorting
  // -----------------------
  const filterAndSortResources = useMemo(() => {
    return (items) => {
      if (!items || items.length === 0) return [];

      let filtered = items.filter((item) => {
        const normalize = (str) => str.toLowerCase().trim().replace(/s$/, "");
        const getFilterType = (dbType) =>
          normalize(dbType) === "commentary"
            ? "commentaries"
            : normalize(dbType) + "s";

        const typeMatch = filters.types.has(getFilterType(item.type));
        const authorMatch =
          filters.authors.size === 0 || filters.authors.has(item.author);

        let priceMatch = true;
        if (filters.price.size > 0) {
          const itemPrice =
            !item.price || item.price === "0" || item.price.toLowerCase() === "free"
              ? "free"
              : "paid";
          priceMatch = filters.price.has(itemPrice);
        }

        return typeMatch && authorMatch && priceMatch;
      });

      switch (sortBy) {
        case "alphabetical":
          filtered.sort((a, b) => a.title.localeCompare(b.title));
          break;
        case "newest":
          filtered.sort(
            (a, b) =>
              (parseInt(b.published_year) || 0) -
              (parseInt(a.published_year) || 0)
          );
          break;
        case "oldest":
          filtered.sort(
            (a, b) =>
              (parseInt(a.published_year) || 0) -
              (parseInt(b.published_year) || 0)
          );
          break;
        case "scripture":
          filtered.sort((a, b) => {
            const aC = parseInt(a.chapter) || 0;
            const bC = parseInt(b.chapter) || 0;
            if (aC !== bC) return aC - bC;
            return (parseInt(a.verse_start) || 0) - (parseInt(b.verse_start) || 0);
          });
          break;
        default:
          break;
      }

      return filtered;
    };
  }, [filters, sortBy]);

  // -----------------------
  // Toggle Filter
  // -----------------------
  const toggleFilter = (category, value) => {
    setFilters((prev) => {
      const newSet = new Set(prev[category]);
      newSet.has(value) ? newSet.delete(value) : newSet.add(value);
      return { ...prev, [category]: newSet };
    });
  };

  // -----------------------
  // Resource Card
  // -----------------------
  const ResourceCard = ({ resource }) => {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          border: "1px solid #ddd",
          borderRadius: "12px",
          padding: "0.75rem",
          margin: "0.5rem 0",
          backgroundColor: "#fff",
          boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
        }}
      >
        {/* Image */}
        <img
          src={resource.image || "/placeholder.png"}
          alt={resource.title}
          style={{
            width: "70px",
            height: "70px",
            objectFit: "cover",
            borderRadius: "8px",
          }}
        />

        {/* Text */}
        <div style={{ flex: 1, textAlign: "left" }}>
          {resource.url ? (
            <a
              href={resource.url}
              target="_blank"
              rel="noreferrer"
              style={{
                fontSize: "1rem",
                fontWeight: "600",
                color: "#1e88e5",
                textDecoration: "none",
              }}
            >
              {resource.title}
            </a>
          ) : (
            <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: "600" }}>
              {resource.title}
            </h4>
          )}
          <p style={{ margin: "0.2rem 0", fontSize: "0.85rem", color: "#555" }}>
            {resource.author}
          </p>
        </div>
      </div>
    );
  };

  // -----------------------
  // UI
  // -----------------------
  return (
    <div
      style={{
        padding: "1rem",
        textAlign: "center",
        maxWidth: "500px",
        margin: "0 auto",
      }}
    >
      <Header />
      {/* Add spacing so Intro isn't cut off */}
      <div style={{ marginTop: "2.5rem" ,marginBottom:"1rem"}}>
        <Intro />
      </div>

      {loading && selectedBook && selectedChapter && (
        <LoadingScreen
          selectedBook={selectedBook}
          selectedChapter={selectedChapter}
          faviconUrl="/favicon.ico"
        />
      )}

      {error && (
        <div
          style={{
            backgroundColor: "#ffebee",
            color: "#c62828",
            padding: "0.8rem",
            borderRadius: "4px",
            margin: "1rem 0",
          }}
        >
          {error}
        </div>
      )}

      {/* Book & Chapter Selectors */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <select
          value={selectedBook}
          onChange={(e) => {
            setSelectedBook(e.target.value);
            setSelectedChapter("");
          }}
          style={{
            width: "100%",
            padding: "0.75rem",
            borderRadius: "10px",
            border: "1px solid #ccc",
            fontSize: "1rem",
          }}
        >
          <option value="">📖 Choose a book...</option>
          {bibleBooks.map((b) => (
            <option key={b.name} value={b.name}>
              {b.name}
            </option>
          ))}
        </select>

        <select
          value={selectedChapter}
          onChange={(e) => setSelectedChapter(e.target.value)}
          disabled={!selectedBook}
          style={{
            width: "100%",
            padding: "0.75rem",
            borderRadius: "10px",
            border: "1px solid #ccc",
            fontSize: "1rem",
            backgroundColor: !selectedBook ? "#f5f5f5" : "#fff",
          }}
        >
          <option value=""># Choose a chapter...</option>
          {Array.from({ length: chaptersCount }, (_, i) => i + 1).map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
      </div>

      {/* Sort & Filter */}
      <SortFilter
        sortBy={sortBy}
        setSortBy={setSortBy}
        filters={filters}
        setFilters={setFilters}
        toggleFilter={toggleFilter}
      />

      {/* Resource Display */}
      {selectedBook && selectedChapter ? (
        Object.keys(typeLabels).map(
          (key) =>
            filters.types.has(key) &&
            primaryResources[key] && (
              <div key={key}>
                <h3 style={{ textAlign: "left", color: "#000" }}>
                  {typeLabels[key]} ({primaryResources[key].length})
                </h3>
                {filterAndSortResources(primaryResources[key]).map((res) => (
                  <ResourceCard key={res.id} resource={res} />
                ))}
              </div>
            )
        )
      ) : (
        <p style={{ fontStyle: "italic", color: "#666", padding: "1rem" }}>
          Please select a book and chapter to view resources.
        </p>
      )}
    </div>
  );
}

export default MobileHome;

