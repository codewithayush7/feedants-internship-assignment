import React, { useState, useEffect, useCallback } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  ActivityIndicator,
  Alert,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Platform
} from "react-native";
import { useAuth } from "../context/AuthContext";
import {
  fetchCompetitionDetails,
  registerForCompetitionApi,
  submitEntryApi
} from "../api/client";
import { ICompetitionDetailsResponse, IPreviousWinner } from "../types";

// Reusable Components
import { TopBar } from "../components/TopBar";
import { HeaderCard } from "../components/HeaderCard";
import { JudgeSection } from "../components/JudgeSection";
import { CountdownBanner } from "../components/CountdownBanner";
import { ImportantDatesGrid } from "../components/ImportantDatesGrid";
import { PreviousWinners } from "../components/PreviousWinners";
import { TabbedContent } from "../components/TabbedContent";
import { RewardsSection } from "../components/RewardsSection";
import { TrustAndReferralSection } from "../components/TrustAndReferralSection";
import { StickyBottomCTA } from "../components/StickyBottomCTA";
import { BottomNavBar } from "../components/BottomNavBar";
import { DevStateSwitcher } from "../components/DevStateSwitcher";
import { IntroVideoModal } from "../components/IntroVideoModal";
import { SubmissionModal } from "../components/SubmissionModal";
import { ToastBanner } from "../components/ToastBanner";

export const CompetitionDetailsScreen: React.FC = () => {
  const { currentUserId, language } = useAuth();

  const [currentSlug, setCurrentSlug] = useState<string>("feedants-classical-dance");
  const [data, setData] = useState<ICompetitionDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Modals state
  const [videoModal, setVideoModal] = useState<{
    visible: boolean;
    title: string;
    subtitle?: string;
    videoUrl?: string;
  }>({ visible: false, title: "" });

  const [submissionModalVisible, setSubmissionModalVisible] = useState<boolean>(false);
  const [isViewingSubmission, setIsViewingSubmission] = useState<boolean>(false);

  // Non-blocking toast state
  const [toast, setToast] = useState<{
    visible: boolean;
    type: "success" | "error" | "info";
    message: string;
  }>({ visible: false, type: "success", message: "" });

  const showToast = (type: "success" | "error" | "info", message: string) => {
    setToast({ visible: true, type, message });
  };

  // Load authoritative competition data from backend
  const loadCompetition = useCallback(async () => {
    try {
      setErrorMessage("");
      const result = await fetchCompetitionDetails(currentSlug, currentUserId);
      setData(result);
    } catch (err: any) {
      console.error("Fetch competition error:", err);
      setErrorMessage(
        err.message || "Failed to load competition details. Ensure backend is running."
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [currentSlug, currentUserId]);

  useEffect(() => {
    setIsLoading(true);
    loadCompetition();
  }, [loadCompetition]);

  const onRefresh = () => {
    setIsRefreshing(true);
    loadCompetition();
  };

  // Authoritative Registration Flow
  const handleRegister = async () => {
    if (!data) return;

    try {
      setIsRegistering(true);
      const res = await registerForCompetitionApi(data.competition.slug, currentUserId);

      // Replace state with authoritative backend response (NO local mutation)
      setData({
        competition: res.competition,
        lifecycle: res.lifecycle,
        spotsRemaining: res.spotsRemaining,
        userState: res.userState
      });

      // Non-blocking success toast feedback
      showToast(
        "success",
        language === "hi"
          ? "पंजीकरण सफल! अब आप अपना सबमिशन अपलोड कर सकते हैं।"
          : "Registration successful! You can now upload your submission."
      );
    } catch (err: any) {
      const msg = err.message || "Registration failed";
      showToast("error", msg);
    } finally {
      setIsRegistering(false);
    }
  };

  // Submission Flow
  const handleSubmitEntry = async (title: string, mediaUrl: string, notes: string) => {
    if (!data) return;

    await submitEntryApi(data.competition.slug, currentUserId, {
      submissionTitle: title,
      mediaUrl,
      notes
    });

    // Refresh to obtain authoritative submitted state
    await loadCompetition();

    // Non-blocking success toast feedback
    showToast(
      "success",
      language === "hi"
        ? "सबमिशन प्राप्त हुआ! आपकी प्रविष्टि समीक्षाधीन है।"
        : "Submission received! Your entry is under review."
    );
  };

  // Modals helpers
  const handleWatchJudgeVideo = () => {
    if (!data) return;
    setVideoModal({
      visible: true,
      title: `${data.competition.judge.name} - Introduction Video`,
      subtitle: data.competition.judge.role,
      videoUrl: data.competition.judge.introVideoUrl
    });
  };

  const handleWinnerVideo = (winner: IPreviousWinner) => {
    setVideoModal({
      visible: true,
      title: `${winner.name} (${winner.rankTitle})`,
      subtitle: "Winning Performance Replay",
      videoUrl: winner.videoUrl
    });
  };

  const handlePrizeMoneyVideo = () => {
    setVideoModal({
      visible: true,
      title: "How Prize Money is Distributed",
      subtitle: "Direct bank transfer / UPI via RazorpayX",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
    });
  };

  const handleRefundPolicy = () => {
    const text =
      data?.competition.refundPolicy ||
      "Refund policy available within 24 hours of registration before competition start.";
    if (Platform.OS === "web") {
      window.alert(text);
    } else {
      Alert.alert("Refund Policy", text);
    }
  };

  const handleTestimonials = () => {
    const text =
      "Feedants Participant Testimonials:\n\n• 'The classical dance competition gave me national exposure!' - Riya S.\n• 'Transparent judging and instant prize payout.' - Aarav M.\n• 'Loved the judging feedback from Manju Dubey.' - Neha V.";
    if (Platform.OS === "web") {
      window.alert(text);
    } else {
      Alert.alert("Hear From Our Users", text);
    }
  };

  if (isLoading && !data) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007A78" />
        <Text style={styles.loadingText}>
          {language === "hi" ? "प्रतियोगिता लोड हो रही है..." : "Loading competition details..."}
        </Text>
      </SafeAreaView>
    );
  }

  if (errorMessage && !data) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.errorTitle}>Unable to connect to server</Text>
        <Text style={styles.errorSub}>{errorMessage}</Text>
        <StickyBottomCTA
          entryFee={99}
          lifecycle={{} as any}
          userState={{ isRegistered: false, isSubmitted: false }}
          spotsRemaining={0}
          isLoading={false}
          onRegisterPress={loadCompetition}
          onSubmitPress={() => {}}
          onViewSubmissionPress={() => {}}
        />
      </SafeAreaView>
    );
  }

  if (!data) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      {/* Floating Non-Blocking Feedback Banner */}
      <ToastBanner
        visible={toast.visible}
        type={toast.type}
        message={toast.message}
        onDismiss={() => setToast((prev) => ({ ...prev, visible: false }))}
      />

      {/* Evaluator State Switcher Toolbar */}
      <DevStateSwitcher
        currentCompetitionSlug={currentSlug}
        onSwitchCompetition={(slug) => setCurrentSlug(slug)}
        onRefresh={loadCompetition}
      />

      {/* Top Bar with Go Back & Language Toggle */}
      <TopBar
        onBackPress={() => {
          if (Platform.OS === "web") {
            window.alert("Back action triggered");
          } else {
            Alert.alert("Back Action", "Navigation go back");
          }
        }}
      />

      {/* Main Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={["#007A78"]}
            tintColor="#007A78"
          />
        }
      >
        {/* 1. Header Card */}
        <HeaderCard
          competition={data.competition}
          userState={data.userState}
          lifecycle={data.lifecycle}
          spotsRemaining={data.spotsRemaining}
        />

        {/* 2. Judge Section */}
        <JudgeSection
          judge={data.competition.judge}
          onWatchVideo={handleWatchJudgeVideo}
        />

        {/* 3. Dynamic Countdown Banner */}
        <CountdownBanner lifecycle={data.lifecycle} />

        {/* 4. Important Dates Grid */}
        <ImportantDatesGrid dates={data.competition.dates} />

        {/* 5. Previous Winners */}
        <PreviousWinners
          winners={data.competition.previousWinners}
          onWinnerPress={handleWinnerVideo}
        />

        {/* 6. Tabbed Content (About / Judging / Rules) */}
        <TabbedContent tabs={data.competition.tabs} />

        {/* 7. Rewards Breakdown (1st - 6th) */}
        <RewardsSection rewards={data.competition.rewards} />

        {/* 8. Trust, Disclaimer & Referral */}
        <TrustAndReferralSection
          disclaimer={data.competition.disclaimer}
          refundPolicy={data.competition.refundPolicy}
          paymentNotice={data.competition.paymentProviderNotice}
          referral={data.competition.referral}
          onOpenTestimonials={handleTestimonials}
          onOpenPrizeVideo={handlePrizeMoneyVideo}
          onOpenRefundPolicy={handleRefundPolicy}
        />
      </ScrollView>

      {/* Sticky Bottom Action Bar (Context-Aware) */}
      <StickyBottomCTA
        entryFee={data.competition.entryFee}
        lifecycle={data.lifecycle}
        userState={data.userState}
        spotsRemaining={data.spotsRemaining}
        isLoading={isRegistering}
        onRegisterPress={handleRegister}
        onSubmitPress={() => {
          setIsViewingSubmission(false);
          setSubmissionModalVisible(true);
        }}
        onViewSubmissionPress={() => {
          setIsViewingSubmission(true);
          setSubmissionModalVisible(true);
        }}
      />

      {/* Bottom Navigation Bar */}
      <BottomNavBar
        onAddPress={() => {
          if (data.userState.isRegistered) {
            setIsViewingSubmission(false);
            setSubmissionModalVisible(true);
          } else {
            handleRegister();
          }
        }}
        onTabPress={(tab) => {
          if (tab === "Competitions") {
            loadCompetition();
          }
        }}
      />

      {/* Video Preview Modal */}
      <IntroVideoModal
        visible={videoModal.visible}
        title={videoModal.title}
        subtitle={videoModal.subtitle}
        videoUrl={videoModal.videoUrl}
        onClose={() => setVideoModal({ ...videoModal, visible: false })}
      />

      {/* Submission Modal */}
      <SubmissionModal
        visible={submissionModalVisible}
        competitionTitle={data.competition.title}
        isReadOnly={isViewingSubmission}
        existingSubmission={data.userState.submission}
        onSubmit={handleSubmitEntry}
        onClose={() => setSubmissionModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB"
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#F9FAFB"
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#4B5563"
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#DC2626",
    marginBottom: 8
  },
  errorSub: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 20
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    paddingBottom: 10
  }
});
