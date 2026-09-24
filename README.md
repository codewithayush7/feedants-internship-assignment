# Feedants Competition Details Full-Stack Module

A production-grade, highly scalable full-stack module for the **Feedants Competition Details Screen** built with **React Native (Expo + TypeScript)**, **Node.js + Express (TypeScript)**, and **MongoDB (Mongoose)** with transactional concurrency and an ordered state machine.

Visual design faithfully reproduces [`reference/Objective_Page.png`](reference/Objective_Page.png), and all business requirements adhere strictly to [`reference/Feedants_Full_Stack_Development_Internship_Technical_Assignment.pdf`](reference/Feedants_Full_Stack_Development_Internship_Technical_Assignment.pdf).

---

## Table of Contents
1. [Project Overview & Objective](#1-project-overview--objective)
2. [Technology Stack](#2-technology-stack)
3. [Architecture & Repository Structure](#3-architecture--repository-structure)
4. [Prerequisites & MongoDB Setup](#4-prerequisites--mongodb-setup)
   - [MongoDB Transaction & Replica-Set Requirement](#mongodb-transaction--replica-set-requirement)
   - [MongoDB Atlas Setup](#mongodb-atlas-setup)
   - [Automated Test Environment](#automated-test-environment)
5. [Environment Variables](#5-environment-variables)
6. [Quickstart Guide](#6-quickstart-guide)
   - [Backend Setup & Seeding](#backend-setup--seeding)
   - [Mobile Setup (Expo & Web)](#mobile-setup-expo--web)
   - [Automated Tests](#running-automated-tests)
7. [API Endpoints](#7-api-endpoints)
8. [Demo Users & Evaluator Toolbar](#8-demo-users--evaluator-toolbar)
9. [Competition Lifecycle State Machine](#9-competition-lifecycle-state-machine)
10. [Registration Concurrency Strategy](#10-registration-concurrency-strategy)
11. [Submission Flow](#11-submission-flow)
12. [Validation & Business Rules](#12-validation--business-rules)
13. [Edge Cases Handled](#13-edge-cases-handled)
14. [Key Assumptions](#14-key-assumptions)
15. [Major Technical Decisions](#15-major-technical-decisions)
16. [Trade-offs Considered](#16-trade-offs-considered)
17. [Current Limitations](#17-current-limitations)
18. [Production Improvements](#18-production-improvements)

---

## 1. Project Overview & Objective

The objective of this assignment is to build a functional, production-ready full-stack module for the **Feedants Competition Details Screen**. Rather than simply producing a static UI mockup, this implementation provides an end-to-end dynamic architecture where:
- All competition details, financial figures, important milestones, rewards, and capacity metrics are server-authoritative and served through RESTful APIs backed by MongoDB.
- User participation states (unregistered, registered, submitted) and spot capacity dynamically adjust with ACID-compliant concurrency protection under flash registration load.
- The UI matches the design specification in `reference/Objective_Page.png` using genuine React Native components and cross-platform support via Expo.

---

## 2. Technology Stack

- **Frontend**: **React Native** via **Expo (SDK 52)** with strict **TypeScript**.
  - Built with genuine React Native primitives (`View`, `Text`, `TouchableOpacity`, `ScrollView`, `Modal`, `StyleSheet`).
  - Supports iOS, Android, and Web (`@expo/metro-runtime`, `react-native-web`) for responsive, immediate browser-based review and mobile screen recording.
  - Interactive components: Live ticking countdown timer, bilingual support (ENG / हिंदी), video preview modal, tabbed description with collapsible accordion, and contextual action buttons.
  - Zero hardcoded figures: prize pool, entry fee, remaining spots, dates, rewards, and tabs are 100% server-driven.
- **Backend**: **Node.js** + **Express.js** written in strict **TypeScript** (`ts-node-dev` for development, `tsc` for production build).
  - Clean MVC modular architecture: dedicated models, controllers, services, routes, and centralized error handling.
  - Server-authoritative state engine deriving competition lifecycle states chronologically.
- **Database**: **MongoDB** with **Mongoose**.
  - Multi-document transactions (`session.withTransaction`) enforcing atomic spot reservations.
  - Compound unique indexes guaranteeing zero duplicate registrations or duplicate submissions.
- **Testing**: **Jest** + **ts-jest** + **Supertest** + **mongodb-memory-server** configured with a replica set to verify transaction isolation and race conditions hermetically.

---

## 3. Architecture & Repository Structure

```
feedants-internship-assignment/
├── mobile/                        # React Native + Expo (Strict TypeScript: .ts, .tsx)
│   ├── src/
│   │   ├── api/client.ts          # Type-safe API client connecting to Express backend
│   │   ├── components/            # Pixel-accurate reusable React Native components
│   │   │   ├── TopBar.tsx         # Back navigation button & bilingual (ENG / हिंदी) pill
│   │   │   ├── HeaderCard.tsx     # Title, status badge, tags, prize, spots progress bar
│   │   │   ├── JudgeSection.tsx   # Manju Dubey details & intro video modal trigger
│   │   │   ├── CountdownBanner.tsx# Live ticking countdown driven by backend timestamp
│   │   │   ├── ImportantDatesGrid.tsx # 2x2 bordered grid for key milestones
│   │   │   ├── PreviousWinners.tsx# Horizontal cards with play badge thumbnails
│   │   │   ├── TabbedContent.tsx  # About / Judging / Rules tabs with expandable text
│   │   │   ├── RewardsSection.tsx # 1st to 6th rank prizes with trophy/medal icons
│   │   │   ├── TrustAndReferralSection.tsx # Disclaimer, Razorpay, Referral card, Testimonials
│   │   │   ├── StickyBottomCTA.tsx# Server-authoritative contextual action button
│   │   │   ├── BottomNavBar.tsx   # Mobile navigation footer (Home, Explore, +, Competitions, Profile)
│   │   │   ├── DevStateSwitcher.tsx # Evaluator toolbar to toggle users & stages
│   │   │   ├── IntroVideoModal.tsx# Video player preview modal
│   │   │   ├── SubmissionModal.tsx# Performance submission upload & review modal
│   │   │   └── ToastBanner.tsx    # Lightweight animated non-blocking notification banner
│   │   ├── types/index.ts         # Shared TypeScript interfaces
│   │   ├── hooks/useCountdown.ts  # Authoritative countdown timer hook
│   │   └── context/AuthContext.tsx# AuthContext managing active demo user & language
│   ├── App.tsx                    # Root mobile entry with responsive mobile framing
│   ├── app.json
│   ├── package.json
│   └── tsconfig.json
│
├── server/                        # Node.js + Express + Mongoose (Strict TypeScript: .ts)
│   ├── src/
│   │   ├── config/index.ts        # Environment variables & constants
│   │   ├── models/                # User, Competition, Registration, Submission
│   │   │   ├── User.ts
│   │   │   ├── Competition.ts
│   │   │   ├── Registration.ts    # Compound unique index { competitionId: 1, userId: 1 }
│   │   │   └── Submission.ts      # Compound unique index { competitionId: 1, userId: 1 }
│   │   ├── controllers/           # Competition, Registration (Transactional), Submission, User
│   │   ├── middleware/            # Auth (x-user-id), centralized error handler
│   │   ├── routes/                # Express router definitions
│   │   ├── services/              # Ordered chronological lifecycle state machine
│   │   ├── seed/seed.ts           # Seeder with demonstrable timeline & consistent counts
│   │   ├── types/index.ts         # Express & Mongoose TypeScript contracts
│   │   ├── app.ts                 # Express application factory
│   │   └── index.ts               # Server startup & DB connection
│   ├── tests/competition.test.ts  # Automated test suite (1 Jest test suite, 11 tests, all passing)
│   ├── jest.config.js
│   ├── package.json
│   └── tsconfig.json
│
├── reference/                     # Untouched reference PDF & Objective_Page.png
└── README.md                      # Comprehensive project documentation
```

---

## 4. Prerequisites & MongoDB Setup

- **Node.js**: v18+ (tested on Node v24.21.0)
- **npm**: v9+ (tested on npm 11.19.0)
- **MongoDB**: v5.0+

### MongoDB Transaction & Replica-Set Requirement
MongoDB multi-document transactions (`session.withTransaction` / `session.startTransaction`) require either a **Replica Set** or a **MongoDB Atlas** cluster. Standalone `mongod` instances without replica set configuration disallow multi-document transactions (error code `20`).

### MongoDB Atlas Setup
MongoDB Atlas is used for the primary demo environment because all Atlas clusters (including free M0 tier) provide native replica set topologies supporting transactions out of the box.
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Under **Database Access**, create a user with read/write privileges.
3. Under **Network Access**, add your current IP address (or `0.0.0.0/0` for development).
4. Copy the connection string and set `MONGODB_URI` in `server/.env`:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/feedants_competition?appName=Cluster0
   ```

*(Alternative Local Option)*: If running an offline local MongoDB deployment, start `mongod` with `--replSet rs0` on port `27018` and execute `rs.initiate()` via `mongosh`.

### Automated Test Environment
The automated test suite (`npm test`) automatically launches an isolated `mongodb-memory-server` configured with a single-node replica set (`replSet: { count: 1, storageEngine: 'wiredTiger' }`). This guarantees hermetic, reproducible multi-document transaction testing anywhere without requiring an active external MongoDB service.

---

## 5. Environment Variables

Create a `server/.env` file in the `server/` directory following [`server/.env.example`](server/.env.example):

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/feedants_competition?appName=Cluster0
NODE_ENV=development
CORS_ORIGIN=*
```

> **Security Note**: `server/.env` is strictly gitignored. Never commit real database credentials to Git.

---

## 6. Quickstart Guide

### Backend Setup & Seeding

1. Navigate to the `server/` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `server/.env` with your MongoDB connection string (or use the default local URI).
4. Seed the database with demo users, primary competition, and consistent registration counts:
   ```bash
   npm run seed
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The API will be available at `http://localhost:5000`.*

### Mobile Setup (Expo & Web)

1. Open a new terminal and navigate to `mobile/`:
   ```bash
   cd mobile
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the application on Web for browser-based evaluation:
   ```bash
   npm run web
   ```
   *The mobile web view will be served at `http://localhost:8081`.*
4. *(Optional)* To run on an iOS simulator, Android emulator, or physical device via Expo Go:
   ```bash
   npx expo start
   ```

### Running Automated Tests

To run the complete test suite verifying transactional capacity, concurrency races, and lifecycle transitions:
```bash
cd server
npm test
```
*Result: **1 Jest test suite, 11 tests, all passing.***

To run static TypeScript checks across both codebases:
```bash
# Server typecheck
cd server && npm run typecheck

# Mobile typecheck
cd mobile && npx tsc --noEmit
```

---

## 7. API Endpoints

### Base URL: `http://localhost:5000/api`

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/competitions` | No | Lists all competitions with computed summary lifecycle. |
| `GET` | `/competitions/:id` | Optional (`x-user-id`) | Retrieves full competition details, derived lifecycle, remaining spots, and user state. |
| `POST` | `/competitions/:id/register` | Yes (`x-user-id`) | Atomically reserves capacity and registers user using MongoDB transactions. |
| `POST` | `/competitions/:id/submit` | Yes (`x-user-id`) | Validates registration + window and submits competition entry. |
| `GET` | `/competitions/:id/submission` | Yes (`x-user-id`) | Retrieves existing submission for the active user. |
| `GET` | `/users/me` | Yes (`x-user-id`) | Returns the authenticated demo user profile. |
| `GET` | `/users/demo` | No | Lists all available demo user accounts for the toolbar. |

---

## 8. Demo Users & Evaluator Toolbar

### Lightweight Demo Authentication
Per the assignment guidelines, full OAuth/JWT/OTP authentication was omitted to prioritize core concurrency and lifecycle correctness. Authentication is implemented using the `x-user-id` header validated against seeded demo accounts via `src/middleware/auth.ts`. Requests with missing or unseeded user IDs are rejected with `401 Unauthorized`.

A floating **Evaluator Toolbar** at the top of the mobile screen allows evaluators to seamlessly switch active demo users:

| Demo User ID | Name | Role / Initial State | Expected Behavior |
|---|---|---|---|
| `user_demo_1` | Priya Sharma | **Unregistered User** | Header shows no badge; CTA shows **`Register Now • ₹99`**; enables testing atomic spot reservation and live decrement. |
| `user_demo_2` | Rahul Verma | **Pre-Registered User** | Matches `Objective_Page.png` visual state (**`✔ Registered`** badge, `1 / 20 Booked`, CTA: **`Upload Submission`**). |
| `user_demo_3` | Ananya Roy | **Submitted Participant** | Primary competition shows **`Submission Received ✔`**; showcase competition shows submitted performance details. |

The toolbar also allows switching between:
1. **Classical Dance (Registration Open)**: Primary competition matching `Objective_Page.png`.
2. **Kathak Masters (Submission Open)**: Showcase competition with registration closed and submissions open.

---

## 9. Competition Lifecycle State Machine

Competition lifecycle is derived on the backend using an ordered chronological state machine (`server/src/services/lifecycleService.ts`). The frontend treats the backend as authoritative and never determines whether registration or submission is permitted.

```
[UPCOMING]               now < registrationStart
    │
    ▼
[REGISTRATION_OPEN]      registrationStart <= now <= registrationClose
    │
    ▼
[REGISTRATION_CLOSED]    registrationClose < now < submissionStart
    │
    ▼
[SUBMISSION_OPEN]        submissionStart <= now <= submissionEnd
    │
    ▼
[SUBMISSION_CLOSED]      submissionEnd < now < resultDate
    │
    ▼
[COMPLETED]              now >= resultDate
```

### Decoupled Capacity & Permissions
Capacity (`isFull: registeredCount >= totalSpots`) is modeled independently from the lifecycle state:
- When all spots are filled during the registration period:
  - `lifecycle.state`: `REGISTRATION_OPEN`
  - `lifecycle.canRegister`: `false`
  - `lifecycle.registrationReason`: `"FULL"`
- Submissions are permitted when `now >= submissionStart && now <= submissionEnd` for registered participants.
- Full capacity never prematurely forces the competition into "submission open" or distorts milestone timelines.

---

## 10. Registration Concurrency Strategy

### The Race Condition Challenge
Under high concurrency (e.g. flash registrations for 20 spots among thousands of users), naive checks (`if count < total`) lead to overbooking. Similarly, a standalone `$inc` operation can increment `registeredCount` and subsequently fail on a unique index violation if a user submits concurrent requests, permanently leaking spots.

### The Solution: Multi-Document Transactions with Verification
1. **Compound Unique Index**:
   ```typescript
   RegistrationSchema.index({ competitionId: 1, userId: 1 }, { unique: true });
   ```
2. **Atomic Verification Inside Transaction**:
   ```typescript
   await session.withTransaction(async () => {
     // 1. Fetch competition inside transaction session
     const competition = await Competition.findById(competitionId).session(session);

     // 2. Validate lifecycle & permissions
     const lifecycle = evaluateLifecycle(competition);
     if (!lifecycle.canRegister) throw new ConflictError("Cannot register");

     // 3. Atomically reserve spot verifying modifiedCount
     const reserveResult = await Competition.updateOne(
       { _id: competitionId, registeredCount: { $lt: competition.totalSpots } },
       { $inc: { registeredCount: 1 } },
       { session }
     );
     if (reserveResult.matchedCount === 0 || reserveResult.modifiedCount === 0) {
       throw new ConflictError("Competition is full");
     }

     // 4. Create Registration document within transaction
     await Registration.create([{
       competitionId,
       userId: user.userId,
       userName: user.name,
       userEmail: user.email,
       paymentStatus: "PAID",
       registeredAt: new Date()
     }], { session });
   });
   ```
3. **Guarantees**:
   - **Different Users Racing**: If 2 spots remain and 20 users register simultaneously, exactly 2 succeed (HTTP 201) and 18 are rejected (HTTP 409). `registeredCount` strictly equals `totalSpots`.
   - **Same User Concurrent Requests**: 10 simultaneous registration requests from the same user yield exactly 1 success (HTTP 201) and 9 rejections (HTTP 409). The spot reservation for the 9 rejected attempts automatically rolls back with the transaction, guaranteeing `registeredCount` increments by **exactly 1**.
   - **Server-Authoritative Frontend**: The frontend never mutates spots locally. Spot count and user status update only from the authoritative response returned by the server.

---

## 11. Submission Flow

1. User must be authenticated (`x-user-id` header).
2. User must be registered for the competition (`Registration` record exists).
3. Current time must fall within the submission window (`now >= dates.submissionStart && now <= dates.submissionEnd`).
4. User submits:
   - `submissionTitle` (required, string)
   - `mediaUrl` (required, valid media link)
   - `notes` (optional, string)
5. Backend verifies uniqueness via compound unique index `{ competitionId: 1, userId: 1 }` on the `submissions` collection.
6. Upon HTTP 201, the UI replaces its state, and the sticky button transitions to **`Submission Received ✔`** (caption: *"View Submission Details"*).
7. Clicking the button opens the submission modal in read-only mode displaying the submitted performance details.
8. Re-submitting returns `HTTP 409 Conflict` and displays a non-blocking toast banner.

---

## 12. Validation & Business Rules

1. **Authentication**: Rejects requests lacking a recognized `x-user-id` header (`401 Unauthorized`).
2. **Registration Eligibility**:
   - Rejects registration before `registrationStart` (`400 Bad Request: NOT_STARTED`).
   - Rejects registration after `registrationClose` (`400 Bad Request: CLOSED`).
   - Rejects registration when `registeredCount >= totalSpots` (`409 Conflict: FULL`).
   - Rejects duplicate registration for the same user (`409 Conflict: ALREADY_REGISTERED`).
3. **Submission Eligibility**:
   - Rejects submission from unregistered users (`403 Forbidden`).
   - Rejects submission before `submissionStart` (`400 Bad Request: NOT_STARTED`).
   - Rejects submission after `submissionEnd` (`400 Bad Request: CLOSED`).
   - Rejects duplicate submission from the same user (`409 Conflict`).
4. **Data Integrity**: Enforces strict schema validations on competition fees, positive participant counts, and non-empty submission titles and URLs.

---

## 13. Edge Cases Handled

- **Flash Registration Race Conditions**: Multi-user concurrent reservation validated via automated concurrency tests (20 users racing for 2 spots $\rightarrow$ 2 succeed, 18 rejected with 409).
- **Duplicate User Concurrent Requests**: Rapid double-clicking or scripted identical requests from the same user rolled back cleanly without leaked capacity (10 requests $\rightarrow$ 1 success, 9 rejected with 409, capacity increments by exactly 1).
- **Network Outage / Failed Request**: Frontend handles API connection errors with clear status indications without locally mutating spot counts.
- **Clock Drift**: All countdown timers and lifecycle derivations calculate against backend-authoritative timestamps (`registrationCloseTimestamp`, `submissionEndTimestamp`), rather than client system clocks.
- **Bilingual Content Fallback**: All tabbed descriptions and labels support seamless switching between English and Hindi with graceful fallbacks.

---

## 14. Key Assumptions

1. **Demonstrable Timeline vs. Illustrative Screenshot Dates**:
   The reference screenshot [`reference/Objective_Page.png`](reference/Objective_Page.png) displays dates from August/September 2026. Because current calendar time is post-August 2026, using literal static dates would render the live demo immediately closed and prevent demonstrating the live registration countdown or submission window.
   **Assumption**: The reference dates are treated as illustrative design mockups. The functional demo seeds a future-facing sequential timeline:
   - Registration started 24h ago and closes in ~30.5 hours (preserving the `01d : 06h : 28m : 32s` timer visible in the design).
   - Submission started 12 hours ago (matching the reference design where `Submission Starts 6 Aug` occurs before `Register Before 10 Aug`, allowing registered participants to submit).
   - Submission ends in 6 days; result date occurs 2 days after submission end.
2. **Demo User Authentication**:
   A lightweight demo identity model is implemented using the `x-user-id` header validated against seeded users (`user_demo_1`, `user_demo_2`, `user_demo_3`). Production authentication (OAuth2 / JWT / OTP) was intentionally omitted per assignment guidelines to focus on core concurrency and lifecycle correctness.
3. **Media Submissions Model**:
   The MVP submission accepts a media URL and performance title rather than implementing a third-party cloud object-storage bucket (e.g. AWS S3 / Cloudflare R2 presigned uploads) to avoid requiring external cloud billing credentials while validating registration and lifecycle constraints.

---

## 15. Major Technical Decisions

1. **MongoDB Multi-Document Transactions with Conditional Write Checks**:
   - Enforces ACID atomicity across the `competitions` and `registrations` collections. Verifies `modifiedCount === 1` inside the session to prevent race conditions without complex external distributed locking.
2. **Server-Authoritative State Pattern**:
   - The frontend never calculates remaining spots or lifecycle stages independently. All state mutations flow through backend APIs, and the UI replaces its state from the server response.
3. **Expo React Native with Web Support**:
   - Preserves 100% genuine React Native component architecture (`View`, `Text`, `TouchableOpacity`, `ScrollView`, `Modal`) while allowing instantaneous desktop browser evaluation and screen recording without requiring Android Studio / Xcode emulators.
4. **Non-Blocking Toast Feedback**:
   - Replaced browser/native alert dialogs with a lightweight animated `ToastBanner` component built using standard React Native `Animated` primitives.

---

## 16. Trade-offs Considered

1. **MongoDB Transactions vs. Two-Phase Locking / Sagas**:
   - *Choice*: Native MongoDB multi-document transactions with conditional atomic update.
   - *Trade-off*: Requires replica set or MongoDB Atlas, but guarantees ACID isolation, automatic rollback on duplicate index violation, and zero spot leakage without maintaining complex distributed locks.
2. **In-Memory Replica Set for Testing**:
   - *Choice*: `mongodb-memory-server` with `replSet: { count: 1 }`.
   - *Trade-off*: Adds minor startup overhead on initial test run (~7s), but provides hermetic, zero-dependency testing of multi-document transactions on any developer machine.

---

## 17. Current Limitations

- **Authentication**: Relies on `x-user-id` header rather than production JWT/session tokens.
- **Media Uploads**: Accepts external media URLs (`mediaUrl`) rather than direct binary file chunking/transcoding.
- **Payment Gateway**: Displays Razorpay trust badges and records `paymentStatus: "PAID"` directly without invoking real banking APIs or webhook callbacks.

---

## 18. Production Improvements

If deploying this module to production for millions of concurrent users:
1. **Redis Caching & Distributed Spot Reservation**:
   - Cache competition details in Redis with TTL.
   - Use Redis `DECRBY` with Lua scripts for microsecond-level spot reservations, persisting to MongoDB via asynchronous event queues (Kafka / RabbitMQ).
2. **Presigned Cloud Media Uploads**:
   - Generate presigned AWS S3 / Cloudflare R2 upload URLs from the backend, uploading video directly from the device with transcoding via AWS Elemental MediaConvert.
3. **Payment Webhook Verification**:
   - Integrate Razorpay webhook signature verification with idempotency keys to handle asynchronous payment capture.
4. **Read Replicas & Connection Pooling**:
   - Route high-volume read queries to MongoDB secondary read replicas (`readPreference=secondaryPreferred`).
