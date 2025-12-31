# Still.

*A calm space for patterns and reflection.*

Still is a wellness web app designed to help users notice emotional patterns over time — without streak pressure, judgment, or forced insights.  
It prioritizes gentleness, uncertainty, and reflection over optimization.


## ✨ Why Still?

Most wellness apps push streaks, goals, and “do better” messaging.  
Still takes a different approach:

- No streaks
- No guilt
- No diagnoses
- No pressure to “improve”

Instead, it focuses on **showing up**, **noticing patterns**, and **letting meaning emerge naturally**.

> *Patterns don’t judge — they just show up.*


## 🧠 Core Features

### 🌤 Mood Check-ins
- Daily mood logging on a **1–5 scale**
- Optional tags (e.g. sleep, stress, social)
- Designed to be quick and non-intrusive

### 📈 Dashboard
- 30-day mood average
- Days logged (presence-based, not streak-based)
- Gentle copy that normalizes steady or uneven progress
- Seeded data for realistic first-time experience

### 📊 Mood Trends
- Line chart showing mood over time
- Range normalized from **1 (very low) → 5 (very good)**
- Hoverable points to view specific days

### 📝 Journaling
- Free-form journaling with optional prompts
- No minimum length
- Journaling subtly connects to insights (without pressure)

### 💡 Insights
- Evidence-based, softly grounded reflections
- Confidence indicators (low / medium / high)
- Explicit uncertainty when data is insufficient
- “Negative space” insights when no strong patterns exist
- Micro-recommendations phrased as invitations, not advice

Examples:
- *“Based on 18 check-ins over the last 30 days”*
- *“This pattern isn’t strong yet — and that’s okay.”*

### 🔁 Regenerate Insights
- Allows users to surface alternative patterns
- Never overwrites existing data
- Reduces AI “black box” anxiety with clear explanations


## 🎨 Design Philosophy

Still is intentionally:
- Soft
- Calm
- Non-clinical
- Human

Design choices include:
- Pastel color palette
- Rounded cards and spacing
- Subtle shadows for depth
- Gentle microcopy on every page

Each page includes **one emotional anchor line**, for example:
- Dashboard: *“A steady month is still progress.”*
- Check-in: *“However today felt, it’s enough to notice it.”*
- Journal: *“You don’t need to explain yourself here.”*
- Insights: *“Patterns don’t judge — they just show up.”*


## 🛠 Tech Stack

- **Next.js** (App Router)
- **React**
- **TypeScript**
- **Tailwind CSS**
- **Recharts** (for mood visualizations)
- Seeded client-side data for realistic demos


## 📂 Project Structure
```
WELLNESS-DASHBOARD/
├─ app/
│  ├─ (auth)/                     # Public authentication routes
│  │  ├─ login/
│  │  │  └─ page.tsx
│  │  ├─ register/
│  │  │  └─ page.tsx
│  │  └─ layout.tsx               # AuthShell layout
│  │
│  ├─ (app)/                      # Authenticated app shell
│  │  ├─ dashboard/
│  │  │  └─ page.tsx
│  │  ├─ checkin/
│  │  │  └─ page.tsx
│  │  ├─ journal/
│  │  │  └─ page.tsx
│  │  ├─ insights/
│  │  │  └─ page.tsx
│  │  └─ layout.tsx               # AppShell (header + nav)
│  │
│  ├─ api/                        # API routes
│  │  ├─ mood/
│  │  │  └─ route.ts
│  │  ├─ journal/
│  │  │  └─ route.ts
│  │  └─ insights/
│  │     ├─ route.ts
│  │     └─ generate/
│  │        └─ route.ts
│  │
│  ├─ globals.css                 # Global styles + theme tokens
│  ├─ layout.tsx                  # Root layout
│  └─ page.tsx                    # Landing page
│
├─ components/
│  ├─ layout/
│  │  ├─ AppShell.tsx             # Header, nav pills, page container
│  │  └─ AuthShell.tsx            # Centered auth layout
│  │
│  ├─ ui/
│  │  ├─ StillCard.tsx
│  │  ├─ StillButton.tsx
│  │  ├─ StillInput.tsx
│  │  ├─ StillTextarea.tsx
│  │  ├─ StillLabel.tsx
│  │  └─ index.ts
│  │
│  ├─ charts/
│  │  └─ MoodTrendChart.tsx
│  │
│  ├─ insights/
│  │  └─ InsightCard.tsx
│  │
│  ├─ mood/
│  │  ├─ MoodPicker.tsx
│  │  └─ TagChips.tsx
│  │
│  └─ index.ts                    # Barrel exports
│
├─ lib/
│  ├─ seed/
│  │  ├─ seedMoods.ts             # 30-day seeded mood data
│  │  └─ seedInsights.ts          # Fallback insights
│  │
│  ├─ analytics/
│  │  ├─ moodStats.ts             # averages, streaks, distribution
│  │  └─ insightLogic.ts
│  │
│  ├─ utils/
│  │  ├─ dates.ts
│  │  ├─ clamp.ts
│  │  └─ format.ts
│  │
│  └─ prisma.ts                   # Prisma client (if used)
│
├─ prisma/
│  └─ schema.prisma
│
├─ middleware.ts                  # Auth protection
├─ public/                        # (optional) icons, images
│
├─ .env
├─ .gitignore
├─ package.json
├─ package-lock.json
├─ postcss.config.js
├─ tailwind.config.ts
├─ tsconfig.json
└─ README.md

```

## 🚀 Getting Started

1. install dependencies
    > npm install

2. run development server
    > npm run dev

3. Open:
    > http://localhost:3000


## ❤️ Final Note
Still was built to feel safe, honest, and human.

It’s not about fixing yourself.
It’s about noticing — and letting that be enough.

Build By - Sai Siri Chittineni ⭐