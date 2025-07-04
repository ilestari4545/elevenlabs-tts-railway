const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

const ELEVEN_API_KEY = process.env.ELEVEN_API_KEY;
const VOICE_ID = process.env.VOICE_ID;
const MODEL_ID = process.env.MODEL_ID || 'eleven_multilingual_v2';

app.use(cors());
app.use(express.json());
app.use('/audio', express.static(path.join(__dirname, 'audio')));

app.post('/tts', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });

    const payload = { text, model_id: MODEL_ID, voice_settings: { stability:0.5, similarity_boost:0.75 }, output_format:'mp3_44100_128' };

    const elevenResponse = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      payload,
      { responseType:'arraybuffer', headers:{ 'xi-api-key':ELEVEN_API_KEY, 'Content-Type':'application/json','Accept':'audio/mpeg' } }
    );

    const filename = `voice_${Date.now()}.mp3`;
    const filepath = path.join(__dirname, 'audio', filename);
    fs.mkdirSync(path.join(__dirname, 'audio'), { recursive: true });
    fs.writeFileSync(filepath, Buffer.from(elevenResponse.data));
    res.json({ url: `/audio/${filename}` });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error:'TTS failed', detail:err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
