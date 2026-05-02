# Civic Issues Platform – Complete UI/UX Design System

## Design Philosophy

**"Your area. Your voice. Your change."**

Inspired by ForThePeople.in's transparency mission + Reddit's community voting + Google Maps' intuitiveness.

- **Clean & trustworthy** – Government integration potential
- **Mobile-first** – Primary use case is on-the-go reporting
- **Community-driven** – Voting/validation is core
- **Local-focused** – City/ward/area granularity
- **Fast & frictionless** – Report in 10 seconds

---

## Color Palette

```
Primary:    #1D6CF2 (Trust blue – ForThePeople.in inspired)
Success:    #0F9D58 (Green – issues resolved)
Warning:    #F57C00 (Orange – needs attention)
Danger:     #D32F2F (Red – urgent/severe)
Neutral:    #FAFAFA (Light gray – backgrounds)
Dark:       #212121 (Dark gray – text)
```

### Status Colors (Issues)
- 🔴 **Pending** → #F57C00 (Orange) – Awaiting votes
- 🟡 **Verified** → #1D6CF2 (Blue) – Community confirmed
- 🟢 **Fixed** → #0F9D58 (Green) – Resolved
- ⚫ **Rejected** → #9E9E9E (Gray) – Spam/duplicate
- 🔵 **In Progress** → #2196F3 (Light blue) – Authority responding

---

## Typography

```
Font Family:  Inter (Google Fonts) + Syne (Headlines)
             Similar to ForThePeople.in's clean, modern approach

Headlines:   Syne Bold, 24px-48px
Body:        Inter Regular, 14px-16px
Captions:    Inter Regular, 12px, #666
Button Text: Inter SemiBold, 14px
```

---

## Layout Structure

### 1. Homepage (Mobile-First, Desktop-Optimized)

```
┌─────────────────────────────────────────┐
│      ☰  Civic Issues  🏠 📍 👤        │ ← Header (sticky)
├─────────────────────────────────────────┤
│                                         │
│   Your Area, Your Voice, Your Change  │ ← Hero section
│                                         │
│  [🏙️ Ashoknagar ▼]  [📍 Near me]      │ ← City/location selector
│                                         │
├─────────────────────────────────────────┤
│  ⚡ TRENDING THIS WEEK                  │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────────────────────────┐  │
│  │ 🕳️ Major Pothole on MG Road      │  │
│  │ ↑ 234  ↓ 12  💬 28               │  │
│  │ 📍 MG Road, Ward 5               │  │
│  │ 🕐 2 hours ago                    │  │
│  └──────────────────────────────────┘  │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │ 🌳 Tree Fallen on Tech Park Ave   │  │
│  │ ↑ 198  ↓ 5  💬 15                │  │
│  │ 📍 Tech Park Ave, Ward 3         │  │
│  │ 🕐 4 hours ago                    │  │
│  └──────────────────────────────────┘  │
│                                         │
│  [View all issues →]                   │
│                                         │
├─────────────────────────────────────────┤
│       [📸 REPORT ISSUE] ← Primary CTA  │
└─────────────────────────────────────────┘
```

### 2. Report Issue Page (5-Step Flow)

```
STEP 1: CAMERA CAPTURE
┌─────────────────────────────────────────┐
│      📸 Take Photo of the Issue         │
├─────────────────────────────────────────┤
│                                         │
│        ┌──────────────────┐            │
│        │  📹 CAMERA VIEW  │            │
│        │                  │            │
│        │     [SNAP]       │            │
│        │                  │            │
│        └──────────────────┘            │
│                                         │
│  ✓ We'll auto-capture your location    │
│  ✓ Photo must be live (not from gallery)
│                                         │
│              [NEXT →]                  │
└─────────────────────────────────────────┘

STEP 2: LOCATION CONFIRMATION
┌─────────────────────────────────────────┐
│      📍 Confirm Your Location          │
├─────────────────────────────────────────┤
│                                         │
│         ┌─────────────────┐            │
│         │   MAP PREVIEW   │            │
│         │                 │            │
│         │   Pinned here ❌ │            │
│         │                 │            │
│         └─────────────────┘            │
│                                         │
│  Address: Tech Park Avenue, Ward 3     │
│  Accuracy: ±15m                        │
│                                         │
│  ☐ Adjust location on map              │
│                                         │
│    [← BACK]  [NEXT →]                  │
└─────────────────────────────────────────┘

STEP 3: ISSUE CATEGORY & DETAILS
┌─────────────────────────────────────────┐
│    🏷️ What's the Issue?                │
├─────────────────────────────────────────┤
│                                         │
│  Category: [🕳️ Pothole ▼]             │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 🕳️ Pothole                       │   │
│  │ 🗑️ Waste / Garbage               │   │
│  │ 🚨 Accident / Debris              │   │
│  │ 🌳 Fallen Tree                    │   │
│  │ 💡 Broken Lamppost                │   │
│  │ 🔧 Damaged Street Sign            │   │
│  │ 💧 Water Leak / Flooding          │   │
│  │ 📞 Other (specify)                │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Title: [Huge pothole near market...] │
│                                         │
│  Description:                          │
│  [Rain water accumulating, traffic...] │
│                                         │
│  Severity:                             │
│  ⚪ Low  🟡 Medium  ⚠️ High  🔴 Critical│
│                                         │
│    [← BACK]  [NEXT →]                  │
└─────────────────────────────────────────┘

STEP 4: PREVIEW & CONFIRM
┌─────────────────────────────────────────┐
│    ✓ Review Before Publishing          │
├─────────────────────────────────────────┤
│                                         │
│  📸 Photo:        ┌─────────────────┐  │
│                   │   [PREVIEW]     │  │
│                   └─────────────────┘  │
│                                         │
│  🏷️ Category:  🕳️ Pothole              │
│  📍 Location:  Tech Park Ave, Ward 3   │
│  ⚠️ Severity:  High                     │
│  📝 Title:     Huge pothole near...    │
│                                         │
│  ☑️ I confirm this is accurate & real  │
│                                         │
│    [← BACK]  [PUBLISH ✓]               │
└─────────────────────────────────────────┘

STEP 5: SUCCESS
┌─────────────────────────────────────────┐
│         ✅ Issue Published!             │
├─────────────────────────────────────────┤
│                                         │
│    Thank you for making a difference   │
│                                         │
│    Your issue is now live on the map   │
│    Other users can verify with votes   │
│                                         │
│  📊 Issue #4827                        │
│  🆙 0 upvotes  🆙 0 downvotes         │
│                                         │
│         [View on Map] [Home]           │
└─────────────────────────────────────────┘
```

### 3. Issues Map View (Main Dashboard)

```
DESKTOP LAYOUT
┌──────────────────────────────────────────────────┐
│  ☰  Civic Issues Platform  🏠 📍 👤 ⚙️         │
├──────────────────────────────────────────────────┤
│  [Ashoknagar ▼] [All Categories ▼] [Sort ▼]    │
├──────────────┬──────────────────────────────────┤
│              │                                  │
│  FILTERS     │     🗺️ INTERACTIVE MAP          │
│  ────────    │                                  │
│              │    ┌──────────────────────────┐ │
│  📍 All      │    │  ✓ 🕳️ Potholes (45)      │ │
│  🕳️ Potholes │    │  ✓ 🗑️ Waste (12)        │ │
│  🗑️ Waste    │    │  ✓ 🌳 Trees (8)         │ │
│  🚨 Accidents│    │  ✓ 💡 Lampposts (5)     │ │
│  🌳 Trees    │    │                          │ │
│  💡 Lamps    │    │      🔴  🔵  🟡          │ │
│  💧 Water    │    │    🔴🔴    🟡 🔵        │ │
│              │    │  🔴      🔵              │ │
│  Sort By:    │    │    🟢        🔴          │ │
│  ⭕ Trending │    │                          │ │
│  🆕 Newest   │    │    [+ zoom] [- zoom]     │ │
│  🔥 Popular  │    │                          │ │
│              │    └──────────────────────────┘ │
│              │                                  │
│  ISSUES      │  [🔴 Pothole on MG Rd]         │
│  ────────    │  ↑ 234  ↓ 12  💬 28            │
│              │  Verified • 2h ago              │
│  ┌────────┐  │                                  │
│  │🔴 MG Rd│  │  [View Details]  [Vote]        │
│  │234 ups │  │                                  │
│  └────────┘  │                                  │
│              │                                  │
│  ┌────────┐  │                                  │
│  │🟡Tree  │  │                                  │
│  │198 ups │  │                                  │
│  └────────┘  │                                  │
│              │                                  │
└──────────────┴──────────────────────────────────┘

MOBILE LAYOUT (STACKED)
┌──────────────────────────────────┐
│  ☰ Civic Issues  📍  👤         │
├──────────────────────────────────┤
│  [Ashoknagar ▼]  [Filters ▼]    │
├──────────────────────────────────┤
│                                  │
│   ┌──────────────────────────┐   │
│   │                          │   │
│   │   🗺️ INTERACTIVE MAP     │   │
│   │                          │   │
│   │   🔴  🔵  🟡            │   │
│   │ 🔴🔴    🟡 🔵          │   │
│   │   🟢        🔴          │   │
│   │                          │   │
│   │   [+ zoom] [- zoom]     │   │
│   │                          │   │
│   └──────────────────────────┘   │
│                                  │
│   [REPORT ISSUE] ← Always visible│
│                                  │
├──────────────────────────────────┤
│   TRENDING THIS WEEK             │
├──────────────────────────────────┤
│                                  │
│  ┌──────────────────────────┐    │
│  │🔴 Pothole on MG Road    │    │
│  │↑ 234  ↓ 12  💬 28       │    │
│  │Verified • 2h ago         │    │
│  │[View →]                  │    │
│  └──────────────────────────┘    │
│                                  │
│  ┌──────────────────────────┐    │
│  │🟡 Tree on Tech Park Ave  │    │
│  │↑ 198  ↓ 5   💬 15        │    │
│  │Verified • 4h ago         │    │
│  │[View →]                  │    │
│  └──────────────────────────┘    │
│                                  │
│           [Show More]            │
│                                  │
└──────────────────────────────────┘
```

### 4. Issue Detail Page

```
┌──────────────────────────────────────────┐
│  ← Issues   [Share] [Report]             │
├──────────────────────────────────────────┤
│                                          │
│    ┌──────────────────────────────────┐  │
│    │                                  │  │
│    │   [📸 PHOTO OF ISSUE]            │  │
│    │                                  │  │
│    │   🕳️ POTHOLE                     │  │
│    │                                  │  │
│    └──────────────────────────────────┘  │
│                                          │
│  Major Pothole on MG Road                │
│                                          │
│  Status: 🔵 VERIFIED                    │
│  Category: 🕳️ Pothole                   │
│  Severity: ⚠️ HIGH                      │
│  Posted by: @cityuser123 (🌟 Level 3)   │
│  📍 MG Road, Ward 5, Ashoknagar        │
│  🕐 2 hours ago                         │
│  📊 Issue #4827                         │
│                                          │
├──────────────────────────────────────────┤
│  COMMUNITY VERDICT                       │
├──────────────────────────────────────────┤
│                                          │
│  👍 234  👎 12  💬 28                    │
│                                          │
│  [👍 UPVOTE]  [👎 DOWNVOTE] [Share]    │
│                                          │
├──────────────────────────────────────────┤
│  DETAILS                                 │
├──────────────────────────────────────────┤
│                                          │
│  Description:                            │
│  "Large pothole causing water to pool.   │
│   Dangerous for two-wheelers. Needs      │
│   immediate filling."                    │
│                                          │
│  Photo Metadata:                         │
│  📸 Taken: 2 hours ago                  │
│  📍 GPS Accuracy: ±12m                  │
│  🔗 Phone: Verified                     │
│                                          │
├──────────────────────────────────────────┤
│  COMMENTS (28)                           │
├──────────────────────────────────────────┤
│                                          │
│  @traffic_cop (Admin)                   │
│  "👷 Our team is on it. Will fix by EOD"│
│  👍 45  💬 3    🕐 1h ago                │
│                                          │
│  @roadster99                             │
│  "Can confirm, almost fell yesterday!"   │
│  👍 12  💬 1    🕐 45m ago               │
│                                          │
│  @saferoads                              │
│  "Please share on Ward 5 residents group"│
│  👍 8   💬 2    🕐 30m ago               │
│                                          │
│  [Load More Comments]                    │
│                                          │
│  [Write a comment...]                    │
│                                          │
└──────────────────────────────────────────┘
```

### 5. Admin Moderation Panel

```
ADMIN DASHBOARD (Desktop View)
┌──────────────────────────────────────────────────────┐
│  [Home] [Pending] [Approved] [Rejected] [Analytics] │
├──────────────────────────────────────────────────────┤
│                                                      │
│  PENDING REVIEW (12 issues)                         │
│  ────────────────────────────                       │
│                                                      │
│  ┌─────────────────────────────────────────────┐    │
│  │ 🕳️ [Pothole on Tech Park Ave]               │    │
│  │ Reported by: @user123 (Level 1)             │    │
│  │ 📍 Tech Park Ave, Ward 3                    │    │
│  │ ↑ 45  ↓ 3  💬 8                             │    │
│  │ Status: Auto-flagged (upvotes > 10)         │    │
│  │ 🕐 Reported: 1 hour ago                     │    │
│  │                                              │    │
│  │ Photo Verification: ✓ Valid (real-time GPS) │    │
│  │ Community Consensus: ✓ Positive (93% up)    │    │
│  │ Duplicate Check: ✓ Unique (not a repeat)    │    │
│  │                                              │    │
│  │ [View Full Details]                         │    │
│  │                                              │    │
│  │ Admin Notes: [_____________________]         │    │
│  │                                              │    │
│  │ [❌ REJECT] [⏳ HOLD] [✅ APPROVE]          │    │
│  └─────────────────────────────────────────────┘    │
│                                                      │
│  ┌─────────────────────────────────────────────┐    │
│  │ 🗑️ [Garbage pile outside market]            │    │
│  │ Reported by: @civicuser (Level 0)           │    │
│  │ 📍 Main Market Square, Ward 2               │    │
│  │ ↑ 2   ↓ 12  💬 1                            │    │
│  │ Status: Manual review needed                │    │
│  │ 🕐 Reported: 3 hours ago                    │    │
│  │                                              │    │
│  │ Photo Verification: ⚠️ Unclear (low light)  │    │
│  │ Community Consensus: ✗ Negative (15% up)    │    │
│  │ Duplicate Check: ? Similar to #4612         │    │
│  │                                              │    │
│  │ [View Full Details]                         │    │
│  │                                              │    │
│  │ Admin Notes: [_____________________]         │    │
│  │                                              │    │
│  │ [❌ REJECT] [⏳ HOLD] [✅ APPROVE]          │    │
│  └─────────────────────────────────────────────┘    │
│                                                      │
│  [Load More]                                        │
│                                                      │
└──────────────────────────────────────────────────────┘

ADMIN ANALYTICS
┌──────────────────────────────────────────────────────┐
│  📊 PLATFORM ANALYTICS - ASHOKNAGAR (This Week)     │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Total Issues: 87  |  Pending: 12  |  Approved: 63 │
│  Rejected: 12     |  Verification Rate: 72%         │
│                                                      │
│  📈 Issues by Category:                             │
│  🕳️  Potholes: 32 (37%)                            │
│  🗑️  Waste: 18 (21%)                               │
│  🌳  Trees: 14 (16%)                               │
│  💡  Lampposts: 12 (14%)                           │
│  🚨  Accidents: 6 (7%)                             │
│  💧  Water: 5 (6%)                                 │
│                                                      │
│  👤 Top Contributors:                               │
│  1. @civichero (24 reports, 89% verified)          │
│  2. @roadwatch (19 reports, 84% verified)          │
│  3. @cityvoice (16 reports, 81% verified)          │
│                                                      │
│  ✅ Resolution Rate: 58% (marked as fixed)         │
│  ⏱️ Avg Review Time: 4.2 hours                     │
│  👍 Community Agreement: 84%                        │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### 6. User Profile & Reputation

```
┌──────────────────────────────────────────┐
│  ← Profile                   [Edit]      │
├──────────────────────────────────────────┤
│                                          │
│           👤                             │
│      [AVATAR]                            │
│                                          │
│     @cityuser123                         │
│     Mumbai, Ashoknagar                   │
│                                          │
│     🌟 Level 3 • Citizen (500 points)   │
│                                          │
│     "Reporting issues to fix my city"    │
│                                          │
├──────────────────────────────────────────┤
│  STATISTICS                              │
├──────────────────────────────────────────┤
│                                          │
│  Issues Reported: 14                    │
│  Helpful Votes: 287                     │
│  Verified Rate: 86% (12/14)             │
│  Badges Earned: 🏆 3                    │
│                                          │
├──────────────────────────────────────────┤
│  REPUTATION LEVELS                       │
├──────────────────────────────────────────┤
│                                          │
│  🌟⭐⭐⭐ Level 3 (500 points)           │
│  Next: Level 4 @ 1000 points             │
│                                          │
│  Progress: ████████░░░░░░ (50%)         │
│                                          │
│  Level 3 Perks:                         │
│  ✓ Issues auto-verified if highly voted │
│  ✓ Can edit own issues                  │
│  ✓ Early access to new features         │
│                                          │
├──────────────────────────────────────────┤
│  MY ACTIVITY                             │
├──────────────────────────────────────────┤
│                                          │
│  Recent Issues:                         │
│  • Pothole on MG Road (34 upvotes) ✅   │
│  • Tree blocking sign (198 upvotes) ✅  │
│  • Water leak outside market (12 ups) ⏳ │
│                                          │
│  [View All Issues]                      │
│                                          │
│  [Logout]                                │
│                                          │
└──────────────────────────────────────────┘
```

---

## City Selector (Multi-City Expansion)

### Phase 1: Single City (MVP)
```
┌──────────────────────────────┐
│  🏙️ Ashoknagar             │
│  West Bengal, India          │
│                              │
│  Active Issues: 87           │
│  Community Members: 234      │
│                              │
└──────────────────────────────┘
```

### Phase 2: Regional Expansion (Q2 2026)
```
┌────────────────────────────────────────────┐
│  Select Your City:                         │
├────────────────────────────────────────────┤
│                                            │
│  🟢 LIVE CITIES (10)                      │
│                                            │
│  🏙️ Ashoknagar (West Bengal)              │
│     Active Issues: 87 | Users: 234        │
│                                            │
│  🏙️ Kolkata (West Bengal)                 │
│     Active Issues: 156 | Users: 512       │
│                                            │
│  🏙️ Pune (Maharashtra)                    │
│     Active Issues: 203 | Users: 789       │
│                                            │
│  🏙️ Bengaluru (Karnataka)                 │
│     Active Issues: 412 | Users: 1,234     │
│                                            │
│  🏙️ Mumbai (Maharashtra)                  │
│     Active Issues: 567 | Users: 2,134     │
│                                            │
│  [More Cities →]                           │
│                                            │
├────────────────────────────────────────────┤
│  📝 COMING SOON (5)                       │
│                                            │
│  ⏳ Delhi  |  ⏳ Hyderabad  |  ⏳ Chennai │
│  ⏳ Jaipur  |  ⏳ Gurgaon                  │
│                                            │
│  [Vote for Next City →]                   │
│                                            │
└────────────────────────────────────────────┘
```

### Phase 3: National Scale (Q4 2026+)
- Map view showing all cities
- Cross-city analytics dashboard
- Mobile app with OS-level push notifications

---

## Component Library (Reusable)

### Issue Card Component
```jsx
<IssueCard
  id="4827"
  category="pothole"
  title="Major Pothole on MG Road"
  location={{ address: "MG Road, Ward 5", lat: 22.83, lng: 88.63 }}
  upvotes={234}
  downvotes={12}
  comments={28}
  status="verified"
  timeAgo="2 hours ago"
  reporterAvatar="/avatars/user123.jpg"
  reporterName="@cityuser123"
  onUpvote={() => {}}
  onDownvote={() => {}}
  onClick={() => {}}
/>
```

### Voting Button Component
```jsx
<VotingButtons
  issueId="4827"
  upvotes={234}
  downvotes={12}
  userVote={null}  // null, "up", or "down"
  onVote={(type) => {}}
/>
```

### Map Pin Component
```jsx
<MapPin
  id="4827"
  category="pothole"
  upvotes={234}
  status="verified"
  lat={22.83}
  lng={88.63}
  onClick={() => {}}
/>
```

---

## Responsive Breakpoints

```
Mobile:   320px - 768px  (Default: Mobile-first design)
Tablet:   768px - 1024px (Optimized tablet layout)
Desktop:  1024px+        (Full dashboard experience)
```

---

## Navigation Structure (Multi-City)

```
Global Header (Sticky)
├── Logo + City Selector
├── Search (Global issues)
├── Notifications Bell
├── User Avatar/Menu
└── Dark Mode Toggle

Main Navigation
├── 🏠 Home
├── 🗺️ Map View
├── 📢 Trending Issues
├── 📝 My Reports
├── 👤 Profile
├── 🏆 Leaderboard (new)
├── 💬 Discussion Forum (future)
└── ⚙️ Settings

Admin Navigation (Admin-only)
├── 📋 Pending Review
├── ✅ Approved Issues
├── ❌ Rejected Issues
├── 📊 Analytics Dashboard
├── 👥 Users Management
└── 🔧 Settings
```

---

## Mobile-First Design Principles

### Bottom Sheet / Drawer
- Report button always visible (bottom-right floating)
- Issue details slide up from bottom
- Smooth animations for engagement

### Touch-Friendly
- Buttons: min 44px × 44px
- Spacing: 16px minimum between clickables
- Gestures: Swipe left to vote down, right to vote up

### Camera-Ready
- Take photo: Full-screen camera
- Confirm location: Map overlay with drag-to-adjust
- GPS accuracy indicator: Visual feedback

---

## Information Architecture (Multi-City)

```
Level 1: Global (All Cities)
├── Home Dashboard
├── Search (Global)
├── Leaderboard
└── Explore Cities Map

Level 2: City (Selected City)
├── City Dashboard
├── Issues Map
├── Trending Issues
├── City Stats
└── City Community

Level 3: Issue (Single Issue)
├── Issue Details
├── Photo + Metadata
├── Community Votes
└── Comments Thread

Level 4: User (Profile)
├── User Stats
├── User Reports
├── Reputation
└── Activity Log
```

---

## Onboarding Flow (First-Time Users)

```
1. Welcome Screen
   "Your City. Your Voice. Your Change. 🌍"
   [Get Started]

2. Location Permission
   "Where are you? We need your location to report issues."
   [Allow] [Skip]

3. Verification Method
   "How should we verify you?"
   [Phone Number] [Email] [Social Login]

4. First Report
   "Let's report your first issue!"
   [📸 Start Reporting] [View Examples]

5. Community Guidelines
   "Keep the community safe & honest"
   - Be truthful
   - No duplicate reports
   - Respectful comments
   [I Agree]

6. Dashboard
   "You're all set! Start exploring."
   [View Issues] [Report Issue] [My Profile]
```

---

## Success Metrics (UI/UX)

- **Onboarding Completion**: > 85% finish flow
- **Issue Report Time**: < 60 seconds (5 steps)
- **Mobile Traffic**: > 85% (primarily mobile users)
- **Vote Engagement**: > 40% vote on issues they see
- **Comment Rate**: > 15% add comments
- **Repeat Users**: > 60% return within 7 days
- **Admin Review Time**: < 4 hours (target)

---

## Design Files & Resources

- **Figma**: [Civic Platform UI Kit](https://figma.com/civic-platform)
- **Component Library**: Storybook for React components
- **Icons**: Heroicons + custom civic icons
- **Fonts**: Inter + Syne (Google Fonts)
- **Color Tokens**: CSS variables for theming

---

## Implementation Priority

### MVP (Phase 1 - 8 weeks)
- ✅ Homepage + city selector
- ✅ Report issue flow (5 steps)
- ✅ Map view with issue pins
- ✅ Issue detail page
- ✅ Voting system (UI)
- ✅ Basic admin dashboard
- ✅ User profiles

### Phase 2 (Q2 2026 - Multi-City)
- [ ] City selector expansion
- [ ] Cross-city search
- [ ] City-specific analytics
- [ ] Admin city management
- [ ] City onboarding

### Phase 3 (Q3 2026 - Community)
- [ ] Comments & threads
- [ ] Leaderboard system
- [ ] User badges & achievements
- [ ] Discussion forum
- [ ] Integration with municipal APIs

### Phase 4 (Q4 2026 - Growth)
- [ ] Mobile app (iOS/Android)
- [ ] Email notifications
- [ ] Integration with Google Maps
- [ ] API for government agencies
- [ ] 50+ cities live

---

## Key UI/UX Decisions

1. **Mobile-First**: Designed for on-the-go reporting via camera
2. **Community-Centric**: Voting + comments are main engagement
3. **Trust & Transparency**: Show photo verification, GPS accuracy, admin actions
4. **Frictionless**: Report an issue in < 60 seconds
5. **Scalable**: City selector designed for 100+ cities
6. **Admin-Empowered**: Clear moderation interface with automation
7. **Gamified**: Reputation levels encourage quality reporting

---

This is your complete UI/UX design system. Ready to build the frontend? 🚀
