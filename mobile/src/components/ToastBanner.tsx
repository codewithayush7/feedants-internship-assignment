import React, { useEffect, useRef } from "react";
import { Animated, View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ToastBannerProps {
  visible: boolean;
  type: "success" | "error" | "info";
  message: string;
  onDismiss?: () => void;
  duration?: number;
}

export const ToastBanner: React.FC<ToastBannerProps> = ({
  visible,
  type,
  message,
  onDismiss,
  duration = 3500
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true
        })
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true
          }),
          Animated.timing(translateY, {
            toValue: -20,
            duration: 250,
            useNativeDriver: true
          })
        ]).start(() => {
          if (onDismiss) onDismiss();
        });
      }, duration);

      return () => clearTimeout(timer);
    } else {
      opacity.setValue(0);
      translateY.setValue(-20);
    }
  }, [visible, message, duration]);

  if (!visible) return null;

  const isSuccess = type === "success";
  const isError = type === "error";

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        isSuccess && styles.successToast,
        isError && styles.errorToast,
        {
          opacity,
          transform: [{ translateY }]
        }
      ]}
    >
      <Ionicons
        name={isSuccess ? "checkmark-circle" : isError ? "alert-circle" : "information-circle"}
        size={20}
        color={isSuccess ? "#059669" : isError ? "#DC2626" : "#007A78"}
      />
      <Text
        style={[
          styles.toastText,
          isSuccess && styles.successText,
          isError && styles.errorText
        ]}
      >
        {message}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: "absolute",
    top: 55,
    left: 16,
    right: 16,
    zIndex: 9999,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 10
  },
  successToast: {
    backgroundColor: "#F0FDF4",
    borderColor: "#A7F3D0"
  },
  errorToast: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA"
  },
  toastText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1F2937",
    flex: 1
  },
  successText: {
    color: "#065F46"
  },
  errorText: {
    color: "#991B1B"
  }
});
