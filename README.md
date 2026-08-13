# 📜 Bible Game Arcade

A fast, responsive, real-time multiplayer Bible Game Arcade platform built with **React**, **TypeScript**, **Tailwind CSS v4**, and **Vite**.

Designed specifically for youth events, Bible competitions, church conferences, and live gatherings.

---

## 🚀 Key Features & Architecture

- **🎮 5 Complete Bible Games**:
  1. **Letter Rush**: Name Bible characters, places, or books starting with a specific letter.
  2. **Quote Master**: Identify who said specific scripture quotes or complete famous verses.
  3. **Bible Who Am I?**: Guess the Bible character from progressive clues.
  4. **Fastest Bible Reader**: Speed-locate and type verses or chapter numbers.
  5. **Match the Pair**: Match biblical couples, kings/prophets, or places with events.

- **📡 Multi-Device Real-Time Sync Engine (Netlify Compatible)**:
  - 3-Layer Hybrid Architecture: Cloud WebSocket Relay + BroadcastChannel + LocalStorage.
  - Allows mobile phones in the audience, the administrator's laptop, and the big-screen projector display to stay 100% in sync without needing a custom Node.js server setup on Netlify (< 50ms latency).

- **⏱️ Millisecond-Precision Official Timestamp Queue**:
  - Automatically records exact submission timestamps (`HH:mm:ss.SSS`).
  - Allows administrators to manually edit official timestamps to resolve tie-breakers or line-of-sight judge calls.

- **🔒 Separate Dedicated Access URLs & Strict Admin Security**:
  - **Player Arena (`/play` or `/`)**: Pure contestant interface isolated from admin controls.
  - **Admin Control Desk (`/admin`)**: Dedicated administrator URL protected by strict password authentication.
  - **Projector Big-Screen Display (`/projector` or `/display`)**: Clean full-screen display for event screens with smooth scrolling support.

---

## 🔗 Dedicated Access URLs

| Role | Access URL | Description |
| :--- | :--- | :--- |
| **Contestant Arena** | `https://your-app.netlify.app/play` or `/` | Contestant interface for joining live sessions with code & submitting answers |
| **Admin Control Desk** | `https://your-app.netlify.app/admin` | Strictly protected control desk for managing sessions, starting rounds, & scoring |
| **Projector Display** | `https://your-app.netlify.app/projector` | Big-screen presentation view for stage projectors & TV displays |

---

## 🔐 Strict Admin Authentication

- **Default Admin Password**: `BIBLE2026!` (also supports PIN `7777`).
- **Lock Desk Button**: Admins can lock out access instantly (`🔒 LOCK DESK`) when stepping away from the control console.
- **Custom Password Management**: Admins can change their password directly inside the Admin Control Desk.

---

## 🛠️ Local Development & Running

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

3. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 🌐 Netlify Deployment

1. Connect your repository to **Netlify**.
2. Set Build Command: `npm run build`
3. Set Publish Directory: `dist`
4. SPA Redirects are pre-configured in `public/_redirects`:
   ```
   /*  /index.html  200
   ```
   This ensures `/admin`, `/play`, and `/projector` route directly to the SPA without 404 errors.
