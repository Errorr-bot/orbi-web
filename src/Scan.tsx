// src/Scan.tsx
import React, { useState } from "react";
import "./Scan.css";
import { useNavigate } from "react-router-dom";

const Scan: React.FC = () => {
  const [text, setText] = useState("");
  const navigate = useNavigate();

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setText(`Scanned from: ${file.name}`);
  };

  return (
    <div className="scan-root">
      {/* 🌿 Mint Back Button */}
      <button
        className="mint-back-btn"
        onClick={() => {
          const btn = document.querySelector(".mint-back-btn");
          btn?.classList.add("ripple");
          setTimeout(() => btn?.classList.remove("ripple"), 500);
          setTimeout(() => navigate("/dashboard"), 250);
        }}
      >
        <span className="arrow">←</span>
        <span className="tooltip">Back to Dashboard</span>
      </button>

      <h2>📷 Orbi Scan</h2>
      <p>Upload an image to extract text using Orbi’s smart scan feature.</p>

      <input type="file" accept="image/*" onChange={handleUpload} />

      {text && <div className="scan-result">{text}</div>}
    </div>
  );
};

export default Scan;
