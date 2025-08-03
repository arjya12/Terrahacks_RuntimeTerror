import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { AppIcon } from "@/components/icons/IconSystem";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: screenWidth } = Dimensions.get("window");

interface ClinicalAlert {
  medication_name: string;
  alert_type: string;
  severity: "low" | "moderate" | "high" | "critical";
  message: string;
  recommendation: string;
  evidence_level: string;
  timestamp: string;
}

interface DosageRecommendation {
  medication_name: string;
  current_dose: number;
  recommended_dose: number;
  unit: string;
  adjustment_reason: string;
  adjustment_factor: number;
  confidence: number;
  needs_adjustment: boolean;
  percentage_change: number;
}

interface EvidenceBasedRecommendation {
  medication_name: string;
  condition: string;
  recommendation: string;
  evidence_level: string;
  strength: string;
  source: string;
  references: string[];
  contraindications: string[];
  monitoring_requirements: string[];
}

interface ClinicalAnalysis {
  clinical_alerts: ClinicalAlert[];
  dosage_recommendations: DosageRecommendation[];
  evidence_based_recommendations: EvidenceBasedRecommendation[];
  overall_assessment: string;
  risk_level: string;
  summary: {
    total_alerts: number;
    critical_alerts: number;
    medications_needing_adjustment: number;
    evidence_supported_therapies: number;
  };
}

interface ClinicalDecisionSupportProps {
  visible: boolean;
  onClose: () => void;
  patientMedications: { id: string; name: string; dosage: string }[];
  patientConditions: string[];
  patientFactors: { age: number; weight?: number; conditions: string[] };
}

export default function ClinicalDecisionSupport({
  visible,
  onClose,
  patientMedications,
  patientConditions,
  patientFactors,
}: ClinicalDecisionSupportProps) {
  const [analysis, setAnalysis] = useState<ClinicalAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedAlert, setSelectedAlert] = useState<ClinicalAlert | null>(
    null
  );

  useEffect(() => {
    if (visible && patientMedications.length > 0) {
      performClinicalAnalysis();
    }
  }, [visible, patientMedications, patientConditions, patientFactors]);

  const performClinicalAnalysis = async () => {
    setIsLoading(true);
    try {
      // Mock clinical analysis - in production, this would call the backend APIs
      const mockAnalysis: ClinicalAnalysis = {
        clinical_alerts: [
          {
            medication_name: "Lisinopril",
            alert_type: "age_related",
            severity: "moderate",
            message:
              "Consider lower starting dose in elderly patients (age 78)",
            recommendation:
              "Reduce starting dose to 2.5mg daily and monitor closely",
            evidence_level: "2b",
            timestamp: new Date().toISOString(),
          },
          {
            medication_name: "Metformin",
            alert_type: "condition_contraindication",
            severity: "high",
            message:
              "Metformin should be used with caution in patients with reduced kidney function",
            recommendation:
              "Monitor renal function closely; consider dose reduction",
            evidence_level: "1a",
            timestamp: new Date().toISOString(),
          },
        ],
        dosage_recommendations: [
          {
            medication_name: "Lisinopril",
            current_dose: 10,
            recommended_dose: 5,
            unit: "mg",
            adjustment_reason: "Adjustment for elderly patient",
            adjustment_factor: 0.5,
            confidence: 0.85,
            needs_adjustment: true,
            percentage_change: -50,
          },
          {
            medication_name: "Metformin",
            current_dose: 1000,
            recommended_dose: 500,
            unit: "mg",
            adjustment_reason: "Adjustment for reduced kidney function",
            adjustment_factor: 0.5,
            confidence: 0.9,
            needs_adjustment: true,
            percentage_change: -50,
          },
        ],
        evidence_based_recommendations: [
          {
            medication_name: "Metformin",
            condition: "Type 2 Diabetes",
            recommendation:
              "First-line therapy for type 2 diabetes. Start with 500mg twice daily with meals.",
            evidence_level: "1a",
            strength: "Strong",
            source: "Built-in Clinical Guidelines",
            references: ["ADA Standards of Medical Care in Diabetes 2023"],
            contraindications: [
              "eGFR < 30 mL/min/1.73m²",
              "Acute or chronic metabolic acidosis",
            ],
            monitoring_requirements: [
              "Monitor renal function every 3-6 months",
              "Monitor vitamin B12 annually",
            ],
          },
        ],
        overall_assessment:
          "Fair - Several optimization opportunities identified",
        risk_level: "moderate",
        summary: {
          total_alerts: 2,
          critical_alerts: 0,
          medications_needing_adjustment: 2,
          evidence_supported_therapies: 1,
        },
      };

      setAnalysis(mockAnalysis);
    } catch (error) {
      console.error("Failed to perform clinical analysis:", error);
      Alert.alert(
        "Analysis Error",
        "Failed to perform clinical analysis. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "#dc2626";
      case "high":
        return "#ea580c";
      case "moderate":
        return "#eab308";
      case "low":
        return "#10b981";
      default:
        return "#6b7280";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return "status_error";
      case "high":
        return "status_error";
      case "moderate":
        return "status_warning";
      case "low":
        return "status_info";
      default:
        return "status_info";
    }
  };

  const getEvidenceLevelDescription = (level: string) => {
    const descriptions = {
      "1a": "Systematic review of RCTs",
      "1b": "Individual RCT",
      "2a": "Systematic review of cohort studies",
      "2b": "Individual cohort study",
      "3a": "Systematic review of case-control studies",
      "3b": "Individual case-control study",
      "4": "Case series",
      "5": "Expert opinion",
    };
    return descriptions[level as keyof typeof descriptions] || "Unknown";
  };

  const renderOverview = () => (
    <View style={styles.tabContent}>
      {/* Summary Cards */}
      <View style={styles.summaryGrid}>
        <View style={[styles.summaryCard, { borderLeftColor: "#dc2626" }]}>
          <AppIcon name="status_error" size="medium" color="#dc2626" />
          <View style={styles.summaryContent}>
            <ThemedText style={styles.summaryNumber}>
              {analysis?.summary.critical_alerts || 0}
            </ThemedText>
            <ThemedText style={styles.summaryLabel}>Critical Alerts</ThemedText>
          </View>
        </View>

        <View style={[styles.summaryCard, { borderLeftColor: "#eab308" }]}>
          <AppIcon name="status_warning" size="medium" color="#eab308" />
          <View style={styles.summaryContent}>
            <ThemedText style={styles.summaryNumber}>
              {analysis?.summary.total_alerts || 0}
            </ThemedText>
            <ThemedText style={styles.summaryLabel}>Total Alerts</ThemedText>
          </View>
        </View>

        <View style={[styles.summaryCard, { borderLeftColor: "#3b82f6" }]}>
          <AppIcon name="action_edit" size="medium" color="#3b82f6" />
          <View style={styles.summaryContent}>
            <ThemedText style={styles.summaryNumber}>
              {analysis?.summary.medications_needing_adjustment || 0}
            </ThemedText>
            <ThemedText style={styles.summaryLabel}>Need Adjustment</ThemedText>
          </View>
        </View>

        <View style={[styles.summaryCard, { borderLeftColor: "#10b981" }]}>
          <AppIcon name="status_check" size="medium" color="#10b981" />
          <View style={styles.summaryContent}>
            <ThemedText style={styles.summaryNumber}>
              {analysis?.summary.evidence_supported_therapies || 0}
            </ThemedText>
            <ThemedText style={styles.summaryLabel}>Evidence-Based</ThemedText>
          </View>
        </View>
      </View>

      {/* Overall Assessment */}
      <ThemedView style={styles.assessmentCard}>
        <View style={styles.assessmentHeader}>
          <AppIcon name="status_info" size="medium" color="#3b82f6" />
          <ThemedText style={styles.assessmentTitle}>
            Overall Assessment
          </ThemedText>
        </View>
        <ThemedText style={styles.assessmentText}>
          {analysis?.overall_assessment}
        </ThemedText>
        <View style={styles.riskLevelContainer}>
          <ThemedText style={styles.riskLevelLabel}>Risk Level:</ThemedText>
          <View
            style={[
              styles.riskLevelBadge,
              {
                backgroundColor:
                  analysis?.risk_level === "high"
                    ? "#dc2626"
                    : analysis?.risk_level === "moderate"
                    ? "#eab308"
                    : "#10b981",
              },
            ]}
          >
            <ThemedText style={styles.riskLevelText}>
              {analysis?.risk_level?.toUpperCase()}
            </ThemedText>
          </View>
        </View>
      </ThemedView>

      {/* Recent Alerts Preview */}
      {analysis?.clinical_alerts && analysis.clinical_alerts.length > 0 && (
        <ThemedView style={styles.alertsPreview}>
          <ThemedText style={styles.sectionTitle}>Recent Alerts</ThemedText>
          {analysis.clinical_alerts.slice(0, 3).map((alert, index) => (
            <TouchableOpacity
              key={index}
              style={styles.alertPreviewItem}
              onPress={() => setSelectedAlert(alert)}
            >
              <AppIcon
                name={getSeverityIcon(alert.severity)}
                size="small"
                color={getSeverityColor(alert.severity)}
              />
              <View style={styles.alertPreviewContent}>
                <ThemedText style={styles.alertPreviewMedication}>
                  {alert.medication_name}
                </ThemedText>
                <ThemedText style={styles.alertPreviewMessage}>
                  {alert.message}
                </ThemedText>
              </View>
              <AppIcon name="nav_forward" size="small" color="secondary" />
            </TouchableOpacity>
          ))}
        </ThemedView>
      )}
    </View>
  );

  const renderAlerts = () => (
    <View style={styles.tabContent}>
      {analysis?.clinical_alerts.map((alert, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.alertCard,
            { borderLeftColor: getSeverityColor(alert.severity) },
          ]}
          onPress={() => setSelectedAlert(alert)}
        >
          <View style={styles.alertHeader}>
            <AppIcon
              name={getSeverityIcon(alert.severity)}
              size="medium"
              color={getSeverityColor(alert.severity)}
            />
            <View style={styles.alertHeaderText}>
              <ThemedText style={styles.alertMedication}>
                {alert.medication_name}
              </ThemedText>
              <ThemedText style={styles.alertType}>
                {alert.alert_type.replace("_", " ").toUpperCase()}
              </ThemedText>
            </View>
            <View
              style={[
                styles.severityBadge,
                { backgroundColor: getSeverityColor(alert.severity) },
              ]}
            >
              <ThemedText style={styles.severityText}>
                {alert.severity.toUpperCase()}
              </ThemedText>
            </View>
          </View>
          <ThemedText style={styles.alertMessage}>{alert.message}</ThemedText>
          <ThemedText style={styles.alertRecommendation}>
            Recommendation: {alert.recommendation}
          </ThemedText>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderDosageRecommendations = () => (
    <View style={styles.tabContent}>
      {analysis?.dosage_recommendations.map((rec, index) => (
        <ThemedView key={index} style={styles.dosageCard}>
          <View style={styles.dosageHeader}>
            <ThemedText style={styles.dosageMedication}>
              {rec.medication_name}
            </ThemedText>
            {rec.needs_adjustment && (
              <View style={styles.adjustmentBadge}>
                <ThemedText style={styles.adjustmentText}>
                  NEEDS ADJUSTMENT
                </ThemedText>
              </View>
            )}
          </View>

          <View style={styles.dosageComparison}>
            <View style={styles.dosageColumn}>
              <ThemedText style={styles.dosageLabel}>Current Dose</ThemedText>
              <ThemedText style={styles.dosageValue}>
                {rec.current_dose} {rec.unit}
              </ThemedText>
            </View>
            <AppIcon name="nav_forward" size="medium" color="secondary" />
            <View style={styles.dosageColumn}>
              <ThemedText style={styles.dosageLabel}>Recommended</ThemedText>
              <ThemedText
                style={[
                  styles.dosageValue,
                  { color: rec.needs_adjustment ? "#ea580c" : "#10b981" },
                ]}
              >
                {rec.recommended_dose} {rec.unit}
              </ThemedText>
            </View>
          </View>

          {rec.needs_adjustment && (
            <View style={styles.dosageDetails}>
              <ThemedText style={styles.dosageReason}>
                Reason: {rec.adjustment_reason}
              </ThemedText>
              <ThemedText style={styles.dosageChange}>
                Change: {rec.percentage_change > 0 ? "+" : ""}
                {rec.percentage_change.toFixed(1)}%
              </ThemedText>
              <View style={styles.confidenceContainer}>
                <ThemedText style={styles.confidenceLabel}>
                  Confidence:
                </ThemedText>
                <View style={styles.confidenceBar}>
                  <View
                    style={[
                      styles.confidenceFill,
                      { width: `${rec.confidence * 100}%` },
                    ]}
                  />
                </View>
                <ThemedText style={styles.confidenceText}>
                  {(rec.confidence * 100).toFixed(0)}%
                </ThemedText>
              </View>
            </View>
          )}
        </ThemedView>
      ))}
    </View>
  );

  const renderEvidenceRecommendations = () => (
    <View style={styles.tabContent}>
      {analysis?.evidence_based_recommendations.map((rec, index) => (
        <ThemedView key={index} style={styles.evidenceCard}>
          <View style={styles.evidenceHeader}>
            <ThemedText style={styles.evidenceMedication}>
              {rec.medication_name}
            </ThemedText>
            <View style={styles.evidenceBadges}>
              <View style={styles.evidenceLevelBadge}>
                <ThemedText style={styles.evidenceLevelText}>
                  Level {rec.evidence_level}
                </ThemedText>
              </View>
              <View
                style={[
                  styles.strengthBadge,
                  {
                    backgroundColor:
                      rec.strength === "Strong"
                        ? "#10b981"
                        : rec.strength === "Moderate"
                        ? "#eab308"
                        : "#6b7280",
                  },
                ]}
              >
                <ThemedText style={styles.strengthText}>
                  {rec.strength}
                </ThemedText>
              </View>
            </View>
          </View>

          <ThemedText style={styles.evidenceCondition}>
            For: {rec.condition}
          </ThemedText>
          <ThemedText style={styles.evidenceRecommendation}>
            {rec.recommendation}
          </ThemedText>

          <View style={styles.evidenceDetails}>
            <ThemedText style={styles.evidenceSource}>
              Source: {rec.source}
            </ThemedText>
            <ThemedText style={styles.evidenceLevelDescription}>
              {getEvidenceLevelDescription(rec.evidence_level)}
            </ThemedText>
          </View>

          {rec.monitoring_requirements.length > 0 && (
            <View style={styles.monitoringSection}>
              <ThemedText style={styles.monitoringTitle}>
                Monitoring Requirements:
              </ThemedText>
              {rec.monitoring_requirements.map((req, reqIndex) => (
                <ThemedText key={reqIndex} style={styles.monitoringItem}>
                  • {req}
                </ThemedText>
              ))}
            </View>
          )}
        </ThemedView>
      ))}
    </View>
  );

  const tabs = [
    { id: "overview", label: "Overview", icon: "status_info" },
    { id: "alerts", label: "Alerts", icon: "status_warning" },
    { id: "dosage", label: "Dosage", icon: "action_edit" },
    { id: "evidence", label: "Evidence", icon: "status_check" },
  ];

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
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <AppIcon name="nav_back" size="medium" color="primary" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>
            Clinical Decision Support
          </ThemedText>
          <View style={styles.headerSpacer} />
        </ThemedView>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <ThemedText style={styles.loadingText}>
              Analyzing medications...
            </ThemedText>
          </View>
        ) : (
          <>
            {/* Tab Navigation */}
            <ThemedView style={styles.tabContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tabScrollContainer}
              >
                {tabs.map((tab) => (
                  <TouchableOpacity
                    key={tab.id}
                    style={[
                      styles.tab,
                      activeTab === tab.id && styles.activeTab,
                    ]}
                    onPress={() => setActiveTab(tab.id)}
                  >
                    <AppIcon
                      name={tab.icon as "nav_medications"}
                      size="small"
                      color={activeTab === tab.id ? "primary" : "secondary"}
                    />
                    <ThemedText
                      style={[
                        styles.tabText,
                        activeTab === tab.id && styles.activeTabText,
                      ]}
                    >
                      {tab.label}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </ThemedView>

            {/* Tab Content */}
            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
            >
              {activeTab === "overview" && renderOverview()}
              {activeTab === "alerts" && renderAlerts()}
              {activeTab === "dosage" && renderDosageRecommendations()}
              {activeTab === "evidence" && renderEvidenceRecommendations()}
            </ScrollView>
          </>
        )}

        {/* Alert Detail Modal */}
        {selectedAlert && (
          <Modal
            visible={!!selectedAlert}
            animationType="fade"
            transparent={true}
            onRequestClose={() => setSelectedAlert(null)}
          >
            <View style={styles.modalOverlay}>
              <ThemedView style={styles.alertDetailModal}>
                <View style={styles.alertDetailHeader}>
                  <ThemedText style={styles.alertDetailTitle}>
                    Alert Details
                  </ThemedText>
                  <TouchableOpacity onPress={() => setSelectedAlert(null)}>
                    <AppIcon
                      name="action_close"
                      size="medium"
                      color="secondary"
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.alertDetailContent}>
                  <ThemedText style={styles.alertDetailMedication}>
                    {selectedAlert.medication_name}
                  </ThemedText>
                  <View
                    style={[
                      styles.alertDetailSeverity,
                      {
                        backgroundColor: getSeverityColor(
                          selectedAlert.severity
                        ),
                      },
                    ]}
                  >
                    <ThemedText style={styles.alertDetailSeverityText}>
                      {selectedAlert.severity.toUpperCase()}
                    </ThemedText>
                  </View>
                </View>

                <ThemedText style={styles.alertDetailMessage}>
                  {selectedAlert.message}
                </ThemedText>
                <ThemedText style={styles.alertDetailRecommendation}>
                  <ThemedText style={styles.alertDetailLabel}>
                    Recommendation:{" "}
                  </ThemedText>
                  {selectedAlert.recommendation}
                </ThemedText>
                <ThemedText style={styles.alertDetailEvidence}>
                  <ThemedText style={styles.alertDetailLabel}>
                    Evidence Level:{" "}
                  </ThemedText>
                  {selectedAlert.evidence_level} -{" "}
                  {getEvidenceLevelDescription(selectedAlert.evidence_level)}
                </ThemedText>

                <TouchableOpacity
                  style={styles.alertDetailCloseButton}
                  onPress={() => setSelectedAlert(null)}
                >
                  <ThemedText style={styles.alertDetailCloseText}>
                    Close
                  </ThemedText>
                </TouchableOpacity>
              </ThemedView>
            </View>
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
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  headerSpacer: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6b7280",
  },
  tabContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  tabScrollContainer: {
    paddingHorizontal: 16,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#3b82f6",
  },
  tabText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
  },
  activeTabText: {
    color: "#3b82f6",
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  summaryCard: {
    width: (screenWidth - 48) / 2,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  summaryContent: {
    marginLeft: 12,
    flex: 1,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2937",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  assessmentCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  assessmentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  assessmentTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  assessmentText: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 12,
    lineHeight: 20,
  },
  riskLevelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  riskLevelLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginRight: 8,
  },
  riskLevelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  riskLevelText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
  },
  alertsPreview: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  alertPreviewItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  alertPreviewContent: {
    flex: 1,
    marginLeft: 12,
  },
  alertPreviewMedication: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },
  alertPreviewMessage: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  alertCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  alertHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  alertHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  alertMedication: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  alertType: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  severityText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#ffffff",
  },
  alertMessage: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 8,
    lineHeight: 20,
  },
  alertRecommendation: {
    fontSize: 14,
    color: "#1f2937",
    fontWeight: "500",
    lineHeight: 20,
  },
  dosageCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  dosageHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  dosageMedication: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  adjustmentBadge: {
    backgroundColor: "#ea580c",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  adjustmentText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#ffffff",
  },
  dosageComparison: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  dosageColumn: {
    flex: 1,
    alignItems: "center",
  },
  dosageLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  dosageValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  dosageDetails: {
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingTop: 12,
  },
  dosageReason: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 6,
  },
  dosageChange: {
    fontSize: 14,
    color: "#ea580c",
    fontWeight: "500",
    marginBottom: 8,
  },
  confidenceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  confidenceLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginRight: 8,
  },
  confidenceBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#f3f4f6",
    borderRadius: 3,
    overflow: "hidden",
    marginRight: 8,
  },
  confidenceFill: {
    height: "100%",
    backgroundColor: "#10b981",
  },
  confidenceText: {
    fontSize: 12,
    color: "#6b7280",
    minWidth: 30,
  },
  evidenceCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  evidenceHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  evidenceMedication: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    flex: 1,
  },
  evidenceBadges: {
    flexDirection: "row",
    gap: 8,
  },
  evidenceLevelBadge: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  evidenceLevelText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#ffffff",
  },
  strengthBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  strengthText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#ffffff",
  },
  evidenceCondition: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
    fontStyle: "italic",
  },
  evidenceRecommendation: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
    marginBottom: 12,
  },
  evidenceDetails: {
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingTop: 8,
    marginBottom: 12,
  },
  evidenceSource: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  evidenceLevelDescription: {
    fontSize: 12,
    color: "#6b7280",
    fontStyle: "italic",
  },
  monitoringSection: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
  },
  monitoringTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  monitoringItem: {
    fontSize: 12,
    color: "#374151",
    marginBottom: 4,
    lineHeight: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  alertDetailModal: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxHeight: "80%",
  },
  alertDetailHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  alertDetailTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  alertDetailContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  alertDetailMedication: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  alertDetailSeverity: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  alertDetailSeverityText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
  },
  alertDetailMessage: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
    marginBottom: 12,
  },
  alertDetailRecommendation: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
    marginBottom: 12,
  },
  alertDetailEvidence: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
    marginBottom: 20,
  },
  alertDetailLabel: {
    fontWeight: "600",
  },
  alertDetailCloseButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  alertDetailCloseText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
});
