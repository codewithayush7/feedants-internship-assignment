import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { createApp } from "../src/app";
import { User } from "../src/models/User";
import { Competition } from "../src/models/Competition";
import { Registration } from "../src/models/Registration";
import { Submission } from "../src/models/Submission";
import { evaluateLifecycle } from "../src/services/lifecycleService";
import { LifecycleState } from "../src/types";

let replSet: MongoMemoryReplSet;
let app = createApp();

beforeAll(async () => {
  // Start in-memory replica set to support multi-document transactions
  replSet = await MongoMemoryReplSet.create({
    replSet: { count: 1, storageEngine: "wiredTiger" }
  });
  const uri = replSet.getUri();
  await mongoose.connect(uri);

  // Ensure collections and compound unique indexes are built
  await User.init();
  await Competition.init();
  await Registration.init();
  await Submission.init();
}, 60000);

afterAll(async () => {
  await mongoose.disconnect();
  if (replSet) {
    await replSet.stop();
  }
});

beforeEach(async () => {
  await User.deleteMany({});
  await Competition.deleteMany({});
  await Registration.deleteMany({});
  await Submission.deleteMany({});

  // Seed standard demo users
  await User.create([
    { userId: "user_demo_1", name: "Priya Sharma", email: "priya@example.com" },
    { userId: "user_demo_2", name: "Rahul Verma", email: "rahul@example.com" },
    { userId: "user_demo_3", name: "Ananya Roy", email: "ananya@example.com" }
  ]);
});

describe("1. Competition Retrieval & Dynamic State", () => {
  it("should retrieve competition details with derived lifecycle and spots", async () => {
    const now = new Date();
    const comp = await Competition.create({
      title: "Feedants Classical Dance",
      slug: "feedants-classical-dance",
      categoryTags: ["Dance"],
      prizePool: 1500,
      entryFee: 99,
      totalSpots: 20,
      registeredCount: 1,
      dates: {
        registrationStart: new Date(now.getTime() - 100000),
        registrationClose: new Date(now.getTime() + 100000),
        submissionStart: new Date(now.getTime() + 200000),
        submissionEnd: new Date(now.getTime() + 300000),
        resultDate: new Date(now.getTime() + 400000)
      },
      judge: { name: "Manju Dubey", role: "Kathak", experience: "12 yrs" },
      previousWinners: [],
      tabs: {
        about: { en: "About", hi: "विवरण" },
        judgingParameters: { en: "Params", hi: "पैरामीटर" },
        rulesAndEligibility: { en: "Rules", hi: "नियम" }
      },
      rewards: [{ position: 1, rankTitle: "1st", amount: 550, iconType: "trophy" }]
    });

    const res = await request(app)
      .get(`/api/competitions/${comp._id}`)
      .set("x-user-id", "user_demo_1");

    expect(res.status).toBe(200);
    expect(res.body.competition.title).toBe("Feedants Classical Dance");
    expect(res.body.spotsRemaining).toBe(19);
    expect(res.body.lifecycle.state).toBe(LifecycleState.REGISTRATION_OPEN);
    expect(res.body.lifecycle.canRegister).toBe(true);
    expect(res.body.userState.isRegistered).toBe(false);
  });
});

describe("2. Normal Registration Flow", () => {
  it("should atomically register user, create registration record, and decrement spots remaining", async () => {
    const now = new Date();
    const comp = await Competition.create({
      title: "Dance Fest",
      slug: "dance-fest",
      prizePool: 1000,
      entryFee: 50,
      totalSpots: 10,
      registeredCount: 0,
      dates: {
        registrationStart: new Date(now.getTime() - 50000),
        registrationClose: new Date(now.getTime() + 50000),
        submissionStart: new Date(now.getTime() + 100000),
        submissionEnd: new Date(now.getTime() + 200000),
        resultDate: new Date(now.getTime() + 300000)
      },
      judge: { name: "Judge", role: "Dancer", experience: "10" },
      tabs: {
        about: { en: "A", hi: "A" },
        judgingParameters: { en: "J", hi: "J" },
        rulesAndEligibility: { en: "R", hi: "R" }
      },
      rewards: []
    });

    const res = await request(app)
      .post(`/api/competitions/${comp._id}/register`)
      .set("x-user-id", "user_demo_1");

    expect(res.status).toBe(201);
    expect(res.body.userState.isRegistered).toBe(true);
    expect(res.body.competition.registeredCount).toBe(1);
    expect(res.body.spotsRemaining).toBe(9);

    // Verify registration document in DB
    const regInDb = await Registration.findOne({
      competitionId: comp._id,
      userId: "user_demo_1"
    });
    expect(regInDb).not.toBeNull();
    expect(regInDb?.paymentStatus).toBe("PAID");
  });
});

describe("3. Duplicate Registration Prevention", () => {
  it("should reject duplicate registration with 409 and not leak capacity", async () => {
    const now = new Date();
    const comp = await Competition.create({
      title: "Dance Fest",
      slug: "dance-fest-dup",
      prizePool: 1000,
      entryFee: 50,
      totalSpots: 10,
      registeredCount: 0,
      dates: {
        registrationStart: new Date(now.getTime() - 50000),
        registrationClose: new Date(now.getTime() + 50000),
        submissionStart: new Date(now.getTime() + 100000),
        submissionEnd: new Date(now.getTime() + 200000),
        resultDate: new Date(now.getTime() + 300000)
      },
      judge: { name: "Judge", role: "Dancer", experience: "10" },
      tabs: {
        about: { en: "A", hi: "A" },
        judgingParameters: { en: "J", hi: "J" },
        rulesAndEligibility: { en: "R", hi: "R" }
      },
      rewards: []
    });

    // First registration
    const firstRes = await request(app)
      .post(`/api/competitions/${comp._id}/register`)
      .set("x-user-id", "user_demo_1");
    expect(firstRes.status).toBe(201);

    // Second registration attempt for same user
    const secondRes = await request(app)
      .post(`/api/competitions/${comp._id}/register`)
      .set("x-user-id", "user_demo_1");

    expect(secondRes.status).toBe(409);

    // Ensure capacity did not leak
    const compAfter = await Competition.findById(comp._id);
    expect(compAfter?.registeredCount).toBe(1);
  });
});

describe("4. Registration After Deadline", () => {
  it("should reject registration when registrationClose is in the past", async () => {
    const now = new Date();
    const comp = await Competition.create({
      title: "Expired Comp",
      slug: "expired-comp",
      prizePool: 1000,
      entryFee: 50,
      totalSpots: 10,
      registeredCount: 0,
      dates: {
        registrationStart: new Date(now.getTime() - 100000),
        registrationClose: new Date(now.getTime() - 10000), // CLOSED
        submissionStart: new Date(now.getTime() + 10000),
        submissionEnd: new Date(now.getTime() + 200000),
        resultDate: new Date(now.getTime() + 300000)
      },
      judge: { name: "Judge", role: "Dancer", experience: "10" },
      tabs: {
        about: { en: "A", hi: "A" },
        judgingParameters: { en: "J", hi: "J" },
        rulesAndEligibility: { en: "R", hi: "R" }
      },
      rewards: []
    });

    const res = await request(app)
      .post(`/api/competitions/${comp._id}/register`)
      .set("x-user-id", "user_demo_1");

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Registration is currently closed");
  });
});

describe("5. Registration When Full", () => {
  it("should reject registration with 409 when registeredCount >= totalSpots", async () => {
    const now = new Date();
    const comp = await Competition.create({
      title: "Full Comp",
      slug: "full-comp",
      prizePool: 1000,
      entryFee: 50,
      totalSpots: 2,
      registeredCount: 2, // FULL
      dates: {
        registrationStart: new Date(now.getTime() - 50000),
        registrationClose: new Date(now.getTime() + 50000),
        submissionStart: new Date(now.getTime() + 100000),
        submissionEnd: new Date(now.getTime() + 200000),
        resultDate: new Date(now.getTime() + 300000)
      },
      judge: { name: "Judge", role: "Dancer", experience: "10" },
      tabs: {
        about: { en: "A", hi: "A" },
        judgingParameters: { en: "J", hi: "J" },
        rulesAndEligibility: { en: "R", hi: "R" }
      },
      rewards: []
    });

    const res = await request(app)
      .post(`/api/competitions/${comp._id}/register`)
      .set("x-user-id", "user_demo_1");

    expect(res.status).toBe(409);
    expect(res.body.message).toContain("maximum capacity");
  });
});

describe("6. Submission Before Registration", () => {
  it("should reject submission with 403 if user is not registered", async () => {
    const now = new Date();
    const comp = await Competition.create({
      title: "Submission Window Open",
      slug: "sub-window-open",
      prizePool: 1000,
      entryFee: 50,
      totalSpots: 10,
      registeredCount: 0,
      dates: {
        registrationStart: new Date(now.getTime() - 100000),
        registrationClose: new Date(now.getTime() - 50000),
        submissionStart: new Date(now.getTime() - 20000), // SUBMISSION_OPEN
        submissionEnd: new Date(now.getTime() + 100000),
        resultDate: new Date(now.getTime() + 200000)
      },
      judge: { name: "Judge", role: "Dancer", experience: "10" },
      tabs: {
        about: { en: "A", hi: "A" },
        judgingParameters: { en: "J", hi: "J" },
        rulesAndEligibility: { en: "R", hi: "R" }
      },
      rewards: []
    });

    const res = await request(app)
      .post(`/api/competitions/${comp._id}/submit`)
      .set("x-user-id", "user_demo_1")
      .send({
        submissionTitle: "My Kathak Solo",
        mediaUrl: "https://example.com/video.mp4"
      });

    expect(res.status).toBe(403);
    expect(res.body.message).toContain("registered");
  });
});

describe("7. Submission Outside Submission Window", () => {
  it("should reject submission when now < submissionStart", async () => {
    const now = new Date();
    const comp = await Competition.create({
      title: "Early Comp",
      slug: "early-comp",
      prizePool: 1000,
      entryFee: 50,
      totalSpots: 10,
      registeredCount: 1,
      dates: {
        registrationStart: new Date(now.getTime() - 50000),
        registrationClose: new Date(now.getTime() + 50000), // Still in REGISTRATION_OPEN
        submissionStart: new Date(now.getTime() + 100000),
        submissionEnd: new Date(now.getTime() + 200000),
        resultDate: new Date(now.getTime() + 300000)
      },
      judge: { name: "Judge", role: "Dancer", experience: "10" },
      tabs: {
        about: { en: "A", hi: "A" },
        judgingParameters: { en: "J", hi: "J" },
        rulesAndEligibility: { en: "R", hi: "R" }
      },
      rewards: []
    });

    // Register user first
    await Registration.create({
      competitionId: comp._id,
      userId: "user_demo_1",
      userName: "Priya",
      userEmail: "priya@example.com"
    });

    // Try submitting before submission window opens
    const res = await request(app)
      .post(`/api/competitions/${comp._id}/submit`)
      .set("x-user-id", "user_demo_1")
      .send({
        submissionTitle: "Early Submission",
        mediaUrl: "https://example.com/video.mp4"
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Submissions are not currently accepted");
  });
});

describe("8. Duplicate Submission Prevention", () => {
  it("should reject duplicate submission from the same registered user", async () => {
    const now = new Date();
    const comp = await Competition.create({
      title: "Open Sub Comp",
      slug: "open-sub-comp",
      prizePool: 1000,
      entryFee: 50,
      totalSpots: 10,
      registeredCount: 1,
      dates: {
        registrationStart: new Date(now.getTime() - 100000),
        registrationClose: new Date(now.getTime() - 50000),
        submissionStart: new Date(now.getTime() - 20000),
        submissionEnd: new Date(now.getTime() + 100000),
        resultDate: new Date(now.getTime() + 200000)
      },
      judge: { name: "Judge", role: "Dancer", experience: "10" },
      tabs: {
        about: { en: "A", hi: "A" },
        judgingParameters: { en: "J", hi: "J" },
        rulesAndEligibility: { en: "R", hi: "R" }
      },
      rewards: []
    });

    await Registration.create({
      competitionId: comp._id,
      userId: "user_demo_1",
      userName: "Priya",
      userEmail: "priya@example.com"
    });

    // First submission
    const res1 = await request(app)
      .post(`/api/competitions/${comp._id}/submit`)
      .set("x-user-id", "user_demo_1")
      .send({
        submissionTitle: "Kathak Tarana",
        mediaUrl: "https://example.com/dance1.mp4"
      });
    expect(res1.status).toBe(201);

    // Second submission attempt
    const res2 = await request(app)
      .post(`/api/competitions/${comp._id}/submit`)
      .set("x-user-id", "user_demo_1")
      .send({
        submissionTitle: "Another Entry",
        mediaUrl: "https://example.com/dance2.mp4"
      });
    expect(res2.status).toBe(409);
    expect(res2.body.message).toContain("already submitted");
  });
});

describe("9. Concurrency: Same User Duplicate Requests", () => {
  it("should accept exactly 1 registration and reject 9 for 10 concurrent requests from same user", async () => {
    const now = new Date();
    const comp = await Competition.create({
      title: "Concurrent Same User Comp",
      slug: "conc-same-user",
      prizePool: 1000,
      entryFee: 50,
      totalSpots: 10,
      registeredCount: 0,
      dates: {
        registrationStart: new Date(now.getTime() - 50000),
        registrationClose: new Date(now.getTime() + 50000),
        submissionStart: new Date(now.getTime() + 100000),
        submissionEnd: new Date(now.getTime() + 200000),
        resultDate: new Date(now.getTime() + 300000)
      },
      judge: { name: "Judge", role: "Dancer", experience: "10" },
      tabs: {
        about: { en: "A", hi: "A" },
        judgingParameters: { en: "J", hi: "J" },
        rulesAndEligibility: { en: "R", hi: "R" }
      },
      rewards: []
    });

    // Fire 10 simultaneous registration requests for user_demo_1
    const requests = Array.from({ length: 10 }).map(() =>
      request(app)
        .post(`/api/competitions/${comp._id}/register`)
        .set("x-user-id", "user_demo_1")
    );

    const responses = await Promise.all(requests);
    const successes = responses.filter((r) => r.status === 201);
    const conflicts = responses.filter((r) => r.status === 409);

    expect(successes.length).toBe(1);
    expect(conflicts.length).toBe(9);

    // Verify registeredCount increased by exactly 1
    const compAfter = await Competition.findById(comp._id);
    expect(compAfter?.registeredCount).toBe(1);

    // Verify only 1 registration document in DB
    const registrations = await Registration.find({ competitionId: comp._id });
    expect(registrations.length).toBe(1);
  });
});

describe("10. Concurrency: Different Users Competing for Final Spots", () => {
  it("should allow exactly 2 registrations and reject 18 when 20 users race for 2 remaining spots", async () => {
    const now = new Date();
    const comp = await Competition.create({
      title: "Race for Spots Comp",
      slug: "race-for-spots",
      prizePool: 1000,
      entryFee: 50,
      totalSpots: 5,
      registeredCount: 3, // Only 2 spots remain!
      dates: {
        registrationStart: new Date(now.getTime() - 50000),
        registrationClose: new Date(now.getTime() + 50000),
        submissionStart: new Date(now.getTime() + 100000),
        submissionEnd: new Date(now.getTime() + 200000),
        resultDate: new Date(now.getTime() + 300000)
      },
      judge: { name: "Judge", role: "Dancer", experience: "10" },
      tabs: {
        about: { en: "A", hi: "A" },
        judgingParameters: { en: "J", hi: "J" },
        rulesAndEligibility: { en: "R", hi: "R" }
      },
      rewards: []
    });

    // Create 20 unique demo users in DB
    const userDocs = Array.from({ length: 20 }).map((_, i) => ({
      userId: `racer_user_${i}`,
      name: `Racer ${i}`,
      email: `racer${i}@example.com`
    }));
    await User.insertMany(userDocs);

    // Fire 20 parallel requests simultaneously
    const requests = userDocs.map((u) =>
      request(app)
        .post(`/api/competitions/${comp._id}/register`)
        .set("x-user-id", u.userId)
    );

    const responses = await Promise.all(requests);
    const successes = responses.filter((r) => r.status === 201);
    const failures = responses.filter((r) => r.status === 409);

    expect(successes.length).toBe(2);
    expect(failures.length).toBe(18);

    // Verify registeredCount equals totalSpots (strictly 5, never > 5)
    const compAfter = await Competition.findById(comp._id);
    expect(compAfter?.registeredCount).toBe(5);

    // Verify total registered documents in DB is 2 (newly added)
    const newRegistrations = await Registration.find({ competitionId: comp._id });
    expect(newRegistrations.length).toBe(2);
  });
});

describe("11. Lifecycle State Machine Transitions", () => {
  it("should evaluate state transitions strictly chronologically", () => {
    const dates = {
      registrationStart: new Date("2026-08-01T00:00:00Z"),
      registrationClose: new Date("2026-08-10T00:00:00Z"),
      submissionStart: new Date("2026-08-11T00:00:00Z"),
      submissionEnd: new Date("2026-08-20T00:00:00Z"),
      resultDate: new Date("2026-08-25T00:00:00Z")
    };
    const comp = { dates, totalSpots: 10, registeredCount: 0 };

    // 1. Before registrationStart -> UPCOMING
    const s1 = evaluateLifecycle(comp, new Date("2026-07-31T23:59:59Z"));
    expect(s1.state).toBe(LifecycleState.UPCOMING);
    expect(s1.canRegister).toBe(false);
    expect(s1.registrationReason).toBe("NOT_STARTED");

    // 2. Between start and close -> REGISTRATION_OPEN
    const s2 = evaluateLifecycle(comp, new Date("2026-08-05T12:00:00Z"));
    expect(s2.state).toBe(LifecycleState.REGISTRATION_OPEN);
    expect(s2.canRegister).toBe(true);

    // 3. Between close and submissionStart -> REGISTRATION_CLOSED
    const s3 = evaluateLifecycle(comp, new Date("2026-08-10T12:00:00Z"));
    expect(s3.state).toBe(LifecycleState.REGISTRATION_CLOSED);
    expect(s3.canRegister).toBe(false);
    expect(s3.registrationReason).toBe("CLOSED");

    // 4. Between submissionStart and submissionEnd -> SUBMISSION_OPEN
    const s4 = evaluateLifecycle(comp, new Date("2026-08-15T12:00:00Z"));
    expect(s4.state).toBe(LifecycleState.SUBMISSION_OPEN);
    expect(s4.canSubmit).toBe(true);

    // 5. Between submissionEnd and resultDate -> SUBMISSION_CLOSED
    const s5 = evaluateLifecycle(comp, new Date("2026-08-22T12:00:00Z"));
    expect(s5.state).toBe(LifecycleState.SUBMISSION_CLOSED);
    expect(s5.canSubmit).toBe(false);

    // 6. After resultDate -> COMPLETED
    const s6 = evaluateLifecycle(comp, new Date("2026-08-26T00:00:00Z"));
    expect(s6.state).toBe(LifecycleState.COMPLETED);
  });
});
