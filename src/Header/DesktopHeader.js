import React, { useState } from "react";
import { useNavigate } from "react-router-dom";


export default function Header() {
  const navigate = useNavigate();

  // Track which button is hovered
  const [hovered, setHovered] = useState(null);

  const renderButton = (label, path, index) => {
    const isHovered = hovered === index;
    return (
      <button
        onClick={() => navigate(path)}
        onMouseEnter={() => setHovered(index)}
        onMouseLeave={() => setHovered(null)}
        style={{
          padding: "0.5rem 1rem",
          backgroundColor: isHovered ? "#8e7727" : "#d9c48c",
          color: isHovered ? "black" : "black",
          border: "1.5px solid white",
          borderRadius: "10px",
          fontSize: "0.9rem",
          fontWeight: "bold",
          cursor: "pointer",
          transition: "all 0.3s ease",
        }}
      >
        {label}
      </button>
    );
  };

  return (
    <header
      style={{
        width: "100vw",
        position: "fixed",
        top: 0,
        left: 0,
        backgroundColor: "black",
        color: "white",
        padding: "0.8rem 1rem",
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontFamily: "Tahoma, Geneva, Verdana, sans-serif",
        boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
        zIndex: 1000,
      }}
    >
      {/* Left side: Logo and Title */}
      <div
        style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
        onClick={() => navigate("/")}
      >
        <img
          src="/mustardseedlogo.png"
          alt="Logo"
          style={{
            height: "32px",
            marginRight: "0.75rem",
          }}
        />
        <h1 style={{ margin: 0, fontSize: "18px", fontFamily: "georgia" }}>
          Reformed Chapter
        </h1>
      </div>

      {/* Right side: Navigation buttons */}
      <div style={{ display: "flex", gap: "1rem", marginRight: "1rem" }}>
        {renderButton("Submit Resources", "/SubmitResource", 0)}
        {renderButton("About Us", "/about", 1)}
        {renderButton("Donate", "/donate", 2)}
      </div>
    </header>
  );
}
