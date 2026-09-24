import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { IJudge } from "../types";
import { useAuth } from "../context/AuthContext";

interface JudgeSectionProps {
  judge: IJudge;
  onWatchVideo?: () => void;
}

export const JudgeSection: React.FC<JudgeSectionProps> = ({ judge, onWatchVideo }) => {
  const { language } = useAuth();

  return (
    <View style={styles.card}>
      {/* Avatar */}
      <Image
        source={{
          uri:
            judge.avatarUrl ||
            "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200"
        }}
        style={styles.avatar}
      />

      {/* Details */}
      <View style={styles.detailsCol}>
        <Text style={styles.judgeLabel}>{language === "hi" ? "निर्णायक" : "Judge"}</Text>
        <Text style={styles.name}>{judge.name}</Text>
        <Text style={styles.role}>{judge.role}</Text>
        <Text style={styles.experience}>{judge.experience}</Text>
      </View>

      {/* Intro Video Button */}
      <TouchableOpacity
        style={styles.videoButton}
        onPress={onWatchVideo}
        activeOpacity={0.7}
      >
        <View style={styles.playCircle}>
          <Ionicons name="play" size={18} color="#007A78" style={{ marginLeft: 2 }} />
        </View>
        <Text style={styles.videoText}>
          {language === "hi" ? "परिचय वीडियो" : "Intro Video"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 14,
    backgroundColor: "#E5E7EB"
  },
  detailsCol: {
    flex: 1
  },
  judgeLabel: {
    fontSize: 11,
    color: "#6B7280",
    textTransform: "uppercase",
    fontWeight: "500"
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginVertical: 1
  },
  role: {
    fontSize: 12,
    color: "#4B5563"
  },
  experience: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 2
  },
  videoButton: {
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8
  },
  playCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E6F7F5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4
  },
  videoText: {
    fontSize: 11,
    color: "#4B5563",
    fontWeight: "500"
  }
});
