# ResumeX AI — AI Resume Analyzer & Skill Recommendation System

A premium full-stack AI SaaS platform that analyzes resumes using Google Gemini AI and provides detailed skill analysis, ATS scoring, career roadmaps, and an interactive AI chatbot for personalized career guidance.

## ✨ Features

### Core Analysis
- **AI Resume Analysis** — Deep semantic analysis of resume content using Gemini AI
- **ATS Score Analysis** — Precise ATS compatibility scoring to pass automated screening
- **Skill Extraction** — Identifies skills present in the resume
- **Missing Skill Detection** — Finds skills gaps based on target role requirements
- **Strength & Weakness Analysis** — Honest assessment of resume strengths and improvement areas
- **Career Recommendations** — Actionable improvement suggestions, technology recommendations, and courses
- **Personalized Career Roadmap** — Week-by-week plan to bridge skill gaps
- **Project Recommendations** — Suggested portfolio projects to strengthen the resume

### AI Resume Chatbot 🤖
- **Context-Aware Conversations** — Ask questions about your specific resume and analysis
- **Interview Preparation** — Generate interview questions based on your actual skills and projects
- **Career Guidance** — Get personalized advice on skills, courses, and career paths
- **Resume Improvement** — Receive specific suggestions to improve weak sections
- **Conversation Memory** — Maintains context within a session for natural follow-up questions

### Visual Experience
- **3D Career DNA Skill Galaxy** — Interactive Three.js visualization of skills constellation
- **AI Career Roadmap Timeline** — Animated step-by-step career progression
- **Premium Dark UI** — Glassmorphism design with neon accents and smooth animations
- **Analysis History** — View and manage past resume evaluations

## 🏗 Architecture

```
Frontend (React + Vite + Tailwind + Three.js)
       ↓ REST API
Backend (Node.js + Express)
       ↓
Gemini AI (Analysis + Chatbot)
       ↓
MongoDB (Report Storage)
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (local installation or MongoDB Atlas)
- Google Gemini API Key ([Get one here](https://aistudio.google.com/apikey))

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/resume_analyzer
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

Start the backend:

```bash
npm run dev
```

The API will be available at `http://localhost:5000`.

### Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory (optional for local dev):

```env
VITE_API_BASE_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/resume/analyze` | Upload and analyze a resume |
| `GET` | `/api/reports` | Get all analysis reports |
| `GET` | `/api/reports/:id` | Get a specific report |
| `DELETE` | `/api/reports/:id` | Delete a report |
| `POST` | `/api/chat/:reportId` | Send a message to the AI chatbot |
| `GET` | `/api/health` | Health check |

## 🔐 Environment Variables

### Backend

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: 5000) | No |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `GEMINI_MODEL` | Gemini model name (default: gemini-2.5-flash) | No |
| `FRONTEND_URL` | Frontend URL for CORS (default: http://localhost:5173) | No |
| `NODE_ENV` | Environment (development/production) | No |

### Frontend

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_BASE_URL` | Backend API URL (default: http://localhost:5000) | No |

## 🌐 Deployment

### Frontend (Vercel / Netlify)

1. Connect your Git repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variable: `VITE_API_BASE_URL=https://your-backend-url.com`

### Backend (Render / Railway)

1. Connect your Git repository
2. Set root directory to `backend`
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add all required environment variables (see table above)
6. Set `FRONTEND_URL` to your deployed frontend URL

## 🛠 Tech Stack

**Frontend:** React 19, Vite, Tailwind CSS 4, Three.js (R3F), Framer Motion, Axios, Lucide Icons

**Backend:** Node.js, Express 5, Mongoose, Multer, pdf-parse

**AI:** Google Gemini AI (Generative AI SDK)

**Database:** MongoDB

## 📄 License

ISC
