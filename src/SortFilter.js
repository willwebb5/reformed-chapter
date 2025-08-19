// SortFilter.js
import React, { useState, useMemo } from 'react';
import { resourceTypes, exampleAuthors } from './Constants';

// Constants for better maintainability
const SORT_OPTIONS = [
  { value: "", label: "Default Order", icon: "📋" },
  { value: "scripture", label: "Scripture Order", icon: "📖" },
  { value: "alphabetical", label: "A-Z", icon: "🔤" },
  { value: "date", label: "Newest First", icon: "⏰" }
];

const PRICE_OPTIONS = ["Free", "Paid"];

// Styles object to reduce inline styles
const styles = {
  container: {
    marginBottom: "2rem"
  },
  dropdownButton: {
    width: "100%",
    padding: "1rem 1.5rem",
    borderRadius: "12px",
    border: "2px solid #e2e8f0",
    backgroundColor: "white",
    fontSize: "1.1rem",
    fontWeight: "700",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
    outline: "none",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
  },
  dropdownPanel: {
    marginTop: "1rem",
    padding: "1rem",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    backgroundColor: "#f8fafc",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
  },
  sectionButton: (isExpanded) => ({
    width: "100%",
    padding: "0.75rem 1rem",
    borderRadius: "12px",
    border: "2px solid #e2e8f0",
    backgroundColor: isExpanded ? "#e2e8f0" : "white",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
    fontWeight: "600"
  }),
  buttonGrid: {
    marginTop: "0.5rem",
    display: "flex",
    gap: "0.5rem",
    flexWrap: "wrap"
  },
  filterButton: (isSelected, color = "#3b82f6") => ({
    padding: "0.5rem 0.8rem",
    borderRadius: "20px",
    border: `2px solid ${isSelected ? color : "#e2e8f0"}`,
    backgroundColor: isSelected ? color : "white",
    color: isSelected ? "white" : "#64748b",
    fontWeight: "500",
    cursor: "pointer"
  }),
  searchInput: {
    width: "100%",
    padding: "0.5rem 0.75rem",
    borderRadius: "12px",
    border: "2px solid #e2e8f0",
    marginBottom: "0.5rem",
    outline: "none"
  },
  clearButton: {
    padding: "0.5rem 1rem",
    borderRadius: "12px",
    border: "none",
    backgroundColor: "#ef4444",
    color: "white",
    cursor: "pointer",
    fontWeight: "600"
  }
};

const SortFilter = ({ sortBy, setSortBy, filters, setFilters, toggleFilter }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [showResourceTypes, setShowResourceTypes] = useState(false);
  const [showAuthors, setShowAuthors] = useState(false);
  const [showPrice, setShowPrice] = useState(false);
  const [authorSearch, setAuthorSearch] = useState("");

  // Memoize filtered authors for better performance
  const filteredAuthors = useMemo(() => 
    exampleAuthors.filter(author =>
      author.toLowerCase().includes(authorSearch.toLowerCase())
    ), [authorSearch]
  );

  const clearAllFilters = () => {
    setSortBy("");
    setFilters(prev => ({ 
      ...prev, 
      authors: new Set(), 
      types: new Set(),
      price: new Set()
    }));
  };

  const handlePriceToggle = (priceOption) => {
    const lowerPrice = priceOption.toLowerCase();
    setFilters(prev => {
      const newFilters = { ...prev };
      
      // Initialize price Set if it doesn't exist
      if (!newFilters.price) {
        newFilters.price = new Set();
      }
      
      // Create a new Set to ensure state updates properly
      const newPriceSet = new Set(newFilters.price);
      
      if (newPriceSet.has(lowerPrice)) {
        newPriceSet.delete(lowerPrice);
      } else {
        newPriceSet.add(lowerPrice);
      }
      
      newFilters.price = newPriceSet;
      return newFilters;
    });
  };

  const handleAuthorToggle = (author) => {
    if (author === "All Authors") {
      setFilters(prev => ({ ...prev, authors: new Set() }));
    } else {
      toggleFilter("authors", author);
    }
  };

  const handleSortSelection = (value) => {
    setSortBy(value);
    setShowSortOptions(false);
  };

  const isAllAuthorsSelected = filters.authors?.size === 0;

  const renderArrow = (isExpanded) => (
    <span style={{
      transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
      transition: "0.2s"
    }}>
      ▼
    </span>
  );

  return (
    <div style={styles.container}>
      {/* Main Dropdown Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        style={styles.dropdownButton}
        aria-expanded={showDropdown}
        aria-label="Filter and sort options"
      >
        Filter & Sort
        {renderArrow(showDropdown)}
      </button>

      {/* Dropdown Panel */}
      {showDropdown && (
        <div style={styles.dropdownPanel}>
          {/* Sort Section */}
          <div style={{ marginBottom: "1rem" }}>
            <button
              onClick={() => setShowSortOptions(!showSortOptions)}
              style={styles.sectionButton(showSortOptions)}
              aria-expanded={showSortOptions}
            >
              🔄 Sort Results
              <span>{showSortOptions ? "▲" : "▼"}</span>
            </button>
            
            {showSortOptions && (
              <div style={styles.buttonGrid}>
                {SORT_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleSortSelection(option.value)}
                    style={styles.filterButton(sortBy === option.value)}
                    aria-pressed={sortBy === option.value}
                  >
                    {option.icon} {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Resource Types Section */}
          <div style={{ marginBottom: "1rem" }}>
            <button
              onClick={() => setShowResourceTypes(!showResourceTypes)}
              style={styles.sectionButton(showResourceTypes)}
              aria-expanded={showResourceTypes}
            >
              📚 Resource Types
              <span>{showResourceTypes ? "▲" : "▼"}</span>
            </button>
            
            {showResourceTypes && (
              <div style={styles.buttonGrid}>
                {resourceTypes.map(type => {
                  const lowerType = type.toLowerCase();
                  const isSelected = filters.types?.has(lowerType);
                  return (
                    <button
                      key={type}
                      onClick={() => toggleFilter("types", lowerType)}
                      style={styles.filterButton(isSelected, "#10b981")}
                      aria-pressed={isSelected}
                    >
                      {type} {isSelected && "✓"}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          {/* Price Section */}
          <div style={{ marginBottom: "1rem" }}>
            <button
              onClick={() => setShowPrice(!showPrice)}
              style={styles.sectionButton(showPrice)}
              aria-expanded={showPrice}
            >
              💲 Price
              <span>{showPrice ? "▲" : "▼"}</span>
            </button>
            
            {showPrice && (
              <div style={styles.buttonGrid}>
                {PRICE_OPTIONS.map(priceOption => {
                  const lowerPrice = priceOption.toLowerCase();
                  const isSelected = filters.price?.has(lowerPrice) || false;
                  return (
                    <button
                      key={priceOption}
                      onClick={() => handlePriceToggle(priceOption)}
                      style={styles.filterButton(isSelected, "#f59e0b")}
                      aria-pressed={isSelected}
                    >
                      {priceOption} {isSelected && "✓"}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Authors Section */}
          <div style={{ marginBottom: "1rem" }}>
            <button
              onClick={() => setShowAuthors(!showAuthors)}
              style={styles.sectionButton(showAuthors)}
              aria-expanded={showAuthors}
            >
              👥 Authors
              <span>{showAuthors ? "▲" : "▼"}</span>
            </button>
            
            {showAuthors && (
              <div style={{ marginTop: "0.5rem" }}>
                <input
                  type="text"
                  placeholder="🔍 Search authors..."
                  value={authorSearch}
                  onChange={(e) => setAuthorSearch(e.target.value)}
                  style={styles.searchInput}
                  aria-label="Search authors"
                />
                <div style={styles.buttonGrid}>
                  <button
                    onClick={() => handleAuthorToggle("All Authors")}
                    style={styles.filterButton(isAllAuthorsSelected, "#8b5cf6")}
                    aria-pressed={isAllAuthorsSelected}
                  >
                    All Authors {isAllAuthorsSelected && "✓"}
                  </button>
                  {filteredAuthors.map(author => {
                    const isSelected = filters.authors?.has(author);
                    return (
                      <button
                        key={author}
                        onClick={() => handleAuthorToggle(author)}
                        style={styles.filterButton(isSelected, "#8b5cf6")}
                        aria-pressed={isSelected}
                      >
                        {author} {isSelected && "✓"}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Clear All Button */}
          <div style={{ marginTop: "1rem", textAlign: "right" }}>
            <button
              onClick={clearAllFilters}
              style={styles.clearButton}
              aria-label="Clear all filters"
            >
              🗑️ Clear All
            </button>
          </div>
        </div>
      )}
      
      {/* Separator Line */}
      <div style={{
        width: "100%",
        height: "1px",
        background: "linear-gradient(90deg, transparent, #000000 20%, #000000 80%, transparent)",
        marginTop: "2rem",
        marginBottom: "1.5rem"
      }} />
    </div>
  );
};

export default SortFilter;