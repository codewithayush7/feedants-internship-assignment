import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { IReferralInfo } from "../types";
import { useAuth } from "../context/AuthContext";

interface TrustAndReferralSectionProps {
  disclaimer: string;
  refundPolicy: string;
  paymentNotice: string;
  referral: IReferralInfo;
  onOpenTestimonials?: () => void;
  onOpenPrizeVideo?: () => void;
  onOpenRefundPolicy?: () => void;
}

export const TrustAndReferralSection: React.FC<TrustAndReferralSectionProps> = ({
  disclaimer,
  referral,
  onOpenTestimonials,
  onOpenPrizeVideo,
  onOpenRefundPolicy
}) => {
  const { language } = useAuth();
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopyLink = () => {
    // If navigator.clipboard is available on web
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(referral.url).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={styles.container}>
      {/* 1. Disclaimer Banner */}
      <View style={styles.disclaimerBanner}>
        <Ionicons name="information-circle-outline" size={18} color="#007A78" />
        <Text style={styles.disclaimerText}>
          {language === "hi"
            ? "अस्वीकरण: केवल सशुल्क प्रतिभागियों की प्रविष्टियों पर निर्णय के लिए विचार किया जाएगा।"
            : disclaimer}
        </Text>
      </View>

      {/* 2. Trust & Info Grid (How to receive prize + Refund & Razorpay) */}
      <View style={styles.trustGrid}>
        {/* Left: How will you receive prize money? */}
        <TouchableOpacity
          style={styles.trustCard}
          onPress={onOpenPrizeVideo}
          activeOpacity={0.8}
        >
          <View style={styles.playIconBox}>
            <Ionicons name="play" size={16} color="#007A78" style={{ marginLeft: 2 }} />
          </View>
          <View style={styles.trustTextCol}>
            <Text style={styles.trustTitle}>
              {language === "hi"
                ? "पुरस्कार राशि कैसे प्राप्त होगी?"
                : "How will you receive\nprize money?"}
            </Text>
            <Text style={styles.trustSubtitle}>
              {language === "hi" ? "अधिक जानने के लिए वीडियो देखें" : "Watch video to know more"}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Right: Refund Policy & Razorpay */}
        <View style={styles.trustCard}>
          <TouchableOpacity
            style={styles.trustRowItem}
            onPress={onOpenRefundPolicy}
            activeOpacity={0.7}
          >
            <Ionicons name="shield-checkmark-outline" size={16} color="#111827" />
            <Text style={styles.policyText}>
              {language === "hi" ? "वापसी नीति" : "Refund policy"}
            </Text>
          </TouchableOpacity>

          <View style={[styles.trustRowItem, { marginTop: 8 }]}>
            <Ionicons name="shield-checkmark-outline" size={16} color="#111827" />
            <View>
              <Text style={styles.secureText}>
                {language === "hi" ? "सुरक्षित भुगतान" : "Secure payments powered by"}
              </Text>
              <Text style={styles.razorpayBrand}>Razorpay</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 3. Referral Banner */}
      <View style={styles.referralCard}>
        <View style={styles.referralHeader}>
          <View style={styles.megaphoneCircle}>
            <Ionicons name="megaphone-outline" size={18} color="#007A78" />
          </View>
          <View style={styles.referralTextCol}>
            <Text style={styles.referralTitle}>
              {language === "hi" ? "रेफर करें और अधिक छूट पाएं" : referral.discountNotice}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.referNowBtn}
            onPress={handleCopyLink}
            activeOpacity={0.8}
          >
            <Text style={styles.referNowText}>
              {language === "hi" ? "अभी रेफर करें" : "Refer Now"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Link & Copy Row */}
        <View style={styles.linkRow}>
          <View style={styles.linkBox}>
            <Text style={styles.linkText} numberOfLines={1}>
              {referral.url}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.copyBtn}
            onPress={handleCopyLink}
            activeOpacity={0.7}
          >
            <Text style={styles.copyBtnText}>
              {copied
                ? language === "hi"
                  ? "कॉपी हो गया!"
                  : "Copied!"
                : language === "hi"
                ? "लिंक कॉपी करें"
                : "Copy Link"}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.referralFooterText}>
          {language === "hi"
            ? "आप प्रत्येक साइनअप के लिए ₹10 अर्जित करते हैं"
            : referral.rewardNotice}
        </Text>
      </View>

      {/* 4. Hear From Our Users */}
      <TouchableOpacity
        style={styles.usersCard}
        onPress={onOpenTestimonials}
        activeOpacity={0.8}
      >
        <Ionicons name="chatbubbles-outline" size={20} color="#111827" />
        <View style={styles.usersTextCol}>
          <Text style={styles.usersTitle}>
            {language === "hi" ? "हमारे उपयोगकर्ताओं से सुनें" : "Hear From Our Users"}
          </Text>
          <Text style={styles.usersSubtitle}>
            {language === "hi"
              ? "देखें कि प्रतिभागियों का Feedants के बारे में क्या कहना है"
              : "See what participants say about Feedants"}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
      </TouchableOpacity>

      {/* 5. Ad Here Slot */}
      <View style={styles.adBanner}>
        <Ionicons name="megaphone-outline" size={16} color="#9CA3AF" />
        <Text style={styles.adText}>{language === "hi" ? "यहाँ विज्ञापन" : "Ad Here"}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 20
  },
  disclaimerBanner: {
    backgroundColor: "#EDF8F8",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#D1F0EE"
  },
  disclaimerText: {
    fontSize: 11,
    color: "#374151",
    flex: 1,
    lineHeight: 16
  },
  trustGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14
  },
  trustCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
    justifyContent: "center"
  },
  playIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E6F7F5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6
  },
  trustTextCol: {},
  trustTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111827",
    lineHeight: 16
  },
  trustSubtitle: {
    fontSize: 10,
    color: "#6B7280",
    marginTop: 2
  },
  trustRowItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  policyText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111827"
  },
  secureText: {
    fontSize: 9,
    color: "#6B7280"
  },
  razorpayBrand: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0C2340",
    fontStyle: "italic"
  },
  referralCard: {
    backgroundColor: "#EBF7F5",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#CCEBE6"
  },
  referralHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10
  },
  megaphoneCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8
  },
  referralTextCol: {
    flex: 1
  },
  referralTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827"
  },
  referNowBtn: {
    backgroundColor: "#007A78",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  referNowText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF"
  },
  linkRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 6
  },
  linkBox: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: "#D1D5DB"
  },
  linkText: {
    fontSize: 11,
    color: "#4B5563"
  },
  copyBtn: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center"
  },
  copyBtnText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1F2937"
  },
  referralFooterText: {
    fontSize: 10,
    color: "#007A78",
    fontWeight: "600"
  },
  usersCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14
  },
  usersTextCol: {
    flex: 1,
    marginLeft: 10
  },
  usersTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827"
  },
  usersSubtitle: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 2
  },
  adBanner: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6
  },
  adText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#9CA3AF"
  }
});
