# RoomMates Connect

RoomMates Connect is a full-stack roommate matching app with an Express API in `backend/` and a Vite-based frontend in `frontend/`.

## Features

- User registration and login with JWT auth
- Profile management and lifestyle survey submission
- Match discovery, filtering, and match status updates
- Frontend pages for onboarding, survey flow, search, and match confirmation

## Project Structure

```text
backend/      Express API, in-memory data stores, and route handlers
frontend/     Vite frontend for the user interface
package.json  Root scripts for launching the backend and installing both app packages
```

## Requirements

- Node.js 18 or newer
- npm

## Setup

Install dependencies from the project root:

```bash
npm install
npm run setup
```

The root `package.json` also includes separate helpers:

```bash
npm run install-backend
npm run install-frontend
```

## Running the App

Start the backend API from the project root:

```bash
npm start
```

The API runs on `http://localhost:3000` by default.

For local frontend development:

```bash
cd frontend
npm run dev
```

The backend allows CORS from `http://localhost:8080`, which matches the default Vite preview/development port used by this project.

## API Overview

Base URL: `http://localhost:3000/api`

- `GET /health` - Health check
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Log in and receive a JWT
- `GET /auth/me` - Get the authenticated user
- `GET /users/profile` - Get the current user profile
- `PUT /users/profile` - Update the current user profile
- `GET /users/all` - List completed profiles for matching
- `GET /users/:id` - Get a user by ID
- `DELETE /users/profile` - Delete the current account
- `GET /survey/questions` - Get survey questions
- `POST /survey/submit` - Submit survey responses
- `GET /survey/responses` - Fetch current survey responses
- `PUT /survey/responses` - Update survey responses
- `GET /matches/potential` - Get compatible matches
- `GET /matches/current` - Get current matches
- `POST /matches/create` - Create a new match
- `PUT /matches/:matchId/status` - Update match status

## Notes

- The backend currently stores users and matches in memory, so data resets when the server restarts.
- Set `PORT`, `FRONTEND_URL`, and `JWT_SECRET` in the environment if you want to override the defaults.
