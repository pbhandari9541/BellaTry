# BellaTry MVP Planning

## 1. Project Scope & Goals

**Core MVP Features:**
- MUA dashboard to upload/create makeup looks.
- Customer-facing try-on page (no login required).
- Booking integration (Calendly/Instagram link).

**Excluded:** Admin panels, customer accounts, payment processing.

---

## 2. System Architecture

**Frontend (Next.js):**
- `/auth` — Login/Signup (Supabase Auth)
- `/dashboard` — MUA portal to manage looks (protected)
- `/try/[slug]` — Customer try-on page (public)
- `/` — Home

**Libraries:**
- Supabase JS client (auth, storage, DB)
- TensorFlow.js + MediaPipe (face tracking/makeup rendering, post-MVP)
- React Color Picker (HEX color selection)

**Backend:**
- Supabase (existing project)
  - Tables: `muas`, `makeup_looks`
  - Storage: Supabase Storage for images

---

## 3. Workflows

### A. MUA Onboarding
- Sign up/login (Supabase Auth)
- Complete profile: username (for shareable URL), Calendly link
- Upload 3–5 looks: image + HEX colors + intensity
- Copy auto-generated try-on link to share with clients

### B. Customer Try-On
- Visit `/try/[username]`
- Upload selfie or use camera
- Apply MUA’s looks virtually (face tracking, post-MVP)
- Click "Book Now" → Redirect to MUA’s Calendly

---

## 4. Data Flow
- MUA uploads look: image → Supabase Storage, metadata → `makeup_looks`
- Customer accesses page: fetch looks by username from `muas` + `makeup_looks`
- No persistent customer data (MVP)

---

## 5. Key Technical Decisions
- Face Tracking: MediaPipe (browser-based, post-MVP)
- Makeup Rendering: TensorFlow.js (post-MVP)
- All compute client-side (no backend processing)
- Auth: Supabase with RLS for data isolation

---

## 6. Supabase Setup
- Enable Storage: `makeup-looks` bucket
- RLS: MUAs can only CRUD their own looks
- `makeup_looks` references `muas.id`
- Generate TypeScript types for frontend

---

## 7. Testing Plan
- Manual testing for MUA and customer flows
- Edge cases: unsupported browsers, slow networks

---

## 8. Deployment & Hosting
- Frontend: Vercel
- Supabase: Existing project, RLS enabled
- Domain: Custom (e.g., tryglam.com)

---

## 9. Post-MVP Roadmap
- Instagram Filters: Spark AR templates
- Analytics: Track try-on sessions
- Collaborations: Share looks with peers

---

## 10. Risks & Mitigations
| Risk | Mitigation |
|------|------------|
| Face tracking inaccuracies | Test on diverse skin tones/lighting |
| Low MUA adoption | Offer free trials, TikTok demo campaigns |
| High client-side compute | Lazy-load TF.js, optimize models |

---

## 11. Metrics for Success
- MUA Signups: 10+ paid MUAs in Month 1
- Conversion Rate: 20% of try-on sessions → bookings
- Performance: <3s load time for try-on page

---

## 12. Next Steps
- Finalize Supabase schema and RLS
- Implement upload/profile forms in dashboard
- Build public try-on page
- Integrate booking links
- Add virtual try-on (post-MVP) 