# 🎵 Alpha Music Player

Alpha Music is a full-stack, feature-rich web-based music streaming platform designed to give users a premium, Spotify-like experience. The application allows users to discover trending music, listen to full tracks seamlessly via a custom-built background YouTube audio engine, create custom playlists, and manage their favorite "liked" songs, all while persisting their personal preferences via a secure MongoDB backend.

## ✨ Key Features
- **Modern Music Player UI**: A sleek, dark-themed responsive interface inspired by industry-leading platforms like Spotify and YouTube Music.
- **Full-Track Streaming**: Instead of relying on 30-second API previews, the app dynamically queries YouTube via the backend and plays full-length audio tracks invisibly using the YouTube IFrame API.
- **Global Audio State Management**: Audio playback is continuous and unaffected by page navigation. Users can browse the library, search for songs, or view playlists while the music continues to play uninterrupted.
- **Custom Playlists**: Users can dynamically create custom playlists and add specific songs to them.
- **Liked Songs System**: A one-click "Heart" feature allows users to instantly save tracks to their personal Liked Songs library.
- **User Authentication**: A secure, fully-featured user registration and login system that ensures users' playlists and liked songs are saved to the cloud and restored across sessions.

---

## 🛠️ Technology Stack
### Frontend (Client)
- **React.js**: Core library for building the dynamic user interface.
- **Zustand**: A lightweight, fast, and scalable state-management solution used to manage the global audio player state, active tracks, and user session data.
- **React Router**: For seamless, Single Page Application (SPA) navigation without page reloads.
- **Lucide-React**: For beautiful, scalable vector icons.
- **YouTube IFrame API**: Interfaced invisibly to stream full-length audio tracks.

### Backend (Server)
- **Node.js & Express.js**: Handles API routing, database interactions, and business logic.
- **MongoDB & Mongoose**: NoSQL database used to store User accounts, Liked Songs, and Playlists.
- **Node Crypto**: Native Node.js cryptographic module used for securely hashing passwords and generating session tokens.

---

## 📂 Project Structure
```text
Alpha Music/
├── client/                 # Frontend React Application
│   ├── src/
│   │   ├── api.js          # Handles fetching trending songs from iTunes API
│   │   ├── store.js        # Global Zustand state (user auth, player logic, playlists)
│   │   ├── App.jsx         # Main router and real-time backend sync logic
│   │   ├── components/     # Reusable UI components (Player, Sidebar, Layout, etc.)
│   │   └── pages/          # Full-page views (Home, LikedSongs, Library, Login)
│
└── server/                 # Backend Node.js Application
    ├── server.js           # Main Express server entry point
    ├── db.js               # MongoDB connection logic
    ├── routes.js           # API Endpoints (Auth, YouTube search, Song APIs)
    └── models/             # Mongoose schemas (User, Song)
```

---

## 💡 Interview Questions & Answers

If you are showcasing this project in an interview, here are common technical questions an interviewer might ask and how to answer them:

### 1. How are you playing full-length songs without violating copyright or paying for expensive audio hosting?
**Answer:** I engineered a hybrid approach. The application fetches trending metadata (song names, artists, cover art) from public APIs. However, when a user clicks "Play", the frontend sends the song title and artist to my Node.js backend. The backend invisibly scrapes YouTube's search results to find the exact official audio Video ID. That Video ID is sent back to the React frontend, which feeds it into a hidden, `0x0` pixel YouTube IFrame API player. This allows the app to stream full, high-quality audio directly from YouTube's servers legally and for free, while I wrap it in my own custom UI with play/pause and progress bar controls.

### 2. Why did you choose Zustand over Redux for state management?
**Answer:** For a music player, the global state needs to be updated constantly (e.g., tracking the current second of the song for the progress bar). Redux requires a lot of boilerplate (actions, reducers, dispatchers) and wraps the app in complex Context providers, which can cause unnecessary re-renders. Zustand provides a much simpler, hook-based approach. It allowed me to create a `useMusicStore` hook that can be accessed directly inside any component (like the Player or Sidebar) without wrapping the entire application, resulting in cleaner code and better performance.

### 3. How does the authentication system work? Did you use a library like Passport.js?
**Answer:** I opted to build a custom authentication flow using Node's native `crypto` module. When a user registers, the backend generates a random `salt` and hashes the user's password using the `scryptSync` algorithm. The hashed password and salt are saved in MongoDB. I also generate a secure, random hexadecimal token which is sent to the client. The React frontend saves this token in `localStorage` and includes it in future requests to automatically authenticate the user and retrieve their specific playlists and liked songs. I chose this approach to demonstrate a fundamental understanding of cryptography and session management without relying heavily on abstract third-party packages.

### 4. How does the app keep the frontend and backend in sync when a user likes a song or creates a playlist?
**Answer:** I utilized a React `useEffect` hook at the highest level of my application (`App.jsx`). The hook listens for any state changes to the `likedSongs` or `playlists` arrays within the global Zustand store. Whenever a change is detected (and a user is logged in), it silently sends a POST request to the `/api/auth/sync` endpoint with the updated arrays. This ensures that the local state is always mirrored to the MongoDB database in real-time, providing a seamless user experience.

### 5. What was the biggest challenge you faced while building this project and how did you overcome it?
**Answer:** The biggest challenge was dealing with browser autoplay policies and the YouTube IFrame API's deprecation of the `listType: 'search'` feature. Initially, the player was supposed to automatically search and play a song via the IFrame. When that failed due to API changes, I had to pivot. I built a custom backend endpoint (`/api/yt-search`) that executes a server-side HTTP request to YouTube, parses the raw HTML using Regular Expressions to extract the exact `videoId`, and returns it to the client. I then used `loadVideoById()` in the frontend player, completely bypassing the deprecated feature and resulting in a much faster, more reliable playback experience.
