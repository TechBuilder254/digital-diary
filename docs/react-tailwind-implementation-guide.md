# Digital Diary React + Tailwind Implementation Guide

Implementation notes for reproducing the current Digital Diary experience with React components and Tailwind CSS utility classes. This guide is meant for engineers working inside Cursor who need a pixel-faithful rebuild using the existing tech stack.

---

## 1. Assumptions & Tech Context
- Frontend stack: React (with React Router), TypeScript strict mode, TailwindCSS, Axios API client.
- Existing styles assume Tailwind config (`frontend/tailwind.config.js`) plus CSS tokens in `frontend/src/styles/design-system.css`.
- Gradients, shadows, and animation utilities follow Tailwind defaults with a few custom classes (`animate-float`, `animate-bounce-slow`) already defined globally.

### Shared Dependencies
- `react-router-dom` for routing between pages.
- `axios` instance (`frontend/src/config/axios.ts`) for REST calls to backend services.
- Icons from `react-icons/fa`.
- Custom helpers: `AIChatWidget`, `AIAssistant`, `Modal`, `FloatingActionButton`, `RichTextEditor`, `useScrollToTop`.

### Layout Shell
- Authenticated views render inside `Layout/Layout.tsx` which provides sidebar/top bar. Landing page hides layout via `landing-page-active` class toggles in `useEffect`.

---

## 2. Design System Snapshot

| Token | Value / Usage |
| --- | --- |
| **Primary Gradient** | `from-indigo-600 via-purple-600 to-pink-600` |
| **Secondary Gradient** | `from-blue-500 to-purple-600`, `from-green-500 to-teal-600`, etc. (see component arrays) |
| **Surface Colors** | `bg-white`, `bg-white/80`, `bg-gray-50`, `bg-gray-900` |
| **Typography** | Headings `font-extrabold text-4xl+`; body `text-gray-600` |
| **Spacing Rhythm** | `space-y-3` on stacked layouts, `gap-3/4/8` in grids |
| **Radii** | Rounded corners `rounded-lg`, `rounded-xl`, `rounded-2xl` across cards |
| **Shadow** | `shadow-lg`, `shadow-xl`, hover states add `hover:shadow-2xl` |

### Breakpoints
- Tailwind defaults: `sm` (640px), `md` (768px), `lg` (1024px).
- Key layout changes:
  - Landing hero switches from column to two-column grid at `lg`.
  - Navigation menu collapses to hamburger below `md`.
  - Dashboard stats grid expands to 5 columns at `lg`.

### Motion & Feedback
- Hover scaling via `hover:scale-105`, `group-hover`.
- Custom float/bounce animations for hero visuals and emoji cues (`animate-bounce`, custom `animate-bounce-slow`).
- Scroll reveal uses `data-scroll-reveal` attributes: elements start hidden via Tailwind classes (`opacity-0 translate-y-6`) and transition to visible inside `useEffect`.

### Accessibility Notes
- Buttons with icons include text or `aria-label`.
- Modal overlays trap focus visually; Escape closes via keyboard handler.
- Color contrast uses deep gradients on light text and vice versa (meets WCAG AA).
- Landing nav links use semantic `<a>` tags; call-to-actions use `<button>`.

---

## 3. Application Architecture

```
frontend/src/
├─ App.tsx           // routing definitions
├─ components/
│  ├─ LandingPage.tsx
│  ├─ Dashboard.tsx
│  └─ Entries.tsx
├─ config/axios.ts   // axios instance
├─ Layout/Layout.tsx // shell for authenticated pages
└─ … other feature components (Tasks, Notes, etc.)
```

### Routing Overview (`App.tsx`)
- `/` → `LandingPage`
- `/login`, `/register` → `auth` components
- Authenticated routes wrap via `Layout`:
  - `/dashboard` → `Dashboard`
  - `/entries` → `Entries`
  - Additional routes for `/tasks`, `/todo`, `/notes`, `/mood-tracker`.

### Shared Tailwind Patterns
- Root wrappers use `space-y-*` to maintain vertical rhythm.
- Cards combine `bg-white`, gradient accents, and shadow transitions.
- CTAs rely on gradient backgrounds with `relative` overlay for hover intensification.

---

## 4. Landing Page (`LandingPage.tsx`)

Purpose: Marketing funnel showcasing platform features with scroll-based reveals and CTA to login.

### Component Layout

```
LandingPage
├─ NotificationBanner (state: isNotificationVisible)
├─ StickyNav (state: isMobileMenuOpen)
├─ Hero section
│  ├─ Text column with CTA buttons
│  └─ Animated diary visual
├─ FeaturesGrid (maps over features array)
├─ Benefits split section
├─ Testimonials cards
├─ Gradient CTA banner
├─ Footer
└─ AIChatWidget
```

### ASCII Wireframe

```
┌───────────────────────────────────────────────┐
│ Notification: "Meet Samiya AI" [×]            │
├─ Nav ────────────────┬───────────────┬───────┤
│ Logo                 │ Links         │ CTA   │
├───────────────────────────────────────────────┤
│ Hero:                                                   │
│  [Badge]                                               │
│  Headline + subtext       |   Floating diary card      │
│  [Get Started] [Explore]  |   Animated badges          │
├───────────────────────────────────────────────┤
│ Features (3x2 cards with gradients/icons)             │
├───────────────────────────────────────────────┤
│ Benefits split: checklist + three mini cards          │
├───────────────────────────────────────────────┤
│ Testimonials (3 cards, quotes, star ratings)          │
├───────────────────────────────────────────────┤
│ CTA Banner: gradient background, button               │
├───────────────────────────────────────────────┤
│ Footer: description | feature links | support links    │
└───────────────────────────────────────────────┘
```

### Tailwind Highlights
- Root: `min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50`.
- Sticky nav: `sticky top-0 bg-white/80 backdrop-blur-md shadow-sm`.
- Hero text: `text-5xl md:text-6xl lg:text-7xl font-extrabold`, CTA buttons use gradient backgrounds with `group-hover` overlays.
- Feature cards: `bg-white p-8 rounded-2xl shadow-lg hover:scale-105 border border-gray-100`.
- CTA section: `bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white`.
- Footer: `bg-gray-900 text-white`, grid columns with `md:grid-cols-3`.

### Interactions
- `useEffect` toggles `landing-page-active` class on `<body>` to hide dashboard layout chrome.
- Scroll handler updates `.scroll-progress-bar` width and applies reveal classes.
- CTA button triggers `navigate('/login')`.
- Mobile nav toggles with animated hamburger lines using conditional Tailwind classes.

---

## 5. Dashboard (`Dashboard.tsx`)

Purpose: Authenticated overview combining productivity stats, AI assistant teaser, and quick navigation.

### Component Layout

```
Dashboard
├─ Gradient Welcome Card (username pulled from localStorage)
├─ AI Assistant Teaser Card (opens modal)
├─ Conditional AIAssistant Modal
├─ StatCards Grid (derived totals)
├─ QuickActions Grid (links)
└─ RecentActivity Card (list or empty state)
```

### ASCII Wireframe

```
┌───────────────────────────────────────────────┐
│ Gradient Welcome: "Welcome back, {username}"  │
├───────────────────────────────────────────────┤
│ [Samiya AI teaser card → modal]              │
├───────────────────────────────────────────────┤
│ Stats Grid (Total Tasks, Completed, Notes,   │
│             Diary Entries, Mood Entries)     │
├───────────────────────────────────────────────┤
│ Quick Actions (3 columns of links w/ icons)  │
├───────────────────────────────────────────────┤
│ Recent Activity card                         │
│   - Loading spinner or list of entries       │
│   - Empty state fallback                     │
└───────────────────────────────────────────────┘
```

### Tailwind Highlights
- Container: `space-y-3` to keep tight vertical rhythm.
- Welcome card: `bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl p-4 text-white shadow-lg`.
- AI teaser: `hover:scale-[1.02]` with gradient background and `group` transitions.
- Stat cards: tinted backgrounds (`bg-blue-50`, `bg-green-50`, etc.) and gradient icon tiles `w-8 h-8 bg-gradient-to-r ...`.
- Quick actions: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3`, each link uses `hover:scale-[1.02]` and `group-hover` arrow shift.
- Recent activity: `bg-white rounded-xl p-6 shadow-md` with conditional rendering for spinner, list, or empty message.

### State & Data Flow
- `useEffect` loads username from `localStorage`.
- `fetchDashboardStats` performs `Promise.allSettled` on `/tasks`, `/todo`, `/notes`, `/entries`, `/moods`.
- Derived stats: total/completed counts, today’s mood detection via date comparison, recent activity arrays.
- AI modal toggled by `showAIModal`; overlay uses `fixed inset-0 bg-black/50`.
- Escape key handler closes modal; body scroll locked while modal open.

---

## 6. Diary Entries (`Entries.tsx`)

Purpose: CRUD interface for diary entries with search, detailed modal, and floating add button.

### Component Layout

```
Entries
├─ Gradient header with totals (Total Entries, Days Written)
├─ Search bar (with suggestions dropdown)
├─ Add Entry Modal (RichTextEditor)
├─ Entries list (cards mapping filteredEntries)
│  └─ Each card: index badge, preview, edit/delete buttons
├─ Entry Detail Modal (view/edit modes)
└─ FloatingActionButton (add entry)
```

### ASCII Wireframe

```
┌───────────────────────────────────────────────┐
│ Gradient Header: stats                        │
├───────────────────────────────────────────────┤
│ Search [icon][input________________________________]│
│ └ Suggestions dropdown (optional)             │
├──────────────── Entries List ─────────────────┤
│ ┌ Card #1 ──────────────────────────────────┐ │
│ │ Title                                     │ │
│ │ preview lines…                            │ │
│ │ Date/time                                 │ │
│ │ [Edit] [Delete]                           │ │
│ └───────────────────────────────────────────┘ │
│ ...                                          │
├───────────────────────────────────────────────┤
│ Floating Action Button (bottom-right)        │
└───────────────────────────────────────────────┘
```

### Tailwind Highlights
- Header: `bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl p-4 text-white`.
- Search input: `pl-10 pr-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-indigo-100`.
- Suggestions dropdown: `absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border`.
- Entry cards: `bg-white rounded-lg p-3 shadow-md hover:shadow-xl border border-gray-100`.
- Detail modal: `fixed inset-0 bg-black/50 flex justify-center`, modal container `bg-white rounded-xl max-w-4xl w-full max-h-[95vh] overflow-hidden`.
- Buttons: gradient backgrounds for primary actions, neutral for cancel.
- Floating button: handled by `FloatingActionButton` with variant-specific gradient styling.

### State & Logic
- `entries`, `filteredEntries`, `searchQuery`, `suggestions` manage search flow.
- `fetchEntries` GET `/entries` and populate state.
- Add/edit/delete functions call POST/PUT/DELETE endpoints (include `user_id` from `localStorage` on create).
- `formatContent` converts plain text to safe HTML (handles numbered/bulleted lists).
- `selectedEntry` toggles detail modal; `editingId` switches between read-only and edit mode inside modal.
- `useScrollToTop` hook ensures view resets when component mounts.

---

## 7. Telemetry & Analytics (Suggested)
- Track page views: landing vs dashboard via analytics service (e.g., `analytics.track('page_view', { page: 'dashboard' })` on mount).
- Key interactions:
  - CTA click: `analytics.track('cta_click', { location: 'hero_get_started' })`.
  - Entry created/deleted events.
  - AI assistant modal open/close.

Include pseudocode in actual components if integrating analytics:

```ts
useEffect(() => {
  analytics.track('page_view', { page: 'dashboard' });
}, []);
```

---

## 8. Testing Recommendations
- **Unit Tests** (React Testing Library)
  - Render each page component, assert presence of key sections (hero heading, stat cards, entry cards).
  - Mock Axios responses for dashboard and entries to verify conditional rendering states.
- **Integration Tests**
  - Playwright scenario: login → dashboard loads stats → navigate to entries → create entry.
- **Accessibility Checks**
  - `@testing-library/jest-dom` with `jest-axe` for landing and dashboard.
  - Manual keyboard traversal through modals, nav, and entry cards (tab order should follow DOM).

---

## 9. Implementation Checklist
1. Configure routing so `/`, `/dashboard`, `/entries` map to described components.
2. Ensure Tailwind config is loaded (import `index.css` with `@tailwind` directives).
3. Copy JSX structures preserving Tailwind classes for visual fidelity.
4. Wire Axios instance for API calls; handle errors with user-friendly alerts/toasts.
5. Import `AIChatWidget`, `AIAssistant`, `Modal`, `FloatingActionButton`, `RichTextEditor` where needed.
6. Add `useEffect` scroll reveal logic in landing page and ensure cleanup on unmount.
7. Confirm responsive behavior at `sm`, `md`, `lg`; adjust grid columns as specified.
8. Test modals for keyboard/ESC handling; ensure background scroll locking.
9. Connect analytics hooks if required by product spec.

Completion of these steps should reproduce the current production experience using React and TailwindCSS inside Cursor.

---

## 10. Reference Components
- `frontend/src/components/LandingPage.tsx`
- `frontend/src/components/Dashboard.tsx`
- `frontend/src/components/Entries.tsx`
- Supporting utilities:
  - `frontend/src/components/AIChatWidget.tsx`
  - `frontend/src/components/AIAssistant.tsx`
  - `frontend/src/components/Modal.tsx`
  - `frontend/src/components/FloatingActionButton.tsx`
  - `frontend/src/components/RichTextEditor.tsx`

Use this document as the blueprint when recreating or refactoring the experience in React + Tailwind.






