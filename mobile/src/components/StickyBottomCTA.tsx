import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { ILifecycleEvaluation, IUserParticipationState, LifecycleState } from "../types";
import { useAuth } from "../context/AuthContext";

interface StickyBottomCTAProps {
  entryFee: number;
  lifecycle: ILifecycleEvaluation;
  userState: IUserParticipationState;
  spotsRemaining: number;
  isLoading: boolean;
  onRegisterPress: () => void;
  onSubmitPress: () => void;
  onViewSubmissionPress: () => void;
}

export const StickyBottomCTA: React.FC<StickyBottomCTAProps> = ({
  entryFee,
  lifecycle,
  userState,
  spotsRemaining,
  isLoading,
  onRegisterPress,
  onSubmitPress,
  onViewSubmissionPress
}) => {
  const { language } = useAuth();

  // 1. User has already submitted an entry
  if (userState.isSubmitted) {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={[styles.ctaButton, styles.submittedButton]}
          onPress={onViewSubmissionPress}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaTitle}>
            {language === "hi" ? "सबमिशन प्राप्त हुआ ✔" : "Submission Received ✔"}
          </Text>
          <Text style={styles.ctaSubtitle}>
            {language === "hi" ? "सबमिशन विवरण देखें" : "View Submission Details"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 2. User is registered -> "Upload Submission" (Exact match to Objective_Page.png)
  if (userState.isRegistered) {
    const isSubmissionOpen = lifecycle.state === LifecycleState.SUBMISSION_OPEN;
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={onSubmitPress}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaTitle}>
            {language === "hi" ? "सबमिशन अपलोड करें" : "Upload Submission"}
          </Text>
          <Text style={styles.ctaSubtitle}>
            {language === "hi"
              ? "पंजीकृत"
              : isSubmissionOpen
              ? "Registered • Submissions Open"
              : "Registered"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 3. House Full (Capacity Exceeded)
  if (lifecycle.isFull || spotsRemaining <= 0) {
    return (
      <View style={styles.container}>
        <View style={[styles.ctaButton, styles.disabledButton]}>
          <Text style={styles.disabledTitle}>
            {language === "hi" ? "हाउस फुल" : "House Full"}
          </Text>
          <Text style={styles.disabledSubtitle}>
            {language === "hi"
              ? "सभी स्थान बुक हो चुके हैं"
              : "All participation spots are booked"}
          </Text>
        </View>
      </View>
    );
  }

  // 4. Registration Closed
  if (!lifecycle.canRegister) {
    return (
      <View style={styles.container}>
        <View style={[styles.ctaButton, styles.disabledButton]}>
          <Text style={styles.disabledTitle}>
            {language === "hi" ? "पंजीकरण बंद है" : "Registration Closed"}
          </Text>
          <Text style={styles.disabledSubtitle}>
            {language === "hi"
              ? "इस प्रतियोगिता के लिए समय सीमा समाप्त हो गई है"
              : "Deadline for new registrations has passed"}
          </Text>
        </View>
      </View>
    );
  }

  // 5. Unregistered User -> "Register Now - ₹99"
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.ctaButton}
        onPress={onRegisterPress}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <>
            <Text style={styles.ctaTitle}>
              {language === "hi"
                ? `अभी पंजीकरण करें • ₹${entryFee}`
                : `Register Now • ₹${entryFee}`}
            </Text>
            <Text style={styles.ctaSubtitle}>
              {language === "hi"
                ? `केवल ${spotsRemaining} स्थान शेष • त्वरित पुष्टि`
                : `Only ${spotsRemaining} spots left • Instant Confirmation`}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB"
  },
  ctaButton: {
    backgroundColor: "#065F60",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  ctaTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.2
  },
  ctaSubtitle: {
    fontSize: 11,
    fontWeight: "500",
    color: "#A7F3D0",
    marginTop: 2
  },
  submittedButton: {
    backgroundColor: "#047857"
  },
  disabledButton: {
    backgroundColor: "#9CA3AF"
  },
  disabledTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF"
  },
  disabledSubtitle: {
    fontSize: 11,
    color: "#F3F4F6",
    marginTop: 2
  }
});
