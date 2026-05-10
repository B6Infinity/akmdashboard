# Civic Issues Platform – Implementation Roadmap (8-Week Sprint)

## Project Structure (Frontend + Backend)

```
civic-platform/
├── frontend/                          # Next.js 15 App
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── layout.js
│   │   │   ├── page.js               # Home (map + trending)
│   │   │   ├── report/
│   │   │   │   ├── page.js           # Report flow (5 steps)
│   │   │   │   ├── camera/page.js    # Photo capture
│   │   │   │   ├── location/page.js  # GPS confirmation
│   │   │   │   ├── details/page.js   # Category + description
│   │   │   │   ├── preview/page.js   # Review before publish
│   │   │   │   └── success/page.js   # Confirmation
│   │   │   ├── issues/
│   │   │   │   ├── page.js           # Browse all issues
│   │   │   │   └── [id]/page.js      # Issue detail
│   │   │   ├── map/page.js           # Full-screen map
│   │   │   ├── trending/page.js      # Trending issues
│   │   │   ├── [city]/page.js        # City dashboard
│   │   │   ├── search/page.js        # Search results
│   │   │   ├── login/page.js
│   │   │   └── signup/page.js
│   │   ├── (protected)/
│   │   │   ├── dashboard/page.js     # My issues
│   │   │   ├── profile/page.js
│   │   │   └── my-votes/page.js
│   │   ├── (admin)/
│   │   │   ├── layout.js
│   │   │   ├── pending/page.js       # Pending review
│   │   │   ├── dashboard/page.js     # Analytics
│   │   │   └── users/page.js
│   │   └── layout.js                 # Root layout
│   │
│   ├── components/
│   │   ├── CameraCapture.jsx         # Live photo capture
│   │   ├── LocationMap.jsx           # Confirm location
│   │   ├── IssueCard.jsx             # Issue card (reusable)
│   │   ├── IssueMap.jsx              # Leaflet map with pins
│   │   ├── VotingButtons.jsx         # Upvote/downvote
│   │   ├── CommentThread.jsx         # Comments section
│   │   ├── AdminReviewCard.jsx       # Admin moderation
│   │   ├── CategorySelector.jsx      # Issue category picker
│   │   ├── CitySelector.jsx          # City switcher
│   │   ├── Navbar.jsx                # Top navigation
│   │   ├── Sidebar.jsx               # Desktop sidebar
│   │   ├── MobileNav.jsx             # Mobile bottom nav
│   │   ├── LoadingSpinner.jsx
│   │   ├── Modal.jsx
│   │   └── Toast.jsx                 # Notifications
│   │
│   ├── lib/
│   │   ├── api.js                    # API client methods
│   │   ├── auth.js                   # Auth utilities
│   │   ├── storage.js                # LocalStorage helpers
│   │   ├── geo.js                    # Geolocation helpers
│   │   ├── validators.js             # Input validation
│   │   ├── constants.js              # Categories, statuses
│   │   └── hooks/
│   │       ├── useAuth.js
│   │       ├── useIssues.js
│   │       ├── useVotes.js
│   │       ├── useGeoLocation.js
│   │       ├── useCity.js
│   │       └── useCamera.js
│   │
│   ├── styles/
│   │   ├── globals.css               # Global + CSS variables
│   │   ├── components.css
│   │   ├── mobile.css
│   │   └── animations.css
│   │
│   ├── public/
│   │   ├── icons/                    # Category icons
│   │   └── images/
│   │
│   └── package.json
│
└── backend/                           # Express API
    ├── routes/
    │   ├── auth.js                   # Login, signup, JWT
    │   ├── issues.js                 # Create, get, update issues
    │   ├── votes.js                  # Upvote, downvote
    │   ├── comments.js               # Comments CRUD
    │   ├── photos.js                 # Photo upload to S3
    │   ├── admin.js                  # Moderation endpoints
    │   ├── cities.js                 # City management
    │   ├── users.js                  # User profile
    │   └── categories.js             # Categories list
    │
    ├── middleware/
    │   ├── auth.js                   # JWT verification
    │   ├── upload.js                 # Multer photo handler
    │   ├── validation.js             # Input validation
    │   ├── errorHandler.js           # Error handling
    │   └── rateLimiter.js            # Rate limiting
    │
    ├── models/
    │   ├── User.js                   # User model
    │   ├── Issue.js                  # Issue model
    │   ├── Vote.js                   # Vote model
    │   ├── Comment.js                # Comment model
    │   └── City.js                   # City model
    │
    ├── prisma/
    │   ├── schema.prisma             # DB schema
    │   └── seed.js                   # Seed initial data
    │
    ├── utils/
    │   ├── jwt.js                    # JWT creation/verification
    │   ├── s3.js                     # AWS S3 upload
    │   ├── email.js                  # Email notifications (future)
    │   └── geolocation.js            # Geo-queries
    │
    ├── server.js                     # Express app entry
    ├── config.js                     # Environment config
    ├── package.json
    ├── .env.example
    └── docker-compose.yml            # PostgreSQL + backend
```

---

## Week-by-Week Implementation Plan

### **WEEK 1: Backend Setup + Auth**

#### Day 1-2: Database & User Model
```sql
-- Backend Task: Prisma schema
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR UNIQUE NOT NULL,
  username VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  phone VARCHAR,
  karma_score INT DEFAULT 0,
  role VARCHAR DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE cities (
  id UUID PRIMARY KEY,
  name VARCHAR UNIQUE NOT NULL,
  state VARCHAR NOT NULL,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Backend Tasks:**
- [ ] Initialize Prisma
- [ ] Create User model in `prisma/schema.prisma`
- [ ] Create City model
- [ ] Run migrations
- [ ] Create seed script (populate cities)

#### Day 3-4: User Auth API
**Backend Tasks:**
- [ ] `POST /api/auth/signup` – Register user
- [ ] `POST /api/auth/login` – Return JWT
- [ ] `GET /api/auth/me` (protected) – Get current user
- [ ] JWT middleware (`middleware/auth.js`)
- [ ] Password hashing with bcrypt
- [ ] Add `.env` with JWT_SECRET

**Testing:**
```bash
# Test signup
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","username":"testuser","password":"test123"}'

# Test login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"test123"}'
```

#### Day 5: Frontend Auth UI
**Frontend Tasks:**
- [ ] Create `app/(public)/signup/page.js` – Signup form
- [ ] Create `app/(public)/login/page.js` – Login form
- [ ] Create `lib/hooks/useAuth.js` – Auth state hook
- [ ] Create `lib/api.js` – API client with JWT headers
- [ ] Add login/signup routes to `/login`, `/signup`
- [ ] Protected route wrapper component

**Components:**
```jsx
// app/(public)/signup/page.js
import SignupForm from '@/components/SignupForm';

export default function SignupPage() {
  return <SignupForm />;
}
```

---

### **WEEK 2: Issue Reporting Backend**

#### Day 1-2: Issue Model + API
**Backend Tasks:**

```sql
CREATE TABLE issues (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  description TEXT,
  category VARCHAR NOT NULL,
  status VARCHAR DEFAULT 'pending',
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  address TEXT,
  city_id UUID REFERENCES cities(id),
  photo_url TEXT NOT NULL,
  photo_timestamp TIMESTAMP,
  photo_gps_accuracy INT,
  upvotes INT DEFAULT 0,
  downvotes INT DEFAULT 0,
  approved_by_admin UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE votes (
  id UUID PRIMARY KEY,
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  vote_type VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(issue_id, user_id)
);

CREATE TABLE comments (
  id UUID PRIMARY KEY,
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  upvotes INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

- [ ] Create Issue, Vote, Comment models in Prisma
- [ ] Set up AWS S3 for photo storage (or Cloudinary)
- [ ] Create `routes/issues.js`
- [ ] Implement `POST /api/issues` – Create issue with photo upload
- [ ] Implement `GET /api/issues` – List issues (paginated, filtered)
- [ ] Implement `GET /api/issues/:id` – Get single issue
- [ ] Add geolocation validation (GPS accuracy, timestamp)

**API Endpoints:**
```javascript
// POST /api/issues
// Body: { title, description, category, latitude, longitude, 
//         photo (FormData), photometadata }
// Returns: { id, status: "pending", ... }

// GET /api/issues?city=ashoknagar&category=pothole&page=1
// Returns: { items: [...], total, page }

// GET /api/issues/:id
// Returns: { id, title, ..., votes: { up, down } }
```

#### Day 3-4: Photo Upload Handler
**Backend Tasks:**
- [ ] Set up Multer middleware (`middleware/upload.js`)
- [ ] Integrate S3 upload (or Cloudinary API)
- [ ] Validate photo: MIME type, size (< 5MB)
- [ ] Extract EXIF metadata (timestamp, GPS if available)
- [ ] Validate GPS timestamp is recent (within last hour)
- [ ] Error handling for invalid photos

```javascript
// middleware/upload.js
const multer = require('multer');
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      return cb(new Error('Invalid file type'));
    }
    cb(null, true);
  }
});

module.exports = upload;
```

#### Day 5: Voting API
**Backend Tasks:**
- [ ] `POST /api/issues/:id/upvote` – Add upvote
- [ ] `POST /api/issues/:id/downvote` – Add downvote
- [ ] `DELETE /api/issues/:id/vote` – Remove vote
- [ ] Enforce unique vote per user (database constraint)
- [ ] Update vote counts + karma score
- [ ] Trigger auto-admin-review if upvotes > 10

---

### **WEEK 3: Frontend Report Flow + Map**

#### Day 1-2: Photo Capture Component
**Frontend Tasks:**
- [ ] Create `components/CameraCapture.jsx` – Live camera via `getUserMedia()`
- [ ] Create `components/LocationMap.jsx` – GPS + map confirmation
- [ ] Create `lib/hooks/useCamera.js` – Camera state management
- [ ] Create `lib/hooks/useGeoLocation.js` – GPS capture

**Components:**
```jsx
// components/CameraCapture.jsx
import { useRef, useState } from 'react';

export default function CameraCapture({ onCapture }) {
  const videoRef = useRef(null);
  
  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    });
    videoRef.current.srcObject = stream;
  };

  const capturePhoto = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0);
    canvas.toBlob(blob => onCapture(blob));
  };

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline />
      <button onClick={capturePhoto}>📸 SNAP</button>
    </div>
  );
}
```

#### Day 3-4: Report Flow Pages
**Frontend Tasks:**
- [ ] Create `app/(public)/report/page.js` – Main report page (router)
- [ ] Create `app/(public)/report/camera/page.js` – Step 1: Camera
- [ ] Create `app/(public)/report/location/page.js` – Step 2: Location
- [ ] Create `app/(public)/report/details/page.js` – Step 3: Category + description
- [ ] Create `app/(public)/report/preview/page.js` – Step 4: Review
- [ ] Create `app/(public)/report/success/page.js` – Step 5: Confirmation
- [ ] Create multi-step form state with Zustand or Context

```jsx
// app/(public)/report/page.js
'use client';

import { useState } from 'react';
import CameraCapture from '@/components/CameraCapture';
import LocationMap from '@/components/LocationMap';

export default function ReportFlow() {
  const [step, setStep] = useState(1); // 1-5
  const [formData, setFormData] = useState({});

  return (
    <div>
      {step === 1 && <CameraCapture onCapture={...} />}
      {step === 2 && <LocationMap onConfirm={...} />}
      {step === 3 && <CategoryForm onSubmit={...} />}
      {/* ... etc */}
    </div>
  );
}
```

#### Day 5: Map Integration
**Frontend Tasks:**
- [ ] Create `components/IssueMap.jsx` – Leaflet map with issue pins
- [ ] Create `app/(public)/map/page.js` – Full-screen map view
- [ ] Add geolocation display (live user position)
- [ ] Add pin colors by status (pending, verified, fixed)
- [ ] Add click handlers on pins → navigate to issue detail

---

### **WEEK 4: Issue Browsing + Voting UI**

#### Day 1-2: Issue List & Detail Pages
**Frontend Tasks:**
- [ ] Create `app/(public)/issues/page.js` – Browse all issues
- [ ] Create `app/(public)/issues/[id]/page.js` – Issue detail
- [ ] Create `components/IssueCard.jsx` – Reusable card
- [ ] Create `components/VotingButtons.jsx` – Upvote/downvote buttons
- [ ] Add filtering: by category, status, date, distance
- [ ] Add pagination

```jsx
// app/(public)/issues/[id]/page.js
'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import IssueDetail from '@/components/IssueDetail';

export default function IssuePage() {
  const { id } = useParams();
  const [issue, setIssue] = useState(null);

  useEffect(() => {
    fetch(`/api/issues/${id}`)
      .then(r => r.json())
      .then(setIssue);
  }, [id]);

  return issue ? <IssueDetail issue={issue} /> : <div>Loading...</div>;
}
```

#### Day 3-4: Voting Functionality
**Frontend Tasks:**
- [ ] Wire up upvote button → `POST /api/issues/:id/upvote`
- [ ] Wire up downvote button → `POST /api/issues/:id/downvote`
- [ ] Show vote counts in real-time
- [ ] Disable vote if already voted (or allow toggle)
- [ ] Show user karma increase on vote
- [ ] Add loading states

#### Day 5: Comments System
**Frontend Tasks:**
- [ ] Create `components/CommentThread.jsx` – Comments section
- [ ] Backend: `POST /api/issues/:id/comments` – Add comment
- [ ] Backend: `GET /api/issues/:id/comments` – List comments
- [ ] Frontend: Add comment form to issue detail
- [ ] Load and display comments

---

### **WEEK 5: Admin Panel**

#### Day 1-2: Admin Routes + Authentication
**Backend Tasks:**
- [ ] Create `routes/admin.js`
- [ ] Add `role: 'admin'` check middleware
- [ ] `GET /api/admin/issues` – List pending issues
- [ ] `POST /api/admin/issues/:id/approve` – Approve issue
- [ ] `POST /api/admin/issues/:id/reject` – Reject issue
- [ ] `POST /api/admin/issues/:id/status` – Update issue status

**Frontend Tasks:**
- [ ] Create `(admin)` layout with admin guard
- [ ] Add admin role to useAuth hook
- [ ] Create `app/(admin)/layout.js` – Admin layout
- [ ] Create `app/(admin)/pending/page.js` – Pending review queue

#### Day 3-4: Admin Dashboard
**Frontend Tasks:**
- [ ] Create `components/AdminReviewCard.jsx` – Moderation card
- [ ] Create `app/(admin)/dashboard/page.js` – Analytics
- [ ] Show: Total issues, approval rate, avg review time
- [ ] Add filtering: By status, category, approval rate
- [ ] Add auto-approve logic (if upvotes > 10 AND upvotes/downvotes > 2)

```jsx
// components/AdminReviewCard.jsx
export default function AdminReviewCard({ issue, onApprove, onReject }) {
  return (
    <div className="review-card">
      <img src={issue.photo_url} alt="Issue" />
      <h2>{issue.title}</h2>
      <p>👍 {issue.upvotes}  👎 {issue.downvotes}</p>
      <p>Community Consensus: {Math.round((issue.upvotes / (issue.upvotes + issue.downvotes)) * 100)}% upvotes</p>
      
      <button onClick={() => onApprove(issue.id)}>✅ APPROVE</button>
      <button onClick={() => onReject(issue.id)}>❌ REJECT</button>
    </div>
  );
}
```

#### Day 5: Admin Stats & Analytics
**Frontend Tasks:**
- [ ] Create `app/(admin)/dashboard/page.js` with charts
- [ ] Display: Total issues, categories breakdown, top contributors
- [ ] Display: Approval rate, avg review time, spam rate
- [ ] Use Chart.js or Recharts for visualizations

---

### **WEEK 6: User Profile + City Selector**

#### Day 1-2: User Profile
**Frontend Tasks:**
- [ ] Create `app/(protected)/profile/page.js` – User profile
- [ ] Show: User stats (reports, upvotes, karma)
- [ ] Show: Reputation level + badges
- [ ] Show: Recent issues reported
- [ ] Add edit profile endpoint
- [ ] Add logout functionality

**Backend Tasks:**
- [ ] `GET /api/users/:id` – Get user profile
- [ ] `PUT /api/users/:id` – Update profile

#### Day 3-4: City Selector & Multi-City Support
**Frontend Tasks:**
- [ ] Create `components/CitySelector.jsx` – City switcher dropdown
- [ ] Create `app/(public)/[city]/page.js` – City-scoped dashboard
- [ ] Add city parameter to all issue queries
- [ ] Update map to show only current city's issues
- [ ] Create city listing page (all active cities)

**Backend Tasks:**
- [ ] `GET /api/cities` – List all cities
- [ ] `GET /api/cities/:id` – Get city details
- [ ] `GET /api/issues?city=ashoknagar` – Filter by city

#### Day 5: City Stats & Analytics
**Backend Tasks:**
- [ ] `GET /api/cities/:id/stats` – City-level analytics
- [ ] Count issues by category per city
- [ ] Show trending issues per city
- [ ] Show top contributors per city

---

### **WEEK 7-8: Testing, Optimization, Polish**

#### Week 7: Testing & Bug Fixes
- [ ] Unit tests for auth (Jest)
- [ ] Integration tests for issue API (Supertest)
- [ ] E2E tests for report flow (Cypress)
- [ ] Fix UI/UX issues from user testing
- [ ] Mobile responsiveness polish
- [ ] Performance optimization (lazy loading, caching)

#### Week 8: Launch Preparation
- [ ] Security audit
- [ ] Database backup strategy
- [ ] Monitoring setup (error tracking)
- [ ] Documentation
- [ ] Launch communication plan

---

## Technology Stack Details

### Frontend

**Dependencies to Install:**
```bash
npm install next react react-dom
npm install leaflet react-leaflet
npm install zustand                    # State management
npm install axios                      # HTTP client
npm install react-hook-form            # Form handling
npm install zod                        # Validation
npm install @heroicons/react           # Icons
npm install clsx tailwindcss           # Styling
npm install date-fns                   # Date formatting
npm install recharts                   # Charts
npm install react-loading-skeleton     # Loading skeleton
```

**Dev Dependencies:**
```bash
npm install -D jest @testing-library/react
npm install -D cypress
npm install -D tailwindcss postcss autoprefixer
npm install -D prettier eslint
```

### Backend

**Dependencies to Install:**
```bash
npm install express cors dotenv
npm install @prisma/client
npm install bcryptjs jsonwebtoken
npm install multer aws-sdk            # Photo upload
npm install axios                      # HTTP requests
npm install express-rate-limit         # Rate limiting
npm install uuid                       # ID generation
npm install joi                        # Validation
npm install nodemon -D                 # Dev mode
```

---

## Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/civic-db
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRY=7d
PORT=4000
AWS_ACCESS_KEY=xxx
AWS_SECRET_KEY=xxx
AWS_REGION=us-east-1
AWS_S3_BUCKET=civic-platform-photos
NODE_ENV=development
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_MAPBOX_TOKEN=xxx
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=xxx
```

---

## Database Initialization

```bash
# Backend setup
cd backend
npm install
npx prisma init
npx prisma db push          # Create tables
npx prisma db seed          # Add test cities
```

---

## Launch Checklist

- [ ] All endpoints tested (Postman/Insomnia)
- [ ] Frontend/backend connected
- [ ] Auth flow works (signup → login → protected routes)
- [ ] Photo upload to S3 works
- [ ] Voting system functional
- [ ] Admin approval workflow tested
- [ ] Mobile responsiveness verified
- [ ] Error handling covers edge cases
- [ ] Rate limiting enabled
- [ ] Database backups scheduled
- [ ] Monitoring/logging configured
- [ ] Security headers added
- [ ] HTTPS enforced
- [ ] Documentation complete

---

## Success Metrics (End of Week 8)

✅ MVP launched with:
- User authentication (signup/login)
- Issue reporting with live photo + GPS
- Map view with issue pins
- Community voting system
- Issue detail pages
- Admin moderation panel
- User profiles
- City selector
- Mobile-responsive design
- 50+ issues reported
- 200+ community votes
- 90%+ uptime

---

This roadmap is your step-by-step blueprint. Start with **Week 1** tomorrow. 🚀
