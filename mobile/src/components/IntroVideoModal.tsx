import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface IntroVideoModalProps {
  visible: boolean;
  title: string;
  subtitle?: string;
  videoUrl?: string;
  onClose: () => void;
}

const { width } = Dimensions.get("window");

export const IntroVideoModal: React.FC<IntroVideoModalProps> = ({
  visible,
  title,
  subtitle,
  videoUrl,
  onClose
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title} numberOfLines={1}>{title}</Text>
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#111827" />
            </TouchableOpacity>
          </View>

          {/* Video Player Canvas / Simulation */}
          <View style={styles.videoPlayerBox}>
            <Ionicons name="play-circle" size={54} color="#007A78" />
            <Text style={styles.playingText}>Video Stream Ready</Text>
            <Text style={styles.urlText} numberOfLines={1}>
              {videoUrl || "https://feedants.com/media/intro.mp4"}
            </Text>
          </View>

          {/* Close button */}
          <TouchableOpacity style={styles.doneBtn} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.doneBtnText}>Close Preview</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    width: Math.min(width - 32, 450),
    padding: 16,
    overflow: "hidden"
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827"
  },
  subtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2
  },
  closeBtn: {
    padding: 4
  },
  videoPlayerBox: {
    height: 200,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB"
  },
  playingText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginTop: 8
  },
  urlText: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 2,
    maxWidth: 250
  },
  doneBtn: {
    backgroundColor: "#065F60",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center"
  },
  doneBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700"
  }
});
