import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";

interface BottomNavBarProps {
  onAddPress?: () => void;
  onTabPress?: (tabName: string) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ onAddPress, onTabPress }) => {
  const { language, currentUser } = useAuth();

  return (
    <View style={styles.navBar}>
      {/* 1. Home */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => onTabPress && onTabPress("Home")}
        activeOpacity={0.7}
      >
        <Ionicons name="home-outline" size={22} color="#6B7280" />
        <Text style={styles.navLabel}>{language === "hi" ? "होम" : "Home"}</Text>
      </TouchableOpacity>

      {/* 2. Explore */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => onTabPress && onTabPress("Explore")}
        activeOpacity={0.7}
      >
        <Ionicons name="search-outline" size={22} color="#6B7280" />
        <Text style={styles.navLabel}>{language === "hi" ? "एक्सप्लोर" : "Explore"}</Text>
      </TouchableOpacity>

      {/* 3. Center Add (+) Button */}
      <View style={styles.centerItem}>
        <TouchableOpacity
          style={styles.addCircle}
          onPress={onAddPress}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={26} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* 4. Competitions (Active) */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => onTabPress && onTabPress("Competitions")}
        activeOpacity={0.7}
      >
        <Ionicons name="trophy" size={22} color="#007A78" />
        <Text style={[styles.navLabel, styles.activeLabel]}>
          {language === "hi" ? "प्रतियोगिताएं" : "Competitions"}
        </Text>
      </TouchableOpacity>

      {/* 5. Profile */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => onTabPress && onTabPress("Profile")}
        activeOpacity={0.7}
      >
        {currentUser?.avatarUrl ? (
          <Image source={{ uri: currentUser.avatarUrl }} style={styles.profileAvatar} />
        ) : (
          <Ionicons name="person-circle-outline" size={24} color="#6B7280" />
        )}
        <Text style={styles.navLabel}>{language === "hi" ? "प्रोफ़ाइल" : "Profile"}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#FFFFFF",
    paddingVertical: 6,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6"
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1
  },
  navLabel: {
    fontSize: 10,
    fontWeight: "500",
    color: "#6B7280",
    marginTop: 2
  },
  activeLabel: {
    color: "#007A78",
    fontWeight: "700"
  },
  centerItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1
  },
  addCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#065F60",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3
  },
  profileAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11
  }
});
