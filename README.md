# NCC Enrollment Portal

A production-ready NCC enrollment portal with a public registration form and a secure admin dashboard.

## Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Node.js + Express.js (MVC)
- **Database:** Supabase (PostgreSQL)

---

## Project Structure

```
NCC-Enrollment/
├── frontend/           # Static frontend (deploy to Vercel/Netlify)
│   ├── index.html      # Landing page
│   ├── register.html   # Student registration form
│   ├── thankyou.html   # Success page
│   ├── admin-login.html
│   ├── admin-dashboard.html
│   ├── css/
│   └── js/
├── backend/            # Express API (deploy to Render/Railway)
│   ├── server.js
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   ├── validators/
│   └── utils/
└── supabase/
    ├── schema.sql      # Run this in Supabase SQL editor
    └── seed.sql        # Creates default admin account
```

---

## Setup Instructions

### 1. Supabase Database

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run `supabase/schema.sql`
3. Then run `supabase/seed.sql` (after updating the password hash — see below)
4. Copy your **Project URL** and **service_role key** from Project Settings → API

### 2. Generate Admin Password Hash

```bash
cd backend
npm install
node -e "const b=require('bcrypt');b.hash('Admin@NCC2024',12).then(console.log)"
```

Copy the output hash and replace the placeholder in `supabase/seed.sql`, then run it.

### 3. Backend Setup

```bash
cd backend
cp .env.example .env
# Fill in your values in .env
npm install
npm run dev
```

### 4. Frontend Setup

Update `API_BASE` in `frontend/js/app.js`, `register.js`, `auth.js`, and `admin.js` to your backend URL.

For local development, open `frontend/index.html` directly in a browser or use Live Server.

---

## Environment Variables (backend/.env)

```
PORT=5000
NODE_ENV=development
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
JWT_SECRET=your_min_32_char_secret_key
JWT_EXPIRES_IN=8h
FRONTEND_URL=http://localhost:3000
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/register` | None | Submit student application |
| POST | `/api/admin/login` | None | Admin login |
| GET | `/api/admin/applications` | JWT | List all applications |
| GET | `/api/admin/applications/export` | JWT | Export CSV/Excel |
| GET | `/api/admin/application/:id` | JWT | Get single application |
| PUT | `/api/admin/application/:id` | JWT | Update application |
| DELETE | `/api/admin/application/:id` | JWT | Delete application |
| GET | `/api/admin/statistics` | JWT | Dashboard stats |

---

## Deployment

### Backend → Render / Railway
1. Push `backend/` to a GitHub repo
2. Create a new Web Service on Render
3. Set environment variables in the dashboard
4. Deploy

### Frontend → Vercel / Netlify
1. Push `frontend/` to a GitHub repo
2. Import to Vercel — it deploys as static files
3. Update `API_BASE` in all JS files to your Render backend URL

---

## Default Admin Credentials

After running `seed.sql` with a proper hash:
- **Username:** `admin`
- **Password:** `Admin@NCC2024`

> ⚠️ Change the password immediately after first login by updating the hash in Supabase.

---

## Security Features

- JWT authentication with 8h expiry
- bcrypt password hashing (rounds=12)
- Helmet.js security headers
- CORS with origin whitelist
- Rate limiting (100 req/15min general, 10/hr for registration, 10/15min for login)
- Input validation with express-validator
- SQL injection protection via Supabase parameterized queries
- XSS protection via input escaping
- Environment variables for all secrets
- Central error handler (no stack traces in production)
