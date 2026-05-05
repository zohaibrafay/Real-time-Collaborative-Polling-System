# CollabPoll: Real-Time Collaborative Polling System 📊

CollabPoll is a modern, real-time polling application designed for live events, conferences, and presentations. It allows a presenter to instantly spin up a polling room, launch dynamic polls, and collect real-time feedback from an audience without requiring any user registration.

## ✨ Key Features

- **Instant Rooms:** Generate secure, short 6-character room codes instantly.
- **No-Friction Audience Entry:** Audience members join with just the room code and a display name—no passwords or accounts required.
- **Real-Time Data Sync:** Live WebSocket integration ensures that votes appear on the presenter's dashboard instantly with smooth, animated chart updates.
- **Flexible Voting Modes:** 
  - *Single Choice:* Standard multiple-choice polling.
  - *Weighted Voting:* Audience members can distribute a specific number of points (e.g., 10 points) across multiple options based on preference.
- **Poll Chaining:** Seamlessly carry over the top N winning options from a concluded poll to dynamically generate the next poll directly from the dashboard.
- **Robust Edge-Case Handling:** Safe upsert logic prevents duplicate votes, race conditions, or late submissions after a poll has been closed.

---

## 🛠️ Tech Stack

### Frontend
- **React.js** (via Vite)
- **React Router** for seamless SPA navigation
- **Chart.js & React-Chartjs-2** for dynamic live result visualizations
- **Socket.IO Client** for real-time WebSocket communication

### Backend
- **Node.js & Express** for the RESTful API and server infrastructure
- **Socket.IO** for scoped, room-based real-time event broadcasting
- **MongoDB & Mongoose** for persistent, relational data modeling

---

## 🏗️ Project Architecture

The project has been refactored into a scalable, modular MVC architecture on the backend:

```text
collabpoll/
├── client/                     # React Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components (LiveResults, PollCreator, etc.)
│   │   ├── hooks/              # Custom hooks (useSocket)
│   │   ├── pages/              # Main view components (Home, PresenterDashboard, AudienceView)
│   │   └── index.css           # Global modern styling
│   └── jsconfig.json           # JSX Configuration
├── server/                     # Express Backend
│   ├── config/                 # Database connection logic
│   ├── models/                 # Mongoose schemas (Room, Poll, Vote)
│   ├── routes/                 # REST API endpoints
│   ├── services/               # Socket.IO handlers and business logic
│   └── server.js               # Application entry point
├── package.json                # Root package manager (Concurrently)
└── DECISIONS.md                # Documentation of technical choices and tradeoffs
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/en/download/) (v16+ recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) (Running locally, or an Atlas Cloud URI)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/zohaibrafay/Real-time-Collaborative-Polling-System.git
   cd Real-time-Collaborative-Polling-System
   ```

2. **Install dependencies:**
   This project uses `concurrently` to run both the frontend and backend from the root directory.
   ```bash
   # Install root dependencies
   npm install

   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   cd ..
   ```

3. **Configure Environment Variables:**
   Navigate to the `/server` directory and create a `.env` file (if you are using MongoDB Atlas).
   ```env
   PORT=3001
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/collabpoll
   ```
   *Note: If no `.env` is provided, the server defaults to your local MongoDB instance at `mongodb://127.0.0.1:27017/collabpoll`.*

### Running the Application

From the **root directory** of the project, run:

```bash
npm start
```
This command spins up:
- The **Node.js/Express Backend** on `http://localhost:3001`
- The **Vite/React Frontend** on `http://localhost:5174` (or `5173`)

Simply navigate to the frontend URL in your browser to start creating rooms!

---

## 🌐 API & Socket Events Reference

### REST API (Backend: `:3001`)
- `POST /api/rooms` - Generates and returns a new room instance.
- `GET /api/rooms/:code` - Validates and fetches room details by 6-character code.
- `GET /api/rooms/:roomId/polls/active` - Returns the currently active poll for a specific room.

### WebSockets
All socket events are strictly scoped to specific `roomCode` rooms using Socket.IO's `.join()` method to ensure data isolation.
- `join_room` - Connects a client socket to a specific room channel.
- `launch_poll` - Presenter emits this to broadcast a new poll to the room.
- `submit_vote` - Audience emits this. Backend validates points and upserts to MongoDB.
- `close_poll` - Presenter emits this to lock the poll and send final results.
- `poll_results` - Server emits this to update the Presenter's Chart.js dashboard.

---

## 📝 Design Decisions & Tradeoffs
For a deeper dive into why the database was structured this way, how race-conditions were avoided during voting, and what future improvements could be made (such as robust anonymous JWT auth), please refer to the [`DECISIONS.md`](./DECISIONS.md) file included in the root directory.
