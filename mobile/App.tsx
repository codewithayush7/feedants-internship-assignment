import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "./src/context/AuthContext";
import { CompetitionDetailsScreen } from "./src/screens/CompetitionDetailsScreen";

export default function App() {
  return (
    <AuthProvider>
      <View style={styles.outerContainer}>
        <StatusBar style="dark" />
        <View style={styles.mobileFrame}>
          <CompetitionDetailsScreen />
        </View>
      </View>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: Platform.OS === "web" ? "#E5E7EB" : "#F9FAFB",
    alignItems: "center",
    justifyContent: "center"
  },
  mobileFrame: {
    flex: 1,
    width: "100%",
    maxWidth: Platform.OS === "web" ? 480 : "100%",
    backgroundColor: "#F9FAFB",
    // Elegant mobile shadow on web
    ...(Platform.OS === "web"
      ? {
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
          overflow: "hidden" as any
        }
      : {})
  }
});
