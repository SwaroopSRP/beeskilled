# BeeSkilled - Full Stack Web Development

A progressive 4-week journey from frontend fundamentals to building full-stack applications with the MERN stack. Each week builds on the previous, covering real-world concepts and practical projects.

---

## Week 1 — Frontend Foundations

> HTML, CSS, and React basics

Started with the building blocks of the web and moved into component-based UI development.

### Projects
| # | Project | Description |
|---|---------|-------------|
| 1 | Personal Portfolio | Static portfolio site built with semantic HTML and CSS |
| 2 | React Components | Reusable UI components demonstrating props and state |
| 3 | Blog UI | Blog layout built with React, covering component composition |

---

## Week 2 — Backend Development

> Node.js, Express, MongoDB, REST APIs, JWT Authentication

Built RESTful APIs from scratch, working with databases, authentication, and secure route handling.

### Projects
| # | Project | Description |
|---|---------|-------------|
| 1 | To-Do List API | CRUD endpoints with MongoDB for data persistence |
| 2 | Auth API | User registration and login with bcrypt password hashing and JWT tokens |
| 3 | Notes App (Mini Project) | Full backend for a notes app — user-specific notes, CRUD, and JWT-secured routes |

### Key Concepts
- Express.js routing and middleware
- Mongoose schemas and models
- Password hashing with bcrypt
- JSON Web Tokens for stateless authentication
- Protected route middleware

---

## Week 3 — Full Stack Integration

> React + Express, Axios, React Router, Context API, Multer file uploads

Connected the frontend and backend into working full-stack applications with authentication, state management, and file handling.

### Projects
| # | Project | Description |
|---|---------|-------------|
| 1 | Full Stack To-Do App | React frontend connected to Express API — login, register, CRUD, and routing |
| 2 | Image Upload | File upload with Multer — preview, display, and delete uploaded images |
| 3 | Task Manager (Mini Project) | Complete task tracking app with user login, task filtering, priority/status, and file attachments |

### Key Concepts
- Axios for API communication
- React Router with protected and public routes
- Context API for global auth state
- Multer middleware for multipart file uploads
- Frontend-backend proxy setup

---

## Week 4 — Project Management Dashboard

> Boards, Lists, Cards, Drag-and-Drop, Role-Based Access

Built a Trello-style project management tool combining everything from the previous weeks into a polished, functional application.

### Features
- **Boards** — Create and manage project boards with default lists
- **Lists** — Add, reorder, and delete lists within boards
- **Cards** — Create, edit, and organize task cards with descriptions, labels, due dates, and assignees
- **Drag & Drop** — Move cards between lists and reorder within lists using `@dnd-kit`
- **Role-Based Access** — System-level roles (admin/manager/member) and board-level roles (admin/editor/viewer)
- **Member Management** — Invite users to boards with specific permissions

### Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React, React Router, @dnd-kit |
| Backend | Express.js, Node.js |
| Database | MongoDB with Mongoose |
| Auth | JWT, bcrypt |

### Project Structure
```
week-4/project-dashboard/
├── server/
│   ├── models/        # User, Board, List, Card
│   ├── controllers/   # Auth, Board, List, Card logic
│   ├── routes/        # API endpoints
│   └── middleware/     # Auth & role-based access
└── client/
    ├── src/
    │   ├── pages/         # Login, Register, Dashboard, BoardView
    │   ├── components/    # ListColumn, CardModal, MembersModal
    │   ├── context/       # Auth state management
    │   └── utils/         # API helper with interceptors
    └── public/
```

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- npm or yarn

### Setup

```bash
# Clone the repo
git clone git@github.com:SwaroopSRP/beeskilled.git
cd beeskilled

# Navigate to any project
cd week-4/project-dashboard/server

# Install dependencies and configure
npm install
cp .env.example .env   # Add your MongoDB URI and JWT secret

# Start backend
npm run dev

# In a new terminal — start frontend
cd ../client
npm install
npm start
```

---

## What I Learned

**Week 1** — How the web works, structuring pages, and thinking in components

**Week 2** — Building APIs, working with databases, and securing endpoints

**Week 3** — Connecting frontend to backend, managing auth state, and handling file uploads

**Week 4** — Complex state management, drag-and-drop interactions, and designing for multi-user access

---

Built as part of a structured learning path focused on becoming a full stack developer.
