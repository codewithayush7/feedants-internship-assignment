import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { IReward } from "../types";
import { useAuth } from "../context/AuthContext";

interface RewardsSectionProps {
  rewards: IReward[];
}

export const RewardsSection: React.FC<RewardsSectionProps> = ({ rewards }) => {
  const { language } = useAuth();

  const renderIcon = (type: string, position: number) => {
    switch (type) {
      case "trophy":
        return <Text style={styles.emojiIcon}>🏆</Text>;
      case "silver_medal":
        return <Text style={styles.emojiIcon}>🥈</Text>;
      case "bronze_medal":
        return <Text style={styles.emojiIcon}>🥉</Text>;
      case "star":
      default:
        return <Ionicons name="star-outline" size={18} color="#007A78" />;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>
        {language === "hi" ? "पुरस्कार (सभी पद)" : "Rewards"}
        <Text style={styles.subtitle}>
          {language === "hi" ? " (सभी पद)" : " (All Positions)"}
        </Text>
      </Text>

      <View style={styles.card}>
        {rewards.map((reward, index) => (
          <View
            key={reward.position || index}
            style={[
              styles.rewardRow,
              index < rewards.length - 1 && styles.rowBorder
            ]}
          >
            {/* Left: Icon & Rank */}
            <View style={styles.rankCol}>
              <View style={styles.iconContainer}>
                {renderIcon(reward.iconType, reward.position)}
              </View>
              <Text style={styles.rankTitle}>{reward.rankTitle}</Text>
            </View>

            {/* Right: Amount */}
            <Text style={styles.amountText}>
              ₹ {reward.amount.toLocaleString("en-IN")}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8
  },
  subtitle: {
    fontSize: 13,
    fontWeight: "400",
    color: "#6B7280"
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 4
  },
  rewardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6"
  },
  rankCol: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  iconContainer: {
    width: 28,
    alignItems: "center",
    justifyContent: "center"
  },
  emojiIcon: {
    fontSize: 18
  },
  rankTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937"
  },
  amountText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#007A78"
  }
});
