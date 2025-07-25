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

---

# Development Phases

## Phase 1: Project Setup
- Choose cloud provider (Vercel for frontend, Supabase for backend)
- Create new GitHub repository
- Set up Dockerfile for backend and frontend
- Configure TypeScript and ESLint/Prettier for both frontend and backend
- Configure environment variables (.env for root, backend, frontend)
- Set up CI/CD pipeline with GitHub Actions
- Configure testing frameworks (Jest + React Testing Library for frontend, Pytest for backend)
- Set up FastAPI backend with health check endpoint
- Initialize Next.js 14 app with RSC
- Provision Supabase for auth, storage, and database

## Phase 2: Core Data & Auth Infrastructure
- Set up Supabase tables: `muas`, `makeup_looks`
- Enable Supabase Storage (makeup-looks bucket)
- Configure RLS policies for data isolation
- Generate TypeScript types from Supabase schema
- Set up Supabase client in frontend and backend
- Implement authentication (Supabase Auth) in frontend
- Add health check and environment validation endpoints

## Phase 3: MUA Dashboard & Profile
- Implement `/dashboard` page (protected route)
- Build MUA profile form (username, Calendly link)
- Implement upload form for makeup looks (image, HEX colors, intensity)
- Store images in Supabase Storage and metadata in `makeup_looks`
- Display uploaded looks in dashboard
- Add copy/shareable try-on link for each MUA
- Add/update documentation for dashboard features

## Phase 4: Customer Try-On Experience
- Implement `/try/[slug]` public page
- Fetch MUA profile and looks by slug (username)
- Add selfie upload/camera input (placeholder for MVP)
- Display available looks for try-on (UI placeholder)
- Add "Book Now" button linking to MUA’s Calendly
- Add error handling for invalid/unknown slugs
- Update documentation for customer flow

## Phase 5: Booking Integration & Polishing
- Integrate Calendly/Instagram booking links in dashboard and try-on page
- Add UI polish: loading states, error boundaries, responsive design
- Ensure all text, branding, and metadata use "BellaTry"
- Clean up any remaining "TradeAdvisor" references
- Add basic analytics hooks (for future tracking)
- Update README and feature documentation

## Phase 6: Testing, QA, and Deployment
- Manual testing of all flows (MUA onboarding, customer try-on, booking)
- Test edge cases (unsupported browsers, slow networks)
- Ensure all automated tests pass (frontend and backend)
- Deploy to staging (Vercel, Supabase)
- Verify environment variables and RLS policies in production
- Document deployment and troubleshooting steps

## Phase 7: Post-MVP Enhancements
- Plan and prioritize post-MVP features:
  - Virtual try-on with MediaPipe/TensorFlow.js
  - Instagram filter export (Spark AR)
  - Analytics dashboard for MUAs
  - Collaboration/sharing features
  - Mobile app or PWA support
- Review metrics for success and iterate

---

# Project Timeline (Estimate)
- Phase 1: 1 week
- Phase 2: 1 week
- Phase 3: 2 weeks
- Phase 4: 1 week
- Phase 5: 1 week
- Phase 6: 1 week
- Phase 7: Ongoing (post-MVP)

**Total estimated timeline: 6-7 weeks for MVP**

---

**Best Practices:**
- Follow sequential, reviewable phases (plan → branch → build/test → commit/PR → review → merge → deploy)
- Keep changes small and focused
- Update documentation and link as per project rules
- Maintain code and documentation consistency
- Avoid hardcoding values that may change in the future
- Use feature flags and robust error handling for new features 