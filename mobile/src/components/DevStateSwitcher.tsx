import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";

interface DevStateSwitcherProps {
  currentCompetitionSlug: string;
  onSwitchCompetition: (slug: string) => void;
  onRefresh: () => void;
}

export const DevStateSwitcher: React.FC<DevStateSwitcherProps> = ({
  currentCompetitionSlug,
  onSwitchCompetition,
  onRefresh
}) => {
  const { currentUserId, switchUser, demoUsers } = useAuth();
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const userRoles: Record<string, string> = {
    user_demo_1: "Priya (Unregistered)",
    user_demo_2: "Rahul (Registered - Ref UI)",
    user_demo_3: "Ananya (Submitted)"
  };

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <TouchableOpacity
        style={styles.headerBar}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.8}
      >
        <View style={styles.leftLabel}>
          <View style={styles.devPill}>
            <Text style={styles.devPillText}>EVALUATOR TOOLBAR</Text>
          </View>
          <Text style={styles.activeUserSummary} numberOfLines={1}>
            User: <Text style={styles.highlightText}>{userRoles[currentUserId] || currentUserId}</Text>
          </Text>
        </View>

        <View style={styles.rightActions}>
          <TouchableOpacity onPress={onRefresh} style={styles.iconBtn}>
            <Ionicons name="refresh" size={16} color="#007A78" />
          </TouchableOpacity>
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={18}
            color="#4B5563"
          />
        </View>
      </TouchableOpacity>

      {/* Expanded Controls */}
      {isExpanded && (
        <View style={styles.expandedContent}>
          {/* User Selector */}
          <Text style={styles.controlHeading}>Switch Active Demo User:</Text>
          <View style={styles.buttonRow}>
            {demoUsers.map((user) => {
              const isSelected = user.userId === currentUserId;
              return (
                <TouchableOpacity
                  key={user.userId}
                  style={[styles.userChip, isSelected && styles.userChipSelected]}
                  onPress={() => switchUser(user.userId)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.userChipText, isSelected && styles.userChipTextSelected]}>
                    {userRoles[user.userId] || user.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Competition Selector */}
          <Text style={[styles.controlHeading, { marginTop: 8 }]}>Switch Competition Window:</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[
                styles.userChip,
                currentCompetitionSlug === "feedants-classical-dance" && styles.userChipSelected
              ]}
              onPress={() => onSwitchCompetition("feedants-classical-dance")}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.userChipText,
                  currentCompetitionSlug === "feedants-classical-dance" &&
                    styles.userChipTextSelected
                ]}
              >
                Classical Dance (Registration Open)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.userChip,
                currentCompetitionSlug === "feedants-kathak-masters" && styles.userChipSelected
              ]}
              onPress={() => onSwitchCompetition("feedants-kathak-masters")}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.userChipText,
                  currentCompetitionSlug === "feedants-kathak-masters" &&
                    styles.userChipTextSelected
                ]}
              >
                Kathak Masters (Submission Open)
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F0FDF4",
    borderBottomWidth: 1,
    borderBottomColor: "#BBF7D0"
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  leftLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1
  },
  devPill: {
    backgroundColor: "#065F60",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2
  },
  devPillText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5
  },
  activeUserSummary: {
    fontSize: 11,
    color: "#374151",
    fontWeight: "500",
    flex: 1
  },
  highlightText: {
    color: "#065F60",
    fontWeight: "700"
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  iconBtn: {
    padding: 4
  },
  expandedContent: {
    paddingHorizontal: 12,
    paddingBottom: 10,
    backgroundColor: "#F9FAFB",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB"
  },
  controlHeading: {
    fontSize: 11,
    fontWeight: "700",
    color: "#374151",
    marginVertical: 4
  },
  buttonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6
  },
  userChip: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "#D1D5DB"
  },
  userChipSelected: {
    backgroundColor: "#065F60",
    borderColor: "#065F60"
  },
  userChipText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#374151"
  },
  userChipTextSelected: {
    color: "#FFFFFF"
  }
});
