# DocMind RAG — Frontend

React frontend for multi-user RAG document Q&A. Each user's documents are completely private.

## Tech Stack

- **React 18** — UI framework
- **React Router v6** — Client-side routing
- **Axios** — API calls
- **React Dropzone** — File upload
- **React Markdown** — Render AI answers as markdown
- **React Hot Toast** — Notifications

## Project Structure
```
frontend/
├── public/
│   └── index.html
└── src/
    ├── App.jsx                # Root app, routing, layout
    ├── index.js               # Entry point
    ├── index.css              # Global styles + design system
    ├── context/
    │   └── AuthContext.js     # JWT auth state (login/logout)
    ├── services/
    │   └── api.js             # All API calls (axios)
    └── pages/
        ├── Login.jsx          # Sign in page
        ├── Signup.jsx         # Create account page
        ├── Documents.jsx      # Upload, list, delete documents
        └── Chat.jsx           # RAG chat interface
```

## Local Setup

### 1. Navigate to frontend
```bash
cd frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment
```bash
copy .env.example .env      # Windows
cp .env.example .env        # Mac/Linux
```

Fill in your `.env`:
```env
REACT_APP_API_URL=http://localhost:8000
```

> For production point this to your Render backend URL:
> `REACT_APP_API_URL=https://your-app.onrender.com`

### 4. Start dev server
```bash
npm start
```

App runs at `http://localhost:3000`

---

## Pages

| Route | Page | Auth |
|-------|------|------|
| `/login` | Sign in | ❌ Public |
| `/signup` | Create account | ❌ Public |
| `/` | Chat (RAG Q&A) | ✅ Protected |
| `/documents` | Upload & manage docs | ✅ Protected |

---

## Features

- **Sign up / Sign in** with JWT stored in localStorage
- **Drag & drop upload** — PDF, DOCX, TXT, MD up to 20 MB
- **Upload progress bar** — shows % while indexing
- **Document list** — shows filename, size, chunk count, status badge
- **Delete documents** — removes from Pinecone + database instantly
- **Chat interface** — ask questions, get markdown-rendered answers
- **Sources panel** — shows which document chunks were used with relevance scores
- **Suggestion prompts** — quick-start questions on empty chat
- **Fully private** — answers only come from the logged-in user's documents

---

## Deploy to Vercel (Free)

1. Push this folder to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import repo
3. Set root directory to `frontend/`
4. Add environment variable:
```
   REACT_APP_API_URL=https://your-render-backend.onrender.com
```
5. Click Deploy

## Deploy to Netlify (Alternative)
```bash
npm run build
```
Then drag the `build/` folder to [netlify.com/drop](https://netlify.com/drop).

Or via Netlify CLI:
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=build
```

> Add `REACT_APP_API_URL` in Netlify → Site Settings → Environment Variables before building.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `REACT_APP_API_URL` | ✅ | Backend API base URL |
