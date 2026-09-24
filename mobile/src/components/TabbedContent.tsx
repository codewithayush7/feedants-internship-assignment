import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ICompetitionTabs } from "../types";
import { useAuth } from "../context/AuthContext";

interface TabbedContentProps {
  tabs: ICompetitionTabs;
}

type TabKey = "about" | "judgingParameters" | "rulesAndEligibility";

export const TabbedContent: React.FC<TabbedContentProps> = ({ tabs }) => {
  const { language } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>("about");
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const tabLabels: Record<TabKey, { en: string; hi: string }> = {
    about: { en: "About Competition", hi: "प्रतियोगिता के बारे में" },
    judgingParameters: { en: "Judging Parameters", hi: "निर्णय पैरामीटर" },
    rulesAndEligibility: { en: "Rules & Eligibility", hi: "नियम और पात्रता" }
  };

  const currentText =
    language === "hi" ? tabs[activeTab]?.hi || "" : tabs[activeTab]?.en || "";

  return (
    <View style={styles.card}>
      {/* Tabs Header */}
      <View style={styles.tabsHeader}>
        {(["about", "judgingParameters", "rulesAndEligibility"] as TabKey[]).map((tabKey) => {
          const isActive = activeTab === tabKey;
          return (
            <TouchableOpacity
              key={tabKey}
              style={[styles.tabButton, isActive && styles.activeTabButton]}
              onPress={() => {
                setActiveTab(tabKey);
                setIsExpanded(false);
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabButtonText, isActive && styles.activeTabText]}>
                {language === "hi" ? tabLabels[tabKey].hi : tabLabels[tabKey].en}
              </Text>
              {isActive && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Content Body */}
      <View style={styles.contentBody}>
        <Text
          style={styles.bodyText}
          numberOfLines={isExpanded ? undefined : 3}
          ellipsizeMode="tail"
        >
          {currentText}
        </Text>

        {/* View More / View Less Toggle */}
        <TouchableOpacity
          style={styles.expandButton}
          onPress={() => setIsExpanded(!isExpanded)}
          activeOpacity={0.7}
        >
          <Text style={styles.expandText}>
            {isExpanded
              ? language === "hi"
                ? "कम देखें"
                : "View less"
              : language === "hi"
              ? "अधिक देखें"
              : "View more"}
          </Text>
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={14}
            color="#007A78"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden"
  },
  tabsHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB"
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    position: "relative"
  },
  activeTabButton: {},
  tabButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
    textAlign: "center"
  },
  activeTabText: {
    color: "#007A78",
    fontWeight: "700"
  },
  activeIndicator: {
    position: "absolute",
    bottom: -1,
    left: 12,
    right: 12,
    height: 2.5,
    backgroundColor: "#007A78",
    borderRadius: 2
  },
  contentBody: {
    padding: 16
  },
  bodyText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#4B5563"
  },
  expandButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginTop: 10,
    paddingVertical: 4
  },
  expandText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#007A78"
  }
});
