---

# 🎙️ Real-Time Voice Agent

An **advanced voice agent** built with **Next.js** that enables **real-time, low-latency conversational AI**.
Users can **speak directly to the AI** and receive **spoken responses instantly**, creating a **natural and fluid two-way voice interaction**.

---

## 🚀 Features

* 🗣️ **Full-Duplex Voice Chat** – Speak and listen in real time.
* ⚡ **Ultra-Low Latency** – Powered by Web Audio & WebSocket streaming.
* 🧠 **Conversational AI** – Understands context and responds naturally.
* 🎧 **Natural TTS (Text-to-Speech)** – Generates high-quality, lifelike voice output.
* 🌐 **Browser-Based** – 100% frontend; no backend server required.
* 💡 **Lightweight & Fast** – Optimized for smooth real-time performance.

---

## 🧩 Tech Stack

| Layer                  | Technology                                        |
| ---------------------- | ------------------------------------------------- |
| **Framework**          | Next.js (App Router)                              |
| **Styling**            | Tailwind CSS                                      |
| **Audio Processing**   | Web Audio API                                     |
| **Streaming**          | WebSocket / WebRTC                                |
| **AI Model**           | Gemini / GPT / Bark / Piper (via API)             |
| **Speech Recognition** | Browser SpeechRecognition API / Whisper API       |
| **Speech Synthesis**   | Web SpeechSynthesis API / External TTS (optional) |

---

## ⚙️ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/voice-agent.git
cd voice-agent
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_TTS_PROVIDER=piper
NEXT_PUBLIC_MODEL=gemini-2.5-flash
```

*(You can skip these if you’re using default demo settings.)*

### 4. Run the Development Server

```bash
npm run dev
```

Now open [http://localhost:3000](http://localhost:3000) in your browser 🎧

---

## 🎧 How It Works

1. **User Speaks** → The browser captures your microphone input.
2. **Speech Recognition (STT)** → Converts speech into text in real time.
3. **AI Model** → Sends the recognized text to the conversational model (e.g., Gemini).
4. **Response Generation** → Model returns the AI’s reply text.
5. **Speech Synthesis (TTS)** → The reply text is converted into natural audio.
6. **Audio Playback** → The spoken response is streamed back instantly.

---

## 🧠 Architecture Overview

```plaintext
Microphone 🎙️
   ↓
Speech-to-Text (Browser or API)
   ↓
LLM (Gemini / GPT)
   ↓
Text-to-Speech (Browser / Piper)
   ↓
Audio Playback 🔊
```

All of this happens **directly in the browser**, ensuring low latency and simplicity — no backend server is needed.

---

## 🧩 Customization

You can easily customize the behavior:

* **Switch AI Model** – Update `NEXT_PUBLIC_MODEL` in `.env.local`
* **Change Voice Type** – Modify speech synthesis settings in `/utils/tts.ts`
* **Adjust Latency** – Tune audio buffer size for smoother streaming
* **Add UI Controls** – Add mute, pause, or replay buttons using React state

---

## 🧰 Requirements

* Node.js 18+
* Modern browser with mic access
* Internet connection (for AI API requests)

---

## 🧠 Example Commands

Try asking:

* “Hey, what can you do?”
* “Tell me a fun fact about space.”
* “Explain deep learning in simple words.”
* “How’s the weather today?”

---

## 🛠️ Roadmap

* 🎭 Emotion-based voice tone
* 🌍 Multilingual support
* 🎵 Background noise handling
* 🤖 Offline voice synthesis (Edge AI)
* 🪄 Custom voice cloning

---

## 🤝 Contributing

Pull requests and feature ideas are welcome!

1. Fork the repo
2. Create a new branch (`feature/your-feature`)
3. Submit a PR 🎉

---

## 📜 License

Licensed under the **MIT License** — free to use, modify, and distribute.

---

## 👨‍💻 Author

**Saurabh Singh**
💼 Junior Data Scientist | AI & LLM Developer
🔗 [LinkedIn](https://www.linkedin.com/in/) | [GitHub](https://github.com/)

---
