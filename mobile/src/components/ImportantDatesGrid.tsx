import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ICompetitionDates } from "../types";
import { useAuth } from "../context/AuthContext";

interface ImportantDatesGridProps {
  dates: ICompetitionDates;
}

function formatDate(dateInput: string | Date): { dateStr: string; timeStr: string } {
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return { dateStr: "TBD", timeStr: "" };

    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"
    ];

    const day = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear().toString().slice(-2);

    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 becomes 12
    const formattedHours = hours.toString().padStart(2, "0");

    return {
      dateStr: `${day} ${month} ${year}`,
      timeStr: `${formattedHours}:${minutes} ${ampm}`
    };
  } catch {
    return { dateStr: "TBD", timeStr: "" };
  }
}

export const ImportantDatesGrid: React.FC<ImportantDatesGridProps> = ({ dates }) => {
  const { language } = useAuth();

  const regBefore = formatDate(dates.registrationClose);
  const subStart = formatDate(dates.submissionStart);
  const subEnd = formatDate(dates.submissionEnd);
  const resDate = formatDate(dates.resultDate);

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>
        {language === "hi" ? "महत्वपूर्ण तिथियां" : "Important Dates"}
      </Text>

      <View style={styles.card}>
        {/* Row 1: Register Before & Submission Starts */}
        <View style={styles.row}>
          {/* Top-Left: Register Before */}
          <View style={[styles.cell, styles.rightBorder]}>
            <View style={styles.iconRow}>
              <Ionicons name="calendar-outline" size={18} color="#007A78" />
              <Text style={styles.cellLabel}>
                {language === "hi" ? "पहले पंजीकरण करें" : "Register Before"}
              </Text>
            </View>
            <Text style={styles.dateText}>{regBefore.dateStr}</Text>
            <Text style={styles.timeText}>{regBefore.timeStr}</Text>
          </View>

          {/* Top-Right: Submission Starts */}
          <View style={styles.cell}>
            <View style={styles.iconRow}>
              <Ionicons name="paper-plane-outline" size={18} color="#007A78" />
              <Text style={styles.cellLabel}>
                {language === "hi" ? "सबमिशन शुरू" : "Submission Starts"}
              </Text>
            </View>
            <Text style={styles.dateText}>{subStart.dateStr}</Text>
            <Text style={styles.timeText}>{subStart.timeStr}</Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.horizontalDivider} />

        {/* Row 2: Submission Ends & Result Date */}
        <View style={styles.row}>
          {/* Bottom-Left: Submission Ends */}
          <View style={[styles.cell, styles.rightBorder]}>
            <View style={styles.iconRow}>
              <Ionicons name="cloud-upload-outline" size={18} color="#007A78" />
              <Text style={styles.cellLabel}>
                {language === "hi" ? "सबमिशन समाप्त" : "Submission Ends"}
              </Text>
            </View>
            <Text style={styles.dateText}>{subEnd.dateStr}</Text>
            <Text style={styles.timeText}>{subEnd.timeStr}</Text>
          </View>

          {/* Bottom-Right: Result Date */}
          <View style={styles.cell}>
            <View style={styles.iconRow}>
              <Ionicons name="trophy-outline" size={18} color="#007A78" />
              <Text style={styles.cellLabel}>
                {language === "hi" ? "परिणाम तिथि" : "Result Date"}
              </Text>
            </View>
            <Text style={styles.dateText}>{resDate.dateStr}</Text>
            <Text style={styles.timeText}>{resDate.timeStr}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginHorizontal: 16,
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden"
  },
  row: {
    flexDirection: "row"
  },
  cell: {
    flex: 1,
    padding: 14
  },
  rightBorder: {
    borderRightWidth: 1,
    borderRightColor: "#E5E7EB"
  },
  horizontalDivider: {
    height: 1,
    backgroundColor: "#E5E7EB"
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6
  },
  cellLabel: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "500"
  },
  dateText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827"
  },
  timeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4B5563",
    marginTop: 2
  }
});
