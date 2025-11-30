# Brototype Competition – Clean Path Complaint Portal

> Submission for the **Brototype (Brototype) Competition** showing a full-stack complaint portal with AI-inspired workflows, staff tools, and a warm Clear Path brand. This README explains everything judges need to review, run, and deploy the project.

## Quick overview

| Area | Highlights |
| --- | --- |
| **Frontend** | Vite + React + Tailwind, warm “Clean Path” visuals, responsive cards, staff/student journeys |
| **Backend** | Node/Express API with MongoDB Atlas, JWT auth, ticket messages, roster aggregation, delete endpoints |
| **Experience** | Main landing, Support/About/Features, complaints cockpit, student/staff dashboards, AI reply helpers |

## Repository structure

```
.
├── backend   # Express API, auth, complaints, roster endpoints
└── frontend  # React UI / Vite dev server
```

## Accounts for evaluation

| Role | Email | Password | Notes |
| --- | --- | --- | --- |
| Admin | `admin@clearpath.com` | `Adminclearpath@123` | Seeded automatically via `.env` vars |
| Staff (create) | Register or promote via DB | — | Staff can manage tickets at `/app/staff/tickets` |
| Student | Register via `/register` | chosen at signup | Access `/app/my-tickets` and support flows |

> Change these credentials in production. For judging, the admin login above exposes all screens.

## Environment configuration

`backend/.env` (sample):
```
PORT=5000
MONGO_URI=<atlas connection>
JWT_SECRET=<random string>
ADMIN_EMAIL=admin@clearpath.com
ADMIN_PASSWORD=Adminclearpath@123
ADMIN_NAME=Admin

# Optional AI provider keys (used for placeholder macros)
OPENROUTER_API_KEY=...
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=anthropic/claude-3-haiku
GROQ_API_KEY=...
GROQ_MODEL=llama3-8b-8192
```

`frontend/.env`:
```
VITE_API_URL=http://localhost:5000   # or deployed API URL
```

## Running locally (judging instructions)

1. **Backend**
   ```bash
   cd backend
   npm install
   npm run dev   # http://localhost:5000
   ```
2. **Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev   # http://localhost:5173
   ```
3. Keep both terminals running. The frontend proxies API calls to `VITE_API_URL`.

## Key features to test

- **Main landing (`/app`)**: hero metrics, portal pillars, workflow timeline, interactive showcase, testimonials, CTA.
- **Support hub (`/support`)**: new hero, contact lanes, process cards, Clean Path loops/FAQ, shared footer.
- **Complaints page (`/app/complaints`)**: real-time student roster fetched from backend (`/api/complaints/roster`).
- **My tickets (`/app/my-tickets`)**: stats grid, ticket cards, staff-only delete action, embedded roster panel.
- **Staff tickets (`/app/staff/tickets`)**: AI reply macros, status updates, chat timeline, delete/close options, roster view.
- **Login/Register**: polished hero content, remember device toggle, support CTA, consistent gradient footers.

## Deployment guide (competition-ready)

1. **Backend**
   - Deploy to Render/Railway/Fly.io/etc.
   - Configure env vars above + MongoDB connection.
   - Start with `npm run start`. Capture public API URL.
2. **Frontend**
   - Set `VITE_API_URL` to the API URL.
   - Run `npm run build` in `frontend/`.
   - Deploy `/dist` to Vercel, Netlify, Cloudflare Pages, or S3+CloudFront. Enable SPA fallback (rewrite `/* -> /index.html`).
3. **Verification**
   - Visit the deployed frontend, log in as the admin, check `/app/complaints`, `/app/my-tickets`, `/app/staff/tickets`, `/support`, `/features`, `/about`.
   - Ensure roster + delete endpoints work (requires backend and Mongo running).

## Tech stack

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons
- **Backend:** Node.js/Express, MongoDB (Atlas), JWT auth
- **Build tools:** npm scripts, Vite dev server, optional AI placeholders (OpenRouter/Groq)

## Notes for Brototype judges

- Backend seeding is automatic on start; use the admin credentials above to explore.
- Student roster uses aggregation on complaints to surface most active students.
- Staff “delete ticket” calls `DELETE /api/complaints/:id` and removes associated messages.
- Entire UI honors the warm cream palette requested in the competition brief.

## Support / contact

- Email: `support@cleanpath.com`
- For backend issues, inspect the hosting logs (Render/Railway etc.).
- For frontend deploy issues, view the static host deployment log (Vercel/Netlify/etc.).

Good luck reviewing, and thank you for considering Clean Path for the Brototype competition!
"# ClearPath" 
