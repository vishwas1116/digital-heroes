# Digital Heroes — Golf Performance + Charity + Prize Draw Platform

**Play. Give. Win.**

A subscription-driven platform that combines Stableford golf score tracking, monthly prize draws, and meaningful charity contributions. Built as a full-stack production-quality application for the Digital Heroes trainee selection process (2026 Edition).

## Project Overview

This is a complete MERN-stack implementation of the Digital Heroes PRD (Level 1). It delivers:

- Public marketing site with strong brand presence inspired by Digital Heroes design language
- Full authentication & role-based access (Public / Subscriber / Admin)
- Monthly & Yearly subscription flow (Stripe test mode)
- Strict 5-score rolling Stableford system with date uniqueness
- Charity directory, selection, contribution % (min 10%), independent donations
- Monthly draw engine (random + algorithmic weighted by score frequency)
- Prize pool calculation (40/35/25) with jackpot rollover
- Simulation-before-publish workflow
- Winner proof upload + admin verification + payout tracking
- Premium user dashboard
- Full admin control surfaces + analytics
- Floating AI assistant ("Hero Guide") with knowledge fallback
- Responsive, motion-enhanced UI that deliberately avoids traditional golf aesthetics

## Features Implemented

### Public
- Premium landing page (Hero, How it works, Draw explanation, Prize pool, Charity impact, Featured charity, FAQ, CTAs)
- Charity directory with search/filter
- Charity detail pages with events
- Auth (register/login)

### Subscriber
- Dashboard (subscription status, scores, charity, participation, winnings, impact)
- Score entry/edit/delete with rolling 5-score logic enforced server-side
- Charity selection & contribution percentage
- Independent donation
- Draw participation view
- Winner proof upload
- AI assistant

### Admin
- User management (view, edit scores, subscription status)
- Draw management (configure, simulate, publish, history, rollover)
- Charity CRUD + feature toggle
- Winner verification (approve/reject + reason) + payout marking
- Analytics (users, prize pool, charity totals, draw stats) with charts

## Tech Stack

**Frontend**
- React 18 + Vite
- Tailwind CSS
- Framer Motion
- React Router
- Axios
- Lucide React
- Recharts
- date-fns

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- JWT + bcryptjs
- Stripe (test mode)
- Multer (proof uploads)
- Helmet, CORS, rate-limit, express-validator

**Database**
- MongoDB Atlas (primary)
- Supabase (optional: media storage for proofs if preferred; documented)

## Architecture Decision: MongoDB + Supabase

The PRD references Supabase as an example and requires a *new* Supabase project for deployment constraints.  

**Decision**: MongoDB Atlas is the primary application database (users, scores, draws, winners, subscriptions, charities, analytics).  

Supabase is integrated optionally for:
- Secure file storage of winner proof screenshots (alternative to local `uploads/`)
- Future realtime features

This keeps the core business logic in a flexible document store while satisfying the "new Supabase project" spirit. Full setup instructions are below.

## Folder Structure

```
digital-heroes/
├── frontend/
│   ├── src/
│   │   ├── components/     # UI components (Button, Card, Modal, ScoreCard, etc.)
│   │   ├── pages/          # Landing, Auth, Dashboard, Admin, Charity, etc.
│   │   ├── layouts/        # PublicLayout, DashboardLayout, AdminLayout
│   │   ├── hooks/          # useAuth, useScores, useDraws
│   │   ├── services/       # api.js (axios instance)
│   │   ├── context/        # AuthContext
│   │   ├── utils/          # helpers, constants
│   │   └── assets/
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── .env.example
├── backend/
│   ├── src/
│   │   ├── config/         # db.js
│   │   ├── controllers/    # auth, scores, draws, charities, admin, ai...
│   │   ├── middleware/     # auth, validate, upload
│   │   ├── models/         # User, Score, Charity, Draw, Winner, Participation, Donation
│   │   ├── routes/
│   │   ├── services/       # scoreService, drawService, prizeService, stripeService, aiService
│   │   ├── utils/
│   │   └── seed/           # seed.js
│   ├── uploads/
│   ├── package.json
│   └── .env.example
├── README.md
└── .gitignore
```

## Database Schema Summary

- **User**: name, email, password (hashed), role, charity ref, contribution %, subscription (plan/status/Stripe IDs/periodEnd)
- **Score**: user, value (1-45), date (unique per user), note. Max 5 per user enforced in service.
- **Charity**: name, slug, description, image, category, impact, events[], featured, totals
- **Draw**: month/year, status, method, winningNumbers, prizePool breakdown, winners by tier, simulationData, rollover
- **Participation**: user + draw + 5 numbers (derived from latest scores)
- **Winner**: user + draw + matchType + amount + verification (proof/status) + payout status
- **Donation**: user + charity + amount + type (subscription_share | independent)

Indexes on unique constraints (user+date for scores, user+draw for participation/winners, year+month for draws).

## API Summary (REST)

Auth: POST /api/auth/register, /login, GET /me  
Users: GET/PUT /api/users/:id (admin)  
Scores: GET/POST /api/scores, PUT/DELETE /api/scores/:id  
Charities: GET /api/charities, GET /:id, POST/PUT/DELETE (admin)  
Subscriptions: POST /create-checkout, POST /webhook, GET /status, POST /cancel  
Draws: GET, POST (admin create), POST /:id/simulate, POST /:id/publish  
Winners: GET, POST /:id/proof, PUT /:id/verify, PUT /:id/payout  
Admin: GET /analytics  
AI: POST /api/ai/chat  
Donations: POST /api/donations  

All protected routes use JWT. Admin routes require role=admin. Subscriber features require active subscription (enforced on backend).

## Product Assumptions & Decisions

1. **Subscription pricing** (demo): Monthly ₹999 / Yearly ₹9,999 (≈17% discount). Configurable via Stripe Price IDs.
2. **Prize pool contribution**: 30% of each subscription fee enters the prize pool. Remaining covers ops + charity base.
3. **Draw numbers**: Users' 5 latest Stableford scores become their 5 "numbers" (clamped 1-45). Match against drawn 5 numbers.
4. **Algorithmic weighting**: Higher frequency of a score value across the platform increases its draw probability slightly (documented in drawService).
5. **Jackpot rollover**: Unclaimed 5-match amount carries to next month's jackpot.
6. **Independent donation**: Separate from subscription share; goes 100% to selected charity.
7. **AI**: Uses OpenAI-compatible API (or Grok) via backend. Fallback knowledge base when no key.
8. **File storage**: Local `uploads/` for proofs in development; Supabase Storage recommended for production.
9. **Currency**: INR for Indian market alignment with Digital Heroes.

## Environment Variables

### Backend `.env`
```
PORT=5000
NODE_ENV=development
MONGODB_URI=...
JWT_SECRET=...
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=...
STRIPE_MONTHLY_PRICE_ID=...
STRIPE_YEARLY_PRICE_ID=...
AI_API_KEY=...
SUPABASE_URL=...
SUPABASE_KEY=...
```

### Frontend `.env`
```
VITE_API_URL=http://localhost:5000/api
```

## Local Setup

1. Clone / extract project
2. **Backend**
   ```bash
   cd backend
   cp .env.example .env   # fill values
   npm install
   npm run seed           # creates admin + demo data
   npm run dev
   ```
3. **Frontend**
   ```bash
   cd frontend
   cp .env.example .env
   npm install
   npm run dev
   ```
4. Open http://localhost:5173

## Demo Credentials

**Admin**
- Email: `admin@digitalheroes-demo.com`
- Password: `DemoAdmin2026!`

**Subscriber**
- Email: `demo@digitalheroes-demo.com`
- Password: `DemoUser2026!`

## Seed Data

`npm run seed` creates:
- 1 admin
- 8 demo users with scores & subscriptions
- 6 charities (one featured)
- 2 previous published draws + winners
- Sample donations & participation

## Deployment

**Frontend (Vercel)**
- New Vercel project
- Root: `frontend`
- Build: `npm run build`
- Env: `VITE_API_URL=https://your-api.onrender.com/api`

**Backend (Render / Railway)**
- New service
- Root: `backend`
- Start: `npm start`
- Env vars from `.env.example`
- Persistent disk or Supabase for uploads

**MongoDB Atlas**
- New cluster + database user
- Whitelist 0.0.0.0/0 for demo (restrict in prod)

**Supabase (for PRD constraint)**
- Create *new* project
- Create storage bucket `winner-proofs` (public or signed URLs)
- Use SUPABASE_URL + service role / anon key for uploads

**Stripe**
- Test mode keys
- Create Monthly & Yearly products/prices
- Webhook endpoint `/api/subscriptions/webhook` for `checkout.session.completed`, `customer.subscription.*`

## Production Checklist

- [ ] All env vars set
- [ ] MongoDB indexes created
- [ ] Stripe webhook verified
- [ ] CORS locked to production domain
- [ ] Rate limiting tuned
- [ ] File size limits enforced
- [ ] HTTPS only
- [ ] Admin password changed
- [ ] Seed data removed or restricted
- [ ] Error monitoring (Sentry optional)

## Known Limitations

- Full Stripe webhook signature verification requires live endpoint
- AI responses quality depends on key + prompt engineering
- Algorithmic draw weighting is simplified frequency-based (extensible)
- Mobile admin tables use card transformation; complex filters limited on small screens

## Design Language

Inspired by Digital Heroes website:
- Cream / off-white backgrounds
- Near-black typography
- Refined green accents (#1a5c4a range)
- Generous whitespace
- Large editorial headlines
- Soft rounded cards
- Subtle Framer Motion reveals
- Emotion-first: Impact → Performance → Reward

Avoided: plaid, fairway photos as hero, club icons as primary language.

## PRD Coverage

Every major section of the PRD (roles, subscription, scores, draw types/methods, prize logic, charity, verification, dashboards, UI requirements, deliverables) has corresponding implementation. Edge cases (duplicate date, 6th score, rollover, inactive subscription, invalid proof) are handled in backend services with clear API errors.

---

**Built for the Digital Heroes selection process — March 2026 Edition.**
