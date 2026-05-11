# Civic Issues Platform – Architecture & Roadmap

## Project Vision
**"For the People" – Community-driven civic issue reporting and verification system**

Users report local incidents (potholes, waste, accidents, broken infrastructure) with **live photos + auto-location**, community validates via upvotes/downvotes, admins moderate and publish approved issues.

---

## Core Features (MVP)

### Phase 1: Issue Reporting & Geolocation
- ✅ Live photo capture (camera API, no gallery)
- ✅ Auto-geolocation (GPS coords captured at photo moment)
- ✅ Issue categories (pothole, waste, accident, lamppost, tree, etc.)
- ✅ Issue title + description
- ✅ Location pinned on map

### Phase 2: Community Voting
- ✅ Users upvote/downvote issues (Reddit-style)
- ✅ Vote count per issue
- ✅ Sort by relevance (trending issues)
- ✅ User reputation/karma system

### Phase 3: Admin Moderation
- ✅ Admin dashboard to review flagged issues
- ✅ Approve/reject based on votes + manual review
- ✅ Publish approved issues to public map
- ✅ Ban duplicate/spam reports

### Phase 4: Public Dashboard (Future)
- ✅ Public view of approved issues on map
- ✅ Issue status tracking (reported → verified → fixed)
- ✅ Integration with municipal authorities

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    USER DEVICES                              │
│  (Mobile browser: PWA for camera access + geolocation)       │
└─────────────────────────────────────────────────────────────┘
                           ↓
        ┌────────────────────────────────────────┐
        │  FRONTEND (Next.js + React)            │
        │  - Photo capture UI                    │
        │  - Map view (issue pins)               │
        │  - Voting interface                    │
        │  - User auth/profile                   │
        └────────────────────────────────────────┘
                           ↓
        ┌────────────────────────────────────────┐
        │  BACKEND API (Express + Node.js)       │
        │  - /api/issues (CRUD)                  │
        │  - /api/votes (upvote/downvote)        │
        │  - /api/auth (login/signup)            │
        │  - /api/admin (moderation)             │
        │  - /api/categories                     │
        │  - /api/comments                       │
        └────────────────────────────────────────┘
                           ↓
        ┌────────────────────────────────────────┐
        │  DATABASE (PostgreSQL)                 │
        │  Tables:                               │
        │  - users                               │
        │  - issues                              │
        │  - photos (S3/storage)                 │
        │  - votes                               │
        │  - admin_actions                       │
        └────────────────────────────────────────┘
```

---

## Data Models

### 1. User Model
```javascript
{
  id: UUID,
  email: string,
  username: string,
  password_hash: string,
  phone: string,
  avatar_url: string,
  karma_score: number,        // Reputation from votes
  verified_badge: boolean,    // Blue checkmark for trusted users
  role: "user" | "admin",
  created_at: timestamp,
  updated_at: timestamp
}
```

### 2. Issue Model
```javascript
{
  id: UUID,
  user_id: UUID,              // Reporter
  title: string,
  description: string,
  category: "pothole" | "waste" | "accident" | "lamppost" | "tree" | "other",
  status: "pending" | "verified" | "fixed" | "rejected",
  
  // Location
  latitude: float,
  longitude: float,
  address: string,            // Reverse geocoded
  area: string,               // Ward/zone
  
  // Photo
  photo_url: string,          // S3 URL
  photo_metadata: {
    timestamp: ISO8601,
    gps_accuracy: meters,
    device: string
  },
  
  // Voting
  upvotes: number,
  downvotes: number,
  vote_score: number,         // upvotes - downvotes
  
  // Moderation
  approved_by_admin: UUID,
  admin_notes: string,
  
  created_at: timestamp,
  updated_at: timestamp,
  resolved_at: timestamp (optional)
}
```

### 3. Vote Model
```javascript
{
  id: UUID,
  issue_id: UUID,
  user_id: UUID,
  vote_type: "up" | "down",
  created_at: timestamp
  // Unique constraint: (issue_id, user_id) – one vote per user per issue
}
```

### 4. Comment Model
```javascript
{
  id: UUID,
  issue_id: UUID,
  user_id: UUID,
  text: string,
  upvotes: number,
  created_at: timestamp,
  updated_at: timestamp
}
```

---

## API Endpoints (Backend Routes)

### Authentication
```
POST   /api/auth/signup          → Register user
POST   /api/auth/login           → Login, return JWT
POST   /api/auth/logout          → Clear session
GET    /api/auth/me              → Get current user (protected)
POST   /api/auth/refresh         → Refresh JWT token
```

### Issues (Public)
```
GET    /api/issues               → List all issues (pagination, filters)
GET    /api/issues/:id           → Get single issue details
POST   /api/issues               → Create new issue (authenticated)
GET    /api/issues/map/geojson   → Get all issues as GeoJSON for map
GET    /api/issues/trending      → Trending issues (hot right now)
GET    /api/issues/near          → Issues near user (radius query)
```

### Voting (User)
```
POST   /api/issues/:id/upvote    → Upvote an issue (authenticated)
POST   /api/issues/:id/downvote  → Downvote an issue (authenticated)
DELETE /api/issues/:id/vote      → Remove vote (authenticated)
GET    /api/issues/:id/votes     → Get vote counts
```

### Comments (Community)
```
POST   /api/issues/:id/comments  → Add comment (authenticated)
GET    /api/issues/:id/comments  → Get issue comments
DELETE /api/comments/:id         → Delete own comment (authenticated)
```

### Admin Moderation (Protected)
```
GET    /api/admin/issues         → List pending issues
POST   /api/admin/issues/:id/approve    → Approve issue
POST   /api/admin/issues/:id/reject     → Reject issue
POST   /api/admin/issues/:id/status     → Update status (fixed, etc)
GET    /api/admin/stats          → Dashboard stats
DELETE /api/admin/issues/:id     → Remove issue (spam)
```

### Categories & Metadata
```
GET    /api/categories           → List issue categories
GET    /api/areas                → List city wards/zones
GET    /api/stats                → Platform stats
```

---

## Frontend Pages (React Components)

### Public Pages
```
/                               → Home (map + top issues)
/report                         → Report issue (camera + form)
/issues                         → Browse all issues
/issues/:id                     → Issue detail + comments + votes
/trending                       → Trending issues (hot)
/map                            → Full-screen interactive map
/auth/login                     → Login page
/auth/signup                    → Signup page
/search                         → Search + filter issues
```

### User Pages (Protected)
```
/dashboard                      → My reported issues
/profile                        → User profile + karma
/my-votes                       → Issues I voted on
/notifications                  → Activity feed
```

### Admin Pages (Admin-only)
```
/admin/pending                  → Pending issues review
/admin/dashboard                → Moderation stats
/admin/users                    → User management
/admin/reports                  → Reported content
```

---

## Tech Stack Recommendation

### Frontend
- **Next.js 15** (App Router, SSR)
- **React 19** (Client components for interactivity)
- **Leaflet / Mapbox GL** (Map visualization + issue pins)
- **React Dropzone / React-Camera** (Photo capture)
- **Zustand or Context API** (State management for votes, auth)
- **TailwindCSS** (Styling, responsive design)
- **JWT** (Authentication tokens)

### Backend
- **Express.js** (API server) ← *You already have this!*
- **PostgreSQL** (Relational DB for users, issues, votes)
- **Prisma ORM** (Type-safe DB queries)
- **Multer** (Photo upload handling)
- **AWS S3 / Cloudinary** (Photo storage)
- **bcryptjs** (Password hashing)
- **jsonwebtoken** (JWT auth)
- **geolocation libraries** (PostGIS for location queries)

### Infrastructure
- **Docker** (Containerization)
- **Docker Compose** (Local dev environment)
- **PostgreSQL Docker** (Database container)
- **AWS S3** (Photo storage)
- **Vercel** (Frontend hosting, optional)
- **Railway / Render / Fly.io** (Backend hosting)

---

## Development Roadmap

### **Sprint 1: User Registration & Authentication** (Week 1-2)
- [ ] User signup/login API endpoints
- [ ] JWT token management
- [ ] Protected route middleware
- [ ] User profile page
- [ ] Password reset

### **Sprint 2: Issue Reporting & Photo Capture** (Week 3-4)
- [ ] Live camera capture (PWA camera API)
- [ ] GPS geolocation capture
- [ ] Issue form (category, description, location)
- [ ] Photo upload to S3
- [ ] Issue model + DB schema

### **Sprint 3: Map & Issue Browsing** (Week 5-6)
- [ ] Map integration (Leaflet/Mapbox)
- [ ] Issue pins on map
- [ ] Issue detail page
- [ ] Pagination & filtering
- [ ] Search functionality

### **Sprint 4: Community Voting** (Week 7-8)
- [ ] Upvote/downvote API
- [ ] Vote UI (buttons, counts)
- [ ] Vote uniqueness (one per user)
- [ ] Trending algorithm
- [ ] Comments system

### **Sprint 5: Admin Moderation Panel** (Week 9-10)
- [ ] Admin dashboard
- [ ] Pending issues review
- [ ] Approve/reject workflow
- [ ] Admin stats & analytics
- [ ] Issue status tracking

### **Sprint 6: Polish & Launch** (Week 11-12)
- [ ] Mobile responsiveness
- [ ] Performance optimization
- [ ] Error handling & validation
- [ ] Notification system
- [ ] User karma badges
- [ ] Public launch

---

## Database Schema (PostgreSQL)

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  username VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  phone VARCHAR,
  avatar_url TEXT,
  karma_score INT DEFAULT 0,
  verified_badge BOOLEAN DEFAULT FALSE,
  role VARCHAR DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Issues
CREATE TABLE issues (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  description TEXT,
  category VARCHAR NOT NULL,
  status VARCHAR DEFAULT 'pending',
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  address TEXT,
  area VARCHAR,
  photo_url TEXT NOT NULL,
  photo_timestamp TIMESTAMP,
  photo_gps_accuracy INT,
  upvotes INT DEFAULT 0,
  downvotes INT DEFAULT 0,
  approved_by_admin UUID REFERENCES users(id),
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Votes
CREATE TABLE votes (
  id UUID PRIMARY KEY,
  issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vote_type VARCHAR NOT NULL, -- 'up' or 'down'
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(issue_id, user_id)  -- One vote per user per issue
);

-- Comments
CREATE TABLE comments (
  id UUID PRIMARY KEY,
  issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  upvotes INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_issues_user_id ON issues(user_id);
CREATE INDEX idx_issues_status ON issues(status);
CREATE INDEX idx_issues_category ON issues(category);
CREATE INDEX idx_issues_coordinates ON issues(latitude, longitude);
CREATE INDEX idx_votes_issue ON votes(issue_id);
CREATE INDEX idx_votes_user ON votes(user_id);
CREATE INDEX idx_comments_issue ON comments(issue_id);
```

---

## Security & Validation

### Frontend Security
- ✅ HTTPS only (enforce in production)
- ✅ CORS configured (backend allows frontend origin)
- ✅ JWT stored in HTTPOnly cookie (not localStorage)
- ✅ Rate limiting on photo uploads (prevent spam)
- ✅ Input validation before API calls

### Backend Security
- ✅ JWT verification middleware on protected routes
- ✅ Password hashing (bcryptjs)
- ✅ SQL injection prevention (use Prisma ORM)
- ✅ Rate limiting (express-rate-limit)
- ✅ File upload validation (size, MIME type)
- ✅ Admin-only routes protected with role check
- ✅ Photo metadata validation (GPS timestamp, accuracy)

### Photo Validation
- ✅ Must be live capture (check EXIF timestamp)
- ✅ No gallery uploads (enforce via camera API)
- ✅ Geolocation must exist
- ✅ File size limit (5MB)
- ✅ Allowed formats: JPEG, PNG, WebP
- ✅ Virus scan via ClamAV or VirusTotal API

---

## Key Implementation Details

### 1. Live Photo Capture (PWA)
```javascript
// Use Web Camera API (not file picker)
<input type="file" accept="image/*" capture="environment" />

// Better: Use getUserMedia() for native camera
navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
  .then(stream => {
    // Capture frame from video stream
    // Extract GPS from device
    // Create blob → upload to backend
  })
```

### 2. Geolocation Capture
```javascript
navigator.geolocation.watchPosition(
  (position) => {
    const { latitude, longitude, accuracy } = position.coords;
    const timestamp = position.timestamp; // When location was captured
    // Store with photo
  }
);
```

### 3. Community Voting Logic
```javascript
// Vote score = upvotes - downvotes
// Trending score = upvotes + (time_decay_factor)
// User can only vote once (enforce via unique constraint)
// Upvoting user's karma increases (future: reputation system)
```

### 4. Admin Approval Flow
```
Issue Created (pending)
    ↓
Users vote (upvote/downvote)
    ↓
If upvotes > 10 OR upvotes > downvotes * 2:
    → Auto-flag for admin review
    ↓
Admin reviews:
    → Approve (publish to public map)
    → Reject (reason: duplicate, spam, fake)
    → Request more info
    ↓
Once approved:
    → Issue visible on public map
    → Users can comment
    → Track status updates
```

---

## Next Steps (Action Plan)

### **Week 1:**
1. [ ] Set up PostgreSQL database locally
2. [ ] Create Prisma schema (users, issues, votes, comments)
3. [ ] Build user authentication API (signup, login, JWT)
4. [ ] Create user model + password hashing

### **Week 2:**
1. [ ] Build issue reporting API endpoints
2. [ ] Set up photo upload (multer → S3)
3. [ ] Add geolocation capture in frontend
4. [ ] Create report issue form page

### **Week 3:**
1. [ ] Integrate Leaflet map
2. [ ] Display issues as GeoJSON
3. [ ] Add issue detail page
4. [ ] Implement pagination & filtering

### **Week 4:**
1. [ ] Build voting system (API + UI)
2. [ ] Add vote counting logic
3. [ ] Implement trending algorithm
4. [ ] Create comments feature

### **Week 5:**
1. [ ] Build admin panel dashboard
2. [ ] Create moderation interface
3. [ ] Add approval/rejection workflow
4. [ ] Set up admin-only routes

---

## File Structure (Recommended)

```
civic-platform/
├── frontend/                          # Next.js UI
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── page.js               # Home
│   │   │   ├── report/page.js        # Report issue
│   │   │   ├── issues/
│   │   │   │   ├── page.js           # Browse issues
│   │   │   │   └── [id]/page.js      # Issue detail
│   │   │   ├── map/page.js           # Full map view
│   │   │   └── trending/page.js      # Trending issues
│   │   ├── (auth)/
│   │   │   ├── login/page.js
│   │   │   └── signup/page.js
│   │   ├── (protected)/
│   │   │   ├── dashboard/page.js     # User dashboard
│   │   │   ├── profile/page.js
│   │   │   └── my-votes/page.js
│   │   ├── (admin)/
│   │   │   ├── pending/page.js
│   │   │   ├── dashboard/page.js
│   │   │   └── users/page.js
│   │   └── layout.js
│   ├── components/
│   │   ├── CameraCapture.jsx
│   │   ├── IssueMap.jsx
│   │   ├── IssueCard.jsx
│   │   ├── VotingButtons.jsx
│   │   ├── AdminPanel.jsx
│   │   └── ...
│   ├── lib/
│   │   ├── api.js                    # API client
│   │   ├── auth.js                   # Auth utils
│   │   └── hooks/
│   │       ├── useAuth.js
│   │       ├── useIssues.js
│   │       └── useVotes.js
│   └── package.json
│
├── backend/                           # Express API
│   ├── routes/
│   │   ├── auth.js
│   │   ├── issues.js
│   │   ├── votes.js
│   │   ├── comments.js
│   │   ├── admin.js
│   │   └── categories.js
│   ├── middleware/
│   │   ├── auth.js                   # JWT verification
│   │   ├── upload.js                 # Multer photo upload
│   │   ├── validation.js             # Input validation
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Issue.js
│   │   ├── Vote.js
│   │   └── Comment.js
│   ├── prisma/
│   │   ├── schema.prisma             # DB schema
│   │   └── migrations/
│   ├── server.js                     # Main app
│   ├── config.js
│   ├── package.json
│   └── docker-compose.yml
│
└── docs/
    ├── API.md
    ├── ARCHITECTURE.md
    └── DEPLOYMENT.md
```

---

## Key Considerations

### Photo Authentication
- Prevent people from uploading old photos
- Validate EXIF timestamp is recent (within minutes)
- GPS accuracy must be reasonable (< 100m)
- Device info logged for fraud detection

### Spam Prevention
- Rate limit: Max 5 issues per user per day
- Karma system: New users have lower voting power
- Auto-flag issues with > 3 downvotes
- Community reports for spam/duplicate

### Privacy
- Don't expose exact user addresses (use anonymization)
- GPS coordinates should be ±20m accurate (not exact)
- Admin can see full location, public sees street only
- User data never shared with third parties

### Scalability
- Use PostGIS for efficient geo-queries (nearest issues)
- Cache trending issues (Redis)
- CDN for photo delivery (CloudFront / Cloudinary)
- Load balancing for backend

---

## Success Metrics

✅ User engagement: Issues reported per day  
✅ Community participation: Vote/comment rate  
✅ Admin efficiency: Issues reviewed & published per day  
✅ Issue resolution: % marked as fixed  
✅ User retention: Daily/weekly active users  
✅ Platform health: Spam rate, false reports  

---

This is your roadmap. Start with **authentication** → **issue reporting** → **map viewing** → **voting** → **admin panel**.

Ready to code Phase 1?
