# 🤖 EmotiScan-AI: Real-Time Emotion Detection

An interactive web application that uses **Artificial Intelligence** to analyze facial expressions and provide personalized mental wellness recommendations.

## 🚀 Live Demo
Check out the project here: [https://no94163-afk.github.io/my-project/](https://no94163-afk.github.io/my-project/)

## ✨ Key Features
- **Privacy-First (Local AI):** Uses `face-api.js` to process images directly in the browser. No data is sent to a server.
- **Smart Recommendations:** Provides mood-based activities (e.g., box breathing for anger, journaling for surprise).
- **Persistent History:** Integrated with **Web Storage API (LocalStorage)** to save detection history across browser sessions.
- **Responsive UI:** Fully optimized for both mobile and desktop screens.

## 🛠️ Technical Stack
- **Frontend:** HTML5, CSS3 (Modern UI with Glassmorphism), JavaScript (ES6+).
- **Deep Learning Library:** `face-api.js` (utilizing TinyFaceDetector).
- **Data Persistence:** LocalStorage for user history.

## 📂 Project Structure
- `index.html`: Main structure and UI components.
- `style.css`: Custom styling and animations.
- `script.js`: AI logic, image processing, and history management.
