# Civic Issues Platform – Strategic Guide & Next Steps

## Your Big Picture Goal

```
"Your area. Your voice. Your change."

Start in Ashoknagar, scale to 100+ cities.
Empower communities to crowdsource & vote on urban issues.
Bridge citizens and government for faster problem-solving.
```

---

## Phase Overview (12 Months)

```
PHASE 1: MVP Launch (Weeks 1-8 | Jan 2026)
└─ Ashoknagar only
└─ Core features: Report, Vote, Map, Admin
└─ Target: 50 issues, 200 users
└─ Success metric: 90%+ uptime, <5s API response

PHASE 2: Regional Expansion (Q2 2026 | Feb-Apr)
└─ Add 4 more cities (Kolkata, Pune, Bengaluru, Mumbai)
└─ City-scoped analytics
└─ Government integration prep
└─ Target: 500+ issues, 5,000 users

PHASE 3: Community Features (Q3 2026 | May-Jul)
└─ Leaderboard system
└─ Badges & achievements
└─ Discussion forums
└─ Issue tracking (Reported → In Progress → Fixed)
└─ Target: 2,000+ issues, 20,000 users

PHASE 4: Scale & Integration (Q4 2026+)
└─ Mobile apps (iOS/Android)
└─ Government API integration
└─ National expansion (50+ cities)
└─ AI-powered duplicate detection
└─ Target: 100,000+ users, 1M+ issues
```

---

## YOUR 3 IMMEDIATE ACTION ITEMS

### 1. **TODAY: Review & Approve Design**

**What to do:**
- Read [CIVIC_UI_DESIGN.md](CIVIC_UI_DESIGN.md)
- Review the wireframes for each page
- Approve or request changes to:
  - Color scheme (currently: Blue #1D6CF2 + grays)
  - Typography (currently: Inter + Syne)
  - Component designs (cards, buttons, forms)

**Questions to answer:**
- [ ] Do you like the blue + white color scheme? (Can change to green, orange, etc.)
- [ ] Should we add your city's name/logo to the header?
- [ ] Any specific features to add before launch?

**Output:**
- Finalized design system approved ✓

---

### 2. **THIS WEEK: Environment & Backend Setup**

**What to do:**

#### Step 1: Create new project directory
```bash
mkdir civic-platform
cd civic-platform
git init
```

#### Step 2: Initialize backend
```bash
mkdir backend
cd backend
npm init -y
npm install express cors dotenv @prisma/client bcryptjs jsonwebtoken multer aws-sdk uuid joi express-rate-limit
npm install -D nodemon prisma
```

#### Step 3: Create `.env` file
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/civic_db
JWT_SECRET=change-this-to-random-32-char-string-XXXXXXXXXXXXXXXXXXXXXX
JWT_EXPIRY=7d
PORT=4000
NODE_ENV=development
AWS_ACCESS_KEY=your-aws-key
AWS_SECRET_KEY=your-aws-secret
AWS_S3_BUCKET=civic-platform-photos
```

#### Step 4: Initialize Prisma
```bash
npx prisma init
```

Update `prisma/.env`:
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/civic_db"
```

#### Step 5: Create basic Express server
```javascript
// backend/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(process.env.PORT || 4000, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
```

**Output:**
- Backend directory created
- Express server running on port 4000
- PostgreSQL database configured

---

### 3. **NEXT WEEK: Frontend Scaffold + First Feature**

**What to do:**

#### Step 1: Initialize Next.js
```bash
cd ..
npx create-next-app@latest frontend --typescript --tailwind
cd frontend
npm install leaflet react-leaflet zustand axios react-hook-form
```

#### Step 2: Create basic pages
```bash
mkdir -p app/(public)/{report,issues,map}
mkdir -p app/(auth)/{login,signup}
mkdir -p components
mkdir lib
```

#### Step 3: Build first feature: User Auth
- Create `/app/(auth)/login/page.js`
- Create `/app/(auth)/signup/page.js`
- Create `lib/api.js` (API client with JWT)
- Create `lib/hooks/useAuth.js` (Auth state)

#### Step 4: Test the flow
```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run dev

# Test in browser
# http://localhost:3000/signup
# http://localhost:3000/login
```

**Output:**
- Frontend running on port 3000
- Can sign up → get JWT token
- Can log in → access protected pages

---

## Development Timeline (Week-by-Week)

| Week | Backend | Frontend | Testing | Status |
|------|---------|----------|---------|--------|
| **1** | Auth API | Auth pages | Unit tests | 🚀 |
| **2** | Issue API + Photo upload | Report flow (steps 1-5) | Integration | 🚀 |
| **3** | Voting API | Issue browsing + map | E2E tests | 🚀 |
| **4** | Comments API | Issue detail + comments | Mobile UI | 🚀 |
| **5** | Admin moderation | Admin dashboard | Approval workflow | 🚀 |
| **6** | City management | City selector + stats | Multi-city testing | 🚀 |
| **7** | Polish + optimization | Mobile polish | Performance tuning | 🚀 |
| **8** | Launch prep | Final polish | Full test suite | ✅ |

---

## Key Decisions You Need to Make

### 1. **Photo Storage**
- **Option A: AWS S3** (Professional, scalable) ← Recommended
- **Option B: Cloudinary** (Easier setup, paid)
- **Option C: Local storage** (For development only)

**Action:** Choose one → I'll add the code

### 2. **Database**
- **PostgreSQL** (Recommended, already in roadmap)
- Setup: Docker (`docker run -e POSTGRES_PASSWORD=password postgres`) or managed service (Heroku, AWS RDS)

**Action:** Decide local vs. managed → I'll provide Docker setup

### 3. **Deployment (After MVP)**
- **Frontend:** Vercel (easiest for Next.js)
- **Backend:** Heroku, Railway, or AWS
- **Database:** AWS RDS or managed PostgreSQL

**Action:** I'll create docker-compose.yml for easy local dev

### 4. **Authentication Method**
- **JWT (recommended)** – What's in the roadmap
- **OAuth (Google/Phone)** – Add later

### 5. **City Launch Priority**
- **Ashoknagar first** ✓ (Confirmed)
- **Then:** Kolkata, Pune, Bengaluru, Mumbai (in order)

---

## Dependencies Checklist

### What You Need to Install Locally

```bash
# 1. Node.js & npm
# Download from https://nodejs.org/ (LTS version)
# Test: node --version && npm --version

# 2. PostgreSQL
# Option A (Docker): docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=password postgres
# Option B (Direct): Download from https://www.postgresql.org/

# 3. Git
# Download from https://git-scm.com/

# 4. VS Code (already have)

# 5. Postman or Insomnia (for API testing)
# Download from https://www.postman.com/ or https://insomnia.rest/
```

---

## File Structure After Week 1

```
civic-platform/
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env
│   ├── prisma/
│   │   └── schema.prisma
│   ├── routes/
│   │   └── auth.js
│   └── middleware/
│       └── auth.js
│
├── frontend/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.js
│   │   │   └── signup/page.js
│   │   ├── page.js
│   │   └── layout.js
│   ├── lib/
│   │   ├── api.js
│   │   └── hooks/
│   │       └── useAuth.js
│   ├── components/
│   ├── package.json
│   └── .env.local
│
├── README.md
└── .gitignore
```

---

## How to Approach Implementation

### ✅ DO THIS:
- Start with **backend first** (auth → issues → voting)
- Test each API endpoint in Postman before frontend
- Wire up frontend to working backend APIs
- Ship incrementally (auth → report → browse → vote)
- Get feedback from beta users (friends, community)

### ❌ DON'T DO THIS:
- Don't build UI before backend is ready
- Don't optimize prematurely (focus on features first)
- Don't skip testing (write simple unit tests)
- Don't hardcode API URLs (use environment variables)

---

## How to Get Help / Unblock Yourself

### Problem: "API endpoint not working"
→ Check backend logs, test with Postman, verify database connection

### Problem: "Frontend won't connect to backend"
→ Check CORS settings, verify API URL in .env.local, check network tab

### Problem: "Photo upload failing"
→ Check file size, MIME type, S3 credentials, bucket permissions

### Problem: "Database migration failed"
→ Check PostgreSQL connection, run `npx prisma db push --force-reset`

### Problem: "Need to add a new field to database"
→ Edit `prisma/schema.prisma` → Run `npx prisma migrate dev`

---

## Week 1 Concrete Tasks (Do These First)

```
□ Day 1-2:
  □ Review CIVIC_UI_DESIGN.md
  □ Approve design (or request changes)
  □ Create civic-platform/ directory
  □ Init backend project

□ Day 3-4:
  □ Set up PostgreSQL locally
  □ Create .env file
  □ Initialize Prisma
  □ Create basic Express server

□ Day 5:
  □ Build auth routes (POST /auth/signup, POST /auth/login)
  □ Test with Postman
  □ Deploy to backend running
```

---

## Week 2 Concrete Tasks

```
□ Day 1-2:
  □ Initialize Next.js frontend
  □ Build signup/login pages
  □ Connect to backend auth API

□ Day 3-4:
  □ Create Issue model in Prisma
  □ Build POST /api/issues endpoint
  □ Add photo upload handler

□ Day 5:
  □ Test issue creation in Postman
  □ Start report flow frontend component
```

---

## Success Indicators

### By End of Week 1:
✅ Backend server running and responding  
✅ PostgreSQL connected  
✅ Auth API working (signup/login)  
✅ JWT tokens being generated  

### By End of Week 2:
✅ Frontend pages loading  
✅ Can sign up from UI  
✅ Can log in from UI  
✅ Issue creation API working  

### By End of Week 4:
✅ Full report flow (5 steps) working  
✅ Can browse issues on map  
✅ Can vote on issues  

### By End of Week 8:
✅ **MVP LIVE** 🚀  
✅ Users can report issues from their phones  
✅ Community can vote + comment  
✅ Admin can moderate  
✅ Ashoknagar launch day  

---

## Post-Launch (After Week 8)

### Week 9-12: Stabilization & First Scale
- Monitor uptime & performance
- Collect user feedback
- Fix bugs
- Prepare for second city launch
- Build marketing content

### Month 3-6: Regional Expansion
- Launch in 4 more cities
- Integrate with municipal authorities
- Build mobile app
- Hit 20,000 users

### Month 6-12: National Scale
- 50+ cities
- Government partnerships
- Feature completion (leaderboards, badges, forums)
- Professional team hiring

---

## Questions to Discuss

Before starting Week 1, confirm:

1. ✅ **Design approved?** (Color scheme, layout, components)
2. ✅ **Photo storage?** (S3, Cloudinary, or local?)
3. ✅ **Database?** (PostgreSQL local or managed?)
4. ✅ **Timeline?** (Strict 8 weeks or flexible?)
5. ✅ **Team?** (Solo or hiring developers?)
6. ✅ **Marketing?** (How to recruit first 50 users in Ashoknagar?)

---

## Your Next Action

**RIGHT NOW:**
1. Read [CIVIC_UI_DESIGN.md](CIVIC_UI_DESIGN.md) ← Takes 30 min
2. Answer the 6 questions above
3. I'll provide the first backend code scaffold

**THEN:**
Start Week 1 tasks → You'll have a working auth system by Friday

---

**You've got this.** 🚀

This is a solid plan. Stick to it, ship incrementally, and you'll have a live civic platform in Ashoknagar in 8 weeks.

Let me know when you're ready to start Day 1 of Week 1, and I'll give you the exact backend code to write.
