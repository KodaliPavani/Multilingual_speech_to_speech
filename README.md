<div align="center">

<img src="https://img.shields.io/badge/ScholarAI-Video%20Translator-6c63ff?style=for-the-badge&logo=google-gemini&logoColor=white" alt="ScholarAI" />

# 🎓 ScholarAI — Universal Multilingual Video Translator

### AI-powered YouTube video transcription, translation & speech synthesis for students

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111+-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Gemini](https://img.shields.io/badge/Gemini-2.5%20Flash-4285F4?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

</div>

---

## ✨ About the Project

**ScholarAI** is a full-stack, AI-powered application designed to help students and educators **understand any YouTube video in their native language**. Simply paste a link, choose your language, and the system will:

- 🎙️ **Download & extract** the video's audio track automatically
- 🧠 **Transcribe** the original spoken content using **Gemini 2.5 Flash**
- 🌐 **Translate** the transcript into your chosen language — simultaneously
- 📝 **Summarize** key takeaways as clean, digestible bullet points
- 🔊 **Synthesize** a natural-speech audio file in the target language using Google TTS

All in one seamless workflow — no configuration needed.

---

## 🖥️ UI Preview

> **ScholarAI** features a stunning dark Student-Professional theme — deep navy blue, indigo/violet neon accents, glassmorphism, and smooth Framer Motion animations.

| Dashboard | Results View | Study History |
|-----------|-------------|----------------|
| Input form with live progress tracker | Tabbed view: Translation, Notes, Transcript | Browseable session log with one-click replay |

---

## 🚀 Feature Highlights

| Feature | Description |
|---------|-------------|
| 🤖 **Gemini 2.5 Flash AI** | Handles transcription, translation & summarization in one unified call |
| 🍪 **Smart Cookie Auth** | Auto-uses Chrome/Edge/Firefox cookies to bypass YouTube bot-detection |
| 🔊 **TTS Speech Synthesis** | Generates a narrated audio file in the target language via Google TTS |
| 📊 **Step Progress Tracker** | Real-time multi-step progress indicator while processing |
| 🕒 **Session History** | Stores up to 15 past sessions in localStorage with one-click replay |
| 🌍 **5 Languages** | English, Telugu, Hindi, Spanish, French |
| 💡 **Graceful Error Handling** | TTS/network failures won't crash the pipeline — text results always returned |
| ⚡ **Live Reload** | FastAPI Uvicorn + Vite HMR for rapid development |

---

## 🛠️ Tech Stack

### Backend
| Package | Purpose |
|---------|---------|
| `fastapi` + `uvicorn` | High-performance REST API server |
| `yt-dlp` | YouTube audio extraction |
| `static-ffmpeg` | Bundled ffmpeg for audio conversion to MP3 |
| `google-generativeai` | Gemini 2.5 Flash — transcription, translation, summarization |
| `gtts` | Google Text-to-Speech audio synthesis |
| `python-dotenv` | `.env` environment variable management |

### Frontend
| Package | Purpose |
|---------|---------|
| `react` + `typescript` | UI framework |
| `vite` | Development server & bundler |
| `tailwindcss` v4 | Utility-first CSS framework |
| `framer-motion` | Smooth animations and transitions |
| `lucide-react` | Beautiful icon set |
| `axios` | HTTP client for API calls |

---

## 📁 Project Structure

```
pp2/
├── backend/
│   ├── services/
│   │   ├── gemini_service.py     # Gemini AI: transcription + translation + summary
│   │   ├── tts_service.py        # Google TTS speech synthesis
│   │   └── youtube_service.py    # yt-dlp audio download & ffmpeg conversion
│   ├── output_audio/             # Served synthesized MP3 files
│   ├── temp_processing/          # Temporary audio workspace (auto-cleaned)
│   ├── main.py                   # FastAPI routes and application entry point
│   ├── requirements.txt          # Python dependencies
│   └── .env                      # Secret keys (not committed to git)
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx               # Main React application and UI
│   │   └── index.css             # Student Professional dark theme styles
│   ├── index.html                # Root HTML with Google Fonts (Inter + Space Grotesk)
│   └── package.json              # Node.js dependencies
│
└── README.md
```

---

## ⚙️ Setup & Installation

### Prerequisites

- **Python** 3.10 or higher
- **Node.js** v18 or higher
- A valid **Google Gemini API Key** (get one from [Google AI Studio](https://aistudio.google.com))
- **Chrome, Edge, or Firefox** installed and logged into YouTube (for cookie-based auth)

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/KodaliPavani/Multilingual_speech_to_speech.git
cd Multilingual_speech_to_speech
```

---

### 2️⃣ Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows
.\venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

**Create your `.env` file:**

```env
GEMINI_API_KEY=your_gemini_api_key_here
ALLOW_ORIGINS=["http://localhost:5173"]
```

**Start the backend server:**

```bash
python main.py
```

> ✅ API runs at `http://localhost:8000`

---

### 3️⃣ Frontend Setup

```bash
cd frontend

# Install Node dependencies
npm install

# Start the Vite development server
npm run dev
```

> ✅ Application runs at `http://localhost:5173`

---

## 🔄 How It Works

```
User submits YouTube URL + Target Language
          ↓
[Step 1] yt-dlp downloads best-quality audio (using browser cookies)
          ↓
         ffmpeg converts → standard 192kbps MP3
          ↓
[Step 2] MP3 uploaded to Google Gemini File API
          ↓
         Gemini 2.5 Flash processes the audio:
         ┌──────────────────────────────────┐
         │  → Original Transcript           │
         │  → Translation (target language) │
         │  → Bullet-point Summary          │
         └──────────────────────────────────┘
          ↓
[Step 3] Translated text sent to gTTS → synthesized MP3 audio file
          ↓
Full result payload returned to React frontend
```

---

## 🌍 Supported Languages

| Language | Code | TTS Support |
|----------|------|-------------|
| 🇺🇸 English | `english` | ✅ |
| 🇮🇳 Telugu | `telugu` | ✅ |
| 🇮🇳 Hindi | `hindi` | ✅ |
| 🇪🇸 Spanish | `spanish` | ✅ |
| 🇫🇷 French | `french` | ✅ |

---

## 🔑 API Reference

### `POST /analyze`

Processes a YouTube video through the full AI pipeline.

**Request Body:**
```json
{
  "url": "https://www.youtube.com/watch?v=...",
  "target_language": "telugu"
}
```

**Response:**
```json
{
  "title": "Video Title",
  "duration": 3600,
  "transcript": "Original spoken text...",
  "translation": "Translated text in target language...",
  "summary": "• Key point 1\n• Key point 2\n...",
  "audio_url": "http://localhost:8000/audio/uuid.mp3"
}
```

### `GET /`
Health check — returns API status and version.

---

## ⚠️ Known Notes

> **YouTube Bot Detection:** If you see a `Sign in to confirm you're not a bot` error, make sure you are **logged into YouTube in Chrome (or Edge/Firefox)** on your machine. The `yt-dlp` service automatically uses your browser's cookies.

> **Processing Time:** Audio-heavy or long videos (30–60+ min) can take 2–5 minutes to process through Gemini. The frontend has a 10-minute timeout built in.

> **TTS Truncation:** Google TTS limits synthesis to ~1,000 characters to prevent connection aborts. Summary and translation are still returned in full text form.

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">

Built with ❤️ by **Teja** · Powered by **Google Gemini 2.5 Flash** & **React 19**

</div>
