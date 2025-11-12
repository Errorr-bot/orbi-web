import React, { useState } from "react";
import "./Scan.css";

const Scan: React.FC = () => {
  const [text, setText] = useState("");
  const [uploaded, setUploaded] = useState(false);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setUploaded(true);
      setTimeout(() => setText("Scanned text: 'The future is mint 🌿'"), 1000);
    }
  };

  return (
    <div className="scan-container">
      <h2 className="section-title">📷 Orbi Scanner</h2>
      <p className="scan-sub">Extract text easily from images.</p>

      <div className="scan-box">
        {!uploaded ? (
          <label className="scan-upload">
            <input type="file" accept="image/*" onChange={handleUpload} hidden />
            Upload Image
          </label>
        ) : (
          <p className="scan-text">{text}</p>
        )}
      </div>
    </div>
  );
};

export default Scan;
