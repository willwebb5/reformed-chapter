import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import mustardSeedLogo from "./MustardSeed.png"; // Update this path if needed

export default function AboutUs() {
  const Section = ({ title, children }) => (
    <section
      style={{
        width: "100%",
        border: "1px solid #ccc",
        borderRadius: "10px",
        padding: "1.5rem",
        marginBottom: "1.5rem",
        backgroundColor: "#fff",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      }}
    >
      <h2 style={{ marginTop: 0, color: "#000" }}>{title}</h2>
      <div style={{ color: "#111", lineHeight: "1.6" }}>{children}</div>
    </section>
  );

  const buttonStyle = {
    padding: "0.6rem 1.2rem",
    borderRadius: "6px",
    border: "1.5px solid #000",
    backgroundColor: "#000",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "all 0.2s",
  };

  const buttonHover = (e) => {
    e.currentTarget.style.backgroundColor = "#333";
  };

  const buttonOut = (e) => {
    e.currentTarget.style.backgroundColor = "#000";
  };

  return (
    <div style={{ padding: "4rem 2rem 2rem", textAlign: "center", backgroundColor: "#f9f9f9", minHeight: "100vh"}}>
      <Header />
      <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "1rem", color: "#000" }}>
        About Reformed Chapter
      </h1>
      <p style={{ fontSize: "1.2rem", marginBottom: "2rem", color: "#555" }}>
        Biblical Depth. Reformed Clarity. Chapter by Chapter.
      </p>

      <div
        style={{
          maxWidth: "900px",
          marginLeft: "auto",
          marginRight: "auto",
          textAlign: "left",
        }}
      >
        <Section title="Our Mission">
          Reformed Chapter exists to help believers access trusted, Christ-centered
          resources on every chapter of Scripture to further their relationships with God.
        </Section>

        <Section title="What We Offer">
          <ul style={{ paddingLeft: "1.2rem", margin: 0 }}>
            <li>Hand-picked sermons, books, devotionals, and commentaries</li>
            <li>Reformed theology–aligned content</li>
            <li>Organized by book and chapter of the Bible</li>
            <li>Clean, distraction-free design</li>
          </ul>
        </Section>

        <Section title="Why Reformed?">
          We are rooted in historic, Reformed Christian doctrine — emphasizing God's
          sovereignty, Scripture's authority, and salvation by grace alone through
          faith alone.
        </Section>

        <Section title="Who We Are">
          Reformed Chapter was created by a small team of believers who wanted a
          simpler way to study Scripture one chapter at a time. It was founded by
          William Webb, a student passionate about making sound theology more
          accessible.
        </Section>

        <Section title="Our Logo">
          <p>
            The mustard seed is a powerful symbol for Reformed Chapter. It represents faith and growth from small beginnings, reflecting how studying even a single chapter of Scripture can lead to deep, transformative spiritual growth. Just as the mustard seed grows into a large tree in Jesus’ teaching, our hope is that each small study here will help faith flourish.
          </p>
          <div style={{ textAlign: "center", marginTop: "1rem" }}>
            <img
              src={mustardSeedLogo}
              alt="Mustard Seed Logo"
              style={{ maxWidth: "100px", height: "auto" }}
            />
          </div>
        </Section>

        <Section title="Join Us">
          <p style={{ marginBottom: "1rem" }}>
            We’re always looking to improve. Have a resource to recommend? Reach out and help us grow this collection.
          </p>

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <button
              onClick={() => (window.location.href = "/submit")}
              style={buttonStyle}
              onMouseOver={buttonHover}
              onMouseOut={buttonOut}
            >
              Submit Resource
            </button>

            <button
              onClick={() => (window.location.href = "mailto:you@example.com")}
              style={buttonStyle}
              onMouseOver={buttonHover}
              onMouseOut={buttonOut}
            >
              Contact Us
            </button>
          </div>
        </Section>
      </div>
    </div>
  );
}
