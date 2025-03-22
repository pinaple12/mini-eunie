import React, { useState, useEffect } from "react";

export default function App() {
  const [input1, setInput1] = useState("");
  const [typedText, setTypedText] = useState("");
  const [showInputs, setShowInputs] = useState(false);
  const [products, setProducts] = useState([]);

  const fullText = "Hi! I'm Mini Eunie, your personal helper for matcha updates. Let me know how I can help!";

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      const next = index + 1;
      setTypedText(fullText.substring(0, next));
      index = next;

      if (next === fullText.length) {
        clearInterval(interval);
        setShowInputs(true);
      }
    }, 40);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (showInputs) {
      fetch("https://mini-eunie.onrender.com/products")
        .then((res) => res.json())
        .then((data) => setProducts(data.products || []));
    }
  }, [showInputs]);

  const handleInputs = (value) => {
    fetch("https://mini-eunie.onrender.com/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "product", value }),
    })
      .then((res) => res.json())
      .then(() => {
        setProducts((prev) => [...prev, value]);
        setInput1("");
      });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && input1.trim()) {
      handleInputs(input1);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        fontFamily: "sans-serif",
      }}
    >
      <h1 style={{ marginBottom: "1rem" }}>Mini Eunie</h1>

      <img
        src="/pokemon-sinistcha.png"
        alt="Mini Eunie"
        style={{
          marginBottom: "2rem",
          borderRadius: "1rem",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        }}
      />

      <p
        style={{
          marginBottom: "1rem",
          minHeight: "1.5rem",
          fontSize: "1rem",
        }}
      >
        {typedText}
        {!showInputs && (
          <span
            style={{
              display: "inline-block",
              width: "1ch",
              animation: "blink 1s steps(2, start) infinite",
            }}
          >
            |
          </span>
        )}
      </p>

      {/* Reserved space for inputs with fade-in */}
      <div
        style={{
          height: "340px",
          display: "flex",
          flexDirection: "column",
          justifyContent: showInputs ? "flex-start" : "flex-end",
          alignItems: "center",
          width: "100%",
          maxWidth: "400px",
          opacity: showInputs ? 1 : 0,
          animation: showInputs ? "fadeIn 1s ease forwards" : "none",
          transition: "opacity 0.3s ease",
        }}
      >
        {showInputs && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}>
            <label style={{ fontWeight: "bold" }}>
              Add a new product to watch out for:
            </label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                type="text"
                placeholder="Input link to product here"
                value={input1}
                onChange={(e) => setInput1(e.target.value)}
                onKeyDown={handleKeyPress}
                style={{
                  flex: 1,
                  padding: "0.5rem",
                  borderRadius: "0.5rem",
                  border: "1px solid #ccc",
                }}
              />
              <button
                onClick={() => handleInputs(input1)}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "0.5rem",
                  background: "#007bff",
                  color: "#fff",
                  border: "none",
                }}
              >
                Enter
              </button>
            </div>
            <div>
              <em style={{ marginBottom: "0.25rem", display: "inline-block" }}>Saved Products:</em>
              <ul style={{ paddingLeft: "2rem", marginTop: "0.5rem" }}>
                {products.length > 0 ? (
                  products.map((url, i) => (
                    <li key={i} style={{ fontSize: "0.9rem" }}>{url}</li>
                  ))
                ) : (
                  <li style={{ fontSize: "0.9rem", fontStyle: "italic" }}>none!</li>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Inline keyframes for blinking cursor and fade-in */}
      <style>
        {`@keyframes blink {
          0% { opacity: 1; }
          50% { opacity: 0; }
          100% { opacity: 1; }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }`}
      </style>
    </div>
  );
}
