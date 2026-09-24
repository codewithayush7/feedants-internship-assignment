import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  ScrollView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";

interface SubmissionModalProps {
  visible: boolean;
  competitionTitle: string;
  isReadOnly?: boolean;
  existingSubmission?: {
    submissionTitle: string;
    mediaUrl: string;
    submittedAt?: string;
  } | null;
  onSubmit: (title: string, mediaUrl: string, notes: string) => Promise<void>;
  onClose: () => void;
}

const { width } = Dimensions.get("window");

export const SubmissionModal: React.FC<SubmissionModalProps> = ({
  visible,
  competitionTitle,
  isReadOnly = false,
  existingSubmission,
  onSubmit,
  onClose
}) => {
  const { language } = useAuth();
  const [title, setTitle] = useState<string>("");
  const [mediaUrl, setMediaUrl] = useState<string>("https://youtu.be/classical-kathak-demo");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleSubmit = async () => {
    if (!title.trim()) {
      setErrorMessage("Please enter a submission title.");
      return;
    }
    if (!mediaUrl.trim()) {
      setErrorMessage("Please enter a video or media link.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");
      await onSubmit(title.trim(), mediaUrl.trim(), notes.trim());
      setTitle("");
      setNotes("");
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to submit entry");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>
                {isReadOnly
                  ? language === "hi"
                    ? "सबमिशन विवरण"
                    : "Submission Details"
                  : language === "hi"
                  ? "प्रतियोगिता सबमिशन"
                  : "Upload Submission"}
              </Text>
              <Text style={styles.subTitle} numberOfLines={1}>
                {competitionTitle}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#111827" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {isReadOnly ? (
              // Read-only view for already submitted entries
              <View style={styles.readOnlyBox}>
                <View style={styles.successBadge}>
                  <Ionicons name="checkmark-circle" size={20} color="#059669" />
                  <Text style={styles.successText}>Entry Successfully Submitted</Text>
                </View>

                <Text style={styles.fieldLabel}>Submission Title:</Text>
                <Text style={styles.fieldValue}>
                  {existingSubmission?.submissionTitle || "Performance Video"}
                </Text>

                <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Video / Media URL:</Text>
                <Text style={styles.linkValue} numberOfLines={2}>
                  {existingSubmission?.mediaUrl || "https://example.com/demo.mp4"}
                </Text>

                {existingSubmission?.submittedAt && (
                  <Text style={styles.timestampText}>
                    Submitted on: {new Date(existingSubmission.submittedAt).toLocaleString()}
                  </Text>
                )}
              </View>
            ) : (
              // Form view for new submission
              <View style={styles.formContainer}>
                {errorMessage ? (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorText}>{errorMessage}</Text>
                  </View>
                ) : null}

                <Text style={styles.inputLabel}>
                  {language === "hi" ? "प्रदर्शन शीर्षक *" : "Performance Title *"}
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Kathak Tarana Solo in Teentaal"
                  value={title}
                  onChangeText={setTitle}
                  placeholderTextColor="#9CA3AF"
                />

                <Text style={styles.inputLabel}>
                  {language === "hi" ? "वीडियो / मीडिया लिंक *" : "Video / Media URL *"}
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="https://youtube.com/... or cloud video URL"
                  value={mediaUrl}
                  onChangeText={setMediaUrl}
                  placeholderTextColor="#9CA3AF"
                />

                <Text style={styles.inputLabel}>
                  {language === "hi" ? "अतिरिक्त नोट्स" : "Additional Notes (Optional)"}
                </Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Mention classical style, raga, or choreographic credits..."
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={3}
                  placeholderTextColor="#9CA3AF"
                />

                <TouchableOpacity
                  style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                  activeOpacity={0.8}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.submitBtnText}>
                      {language === "hi" ? "सबमिशन भेजें" : "Submit Entry"}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end"
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "85%",
    padding: 20
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827"
  },
  subTitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2
  },
  closeBtn: {
    padding: 4
  },
  formContainer: {
    gap: 12
  },
  errorBox: {
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "#FCA5A5"
  },
  errorText: {
    fontSize: 12,
    color: "#DC2626",
    fontWeight: "500"
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151"
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827"
  },
  textArea: {
    height: 70,
    textAlignVertical: "top"
  },
  submitBtn: {
    backgroundColor: "#065F60",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 16
  },
  submitBtnDisabled: {
    opacity: 0.7
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700"
  },
  readOnlyBox: {
    paddingVertical: 10
  },
  successBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ECFDF5",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#A7F3D0"
  },
  successText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#059669"
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280"
  },
  fieldValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginTop: 2
  },
  linkValue: {
    fontSize: 13,
    color: "#007A78",
    marginTop: 2,
    textDecorationLine: "underline"
  },
  timestampText: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 16
  }
});
