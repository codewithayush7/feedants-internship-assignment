import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";

interface TopBarProps {
  onBackPress?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onBackPress }) => {
  const { language, setLanguage } = useAuth();

  return (
    <View style={styles.container}>
      {/* Go Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBackPress}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={20} color="#111827" />
        <Text style={styles.backText}>{language === "hi" ? "वापस जाएं" : "Go back"}</Text>
      </TouchableOpacity>

      {/* Language Toggle Pill */}
      <View style={styles.languagePill}>
        <TouchableOpacity
          style={[styles.langSegment, language === "en" && styles.activeLangSegment]}
          onPress={() => setLanguage("en")}
          activeOpacity={0.8}
        >
          <Text style={[styles.langText, language === "en" && styles.activeLangText]}>
            ENG
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.langSegment, language === "hi" && styles.activeLangSegment]}
          onPress={() => setLanguage("hi")}
          activeOpacity={0.8}
        >
          <Text style={[styles.langText, language === "hi" && styles.activeLangText]}>
            हिंदी
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#F9FAFB"
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  backText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827"
  },
  languagePill: {
    flexDirection: "row",
    backgroundColor: "#E5E7EB",
    borderRadius: 20,
    padding: 2
  },
  langSegment: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 18
  },
  activeLangSegment: {
    backgroundColor: "#007A78"
  },
  langText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4B5563"
  },
  activeLangText: {
    color: "#FFFFFF"
  }
});
