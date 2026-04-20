# 🌿 Vintage Veda — Ayurvedic Wellness Platform

A full-stack web application for discovering and sharing traditional Ayurvedic remedies, validated by community wisdom.

![Vintage Veda](client/public/logo.jpeg)

## ✨ Features

- **🔍 Smart Search** — Search remedies by disease or ingredient with category filtering
- **🌶️ Spices Encyclopedia** — Explore 15+ Ayurvedic spices with benefits, cautions, and dosha balance
- **🧘 Dosha Quiz** — Discover your Ayurvedic constitution (Vata, Pitta, Kapha)
- **⭐ Remedy of the Day** — Daily featured Ayurvedic remedy
- **📊 Community Upvotes** — Rate and validate remedies
- **⚠️ Allergen Warnings** — Safety-first approach with allergen flags
- **🔐 Authentication** — Secure JWT-based login and registration
- **🤖 VedaBot** — AI-powered Ayurvedic assistant (Gemini API)
- **📱 Responsive Design** — Beautiful UI on desktop, tablet, and mobile

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite |
| **Styling** | Custom CSS Design System (Outfit + Inter fonts) |
| **Backend** | FastAPI (Python) |
| **Database** | MongoDB Atlas (via Beanie ODM) |
| **Auth** | JWT (JSON Web Tokens) |
| **AI** | Google Gemini API |
| **Deployment** | Render (backend) + Vercel (frontend) |

## 📁 Project Structure

```
Vintage Veda Project/
├── client/                 # React Frontend
│   ├── public/             # Static assets (logo, images)
│   ├── src/
│   │   ├── App.jsx         # Main app with routing & landing page
│   │   ├── api.js          # Centralized API service layer
│   │   ├── index.css       # Complete design system
│   │   └── pages/
│   │       ├── AuthPage.jsx
│   │       ├── SearchPage.jsx
│   │       ├── SpicesPage.jsx
│   │       └── DoshaQuizPage.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/                 # FastAPI Backend
│   ├── app/
│   │   ├── main.py         # FastAPI entry point
│   │   ├── config.py       # Environment configuration
│   │   ├── database.py     # MongoDB/Beanie setup
│   │   ├── models/         # Beanie document models
│   │   ├── routers/        # API route handlers
│   │   ├── schemas/        # Pydantic request/response schemas
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Auth middleware
│   │   └── seeds/          # Database seed scripts
│   ├── .env.example        # Environment template
│   ├── requirements.txt
│   └── render.yaml         # Render deployment config
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB Atlas account

### Backend Setup

```bash
cd server
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
cp .env.example .env         # Fill in your credentials
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

The frontend runs at `http://localhost:5173` and the backend at `http://localhost:8000`.

### Environment Variables

Copy `server/.env.example` to `server/.env` and fill in:

```env
MONGODB_URL=mongodb+srv://...
JWT_SECRET=your-secret-key
GEMINI_API_KEY=your-gemini-key
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/remedies/featured` | Get featured remedies |
| GET | `/api/remedies/remedy-of-day` | Get remedy of the day |
| GET | `/api/remedies/search` | Search remedies by disease/ingredient |
| GET | `/api/spices/` | List all spices |
| GET | `/api/content/seasonal` | Seasonal wellness tips |
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login & get JWT token |
| POST | `/api/chatbot/chat` | Chat with VedaBot AI |

## 🎨 Design System

The app uses a custom design system with:
- **Colors**: Earthy greens, warm browns, cream backgrounds
- **Typography**: Outfit (headings) + Inter (body)
- **Components**: Cards, pills, badges, overlays, grids
- **Animations**: fadeUp, scaleIn, pulse-ring micro-animations

## 👤 Authors

A personal project built with passion for Ayurvedic wellness.

- **Vaidik Prajapati** — [GitHub](https://github.com/VaidikPrajapati)
- **Aditya Vyas** — [GitHub](https://github.com/AdityaVyas-15)

## 📄 License

MIT License
