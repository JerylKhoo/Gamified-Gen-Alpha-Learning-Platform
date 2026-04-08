<div align="center">

<img src="assets/Icon.jng" alt="AlphaLingo" width="80" />
<h1 align="center"><b>AlphaLingo</b></h1>

**A gamified learning platform — master Gen Alpha culture, earn badges, and climb the leaderboard.**

[![Java](https://img.shields.io/badge/Java-Spring%20Boot%203.4-ED8B00?style=for-the-badge&logo=spring&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Python](https://img.shields.io/badge/Python-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)

</div>

---

## 📖 Overview

**AlphaLingo** is a full-stack gamified learning platform that teaches Gen Alpha culture, internet slang, and digital communication through **adaptive quizzes**, **community engagement**, **streak tracking**, and a **competitive leaderboard**.

The platform is built on a **microservices architecture** with an **AI-powered grading agent**, enabling automated answer evaluation, role-based access control, and real-time gamification mechanics.

### Key Features

- 🧠 **Adaptive Learning** — Quiz difficulty adjusts dynamically based on user performance
- 🏆 **Gamification** — Points, streaks, badge achievements, and a global leaderboard
- 💬 **Community** — User-generated posts and collaborative moderation
- 🤖 **AI Grading Agent** — Groq & Google GenAI integration for automated answer evaluation
- 👤 **User Profiles** — Custom avatars, progress history, and role-based access
- 🔐 **Auth & Access Control** — Email/password and Google OAuth via Supabase, JWT-validated by Spring Security
- 🛡️ **Role Promotion** — Automatic Collaborator role promotion at 80k points
- 📊 **Admin Panel** — Full content management for lessons, quizzes, questions, and badges
- 📄 **Interactive API Docs** — Swagger UI at `/swagger-ui/index.html`

---

## Domains

| Domain | Purpose |
|---|---|
| https://frontend.delightfulwater-5f80a575.southeastasia.azurecontainerapps.io/ | AlphaLingo Frontend UI |
| https://springboot.delightfulwater-5f80a575.southeastasia.azurecontainerapps.io/swagger-ui/index.html | Springboot API Documentation |
| https://springboot.delightfulwater-5f80a575.southeastasia.azurecontainerapps.io/ | Spring Boot API |
| https://grading-agent.delightfulwater-5f80a575.southeastasia.azurecontainerapps.io/docs | Grading Agent API Documentation |
| https://grading-agent.delightfulwater-5f80a575.southeastasia.azurecontainerapps.io/ | Grading Agent API |

---

## 🏗️ Architecture

![System Architecture](assets/CSD%20System%20Architecture.png)

---

## 🛠️ Tech Stack

### Frontend
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![React Router](https://img.shields.io/badge/React%20Router-7.13-CA4245?style=flat-square&logo=reactrouter&logoColor=white)](https://reactrouter.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.2-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Supabase JS](https://img.shields.io/badge/Supabase%20JS-2.97-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![GSAP](https://img.shields.io/badge/GSAP-3.14-88CE02?style=flat-square&logo=greensock&logoColor=black)](https://gsap.com)
[![BlockNote](https://img.shields.io/badge/BlockNote-0.47-blue?style=flat-square)](https://www.blocknotejs.org)

### Backend
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.2-6DB33F?style=flat-square&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-17-ED8B00?style=flat-square&logo=openjdk&logoColor=white)](https://openjdk.org)
[![Spring Security](https://img.shields.io/badge/Spring%20Security-OAuth2%20%2B%20JWT-6DB33F?style=flat-square&logo=springsecurity&logoColor=white)](https://spring.io/projects/spring-security)
[![Spring Data JPA](https://img.shields.io/badge/Spring%20Data%20JPA-Hibernate-59666C?style=flat-square)](https://spring.io/projects/spring-data-jpa)
[![SpringDoc OpenAPI](https://img.shields.io/badge/SpringDoc-Swagger%20UI-85EA2D?style=flat-square&logo=swagger&logoColor=black)](https://springdoc.org)
[![Lombok](https://img.shields.io/badge/Lombok-1.18-pink?style=flat-square)](https://projectlombok.org)

### Grading Agent (Microservice)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.135-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![Groq](https://img.shields.io/badge/Groq-LLM%20Grading-F55036?style=flat-square)](https://groq.com)
[![Google GenAI](https://img.shields.io/badge/Google%20GenAI-AI%20Grading-4285F4?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev)
[![Redis](https://img.shields.io/badge/Redis-Caching-FF4438?style=flat-square&logo=redis&logoColor=white)](https://redis.io)
[![Pydantic](https://img.shields.io/badge/Pydantic-2.12-E92063?style=flat-square&logo=pydantic&logoColor=white)](https://docs.pydantic.dev)

### Database & Infrastructure
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%2B%20Auth%20%2B%20Storage-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com)
[![Maven](https://img.shields.io/badge/Maven-3.8+-C71A36?style=flat-square&logo=apachemaven&logoColor=white)](https://maven.apache.org)

---

## 🚀 Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) *(recommended — runs everything)*
- [Node.js 18+](https://nodejs.org/) & npm
- Java 17+ & Maven 3.8+ *(if running backend without Docker)*

### Environment Variables

**Backend** — create the following files inside `backend/`:

<details>
<summary><code>backend/.env</code></summary>

```env
# PostgreSQL (Supabase)
DB_URL=jdbc:postgresql://<your-supabase-host>:5432/postgres
DB_USERNAME=postgres
DB_PASSWORD=your_db_password

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
SUPABASE_JWKS_URI=https://your-project.supabase.co/auth/v1/.well-known/jwks.json

# AI Grading Agent
GROQ_API_KEY=your_groq_api_key
GOOGLE_API_KEY=your_google_api_key

# Redis (Caching)
REDIS_HOST=your_redis_host
REDIS_PORT=16449
REDIS_PASSWORD=your_redis_password
```
</details>

**Frontend** — create `frontend/.env`:

<details>
<summary><code>frontend/.env</code></summary>

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:8080
```
</details>

---

### Running with Docker *(recommended)*

> Make sure **Docker Desktop** is running before proceeding.

```bash
# Start all backend services (Spring Boot + Grading Agent)
cd backend
docker-compose up -d --build
```

Then start the frontend:

```bash
cd frontend
npm install
npm run dev
```

| Service | URL |
|---|---|
| Frontend | `http://localhost:5173` |
| Spring Boot API | `http://localhost:8080` |
| Swagger UI | `http://localhost:8080/swagger-ui/index.html` |
| Grading Agent | `http://localhost:8000` |

---

### Running Manually

**Backend:**

```bash
cd backend
./run.sh          # macOS/Linux
run.bat           # Windows
```

Or with Maven directly:

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

**Grading Agent:**

```bash
cd backend/grading_agent
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

---

## 📁 Project Structure

```
Gamified-Gen-Alpha-Learning-Platform/
├── frontend/                          # React + Vite SPA
│   ├── src/
│   │   ├── pages/                        # Page-level components
│   │   │   ├── LandingPage.jsx           # Public homepage
│   │   │   ├── AuthPage.jsx              # Login / Register
│   │   │   ├── HomePage.jsx              # Dashboard
│   │   │   ├── CoursePage.jsx            # Course browser
│   │   │   ├── AdaptiveLearningPage.jsx  # Quiz interface
│   │   │   ├── GradingAgentPage.jsx      # AI grading interface
│   │   │   └── AdminDashboardPage.jsx    # Admin panel
│   │   ├── components/                   # Reusable UI components
│   │   │   ├── LandingPage/              # Hero, Navbar, Footer
│   │   │   └── HomePage/                 # Sidebar, widgets
│   │   ├── context/                      # AuthContext (Supabase session)
│   │   └── lib/                          # supabaseClient
│   └── .env                              # Frontend env variables
│
├── backend/                              # Spring Boot + Grading Agent
│   ├── src/main/java/com/genalpha/learningplatform/
│   │   ├── controller/                   # 18 REST controllers
│   │   ├── service/                      # Business logic
│   │   ├── model/                        # 17 JPA entities
│   │   ├── repository/                   # Spring Data JPA repos
│   │   ├── dto/                          # Data transfer objects
│   │   ├── config/                       # Security, CORS, OpenAPI
│   │   └── security/                     # JWT auth converter
│   │
│   ├── grading_agent/                    # Python FastAPI microservice
│   │   ├── app.py                        # FastAPI application
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   │
│   ├── docker-compose.yml                # Local orchestration
│   ├── .env.example                      # Env variable template
│   ├── run.sh / run.bat                  # Quick start scripts
│   └── test.sh / test.bat                # Test scripts
│
└── Setup.sql                             # Database schema + triggers
```

---

## 🌐 API Overview

Base URL: https://springboot.delightfulwater-5f80a575.southeastasia.azurecontainerapps.io/api/v1

| Resource | Endpoint | Access |
|---|---|---|
| Auth | `/auth/login`, `/auth/register` | Public |
| Users | `/users/leaderboard`, `/users/{id}` | Authenticated |
| Courses | `/courses` | GET public · Write admin |
| Lessons | `/lessons` | GET public · Write admin |
| Questions | `/questions` | GET public · Write admin |
| Quizzes | `/quiz` | GET public · Write admin |
| Adaptive | `/adaptive/next` | Authenticated |
| Progress | `/progress` | Authenticated |
| Streaks | `/streaks/me` | Authenticated |
| Badges | `/badges`, `/user-badges/me` | Authenticated |
| Posts | `/posts` | Authenticated |
| Avatars | `/avatars` | Authenticated |
| Admin | `/admin/**` | Admin only |
| Health | `/health` | Public |

Full interactive docs: https://springboot.delightfulwater-5f80a575.southeastasia.azurecontainerapps.io/swagger-ui/index.html

---

## 🧪 Testing

The backend has **24 test classes** covering both service and controller layers using JUnit 5 + Mockito.

### Test Coverage

| Layer | Test Classes |
|---|---|
| Services | `AdaptiveLearningServiceImplTest`, `BadgeServiceImplTest`, `ChatBotServiceImplTest`, `CourseProgressServiceImplTest`, `CourseServiceImplTest`, `ModuleServiceImplTest`, `PostServiceImplTest`, `QuizProgressServiceImplTest`, `QuizServiceImplTest`, `UserBadgeServiceImplTest`, `UserServiceImplTest`, `UserStreakServiceImplTest` |
| Controllers | `AdminControllerTest`, `BadgeControllerTest`, `CourseControllerTest`, `CourseProgressControllerTest`, `ModuleControllerTest`, `PostControllerTest`, `QuizControllerTest`, `QuizProgressControllerTest`, `UserBadgeControllerTest`, `UserControllerTest`, `UserStreakControllerTest` |

### Running Tests

> Make sure your `backend/.env` is configured before running tests.

**macOS / Linux:**

```bash
cd backend
./test.sh
```

**Windows:**

```bash
cd backend
test.bat
```

**Or with Maven directly** (ensure env vars are set):

```bash
cd backend
mvn test
```

**Run a specific test class:**

```bash
cd backend
mvn test -Dtest=UserServiceImplTest
```

**Run a specific test method:**

```bash
cd backend
mvn test -Dtest=UserServiceImplTest#testGetUserById
```

---

## 🗺️ Pages & Routes

| Route | Page | Auth Required |
|---|---|---|
| `/` | Landing Page | No |
| `/auth` | Login / Register | No (guest only) |
| `/home` | Home Dashboard | Yes |
| `/home/learn` | Course Browser | Yes |
| `/home/learn/:lessonId` | Adaptive Quiz | Yes |
| `/home/community` | Community Feed | Yes |
| `/home/leaderboard` | Leaderboard | Yes |
| `/home/grading` | AI Grading Agent | Yes |
| `/admin` | Admin Dashboard | Admin only |

---

## 👥 Contributors

<div align="center">

| Jeryl | Aaron | Jia Hong | Sze Teng | Flash | Yasmin |
|:---:|:---:|:---:|:---:|:---:|:---:|

</div>

---

<div align="center">

Built with ❤️ for CS203 by AlphaLingo Team · Singapore Management University

</div>
