// src/Scan.tsx
import React, { useState } from "react";
import Tesseract from "tesseract.js";

const Scan: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImage(URL.createObjectURL(file));
  };

  const handleScan = async () => {
    if (!image) return;
    setLoading(true);
    setText("");
    try {
      const result = await Tesseract.recognize(image, "eng", {
        logger: (info) => console.log(info),
      });
      setText(result.data.text);
    } catch (err) {
      console.error(err);
      setText("Error reading image");
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        marginTop: "30px",
        background: "rgba(255,255,255,0.12)",
        borderRadius: 12,
        padding: 24,
        color: "white",
        textAlign: "center",
      }}
    >
      <h2>📷 Scan Image</h2>

      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        style={{ marginTop: 12 }}
      />

      {image && (
        <div style={{ marginTop: 16 }}>
          <img
            src={image}
            alt="uploaded"
            style={{ maxWidth: "100%", borderRadius: 8 }}
          />
        </div>
      )}

      <button
        onClick={handleScan}
        disabled={!image || loading}
        style={{
          marginTop: 16,
          padding: "10px 14px",
          background: "rgba(255,255,255,0.25)",
          color: "white",
          border: "none",
          borderRadius: 12,
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        {loading ? "🔍 Scanning..." : "🧠 Extract Text"}
      </button>

      {text && (
        <div
          style={{
            marginTop: 20,
            background: "rgba(255,255,255,0.15)",
            padding: 12,
            borderRadius: 8,
            whiteSpace: "pre-wrap",
          }}
        >
          <strong>📝 Extracted Text:</strong>
          <p>{text}</p>
        </div>
      )}
    </div>
  );
};

export default Scan;
