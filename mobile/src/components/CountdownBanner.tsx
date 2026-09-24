import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCountdown } from "../hooks/useCountdown";
import { useAuth } from "../context/AuthContext";
import { ILifecycleEvaluation, LifecycleState } from "../types";

interface CountdownBannerProps {
  lifecycle: ILifecycleEvaluation;
}

export const CountdownBanner: React.FC<CountdownBannerProps> = ({ lifecycle }) => {
  const { language } = useAuth();

  // If in REGISTRATION_OPEN, countdown to registrationCloseTimestamp
  // If in SUBMISSION_OPEN, countdown to submissionEndTimestamp
  const targetTimestamp =
    lifecycle.state === LifecycleState.SUBMISSION_OPEN
      ? lifecycle.submissionEndTimestamp
      : lifecycle.registrationCloseTimestamp;

  const { formattedString, isExpired } = useCountdown(targetTimestamp);

  let label = language === "hi" ? "पंजीकरण समाप्त होगा" : "Registration closes in";
  let alertText = language === "hi" ? "जल्दी करें!" : "Hurry up!";

  if (lifecycle.state === LifecycleState.SUBMISSION_OPEN) {
    label = language === "hi" ? "सबमिशन समाप्त होगा" : "Submission ends in";
  } else if (lifecycle.state === LifecycleState.REGISTRATION_CLOSED) {
    label = language === "hi" ? "पंजीकरण बंद है" : "Registration closed";
    alertText = "";
  } else if (lifecycle.state === LifecycleState.COMPLETED) {
    label = language === "hi" ? "प्रतियोगिता समाप्त" : "Competition completed";
    alertText = "";
  }

  return (
    <View style={styles.banner}>
      {/* Left Icon & Label */}
      <View style={styles.leftGroup}>
        <Ionicons name="hourglass-outline" size={16} color="#007A78" />
        <Text style={styles.labelText}>{label}</Text>
      </View>

      {/* Dynamic Countdown Display */}
      <Text style={styles.countdownText}>
        {isExpired && lifecycle.state !== LifecycleState.REGISTRATION_OPEN
          ? "00d : 00h : 00m : 00s"
          : formattedString}
      </Text>

      {/* Right Hurry Up Tag */}
      {alertText ? (
        <View style={styles.rightGroup}>
          <Ionicons name="stopwatch-outline" size={16} color="#007A78" />
          <Text style={styles.hurryText}>{alertText}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: "#EDF8F8",
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#D1F0EE"
  },
  leftGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  labelText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1F2937"
  },
  countdownText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#007A78",
    letterSpacing: 0.3
  },
  rightGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  hurryText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#007A78"
  }
});
