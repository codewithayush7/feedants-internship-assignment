import mongoose from "mongoose";
import { User } from "../models/User";
import { Competition } from "../models/Competition";
import { Registration } from "../models/Registration";
import { Submission } from "../models/Submission";
import { config } from "../config";

export async function seedDatabase(): Promise<void> {
  console.log("Seeding Feedants database...");

  // 1. Clear existing collections
  await User.deleteMany({});
  await Competition.deleteMany({});
  await Registration.deleteMany({});
  await Submission.deleteMany({});

  // 2. Create Demo Users
  const users = await User.create([
    {
      userId: "user_demo_1",
      name: "Priya Sharma",
      email: "priya.sharma@example.com",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
    },
    {
      userId: "user_demo_2",
      name: "Rahul Verma",
      email: "rahul.verma@example.com",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
    },
    {
      userId: "user_demo_3",
      name: "Ananya Roy",
      email: "ananya.roy@example.com",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
    }
  ]);
  console.log(`Seeded ${users.length} demo users: user_demo_1, user_demo_2, user_demo_3`);

  // 3. Define sequential timeline for Primary Competition
  // Preserves ~30.5 hr registration countdown matching 01d : 06h : 28m : 32s in Objective_Page.png
  const now = new Date();
  const primaryDates = {
    registrationStart: new Date(now.getTime() - 24 * 60 * 60 * 1000),      // 24 hours ago
    registrationClose: new Date(now.getTime() + 30.5 * 60 * 60 * 1000),    // ~30.5 hours from now
    submissionStart:   new Date(now.getTime() - 12 * 60 * 60 * 1000),      // 12 hours ago (matches 6 Aug starting before 10 Aug)
    submissionEnd:     new Date(now.getTime() + (30.5 + 144) * 60 * 60 * 1000), // 6 days later
    resultDate:        new Date(now.getTime() + (30.5 + 192) * 60 * 60 * 1000)  // 2 days after submission end
  };

  // 4. Primary Competition: Feedants Classical Dance
  // Exactly 1 pre-registered user (user_demo_2) -> registeredCount: 1, totalSpots: 20 (19 spots left)
  const primaryCompetition = await Competition.create({
    title: "Feedants Classical Dance",
    slug: "feedants-classical-dance",
    categoryTags: ["Dance", "Multi-Win"],
    certificateNotice: "Winners get certificate",
    prizePool: 1500,
    entryFee: 99,
    totalSpots: 20,
    registeredCount: 1, // Consistently reflects user_demo_2 registration
    dates: primaryDates,
    judge: {
      name: "Manju Dubey",
      role: "Professional Kathak Dancer",
      experience: "12+ Years of Experience",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200",
      introVideoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
    },
    previousWinners: [
      {
        name: "Riya Shah",
        rankTitle: "1st Winner",
        thumbnailUrl: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=200",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
      },
      {
        name: "Aarav Mehta",
        rankTitle: "1st Winner",
        thumbnailUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
      },
      {
        name: "Neha Verma",
        rankTitle: "2nd Winner",
        thumbnailUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
      },
      {
        name: "Ishita Chouhan",
        rankTitle: "3rd Winner",
        thumbnailUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
      }
    ],
    tabs: {
      about: {
        en: "This is an online classical dance competition open for all age groups. Participate from anywhere and showcase your talent. Express your passion through traditional dance.\n\nParticipants can submit a solo performance in any classical dance style (Kathak, Bharatanatyam, Odissi, Kuchipudi, Kathakali, or Mohiniyattam). Entries will be judged by Manju Dubey.",
        hi: "यह सभी आयु समूहों के लिए खुली एक ऑनलाइन शास्त्रीय नृत्य प्रतियोगिता है। कहीं से भी भाग लें और अपनी प्रतिभा का प्रदर्शन करें। पारंपरिक नृत्य के माध्यम से अपने जुनून को व्यक्त करें।"
      },
      judgingParameters: {
        en: "• Rhythm & Taal precision (30%)\n• Abhinaya & Facial Expressions (25%)\n• Anga Shuddhi & Posture (25%)\n• Costume & Overall Stage Presence (20%)",
        hi: "• ताल और लय की सटीकता (30%)\n• अभिनय और चेहरे के भाव (25%)\n• अंग शुद्धि और मुद्रा (25%)\n• वेशभूषा और समग्र प्रस्तुति (20%)"
      },
      rulesAndEligibility: {
        en: "• Duration: 2 to 5 minutes continuous uncut recording.\n• Classical music accompaniment required.\n• Plain background and clear lighting recommended.\n• Disclaimer: Only contributions from paid participants will be considered for judging.",
        hi: "• अवधि: 2 से 5 मिनट का निरंतर वीडियो।\n• शास्त्रीय संगीत संगत आवश्यक है।\n• स्पष्ट प्रकाश व्यवस्था अनुशंसित है।\n• केवल सशुल्क प्रतिभागियों की प्रविष्टियों पर विचार किया जाएगा।"
      }
    },
    rewards: [
      { position: 1, rankTitle: "1st Winner", amount: 550, iconType: "trophy" },
      { position: 2, rankTitle: "2nd Winner", amount: 300, iconType: "silver_medal" },
      { position: 3, rankTitle: "3rd Winner", amount: 240, iconType: "bronze_medal" },
      { position: 4, rankTitle: "4th Winner", amount: 200, iconType: "star" },
      { position: 5, rankTitle: "5th Winner", amount: 130, iconType: "star" },
      { position: 6, rankTitle: "6th Winner", amount: 80, iconType: "star" }
    ],
    referral: {
      code: "referral123",
      url: "https://feedants.com/r/referral123",
      discountNotice: "Refer & Earn more discount",
      rewardNotice: "You earn ₹10 for every signup"
    },
    disclaimer: "Disclaimer: Only contributions from paid participants will be considered for judging.",
    refundPolicy: "Refund policy available within 24 hours of registration before competition start.",
    paymentProviderNotice: "Secure payments powered by Razorpay"
  });

  // 5. Pre-register user_demo_2 for the primary competition (maintains registeredCount: 1 consistency)
  await Registration.create({
    competitionId: primaryCompetition._id,
    userId: "user_demo_2",
    userName: "Rahul Verma",
    userEmail: "rahul.verma@example.com",
    paymentStatus: "PAID",
    registeredAt: new Date(now.getTime() - 2 * 60 * 60 * 1000)
  });
  console.log("Pre-registered user_demo_2 for Primary Competition (registeredCount: 1, 19 spots remaining)");

  // 6. Secondary Competition: Submission Showcase (for testing SUBMISSION_OPEN state and user_demo_3)
  const submissionShowcaseDates = {
    registrationStart: new Date(now.getTime() - 48 * 60 * 60 * 1000),
    registrationClose: new Date(now.getTime() - 12 * 60 * 60 * 1000), // Registration already closed
    submissionStart:   new Date(now.getTime() - 10 * 60 * 60 * 1000), // Submission open right now!
    submissionEnd:     new Date(now.getTime() + 72 * 60 * 60 * 1000),  // 3 days left to submit
    resultDate:        new Date(now.getTime() + 120 * 60 * 60 * 1000)
  };

  const showcaseCompetition = await Competition.create({
    title: "Feedants Kathak Masters Championship",
    slug: "feedants-kathak-masters",
    categoryTags: ["Kathak", "Championship"],
    certificateNotice: "Winners get National Certificate",
    prizePool: 3000,
    entryFee: 199,
    totalSpots: 10,
    registeredCount: 1, // Consistently reflects user_demo_3 registration
    dates: submissionShowcaseDates,
    judge: {
      name: "Pt. Birju Maharaj Academy",
      role: "Eminent Dance Gurus",
      experience: "25+ Years Legacy",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200",
      introVideoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
    },
    previousWinners: [],
    tabs: {
      about: {
        en: "Championship round for intermediate and advanced Kathak performers.",
        hi: "मध्यवर्ती और उन्नत कथक कलाकारों के लिए चैम्पियनशिप दौर।"
      },
      judgingParameters: {
        en: "Footwork (Tatkar), Chakkars, and Expression (Bhav).",
        hi: "तत्कार, चक्कर और भाव।"
      },
      rulesAndEligibility: {
        en: "Traditional costume required. Minimum 3 minutes duration.",
        hi: "पारंपरिक वेशभूषा आवश्यक है।"
      }
    },
    rewards: [
      { position: 1, rankTitle: "1st Winner", amount: 1500, iconType: "trophy" },
      { position: 2, rankTitle: "2nd Winner", amount: 1000, iconType: "silver_medal" },
      { position: 3, rankTitle: "3rd Winner", amount: 500, iconType: "bronze_medal" }
    ],
    referral: {
      code: "kathak2026",
      url: "https://feedants.com/r/kathak2026",
      discountNotice: "Refer fellow dancers",
      rewardNotice: "You earn ₹20 for every referral"
    },
    disclaimer: "Official certification verified by national jury.",
    refundPolicy: "Non-refundable once submission begins.",
    paymentProviderNotice: "Secure payments powered by Razorpay"
  });

  // Pre-register user_demo_3 for showcase competition
  await Registration.create({
    competitionId: showcaseCompetition._id,
    userId: "user_demo_3",
    userName: "Ananya Roy",
    userEmail: "ananya.roy@example.com",
    paymentStatus: "PAID",
    registeredAt: new Date(now.getTime() - 20 * 60 * 60 * 1000)
  });

  // Pre-seed submission for user_demo_3
  await Submission.create({
    competitionId: showcaseCompetition._id,
    userId: "user_demo_3",
    userName: "Ananya Roy",
    submissionTitle: "Teental Kathak Tarana & Drut Laya",
    mediaUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    notes: "Performed in Raag Yaman with 16-beat cycle.",
    status: "SUBMITTED",
    submittedAt: new Date(now.getTime() - 5 * 60 * 60 * 1000)
  });
  console.log("Pre-registered and seeded submission for user_demo_3 on Showcase Competition");

  console.log("Database seeded successfully!");
}

if (require.main === module) {
  mongoose
    .connect(config.mongoUri)
    .then(async () => {
      await seedDatabase();
      await mongoose.disconnect();
      console.log("MongoDB connection closed.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Seed error:", err);
      process.exit(1);
    });
}
