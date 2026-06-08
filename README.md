# RoomMates Connect

RoomMates Connect is a full-stack roommate matching app with an Express API in `backend/` and a static Vite-based frontend in `frontend/`.

## Features

- User registration and login with JWT auth
- Profile management and lifestyle survey submission
- Match discovery, filtering, and match status updates
- Static frontend pages for onboarding, survey flow, search, and match confirmation

## Project Structure

- `backend/` - Express API, in-memory data stores, and route handlers
- `frontend/` - HTML, CSS, and browser-side JavaScript for the UI
- `package.json` - root scripts for launching the backend and installing both app packages

## Requirements

- Node.js 18 or newer
- npm

## Setup

Install dependencies from the project root:

```bash
npm install
npm run setup
```

The root `package.json` also includes separate helpers if you want to install one side at a time:

```bash
npm run install-backend
npm run install-frontend
```

## Running the App

Start the backend API from the project root:

```bash
npm start
```

This runs the API on `http://localhost:3000` by default.

For local frontend development, start the frontend from the `frontend/` folder:

```bash
cd frontend
npm run dev
```

The backend allows CORS from `http://localhost:8080`, which matches the default Vite preview/development port used by this project.

## API Overview

Base URL: `http://localhost:3000/api`

- `GET /health` - health check
- `POST /auth/register` - register a new user
- `POST /auth/login` - log in and receive a JWT
- `GET /auth/me` - get the authenticated user
- `GET /users/profile` - get the current user profile
- `PUT /users/profile` - update the current user profile
- `GET /users/all` - list completed profiles for matching
- `GET /users/:id` - get a user by ID
- `DELETE /users/profile` - delete the current account
- `GET /survey/questions` - get survey questions for the frontend
- `POST /survey/submit` - submit survey responses
- `GET /survey/responses` - fetch the current survey responses
- `PUT /survey/responses` - update survey responses
- `GET /matches/potential` - get compatible matches
- `GET /matches/current` - get current matches
- `POST /matches/create` - create a new match
- `PUT /matches/:matchId/status` - update a match status

## Notes

- The backend currently stores users and matches in memory, so data resets when the server restarts.
- Set `PORT`, `FRONTEND_URL`, and `JWT_SECRET` in the environment if you want to override the defaults.

## Frontend Pages

- `index.html` - landing page
- `signup.html` - sign-up flow
- `survey.html` - lifestyle survey
- `search.html` - match search and filtering UI
- `match.html` - match confirmation screen
