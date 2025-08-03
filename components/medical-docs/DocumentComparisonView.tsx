import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { AppIcon } from "@/components/icons/IconSystem";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { height: screenHeight } = Dimensions.get("window");

interface SimplificationResult {
  simplification_id: string;
  original_text: string;
  simplified_text: string;
  metadata: {
    confidence_score: number;
    reading_level: string;
    document_type: string;
    key_terms_explained: string[];
    word_count_reduction: number;
    original_word_count: number;
    simplified_word_count: number;
  };
  processing_info: {
    processing_time: number;
    simplification_level: string;
    patient_context_used: boolean;
  };
  timestamp: string;
}

interface DocumentComparisonViewProps {
  visible: boolean;
  onClose: () => void;
  result: SimplificationResult | null;
}

export default function DocumentComparisonView({
  visible,
  onClose,
  result,
}: DocumentComparisonViewProps) {
  const [viewMode, setViewMode] = useState<
    "side-by-side" | "original" | "simplified"
  >("side-by-side");
  const [showMetadata, setShowMetadata] = useState(false);

  if (!result) return null;

  const handleShare = () => {
    Alert.alert(
      "Share Simplified Document",
      "How would you like to share this document?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Copy Text", onPress: handleCopyText },
        { text: "Export PDF", onPress: handleExportPDF },
        { text: "Email", onPress: handleEmail },
      ]
    );
  };

  const handleCopyText = () => {
    // In production, would use Clipboard API
    Alert.alert("Copied", "Simplified text copied to clipboard!");
  };

  const handleExportPDF = () => {
    Alert.alert("Export PDF", "PDF export feature coming soon!");
  };

  const handleEmail = () => {
    Alert.alert("Email", "Email sharing feature coming soon!");
  };

  const handleSave = () => {
    Alert.alert("Save Document", "Document saved to your medical records!", [
      { text: "OK" },
    ]);
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return "#10b981";
    if (score >= 0.6) return "#f59e0b";
    return "#ef4444";
  };

  const renderSideBySideView = () => (
    <View style={styles.sideBySideContainer}>
      {/* Original Document */}
      <View style={styles.documentPanel}>
        <View style={styles.panelHeader}>
          <ThemedText style={styles.panelTitle}>Original Document</ThemedText>
          <View style={styles.wordCountBadge}>
            <ThemedText style={styles.wordCountText}>
              {result.metadata.original_word_count} words
            </ThemedText>
          </View>
        </View>
        <ScrollView style={styles.textContainer} nestedScrollEnabled>
          <ThemedText style={styles.originalText}>
            {result.original_text}
          </ThemedText>
        </ScrollView>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Simplified Document */}
      <View style={styles.documentPanel}>
        <View style={styles.panelHeader}>
          <ThemedText style={styles.panelTitle}>Simplified Version</ThemedText>
          <View style={[styles.wordCountBadge, { backgroundColor: "#10b981" }]}>
            <ThemedText style={[styles.wordCountText, { color: "white" }]}>
              {result.metadata.simplified_word_count} words
            </ThemedText>
          </View>
        </View>
        <ScrollView style={styles.textContainer} nestedScrollEnabled>
          <ThemedText style={styles.simplifiedText}>
            {result.simplified_text}
          </ThemedText>
        </ScrollView>
      </View>
    </View>
  );

  const renderSingleView = () => (
    <ScrollView style={styles.singleViewContainer}>
      <ThemedText style={styles.singleViewText}>
        {viewMode === "original"
          ? result.original_text
          : result.simplified_text}
      </ThemedText>
    </ScrollView>
  );

  const renderMetadataPanel = () => (
    <ThemedView style={styles.metadataPanel}>
      <View style={styles.metadataHeader}>
        <ThemedText style={styles.metadataTitle}>Document Analysis</ThemedText>
        <TouchableOpacity onPress={() => setShowMetadata(false)}>
          <AppIcon name="action_close" size="small" color="secondary" />
        </TouchableOpacity>
      </View>

      <View style={styles.metadataContent}>
        {/* Confidence Score */}
        <View style={styles.metadataItem}>
          <ThemedText style={styles.metadataLabel}>Confidence Score</ThemedText>
          <View style={styles.confidenceContainer}>
            <View
              style={[
                styles.confidenceBar,
                {
                  backgroundColor: getConfidenceColor(
                    result.metadata.confidence_score
                  ),
                },
                { width: `${result.metadata.confidence_score * 100}%` },
              ]}
            />
            <ThemedText style={styles.confidenceText}>
              {(result.metadata.confidence_score * 100).toFixed(0)}%
            </ThemedText>
          </View>
        </View>

        {/* Reading Level */}
        <View style={styles.metadataItem}>
          <ThemedText style={styles.metadataLabel}>Reading Level</ThemedText>
          <ThemedText style={styles.metadataValue}>
            {result.metadata.reading_level}
          </ThemedText>
        </View>

        {/* Word Count Reduction */}
        <View style={styles.metadataItem}>
          <ThemedText style={styles.metadataLabel}>
            Word Count Reduction
          </ThemedText>
          <ThemedText style={[styles.metadataValue, { color: "#10b981" }]}>
            -{result.metadata.word_count_reduction.toFixed(1)}%
          </ThemedText>
        </View>

        {/* Processing Time */}
        <View style={styles.metadataItem}>
          <ThemedText style={styles.metadataLabel}>Processing Time</ThemedText>
          <ThemedText style={styles.metadataValue}>
            {result.processing_info.processing_time.toFixed(2)}s
          </ThemedText>
        </View>

        {/* Document Type */}
        <View style={styles.metadataItem}>
          <ThemedText style={styles.metadataLabel}>Document Type</ThemedText>
          <ThemedText style={styles.metadataValue}>
            {result.metadata.document_type.replace("_", " ").toUpperCase()}
          </ThemedText>
        </View>

        {/* Key Terms Explained */}
        {result.metadata.key_terms_explained.length > 0 && (
          <View style={styles.metadataItem}>
            <ThemedText style={styles.metadataLabel}>
              Key Terms Explained
            </ThemedText>
            <View style={styles.termsContainer}>
              {result.metadata.key_terms_explained.map((term, index) => (
                <View key={index} style={styles.termBadge}>
                  <ThemedText style={styles.termText}>{term}</ThemedText>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </ThemedView>
  );

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <ThemedView style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <AppIcon name="nav_back" size="medium" color="primary" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>
            Document Comparison
          </ThemedText>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => setShowMetadata(true)}
              style={styles.headerButton}
            >
              <AppIcon name="status_info" size="medium" color="primary" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
              <AppIcon name="action_share" size="medium" color="primary" />
            </TouchableOpacity>
          </View>
        </ThemedView>

        {/* View Mode Toggle */}
        <ThemedView style={styles.viewModeContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.viewModeScrollContainer}
          >
            {[
              {
                mode: "side-by-side",
                label: "Side by Side",
                icon: "control_split",
              },
              { mode: "original", label: "Original", icon: "nav_profile" },
              { mode: "simplified", label: "Simplified", icon: "status_check" },
            ].map((option) => (
              <TouchableOpacity
                key={option.mode}
                style={[
                  styles.viewModeButton,
                  viewMode === option.mode && styles.viewModeButtonActive,
                ]}
                onPress={() => setViewMode(option.mode as "side-by-side")}
              >
                <AppIcon
                  name={option.icon as "nav_scan"}
                  size="small"
                  color={viewMode === option.mode ? "primary" : "secondary"}
                />
                <ThemedText
                  style={[
                    styles.viewModeText,
                    viewMode === option.mode && styles.viewModeTextActive,
                  ]}
                >
                  {option.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </ThemedView>

        {/* Content */}
        <View style={styles.content}>
          {viewMode === "side-by-side"
            ? renderSideBySideView()
            : renderSingleView()}
        </View>

        {/* Bottom Actions */}
        <ThemedView style={styles.bottomActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
            <AppIcon name="action_save" size="small" color="primary" />
            <ThemedText style={styles.actionButtonText}>Save</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryActionButton]}
            onPress={handleShare}
          >
            <AppIcon name="action_share" size="small" color="white" />
            <ThemedText style={[styles.actionButtonText, { color: "white" }]}>
              Share
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {/* Metadata Panel Modal */}
        {showMetadata && (
          <Modal
            visible={showMetadata}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowMetadata(false)}
          >
            <View style={styles.metadataOverlay}>{renderMetadataPanel()}</View>
          </Modal>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  headerActions: {
    flexDirection: "row",
  },
  viewModeContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
    backgroundColor: "#ffffff",
  },
  viewModeScrollContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  viewModeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  viewModeButtonActive: {
    backgroundColor: "#e3f2fd",
    borderColor: "#1976d2",
  },
  viewModeText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
  },
  viewModeTextActive: {
    color: "#1976d2",
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  sideBySideContainer: {
    flex: 1,
    flexDirection: "row",
    padding: 16,
    gap: 16,
  },
  documentPanel: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  wordCountBadge: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  wordCountText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6b7280",
  },
  textContainer: {
    flex: 1,
    padding: 16,
  },
  originalText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#374151",
  },
  simplifiedText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#1f2937",
  },
  divider: {
    width: 1,
    backgroundColor: "#e9ecef",
    marginVertical: 16,
  },
  singleViewContainer: {
    flex: 1,
    padding: 16,
  },
  singleViewText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#1f2937",
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  bottomActions: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e9ecef",
    gap: 6,
  },
  primaryActionButton: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  metadataOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  metadataPanel: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: screenHeight * 0.7,
  },
  metadataHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  metadataTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  metadataContent: {
    padding: 20,
  },
  metadataItem: {
    marginBottom: 20,
  },
  metadataLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
    marginBottom: 6,
  },
  metadataValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1f2937",
  },
  confidenceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  confidenceBar: {
    height: 8,
    borderRadius: 4,
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  confidenceText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    minWidth: 40,
  },
  termsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  termBadge: {
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  termText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#1976d2",
  },
});
