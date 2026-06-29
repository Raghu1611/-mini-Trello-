# mini-Trello

A lightweight, self-hostable multi-user task collaboration board system. Built using the **MERN** stack, featuring JWT authentication, drag-and-drop card interaction, and real-time synchronization via WebSockets.

---

## Live Demo & Loom Walkthrough

- **Live URL (Front-end):** [https://azentrix-fullstack-task2-ui.vercel.app](https://azentrix-fullstack-task2-ui.vercel.app) *(Deploy link placeholder)*
- **Live URL (Back-end):** [https://azentrix-fullstack-task2-api.onrender.com](https://azentrix-fullstack-task2-api.onrender.com) *(Deploy link placeholder)*
- **Loom Demo Video:** [Loom Video Link](https://loom.com/canvas)

---

## Role-Based Card & User Management

To support robust teamwork, the application enforces the following permission levels both on the Express REST controllers and visually in the React frontend:

- **Admin:**
  - Full control over users (list directory, modify roles between Admin/Member, delete user accounts).
  - Full control over board cards (can edit, delete, or drag-and-drop **any** task).
- **Member:**
  - Can view all boards and collaborative columns.
  - Can **only manage (edit, delete, drag) cards that they created or are assigned to**.
  - Visual lock indicators (Lock) are shown on cards owned by other teammates, disabling drag handles and hiding edit buttons.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Axios, React Router v6 |
| **Draggables** | `@hello-pangea/dnd` (React 18 friendly fork of `react-beautiful-dnd`) |
| **Backend** | Node.js, Express, Socket.io |
| **Database** | MongoDB Atlas via Mongoose ODM |
| **Authentication**| JWT (JSON Web Tokens) & `bcryptjs` hashing |

---

## Seeded Test Accounts

To test the application immediately, the database contains seeded users:

1. **Admin User**
   - **Email:** `admin@minitrello.com`
   - **Password:** `admin123`
2. **Member User**
   - **Email:** `member@minitrello.com`
   - **Password:** `member123`
3. **John Doe (Member)**
   - **Email:** `john@minitrello.com`
   - **Password:** `member123`

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- NPM

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/Raghu1611/azentrix-fullstack-task2.git
cd azentrix-fullstack-task2

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Database Seeding & Startup

1. Environment variables are pre-configured in `server/.env`.
2. Seed the MongoDB database with default boards, users, and tasks:
   ```bash
   cd server
   node src/db/seed.js
   ```
3. Run both servers (in separate terminals or side-by-side):

   **Backend (Port 5000):**
   ```bash
   cd server
   npm run dev
   ```

   **Frontend (Port 5173):**
   ```bash
   cd client
   npm run dev
   ```

Open `http://localhost:5173` in your browser.

---

## Approach & Core Architecture

### Real-time Collaborative Synchronization
- When a user navigates to `/boards/:boardId`, the client connects to Socket.io and issues a `join_board` request for room `board:<boardId>`.
- Any task creation, modification, or move (drag-and-drop) triggers an Express controller action. On success, the backend emits the event (e.g., `card_moved`) to the board's room.
- Other active users on the same board receive the message and perform a smooth local state update instantly.

### Optimistic Drag & Drop Updates
- When a card is dragged, the React UI performs an optimistic state transition, sliding elements immediately for a lag-free experience.
- The drag triggers a request to `/api/cards/:id/move`.
- If the server rejects the request (e.g. 403 Forbidden due to lack of ownership), the UI alerts the user and seamlessly reverts the card to its original position.

---

## Deployment Instructions

Since this is a full-stack application, it needs to be deployed in two parts: the backend (Node.js) and the frontend (Vite React). Configuration files for both have been generated for your convenience.

### 1. Deploying the Backend on Render
1. Create a free account on [Render](https://render.com/).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository containing this codebase.
4. Render will automatically detect the \ender.yaml\ file in the root directory and configure the service (build command, start command, etc.).
5. **Environment Variables**: In the Render dashboard, go to the Environment section and add the \MONGODB_URI\ (from MongoDB Atlas) and \CLIENT_URL\ (your frontend URL, once deployed).

### 2. Deploying the Frontend on Vercel
1. Create a free account on [Vercel](https://vercel.com/).
2. Click **Add New Project** and import your GitHub repository.
3. Set the **Root Directory** to \client\.
4. Vercel will automatically detect Vite.
5. Expand the **Environment Variables** section and add \VITE_API_URL\ pointing to your live Render backend URL.
6. Click **Deploy**. (The included \ercel.json\ will handle React Router redirects).

Once deployed, copy your live URLs and update the placeholders at the top of this README!

