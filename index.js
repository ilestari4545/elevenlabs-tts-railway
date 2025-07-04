const express = require("express");
const fetch = require("node-fetch");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = "q8qwd1jY2jS3AWOBeq25";
const MODEL_ID = "eleven_multilingual_v2";

app.get("/", (req, res) => {
  res.send("🟢 ElevenLabs Proxy aktif");
});

app.post("/speak", async (req, res) => {
  const text = req.body.text || req.query.text;
  if (!text) return res.status(400).send("Teks kosong");

  const payload = {
    text: text,
    model_id: MODEL_ID,
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.75
    },
    output_format: "mp3_44100_128"
  };

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).send("Gagal: " + errText);
    }

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    res.send(base64);
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
});

app.listen(3000, () => {
  console.log("Server jalan di http://localhost:3000");
});
