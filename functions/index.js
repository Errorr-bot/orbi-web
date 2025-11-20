const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Fast2SMS API key from environment config
const FAST2SMS_KEY = functions.config().fast2sms.key;

// -------------------------------------------------------------------
// POST /api/send-sms
// Body: { phone: string, text: string, qrLink?: string }
// -------------------------------------------------------------------
app.post("/send-sms", async (req, res) => {
  try {
    const { phone, text, qrLink } = req.body;

    if (!phone || !text) {
      return res.status(400).json({ error: "Missing phone or text parameter" });
    }

    // Final message
    const finalMessage = qrLink ? `${text}\nQR: ${qrLink}` : text;

    const url = "https://www.fast2sms.com/dev/bulkV2";

    const payload = {
      route: "v3",
      sender_id: "TXTIND",
      message: finalMessage,
      language: "english",
      flash: 0,
      numbers: phone,
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        authorization: FAST2SMS_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log("Fast2SMS Response:", data);

    if (data.return === false) {
      return res.status(500).json({ error: "Fast2SMS Error", details: data });
    }

    res.json({ success: true, message: "SMS sent!", details: data });
  } catch (err) {
    console.error("SMS error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Export Firebase Function
exports.api = functions.https.onRequest(app);
