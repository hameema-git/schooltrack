# 📚 SchoolTrack

A mobile-first PWA for CBSE parents to track school updates, homework, fees, and share missed-class notes — with AI-powered WhatsApp message parsing.

## Features

| Feature | Details |
|---|---|
| 🏠 Today Dashboard | Glanceable urgent strip, stats, all update types |
| 💬 WhatsApp AI Parser | Paste any teacher message → Claude fills in all details |
| 📒 Class Notes | Parents upload scanned notebook pages for missed classes |
| ✨ AI Note Summary | Claude Vision reads photos and bullet-points what was covered |
| 📱 Full PWA | Installs on Android + iOS, works offline |
| 🏫 Multi-class | Grades 1–12, Divisions A–D |
| 👥 Roles | Parent, Class Rep, Teacher, Admin |

---

## Deploy on Render (one service, everything together)

### Step 1 — Push to GitHub
```bash
git init && git add . && git commit -m "init"
gh repo create schooltrack --public --push
# or: git remote add origin https://github.com/you/schooltrack.git && git push -u origin main
```

### Step 2 — Create on Render
Option A — **Auto with render.yaml** (recommended):
- Go to https://render.com → New → Blueprint
- Connect your repo — Render reads `render.yaml` and creates the web service + PostgreSQL automatically

Option B — **Manual**:
- New → Web Service → connect repo
- Build Command: `chmod +x build.sh && ./build.sh`
- Start Command: `cd backend && gunicorn schooltrack.wsgi:application --bind 0.0.0.0:$PORT`
- Add a PostgreSQL database, copy the connection details to env vars

### Step 3 — Set environment variables in Render dashboard
```
ANTHROPIC_API_KEY   = sk-ant-...        ← from console.anthropic.com
ADMIN_USERNAME      = admin             ← your choice
ADMIN_PASSWORD      = yourpassword      ← your choice
ADMIN_EMAIL         = you@email.com
```
`SECRET_KEY` and all `DB_*` vars are auto-set by render.yaml.

### Step 4 — Deploy!
Your app is live at `https://schooltrack.onrender.com`

---

## Local development

### Backend (Django)
```bash
cd backend

# Install deps
pip install -r requirements.txt

# Use SQLite locally (edit settings.py temporarily):
# DATABASES = { 'default': { 'ENGINE': 'django.db.backends.sqlite3', 'NAME': BASE_DIR / 'db.sqlite3' } }

export ANTHROPIC_API_KEY=sk-ant-...
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver   # → http://localhost:8000
```

### Frontend (React)
```bash
cd frontend
npm install
npm run dev   # → http://localhost:5173  (proxies /api to :8000)
```

---

## How missed-class notes work

1. Parent opens **Notes** tab → taps 📤 Upload
2. Takes photos of child's notebook pages (up to 8)
3. Selects grade, division, subject, class date
4. Uploads — Django saves images, calls Claude Vision in background
5. Claude reads the handwritten/printed pages, returns bullet-point summary
6. Any parent filters by Grade → Date → Subject to find notes
7. 👍 Helpful votes surface the best notes to the top

---

## Roles

| Role | Can do |
|---|---|
| Parent | View, mark done, upload notes, helpful votes |
| Class Rep | All above + add/edit updates for their class |
| Teacher/Admin | Full access, manage via `/admin/` panel |

To promote a user to admin: open `https://your-app.onrender.com/admin/` → Users → select user → change Role to Admin.

---

## Project structure
```
schooltrack/
├── backend/
│   ├── apps/
│   │   ├── accounts/         # User model, auth, roles
│   │   │   └── management/commands/create_admin.py
│   │   ├── updates/          # All update types + AI parse endpoint
│   │   └── notes/            # Missed notes + Claude Vision summary
│   ├── schooltrack/          # settings, urls, wsgi
│   └── requirements.txt
├── frontend/
│   ├── public/
│   │   ├── sw.js             # Service worker (offline support)
│   │   ├── manifest.json     # PWA manifest
│   │   └── icon-*.png        # App icons
│   └── src/
│       ├── pages/            # Dashboard, Notes, Profile, Login, Register
│       ├── components/       # Layout, AddUpdateSheet, WAPasteSheet, Toast
│       ├── api/              # Axios service layer
│       └── AuthContext.jsx   # Token auth state
├── build.sh                  # Render build script
└── render.yaml               # Render deployment config
```
