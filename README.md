# Digital Heroes — Play. Give. Win.

**Golf performance tracking · Charity impact · Monthly prize draws**

A production-style full-stack platform built for the Digital Heroes trainee selection process (PRD Level 1 · 2026 Edition).

Not a generic CRUD demo — designed as a serious SaaS MVP with real business rules, admin operations, and brand-aligned UI.

---

## Overview

Digital Heroes lets members:

1. **Subscribe** (monthly / yearly)
2. **Enter Stableford scores** (rolling latest 5)
3. **Support a charity** (min 10% of subscription + independent donations)
4. **Enter monthly draws** (numbers derived from scores)
5. **Win & claim** prizes via proof upload and admin verification

**Tagline:** Play. Give. Win.

---

## Features

### Public
- Premium landing page (Digital Heroes visual language)
- Charity directory (search, filter, detail, events)
- Auth: register / login
- Floating **Hero Guide** assistant (knowledge + optional AI)

### Subscriber
- Dashboard: subscription, scores, charity, participation, winnings
- Score entry with server-enforced rules (1–45, one per date, max 5)
- Independent donations
- Winner proof upload
- Subscription activate (demo) / cancel

### Admin
- Overview analytics
- User list + search
- Charity management view
- **Draw engine:** create → simulate (random / algorithmic) → publish
- Prize pool preview (40% / 35% / 25% + jackpot rollover)
- Winner verification (approve / reject + reason) + mark payout

---

## Tech stack

| Layer | Stack |
|-------|-------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion, React Router, Axios, Lucide, Recharts-ready |
| Backend | Node.js, Express, Mongoose, JWT, bcrypt, Multer, Helmet, rate-limit |
| Database | MongoDB Atlas (primary) |
| Payments | Stripe test-ready + **demo activate** without keys |
| AI | Optional OpenAI/Grok-compatible API; offline knowledge fallback |
| Storage | Local `uploads/` for winner proofs (Supabase optional for production) |

---

## Architecture decision: MongoDB + Supabase

PRD mentions Supabase as an example and a **new** project for deployment constraints.

**Decision:**
- **MongoDB Atlas** = primary application DB (users, scores, draws, winners, donations, charities)
- **Supabase** = optional for production file storage (winner proofs) and future realtime

This keeps core business logic in a flexible document store while remaining compatible with the spirit of the PRD deployment constraint. Create a **new** Supabase project for any media bucket if required by evaluators.

---

## Project structure

```text
digital-heroes/
├── frontend/                 # Vite React app (Vercel-ready)
│   └── src/
│       ├── components/       # HeroGuide, ProtectedRoute, …
│       ├── pages/            # Home, Auth, Dashboard, Admin, Charities
│       ├── context/          # AuthContext
│       ├── services/         # api.js
│       └── layouts/
├── backend/                  # Express API (Render/Railway-ready)
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/       # auth, upload
│       ├── models/
│       ├── routes/
│       ├── services/         # score, draw, stripe, ai
│       └── seed/
├── README.md
└── .gitignore