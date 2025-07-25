# TradeAdvisor Authentication Flow & System Connections

## Overview
This document describes the authentication flows for TradeAdvisor, covering both Google OAuth and email/password scenarios. It also includes a system connection diagram showing how all major services interact.

---

## 1. Google OAuth Sign Up / Login Flow

### ASCII Diagram
```
┌────────────┐      ┌────────────┐      ┌────────────┐      ┌────────────┐
│   User     │────▶│  Frontend  │────▶│  Supabase  │────▶│   Google   │
│            │     │            │     │            │     │            │
│ Clicks     │     │ Calls      │     │ Redirects  │     │ User logs  │
│ Google     │     │ signInWith │     │ OAuth      │     │ in/consents│
│ Sign In    │     │ OAuth      │     │ OAuth      │     │            │
└────────────┘     └────────────┘     └────────────┘     └────────────┘
                                                        │            │
                                                        │ Redirects  │
                                                        │ back w/    │
                                                        │ auth code  │
                                                        └─────┬──────┘
                                                              │
                                                              ▼
┌────────────┐      ┌────────────┐      ┌────────────┐
│  Supabase  │────▶│  Frontend  │────▶│  Backend   │
│ Exchanges  │     │ Receives   │     │ Sends API  │
│ code for   │     │ session,   │     │ requests   │
│ tokens,    │     │ stores     │     │ with JWT   │
│ creates    │     │ session    │     │            │
│ user if    │     │            │     │            │
│ new        │     │            │     │            │
└────────────┘     └────────────┘     └────────────┘
```

---

## 2. Email/Password Sign Up & Login Flow

### ASCII Diagram
```
┌────────────┐      ┌────────────┐      ┌────────────┐
│   User     │────▶│  Frontend  │────▶│  Supabase  │
│ Enters     │     │ Calls      │     │ Sends      │
│ email/pw   │     │ signUp()   │     │ confirmation│
└────────────┘     └────────────┘     └────────────┘
                                         │
                                         ▼
                                 ┌────────────┐
                                 │   User     │
                                 │  (Email)   │
                                 └────────────┘
                                         │
                                         ▼
┌────────────┐      ┌────────────┐      ┌────────────┐
│   User     │────▶│  Supabase  │────▶│  Frontend  │
│ Clicks     │     │ Verifies   │     │ Receives   │
│ link in    │     │ link,      │     │ session    │
│ email      │     │ creates    │     │ token      │
└────────────┘     │ session    │     └────────────┘
                   └────────────┘
                                         │
                                         ▼
                                 ┌────────────┐
                                 │  Frontend  │
                                 │  Stores    │
                                 │  session   │
                                 └────────────┘
                                         │
                                         ▼
┌────────────┐      ┌────────────┐      ┌────────────┐
│   User     │────▶│  Frontend  │────▶│  Supabase  │
│ Logs in    │     │ Calls      │     │ Returns    │
│ with email │     │ signIn()   │     │ session    │
│ & password │     │            │     │ token      │
└────────────┘     └────────────┘     └────────────┘
                                         │
                                         ▼
                                 ┌────────────┐
                                 │  Frontend  │
                                 │  Sends API │
                                 │  requests  │
                                 └────────────┘
                                         │
                                         ▼
                                 ┌────────────┐
                                 │  Backend   │
                                 │  Verifies  │
                                 │  JWT w/    │
                                 │  Supabase  │
                                 └────────────┘
```

---

## 3. Password Reset Flow

### ASCII Diagram
```
┌────────────┐      ┌────────────┐      ┌────────────┐
│   User     │────▶│  Frontend  │────▶│  Supabase  │
│ Requests   │     │ Calls      │     │ Sends      │
│ password   │     │ resetPwd() │     │ reset email│
│ reset      │     │            │     │            │
└────────────┘     └────────────┘     └────────────┘
                                         │
                                         ▼
                                 ┌────────────┐
                                 │   User     │
                                 │  (Email)   │
                                 └────────────┘
                                         │
                                         ▼
┌────────────┐      ┌────────────┐      ┌────────────┐
│   User     │────▶│  Supabase  │────▶│  Frontend  │
│ Clicks     │     │ Verifies   │     │ Receives   │
│ reset link │     │ link,      │     │ session    │
│ in email   │     │ sets new   │     │ token      │
└────────────┘     │ password   │     └────────────┘
                   └────────────┘
                                         │
                                         ▼
                                 ┌────────────┐
                                 │  Frontend  │
                                 │  Stores    │
                                 │  session   │
                                 └────────────┘
```

---

## 4. System Connection Diagram

### ASCII Diagram
```
┌────────────┐         ┌────────────┐         ┌────────────┐
│  Frontend  │───────▶│  Backend   │───────▶│  Supabase  │
│ (Next.js)  │        │ (FastAPI)  │        │ (Auth, DB) │
└────────────┘        └────────────┘        └────────────┘
      │                     │                     │
      │                     │                     │
      │                     │                     │
      │                     │                     │
      │                     │                     │
      │                     │                     │
      │                     │                     │
      │                     │                     │
      │                     │                     │
      ▼                     │                     │
┌────────────┐              │                     │
│  OpenAI    │◀─────────────┘                     │
└────────────┘                                    │
      │                                          │
      ▼                                          │
┌────────────┐                                   │
│ Pinecone   │◀──────────────────────────────────┘
└────────────┘
      │
      ▼
┌────────────┐
│AlphaVantage│
└────────────┘
      │
      ▼
┌────────────┐
│  Other     │
│APIs (SEC,  │
│Reddit, etc)│
└────────────┘
```

---

## 5. Configuration Notes
- **OAuth (Google):**
  - Set up in Supabase dashboard (Auth → Providers → Google)
  - Google Cloud Console: Authorized redirect URI must match Supabase callback
- **Email/Password:**
  - SMTP must be configured in Supabase for email confirmations and password resets
- **CORS:**
  - Backend must allow frontend origin via env var (e.g., `NEXT_PUBLIC_APP_URL`)
- **Environment Variables:**
  - Frontend: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_KEY`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_APP_URL`
  - Backend: `SUPABASE_URL`, `SUPABASE_KEY`, `NEXT_PUBLIC_APP_URL`, etc.

---

## 6. See Also
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [OpenAI API Docs](https://platform.openai.com/docs/api-reference)
- [Pinecone Docs](https://docs.pinecone.io/docs/overview)
- [Alpha Vantage Docs](https://www.alphavantage.co/documentation/)
