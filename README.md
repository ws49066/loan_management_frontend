# Loan Management Frontend

Next.js frontend for the Loan Management project. This application communicates with the Loan Management API (backend) and provides a UI for managing clients, loans, installments, payments and the dashboard.

## Features

- Authentication and session handling with tokens
- Pages for customers, loans, payments, dashboard and users
- Forms and input validation using Pydantic-compatible schemas on the backend
- API integration with the backend running at `http://localhost:8000` by default

## Tech Stack

- Next.js (App Router)
- TypeScript
- Axios (HTTP client)
- Tailwind / custom CSS (check `app/globals.css`)

## Setup (Development)

1. Install dependencies

```bash
npm install
# or
pnpm install
```

2. Configure environment variables

Create a `.env.local` file at the project root if needed. Example variables used by this project (adjust as necessary):

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

3. Run the development server

```bash
npm run dev
# or
pnpm dev
```

Open http://localhost:3000 in your browser.

## Build & Production

Build the app:

```bash
npm run build
```

Start in production mode:

```bash
npm run start
```

## Environment & Backend Integration

- The frontend expects the backend API at `NEXT_PUBLIC_API_BASE_URL` (default `http://localhost:8000/api/v1`).
- Ensure the backend is running and CORS allows requests from `http://localhost:3000`.

## Tests

If there are frontend tests (Jest/Playwright), run them with:

```bash
npm test
```

(No UI tests are included by default; tell me if you want me to add basic end-to-end or unit tests.)

## Deployment

- Vercel is recommended for Next.js apps. Set environment variables in the Vercel dashboard.
- You can also deploy as a static export if your app does not require server-side rendering.

## Translating to English

Currently some project strings or API examples might be in Portuguese. To fully convert the frontend to English I can:

1. Scan `features/`, `app/(private)`, and `app/(public)` folders for Portuguese strings.
2. Replace UI labels and form placeholders with English equivalents.
3. Create a translation file structure (i18n) if you want multi-language support.

Tell me if you want me to automatically apply these translations.

## Adding This Project to Your Portfolio

If you want a short portfolio blurb and screenshot suggestions, I can prepare a concise description and a step-by-step demo script you can use when presenting the project.
