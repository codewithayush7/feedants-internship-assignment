import React from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { IPreviousWinner } from "../types";
import { useAuth } from "../context/AuthContext";

interface PreviousWinnersProps {
  winners: IPreviousWinner[];
  onWinnerPress?: (winner: IPreviousWinner) => void;
}

export const PreviousWinners: React.FC<PreviousWinnersProps> = ({ winners, onWinnerPress }) => {
  const { language } = useAuth();

  if (!winners || winners.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>
        {language === "hi" ? "पिछले विजेता" : "Previous Winners"}
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {winners.map((winner, index) => (
          <TouchableOpacity
            key={index}
            style={styles.winnerCard}
            onPress={() => onWinnerPress && onWinnerPress(winner)}
            activeOpacity={0.8}
          >
            {/* Image Thumbnail with Overlay Play Badge */}
            <View style={styles.imageWrapper}>
              <Image
                source={{
                  uri:
                    winner.thumbnailUrl ||
                    "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=200"
                }}
                style={styles.thumbnail}
              />
              <View style={styles.playBadge}>
                <Ionicons name="play" size={12} color="#007A78" style={{ marginLeft: 1 }} />
              </View>
            </View>

            {/* Winner Details */}
            <View style={styles.infoCol}>
              <Text style={styles.winnerName} numberOfLines={1}>
                {winner.name}
              </Text>
              <Text style={styles.rankTitle}>{winner.rankTitle}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginHorizontal: 16,
    marginBottom: 10
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12
  },
  winnerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 8,
    paddingRight: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1
  },
  imageWrapper: {
    position: "relative",
    width: 52,
    height: 52,
    borderRadius: 8,
    overflow: "hidden",
    marginRight: 10
  },
  thumbnail: {
    width: "100%",
    height: "100%",
    backgroundColor: "#E5E7EB"
  },
  playBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    alignItems: "center",
    justifyContent: "center"
  },
  infoCol: {
    justifyContent: "center"
  },
  winnerName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2
  },
  rankTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#007A78"
  }
});
