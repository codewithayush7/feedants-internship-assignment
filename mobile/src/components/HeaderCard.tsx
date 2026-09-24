import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ICompetition, IUserParticipationState, ILifecycleEvaluation } from "../types";
import { useAuth } from "../context/AuthContext";

interface HeaderCardProps {
  competition: ICompetition;
  userState: IUserParticipationState;
  lifecycle: ILifecycleEvaluation;
  spotsRemaining: number;
}

export const HeaderCard: React.FC<HeaderCardProps> = ({
  competition,
  userState,
  lifecycle,
  spotsRemaining
}) => {
  const { language } = useAuth();
  const bookedPercent = Math.min(
    100,
    Math.round((competition.registeredCount / competition.totalSpots) * 100)
  );

  return (
    <View style={styles.card}>
      {/* Title & Status Badge Row */}
      <View style={styles.titleRow}>
        <Text style={styles.title}>{competition.title}</Text>
        {userState.isRegistered ? (
          <View style={styles.registeredBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#008080" />
            <Text style={styles.registeredText}>
              {language === "hi" ? "पंजीकृत" : "Registered"}
            </Text>
          </View>
        ) : lifecycle.isFull ? (
          <View style={[styles.registeredBadge, styles.fullBadge]}>
            <Text style={[styles.registeredText, styles.fullText]}>
              {language === "hi" ? "हाउस फुल" : "House Full"}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Category Pills & Certificate Row */}
      <View style={styles.tagsRow}>
        {competition.categoryTags.map((tag, idx) => (
          <View key={idx} style={styles.tagPill}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}

        <View style={styles.certRow}>
          <Ionicons name="trophy-outline" size={16} color="#008080" />
          <Text style={styles.certText}>
            {language === "hi" ? "विजेताओं को प्रमाण पत्र मिलेगा" : competition.certificateNotice}
          </Text>
        </View>
      </View>

      {/* Financial Metrics & Spots Row */}
      <View style={styles.metricsRow}>
        {/* Prize Pool */}
        <View style={styles.metricCol}>
          <Text style={styles.metricLabel}>
            {language === "hi" ? "पुरस्कार राशि" : "Prize Pool"}
          </Text>
          <Text style={styles.prizeAmount}>₹ {competition.prizePool.toLocaleString("en-IN")}</Text>
        </View>

        {/* Entry Fee */}
        <View style={styles.metricCol}>
          <Text style={styles.metricLabel}>
            {language === "hi" ? "प्रवेश शुल्क" : "Entry Fee"}
          </Text>
          <Text style={styles.feeAmount}>₹ {competition.entryFee}</Text>
        </View>

        {/* Spots Left & Progress Bar */}
        <View style={styles.spotsCol}>
          <View style={styles.spotsHeader}>
            <Ionicons name="people-outline" size={16} color="#008080" />
            <Text style={styles.spotsText}>
              {spotsRemaining > 0
                ? language === "hi"
                  ? `केवल ${spotsRemaining} स्थान शेष`
                  : `Only ${spotsRemaining} spots left`
                : language === "hi"
                ? "कोई स्थान शेष नहीं"
                : "No spots left"}
            </Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.max(5, bookedPercent)}%` }]} />
          </View>

          {/* Booked Caption */}
          <Text style={styles.bookedText}>
            {`${competition.registeredCount} / ${competition.totalSpots} ${
              language === "hi" ? "बुक किया गया" : "Booked"
            }`}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    flex: 1,
    marginRight: 8
  },
  registeredBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E6F7F5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#A7F3D0",
    gap: 4
  },
  registeredText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#008080"
  },
  fullBadge: {
    backgroundColor: "#FEE2E2",
    borderColor: "#FCA5A5"
  },
  fullText: {
    color: "#DC2626"
  },
  tagsRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16
  },
  tagPill: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8
  },
  tagText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#4B5563"
  },
  certRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  certText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#008080"
  },
  metricsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6"
  },
  metricCol: {
    flex: 1
  },
  metricLabel: {
    fontSize: 11,
    color: "#6B7280",
    marginBottom: 2
  },
  prizeAmount: {
    fontSize: 22,
    fontWeight: "800",
    color: "#008080"
  },
  feeAmount: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827"
  },
  spotsCol: {
    flex: 1.4,
    alignItems: "flex-end"
  },
  spotsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4
  },
  spotsText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#008080"
  },
  progressTrack: {
    width: "100%",
    height: 5,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 4
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#008080",
    borderRadius: 3
  },
  bookedText: {
    fontSize: 11,
    color: "#6B7280"
  }
});
