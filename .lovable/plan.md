
## Implementation Plan — Parts 2 & 3

Given the massive scope, I'll implement in priority order across multiple batches. Here's what I'll tackle and in what order:

### Batch A — High Impact, No External Dependencies
1. **2B. Optimistic UI for messages** — Immediate render with sending/retry states
2. **2D. Skeleton loading states** — Replace all spinners with skeletons
3. **3A. Quick-tap preset messages** — Scrollable emoji chips above chat input
4. **3B. Driving Mode UI** — Simplified large-touch UI when driving
5. **3G. Notification badges** — Red dots on bottom nav for unread counts
6. **3E. i18n translations** — Full multi-language support (en, ru, ka, es + fallbacks)

### Batch B — Requires Storage/DB Changes
7. **3C. Location sharing in chat** — GPS message type with mini-map card
8. **3D. Voice messages** — Hold-to-record with Supabase Storage bucket
9. **3H. Nearby Drivers list view** — Toggle between map and list

### Batch C — External APIs & Complex Features
10. **2A. PWA/Service Worker** — Offline shell caching + manifest.json (with PWA caveats in Lovable preview)
11. **2C. Lazy-load Leaflet** — Dynamic import instead of script injection
12. **2E. Virtualize messages** — react-window for 50+ messages
13. **3F. Onboarding carousel** — 3-step swipe flow
14. **3I. HOS timer** — Driving hours widget with localStorage
15. **3J. Weather alerts** — Open-Meteo API integration

### Notes
- PWA (2A) will only work in production/published builds, not in the Lovable preview
- Voice messages (3D) needs a new storage bucket migration
- Location sharing (3C) needs a message_type column on route_messages and direct_messages
- i18n (3E) touches every single page — will be done carefully
- Weather (3J) uses Open-Meteo (free, no API key)

**Shall I proceed with Batch A first?**
