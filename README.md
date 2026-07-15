# SLIITek Frontend 💻

This repository contains the React frontend application for **SLIITek**, a collaborative Q&A and community portal tailored for students, staff, and system administrators. The application is built using React 19 and Vite, styled with Tailwind CSS, and containerized with Nginx to serve as a lightweight, production-ready frontend bundle.

---

## 🌟 Key Features

- **Intuitive User Portals & Dashboards**:
  - **Student Feed & Dashboard**: View personal activity, track answered/asked questions, monitor points/reputation, and explore communities.
  - **Staff/Moderator Portal**: Elevated dashboard for staff members to review posts, moderate contents, and assist students.
  - **Admin Control Panel**: Full user management system (create, update, delete, suspend), real-time reports moderation list, audit logging, and global dashboard metrics.
- **Q&A Core Interaction**:
  - Browse questions list with tags, search filters, and sorting.
  - View individual question threads complete with rich layouts, author profile metadata, and interactive comment sections.
  - Upvote/Downvote threads with visual feedback.
  - Answer creation, edit, and deletion; question authors can mark an answer as "Accepted."
- **Authentication Flows**:
  - Register, Login, and Password recovery views.
  - Integrated email OTP verification flow during register and forgot password processes.
- **Real-Time Integration & Toasts**:
  - Live socket connection using **Socket.io-client** to receive immediate moderation status changes and admin notifications.
  - Interactive notification popups powered by **Sonner** toasts.
- **Interactive Analytics**:
  - Data visualizations on dashboards (using **Recharts**) to track community activity, user registration rates, and reporting trends.
- **Robust Testing Setup**:
  - Core helper functions and component behaviors verified with **Vitest**.
  - Comprehensive user-flow testing (login, questions, answers, upvoting, admin moderation, and real-time alerts) covered by **Playwright** End-to-End test suites.

---

## 🛠️ Technology Stack

- **Framework**: React 19 (using Vite bundler)
- **Styling**: Tailwind CSS v4, Lucide React, React Icons
- **UI Components**: Radix UI Primitives (Avatar, Dialog, Slot)
- **State & Routing**: React Context, React Router Dom (v7)
- **HTTP Client**: Axios
- **Real-time**: Socket.io Client
- **Charts**: Recharts
- **Testing**: Playwright (E2E testing), Vitest & JSDOM (Unit/Integration testing)

---

## 📂 Project Structure

```text
FrontEnd_SLIITek/
├── src/
│   ├── assets/       # Static assets, images, and animations
│   ├── components/   # Shared UI components (Layout, Navbar, Button, Dialog)
│   ├── context/      # React contexts (AuthContext, SocketContext)
│   ├── hooks/        # Custom React hooks
│   ├── lib/          # Custom libraries and tailwind configuration helpers
│   ├── pages/        # Main application pages
│   │   ├── admin/    # Admin panel pages (Dashboard, Reports, Users, etc.)
│   │   ├── Home/     # Main feed and community dashboards
│   │   ├── Landing/  # Public landing pages
│   │   └── User/     # Authentication views (Login, Register, OTP verify)
│   ├── routes/       # React Router configurations (Public vs. Protected routes)
│   ├── services/     # API integration services (Axios client, endpoints)
│   ├── store/        # State store configurations
│   ├── utils/        # General helper scripts
│   ├── App.jsx       # App shell mounting routes and contexts
│   ├── main.jsx      # Entry point mounting App
│   └── index.css     # Global styles and Tailwind imports
├── e2e/              # Playwright E2E test suites (voting, questions, etc.)
├── tests/            # Vitest unit tests and Playwright spec suites
├── nginx.conf        # Production Nginx reverse-proxy configuration
├── Dockerfile        # Multi-stage Docker build config (Node build -> Nginx host)
├── Jenkinsfile       # CI/CD pipeline definition for Jenkins Windows Agent
├── DEPLOY.md         # Detailed AWS deployment instructions
└── README.md         # You are here!
```

---

## ⚙️ Local Development Setup

### Prerequisites

Ensure you have **Node.js** (v20 or higher) and **npm** installed.

### Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone https://github.com/chanukav/FrontEnd_SLIITek.git
   cd FrontEnd_SLIITek
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

5. **Lint Code**:
   ```bash
   npm run lint
   ```

---

## 🧪 Testing Guidelines

This project maintains testing setups for both unit/integration testing and system/E2E testing:

### 1. Unit & Component Tests (Vitest)
Unit tests verify internal React component lifecycle, custom hooks, and utility functions in a virtualized JSDOM environment.
```bash
# Run Vitest suite
npm run test
```

### 2. End-to-End Tests (Playwright)
Playwright E2E tests run real browser automation tests to simulate user flows (e.g., Auth, Question submissions, voting, and real-time moderation).
```bash
# Run all E2E tests headlessly
npm run test:e2e

# Run E2E tests with UI runner (interactive debugging)
npm run test:e2e:ui

# Run E2E tests in a headed browser
npm run test:e2e:headed
```

---

## 🚢 Production Build & Deployment

For deployment, the frontend employs a multi-stage Docker architecture:
1. **Build Stage**: Uses Node.js to compile Vite source files into a static `/dist` bundle.
2. **Runtime Stage**: Copies `/dist` to a lightweight `nginx:alpine` image. The Nginx server is configured (`nginx.conf`) to serve the static assets and reverse-proxy backend `/api/` traffic to the backend containers inside the private bridged Docker network, preventing CORS issues.

The project is built and deployed automatically via a **Jenkins CI/CD Pipeline** directly onto an AWS EC2 instance. For step-by-step setup guides (including Jenkins environment configurations for Windows build runners), refer to [DEPLOY.md](file:///d:/SLIITek/FrontEnd_SLIITek/DEPLOY.md).
