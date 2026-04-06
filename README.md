
# Taska Backend

A scalable, modular RESTful API built with **NestJS**, **TypeScript**, and **PostgreSQL**. Provides comprehensive backend services for task management, user authentication, streak tracking, badges, and motivational features.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Database](#database)
- [Authentication](#authentication)
- [Docker](#docker)
- [Testing](#testing)
- [Development](#development)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

Taska Backend is the core server of the Taska task management platform. It provides enterprise-grade APIs for:

- **User Management** - Registration, authentication, and user profiles
- **Task Management** - Complete CRUD operations with status tracking
- **Gamification** - Streak tracking and badge reward system
- **Motivation** - Daily inspirational quotes and notifications
- **Email Services** - Confirmation and notification emails
- **Logging & Monitoring** - Application logging and activity tracking

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Runtime** | Node.js 18+ |
| **Framework** | NestJS 10+ |
| **Language** | TypeScript 5+ |
| **Database** | PostgreSQL 14+ |
| **ORM** | TypeORM / Prisma |
| **Package Manager** | pnpm |
| **Authentication** | JWT (Access + Refresh Tokens) |
| **Mail Service** | Nodemailer + Handlebars |
| **Containerization** | Docker & Docker Compose |
| **Testing** | Jest |
| **Linting** | ESLint |

## 📦 Prerequisites

Before you begin, ensure you have:

- **Node.js** v18+ and **pnpm** installed
- **PostgreSQL** 14+ running locally or via Docker
- **.env** file configured (see Environment Setup)
- **Git** for version control

## ⚙️ Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd taska-backend
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Create environment configuration:**
   - Copy `.env.example` to `.env`
   - Update database and API credentials

4. **Set up the database:**
   ```bash
   pnpm run typeorm migration:run
   # or use provided SQL scripts
   ```

## 🔐 Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
# Application
NODE_ENV=development
PORT=8000
APP_NAME=Taska Backend
APP_URL=http://localhost:8000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=taska_db

# JWT
JWT_SECRET=your_super_secret_key
JWT_EXPIRATION=15m
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_REFRESH_EXPIRATION=7d

# Email Service
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_FROM=noreply@taska.com

# External APIs
QUOTES_API_URL=https://api.quotable.io
LOGGING_LEVEL=debug
```

## 🚀 Running the Application

### Development Mode
```bash
pnpm run start:dev
```
Hot-reloading enabled. Server runs on `http://localhost:8000`

### Production Mode
```bash
pnpm run start:prod
```

### Build Only
```bash
pnpm run build
```

## 📁 Project Structure

```
src/
├── auth/                    # Authentication module
│   ├── strategies/          # JWT & Refresh token strategies
│   ├── guards/              # Route guards & role-based access
│   ├── decorators/          # Custom decorators (@Public, @Roles, etc.)
│   ├── dto/                 # Login, signup, password reset DTOs
│   └── auth.service.ts      # Authentication business logic
│
├── users/                   # User management module
│   ├── entities/            # User database entity
│   ├── dto/                 # User DTOs
│   └── users.service.ts     # User business logic
│
├── tasks/                   # Task management module
│   ├── entities/            # Task entity
│   ├── dto/                 # Create/Update task DTOs
│   └── tasks.service.ts     # Task business logic
│
├── streaks/                 # Streak tracking module
│   ├── entities/            # Streak entity
│   └── streaks.service.ts   # Streak logic
│
├── badges/                  # Badge reward system
│   ├── entities/            # Badge entity
│   └── badges.service.ts    # Badge logic
│
├── quotes/                  # Motivational quotes module
│   └── quotes.service.ts    # Quote fetching & management
│
├── mail/                    # Email service
│   ├── templates/           # Handlebars email templates
│   └── mail.service.ts      # Email sending logic
│
├── logs/                    # Logging module
│   └── logs.service.ts      # Application logging
│
├── database/                # Database configuration
│   └── database.module.ts   # TypeORM configuration
│
├── app.module.ts            # Root application module
├── app.controller.ts        # Root controller
├── main.ts                  # Application entry point
└── http-exception.filter.ts # Global exception handling

test/
└── app.e2e-spec.ts         # End-to-end tests
```

## 🔌 API Endpoints

### Interactive API Documentation (Swagger)
When the server is running, OpenAPI docs are available at:

- `http://localhost:8000/api/docs` (Swagger UI)
- `http://localhost:8000/api/docs-json` (OpenAPI JSON)

For protected routes:

1. Call `POST /auth/login` or `POST /auth/refresh` to get an access token.
2. In Swagger UI, click **Authorize**.
3. Paste the token as `Bearer <access_token>`.

### Authentication
```
POST   /auth/register              - Register new user
POST   /auth/login                 - Login user
POST   /auth/refresh               - Refresh JWT token
POST   /auth/signout               - Logout user
POST   /auth/forgot-password       - Request password reset email
POST   /auth/reset-password        - Reset password with OTP
```

### Users
```
GET    /users                     - Get all users
GET    /users/:id                - Get user profile
PATCH  /users/:id                - Update user profile
DELETE /users/:id                - Delete user account
POST   /users                     - Create new user
```

### Tasks
```
GET    /tasks                     - List all tasks
POST   /tasks                     - Create new task
GET    /tasks/:id                - Get task details
PATCH  /tasks/:id                - Update task
DELETE /tasks/:id                - Delete task
```

### Streaks
```
GET    /streaks                   - Get all streaks
POST   /streaks                   - Create new streak
GET    /streaks/:id              - Get specific streak
PATCH  /streaks/update/:userId   - Update user streak (with completedToday flag)
DELETE /streaks/:id              - Delete streak
```

### Badges
```
GET    /badges                    - List all badges
POST   /badges                    - Create new badge
GET    /badges/user/:userId      - Get user's badges
DELETE /badges/:id               - Delete badge
```

### Quotes
```
GET    /quotes                    - Get all quotes
POST   /quotes                    - Create new quote
GET    /quotes/random            - Get random quote
GET    /quotes/:id               - Get specific quote
DELETE /quotes/:id               - Delete quote
```

### Health
```
GET    /                          - Health check endpoint
```

## 💾 Database

### Migrations
```bash
# Create new migration
pnpm run typeorm migration:create

# Run migrations
pnpm run typeorm migration:run

# Revert migration
pnpm run typeorm migration:revert
```

### Database Schema
- **users** - User accounts with roles and permissions
- **tasks** - User tasks with status and timestamps
- **streaks** - Daily streak tracking
- **badges** - Achievement badges
- **quotes** - Motivational quotes
- **email_logs** - Email delivery tracking

## 🔐 Authentication

- **JWT (JSON Web Tokens)** for stateless authentication
- **Access Token** - Short-lived (15 minutes by default)
- **Refresh Token** - Long-lived (7 days by default)
- **Role-Based Access Control (RBAC)** - Tasker & Admin roles
- **Guard & Decorator Pattern** for protected routes
- **OTP-based Password Reset** - Email-sent OTP for secure password recovery
- **Bcrypt Hashing** for secure password storage

Protected routes require `Authorization: Bearer <access_token>` header.

## 👥 User Roles & Permissions

### **Tasker Role** (Default)
- Can create and manage own tasks
- Can view own streak progress
- Can earn badges through task completion
- Can receive daily motivational quotes
- Can update own profile

### **Admin Role**
- Full access to all resources
- Can manage all users and tasks
- Can create/edit/delete badges and quotes
- Can view system-wide statistics
- Can manage user roles

| Feature | Tasker | Admin |
|---------|--------|-------|
| Create Tasks | ✅ | ✅ |
| Manage Streaks | ✅ | ✅ |
| Earn Badges | ✅ | ✅ |
| View Quotes | ✅ | ✅ |
| Manage All Users | ❌ | ✅ |
| Manage Quotes | ❌ | ✅ |
| Manage Badges | ❌ | ✅ |
| System Admin Panel | ❌ | ✅ |

## 🐳 Docker

### Run with Docker Compose
```bash
# Development environment
docker-compose up -d

# Production environment
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

**Services:**
- NestJS Backend (port 8000)
- PostgreSQL Database (port 5432)

## 🧪 Testing

### Run all tests
```bash
pnpm run test
```

### Watch mode
```bash
pnpm run test:watch
```

### Coverage report
```bash
pnpm run test:cov
```

### E2E tests
```bash
pnpm run test:e2e
```

## 👨‍💻 Development

### Linting & Formatting
```bash
# Run ESLint
pnpm run lint

# Fix lint issues
pnpm run lint:fix

# Format code (Prettier)
pnpm run format
```

### Code Quality Best Practices
- Keep controllers thin - leverage services for business logic
- Use **DTOs** for request validation
- Implement **global exception handling** with custom filters
- Follow **NestJS modular architecture**
- Use **dependency injection** throughout
- Add **TypeScript strict mode** validation
- Document complex logic with comments

### Creating New Modules
```bash
# Use NestJS CLI
nest g module users
nest g controller users
nest g service users
```

## 🐛 Troubleshooting

### Database Connection Failed
- Verify PostgreSQL is running
- Check `.env` database credentials
- Ensure database name exists

### Port Already in Use
```bash
# Change PORT in .env or run:
PORT=3001 pnpm run start:dev
```

### Invalid Credentials
- Ensure bcrypt hashing is properly configured
- Check that passwords are being hashed before storage
- Verify user exists before login attempt

### User Already Exists
- When registering, the system checks for existing users by email
- Return `UnauthorizedException` if user already registered
- Use login endpoint for existing users

### JWT Token Expired
- Use the refresh endpoint to get a new access token
- Refresh tokens are valid for 7 days

### Email Not Sending
- Verify SMTP credentials in `.env`
- Check Gmail app-specific password (not regular password)
- Enable "Less secure app access" if needed

### Invalid OTP for Password Reset
- OTP tokens are time-limited
- Request a new password reset email if OTP expires
- Ensure OTP is correct before reset attempt

### Migration Errors
- Ensure database is running
- Check TypeORM entity definitions
- Review migration timestamps for conflicts

## 📝 License

This project is licensed under the MIT License.

## 🤝 Support

For issues, questions, or contributions, please open an issue or contact the development team.
Administrators manage users, track application analytics, monitor task completion trends, and manage reward system via the admin dashboard.

🏗️ Architecture
Project Structure
src/
├── main.tsx                     # Application entry point
├── App.tsx                      # Root application component with routes
├── index.css                    # Global styles
├── pages/                       # Page components
│   ├── Landing.tsx              # Home/landing page with features
│   ├── Login.tsx                # User login page
│   ├── Register.tsx             # User registration page
│   ├── About.tsx                # About page
│   ├── Contact.tsx              # Contact page
│   └── Locations.tsx            # Task Dashboard with task management
├── Dashboards/                  # Dashboard pages
│   ├── Customer/                # Customer dashboard
│   │   ├── Dashboard.tsx        # Customer main dashboard
│   │   ├── MiningCheck-in.tsx   # Morning motivation check-in
│   │   ├── NightCheck-in.tsx    # Night reflection check-in
│   │   ├── MindMap.tsx          # Task mind mapping
│   │   ├── Session.tsx          # Task sessions
│   │   └── bot.tsx              # Chat bot assistant
│   └── Admin/                   # Admin dashboard
│       ├── Dashboard.tsx        # Admin main dashboard
│       └── conversation.tsx     # Admin conversations
├── components/                  # Reusable UI components
│   ├── ui/                      # Basic UI components (Button, Input, Card, etc.)
│   ├── layout/                  # Layout components (Header, Footer, etc.)
│   ├── ChatBot.tsx              # Chat bot component
│   ├── LocationCard.tsx         # Task/Coaching card component
│   └── BookingModal.tsx         # Session booking modal
├── features/                    # Redux features
│   ├── Auth/                    # Authentication slice and API
│   ├── Tasks/                   # Tasks API (tasksApi.ts)
│   ├── Users/                   # Users slice and API
│   └── index/                   # Additional features
├── app/                         # Redux store configuration
│   └── store.ts                 # Store setup
### React Router Configuration

The application uses React Router for client-side routing:

```typescript
// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerDashboard from './Dashboards/Customer/Dashboard';
import AdminDashboard from './Dashboards/Admin/Dashboard';
import ProtectedRoute from './components/layout/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/dashboard/customer" 
          element={
            <ProtectedRoute>
              <CustomerDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/admin" 
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}
```ath: '$vehicleId',
  parseParams: (params) => ({
    vehicleId: z.string().parse(params.vehicleId),
  }),
  component: VehicleDetailPage,
});
✨ Features
User-Facing Features
Task Dashboard: Create, view, edit, and complete tasks with smart filtering
Task Management: Organize tasks by priority (high, medium, low), status (pending, in-progress, completed), and categories
Progress Tracking: Real-time completion rates and task statistics (completed, in-progress, pending counts)
Gamification System: Earn badges and rewards for completing tasks and maintaining streaks
Daily Inspiration: Daily inspirational quotes to boost motivation and psychological well-being
User Authentication: Secure login/registration with JWT tokens
Personal Dashboard: Track progress, view achievements, and manage profile
Responsive Design: Mobile-first responsive design optimized for all devices
Engagement Features
Morning Check-ins: Start your day with motivation and task planning
Night Check-ins: Reflect on achievements and plan for tomorrow
Mind Mapping: Visualize task relationships and dependencies
Chat Bot Assistant: AI-powered task guidance and motivation support
Badges & Rewards: Unlock achievements for task completion milestones
Admin Features
Dashboard Analytics: Charts and metrics for user engagement and task completion insights
User Management: Admin controls for user accounts and activity
Task Monitoring: View and monitor all user tasks and progress
Reporting System: Task completion reports and engagement analytics
System Management: Configure gamification rules and reward system
Technical Features
Type-Safe Development: Full TypeScript integration for robust code
State Management: Centralized state with Redux Toolkit
API Integration: RTK Query for efficient, cached data fetching
Smooth Animations: Framer Motion for delightful UI transitions
Error Boundaries: Graceful error handling and recovery
Loading States: Skeleton loaders and loading indicators
Icon Library: Comprehensive Lucide React icons for intuitive UI
🚀 Getting Started
Prerequisites
Node.js 18.0 or higher
pnpm package manager
Step-by-Step Setup
Clone the repository
git clone https://github.com/yourusername/Taska.git
cd Taska
Install dependencies
pnpm install
Environment configuration
cp .env.example .env
## 🧭 Routing with React Router

### Route Configuration
React Router provides declarative routing for the application:

```typescript
// Protected Route wrapper
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../app/store';

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { token } = useSelector((state: RootState) => state.auth);
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}
Navigation
import { useNavigate } from 'react-router-dom';

function Component() {
  const navigate = useNavigate();
  
  const handleNavigate = () => {
    navigate('/dashboard/customer');
  };
  
  return <button onClick={handleNavigate}>Go to Dashboard</button>;
}
Adding Links
import { Link } from "react-router-dom";

// In your JSX
<Link to="/about">About</Link>
<Link to="/contact">Contact</Link>
Using A Layout
In the File Based Routing setup, the layout is located in src/routes/__root.tsx. Example:

import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

export const Route = createRootRoute({
  component: () => (
    <>
      <header>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
        </nav>
      </header>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
})
🗃️ State Management
Redux Store Structure
// store/slices/authSlice.ts
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<AuthState>) => {
      state.user = action.payload.user;
```typescript
// app/store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/Auth/UserAuthSlice';
import userReducer from '../features/Users/userSlice';
import { usersAPI } from '../features/Users/usersApi';
import { tasksAPI } from '../features/Tasks/tasksApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    [usersAPI.reducerPath]: usersAPI.reducer,
    [tasksAPI.reducerPath]: tasksAPI.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      usersAPI.middleware,
      tasksAPI.middleware
    ),
});
Task Card Component Example
export const TaskCard: React.FC<TaskCardProps> = ({ task, onComplete }) => {
  const priorityColors = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800',
  };
  
  return (
    <div className="rounded-lg border shadow-sm p-4 hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-lg">{task.title}</h3>
        <span className={`px-2 py-1 text-xs rounded-full ${priorityColors[task.priority]}`}>
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </span>
      </div>
      <p className="text-gray-600 text-sm mb-3">{task.description}</p>
      <div className="flex justify-between items-end">
        <span className="text-xs text-gray-500">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
        <button 
          onClick={() => onComplete(task.id)}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          Complete
        </button>
      </div>
    </div>
  );
};
🔌 API Integration
RTK Query Setup for Tasks
// features/Tasks/tasksApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export const tasksAPI = createApi({
  reducerPath: 'tasksAPI',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:8000/tasks',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getUserTasks: builder.query<Task[], string>({
      query: (userId) => `/user/${userId}`,
    }),
    createTask: builder.mutation<Task, Partial<Task>>({
      query: (task) => ({
        url: '/',
        method: 'POST',
        body: task,
      }),
    }),
    updateTask: builder.mutation<Task, Task>({
      query: (task) => ({
        url: `/${task.id}`,
        method: 'PUT',
        body: task,
      }),
    }),
    deleteTask: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const { useGetUserTasksQuery, useCreateTaskMutation, useUpdateTaskMutation, useDeleteTaskMutation } = tasksAPI;
🚀 Deployment
Build for Production
# Build the application
pnpm build

# Preview the build
pnpm preview
Environment Variables for Production
VITE_API_URL="https://api.taska.example.com"
VITE_APP_NAME="Taska"
Deployment Platforms
Vercel
// vercel.json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "routes": [
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
Netlify
# netlify.toml
[build]
  publish = "dist"
  command = "pnpm build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
🤝 Contributing
Development Guidelines
Follow TypeScript best practices
Use React Router for all navigation and client-side routing
Write tests for new components and features
Follow the established component structure
Use Tailwind CSS and Framer Motion for styling and animations
Update documentation for new features
Test task management workflows thoroughly
Commit Message Convention
feat: add task creation modal
fix: resolve task filtering issue
docs: update task management documentation
style: improve task dashboard responsive design
refactor: simplify task state management
test: add tests for task completion feature
📞 Support
For support regarding Taska:

Check the documentation and README first
Review existing GitHub Issues
Create a new issue with detailed description
Include steps to reproduce any bugs
Follow the issue template when reporting problems
📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

Taska - Master Your Tasks, Transform Your Life

Built with React 19.2.4, TypeScript 5.9.3, React Router 7.14.0, Redux Toolkit 2.11.2, Framer Motion 12.38.0, and Tailwind CSS