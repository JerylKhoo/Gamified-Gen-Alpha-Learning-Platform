# AlphaLingo — Gamified Gen Alpha Learning Platform

A full-stack gamified learning platform that teaches Gen Alpha culture, internet slang, and digital communication through adaptive quizzes, community content, streak tracking, and a leaderboard system.

---

## Tech Stack

### Frontend
| Tool | Version |
|------|---------|
| React | 19.2 |
| Vite | 7.2 |
| React Router DOM | 7.13 |
| Tailwind CSS | 4.2 |
| Supabase JS | 2.97 |

### Backend
| Tool | Version |
|------|---------|
| Spring Boot | 3.4.2 |
| Java | 17 |
| Spring Security + OAuth2 | — |
| Spring Data JPA / Hibernate | — |
| PostgreSQL (Supabase) | — |
| SpringDoc OpenAPI (Swagger) | — |

---

## Features

- **Adaptive Learning** — Quiz difficulty adjusts dynamically based on user performance
- **Gamification** — Points, streak tracking, badge achievements, and a global leaderboard
- **Community** — User-generated posts and collaborative moderation
- **User Profiles** — Custom avatars, progress history, and role-based access
- **Admin Panel** — Content management for lessons, questions, quizzes, and badges via API
- **Auth** — Email/password and Google OAuth via Supabase, JWT-validated by Spring Security
- **API Docs** — Swagger UI available at `http://localhost:8080/swagger-ui/index.html`

---

## Project Structure

```
Gamified-Gen-Alpha-Learning-Platform/
├── frontend/                   # React + Vite application
│   ├── src/
│   │   ├── pages/              # Page-level components
│   │   ├── components/
│   │   │   ├── LandingPage/    # Hero, Navbar, Footer
│   │   │   └── HomePage/       # Sidebar, LearnPage, CommunityPage
│   │   ├── context/            # AuthContext (Supabase session)
│   │   └── lib/                # supabaseClient
│   └── .env                    # Frontend environment variables
│
├── backend/                    # Spring Boot application
│   └── src/main/java/com/genalpha/learningplatform/
│       ├── controller/         # REST controllers (13 endpoints)
│       ├── service/            # Business logic
│       ├── model/              # JPA entities
│       ├── repository/         # Spring Data repositories
│       ├── config/             # Security, CORS configuration
│       └── security/           # JWT auth converter
│
├── Setup.sql                   # Database schema and triggers
└── GenAlpha_Slang_QuizBank.xlsx  # Quiz content source data
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Java 17+
- Maven 3.8+

---

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173`

**Environment variables** — create `frontend/.env`:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:8080
```

---

### Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

Runs on `http://localhost:8080`

Configure `backend/src/main/resources/application.properties` with your Supabase PostgreSQL credentials and JWKS URI.

---

## API Overview

Base URL: `http://localhost:8080/api/v1`

| Resource | Endpoint | Notes |
|----------|----------|-------|
| Auth | `/auth/login`, `/auth/register` | Public |
| Users | `/users/leaderboard`, `/users/{id}` | Leaderboard is authenticated |
| Lessons | `/lessons` | GET public, write admin only |
| Questions | `/questions` | GET public, write admin only |
| Quizzes | `/quiz` | GET public, write admin only |
| Adaptive | `/adaptive/next` | Authenticated |
| Progress | `/progress` | Authenticated |
| Streaks | `/streaks/me` | Authenticated |
| Badges | `/badges`, `/user-badges/me` | Authenticated |
| Posts | `/posts` | Authenticated |
| Avatars | `/avatars` | Authenticated |
| Health | `/health` | Public |

Full interactive docs: `http://localhost:8080/swagger-ui/index.html`

---

## Pages

| Route | Page | Auth Required |
|-------|------|--------------|
| `/` | Landing Page | No |
| `/auth` | Login / Register | No (guest only) |
| `/home` | Home Dashboard | Yes |
| `/home/learn` | Course Browser | Yes |
| `/home/learn/:lessonId` | Adaptive Quiz | Yes |
| `/home/community` | Community Feed | Yes |
| `/home/leaderboard` | Leaderboard | Yes |
| `/home/dashboard` | Dashboard | Yes (coming soon) |
