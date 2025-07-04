const express = require("express");
const fetch = require("node-fetch");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

if (!process.env.ELEVENLABS_API_KEY) {
  console.error("Error: ELEVENLABS_API_KEY environment variable is required");
  process.exit(1);
}

app.get("/test", (_req, res) => {
  res.send("ElevenLabs Proxy OK");
});

app.post("/speak", async (req, res) => {
  const text = req.body.text || req.body.text;
  if (!text) return res.status(400).send("Error: text is required");

  try {
    const resp = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${process.env.VOICE_ID || ""}`, {
      method: "POST",
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY,
        Accept: "audio/mpeg",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: text,
        model_id: process.env.MODEL_ID || "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        },
        output_format: "mp3_44100_128"
      })
    });

    if (!resp.ok) {
      const t = await resp.text();
      return res.status(resp.status).send(`Error from ElevenLabs: ${t}`);
    }
    const buffer = await resp.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    res.send(base64);
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
