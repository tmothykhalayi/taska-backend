
# Taska Backend – NestJS + PostgreSQL

## Overview
Taska Backend is a modular, scalable server built with NestJS and PostgreSQL. It provides RESTful APIs for managing tasks, user streaks, badges, and motivational quotes for Taska – The Daily Drip Edition.

## Features
- CRUD APIs for tasks
- User streak tracking
- Badge reward system
- Motivational quotes integration
- PostgreSQL persistent storage
- Input validation & error handling
- Modular NestJS architecture

## Tech Stack
- **Backend:** NestJS (Node.js + TypeScript)
- **Database:** PostgreSQL
- **ORM:** TypeORM / Prisma
- **API Testing:** Postman / Thunder Client
- **Version Control:** Git & GitHub

## Project Structure
- `src/`
  - `auth/` – Authentication, guards, strategies, DTOs
  - `database/` – Database module
  - `app.controller.ts`, `app.service.ts`, `app.module.ts`, `main.ts`
- `test/` – E2E tests

## Installation & Setup
1. Clone the repository and navigate to the backend folder.
2. Install dependencies: `npm install`
3. Configure `.env` with your database and API keys.
4. Set up PostgreSQL and run migrations or use provided SQL.
5. Start the server:
   - Dev: `npm run start:dev`
   - Prod: `npm run start:prod`

## API Endpoints
- `GET /tasks` – List tasks
- `POST /tasks` – Create task
- `GET /tasks/:id` – Get task by ID
- `PUT /tasks/:id` – Update task
- `DELETE /tasks/:id` – Delete task
- `GET /streaks/:userId` – Get user streaks
- `GET /badges/:userId` – Get user badges
- `GET /quotes` – Get daily quote

## Testing
- Use Postman/Thunder Client for API testing
- Jest for unit/e2e tests

## Best Practices
- Keep controllers thin, use services for logic
- DTOs for validation
- Modular design
- Use environment variables for secrets
- Async/await for DB queries

## Future Improvements
- JWT authentication & user roles
- Analytics endpoints
- Dockerization
- Notification integration