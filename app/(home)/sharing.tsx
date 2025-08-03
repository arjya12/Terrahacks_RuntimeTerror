import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { mockDataService } from "@/mocks/mockService";
import { SharingToken } from "@/mocks/types";

interface SharingCardProps {
  token: SharingToken;
  onRevoke: (token: string) => void;
  onShowQR: (token: SharingToken) => void;
  isRevoking?: boolean;
}

/**
 * SharingCard - Displays individual sharing token information
 *
 * @param token - The sharing token data
 * @param onRevoke - Callback when revoke button is pressed
 * @param onShowQR - Callback when QR button is pressed
 * @param isRevoking - Whether this token is currently being revoked
 *
 * Features:
 * - Expiration status with color-coded badges
 * - Permission list display
 * - QR code and revoke action buttons
 * - Loading state for revoke action
 */
function SharingCard({
  token,
  onRevoke,
  onShowQR,
  isRevoking = false,
}: SharingCardProps) {
  const isExpired = new Date(token.expiresAt) < new Date();
  const daysLeft = Math.ceil(
    (new Date(token.expiresAt).getTime() - new Date().getTime()) /
      (1000 * 3600 * 24)
  );

  return (
    <ThemedView style={styles.sharingCard}>
      <View style={styles.cardHeader}>
        <View style={styles.cardInfo}>
          <ThemedText style={styles.cardTitle}>Open Share Link</ThemedText>
          <ThemedText style={styles.cardSubtitle}>
            {isExpired
              ? "Expired"
              : daysLeft > 0
              ? `${daysLeft} day${daysLeft !== 1 ? "s" : ""} left`
              : "Expires today"}
          </ThemedText>
        </View>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: isExpired
                ? "#ef4444"
                : token.isActive
                ? "#10b981"
                : "#6b7280",
            },
          ]}
        >
          <Text style={styles.statusText}>
            {isExpired ? "Expired" : token.isActive ? "Active" : "Revoked"}
          </Text>
        </View>
      </View>

      <View style={styles.permissionsContainer}>
        <ThemedText style={styles.permissionsTitle}>Permissions:</ThemedText>
        {token.permissions.map((permission, index) => (
          <Text key={index} style={styles.permissionItem}>
            •{" "}
            {permission
              .replace("_", " ")
              .replace(/\b\w/g, (l) => l.toUpperCase())}
          </Text>
        ))}
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.qrButton}
          onPress={() => onShowQR(token)}
          disabled={!token.isActive || isExpired}
        >
          <IconSymbol name="qrcode" size={16} color="white" />
          <Text style={styles.buttonText}>Show QR</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.revokeButton, isRevoking && styles.buttonDisabled]}
          onPress={() => onRevoke(token.token)}
          disabled={!token.isActive || isRevoking}
        >
          {isRevoking ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <IconSymbol name="xmark" size={16} color="white" />
          )}
          <Text style={styles.buttonText}>
            {isRevoking ? "Revoking..." : "Revoke"}
          </Text>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

interface QRModalProps {
  visible: boolean;
  token: SharingToken | null;
  onClose: () => void;
}

function QRModal({ visible, token, onClose }: QRModalProps) {
  if (!token) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.modalCloseText}>Close</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Medication Share</Text>
          <View style={{ width: 50 }} />
        </View>

        <ScrollView contentContainerStyle={styles.qrContainer}>
          <ThemedText style={styles.qrTitle}>
            Show this QR code to your healthcare provider
          </ThemedText>

          <View style={styles.qrCodeContainer}>
            <QRCode
              value={token.token}
              size={200}
              backgroundColor="white"
              color="black"
            />
          </View>

          <ThemedText style={styles.qrSubtitle}>
            This code will expire on{" "}
            {new Date(token.expiresAt).toLocaleDateString()}
          </ThemedText>

          <View style={styles.qrInfo}>
            <ThemedText style={styles.qrInfoTitle}>
              What&apos;s shared:
            </ThemedText>
            {token.permissions.map((permission, index) => (
              <Text key={index} style={styles.qrInfoItem}>
                •{" "}
                {permission
                  .replace("_", " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </Text>
            ))}
          </View>

          <View style={styles.tokenContainer}>
            <ThemedText style={styles.tokenTitle}>Share Code</ThemedText>
            <View style={styles.tokenBox}>
              <Text style={styles.tokenText}>{token.token}</Text>
            </View>
            <ThemedText style={styles.tokenSubtitle}>
              Providers can also enter this code manually
            </ThemedText>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

interface CreateShareModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateShare: (hours: number, permissions: string[]) => void;
}

function CreateShareModal({
  visible,
  onClose,
  onCreateShare,
}: CreateShareModalProps) {
  const [hours, setHours] = useState("24");
  const [selectedPermissions, setSelectedPermissions] = useState([
    "view_medications",
    "view_basic_info",
  ]);

  const availablePermissions = [
    { key: "view_medications", label: "View Medications" },
    { key: "view_basic_info", label: "View Basic Info" },
    { key: "view_allergies", label: "View Allergies" },
    { key: "view_conditions", label: "View Medical Conditions" },
  ];

  const togglePermission = (permission: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  const handleCreate = () => {
    const hoursNumber = parseInt(hours, 10);
    if (isNaN(hoursNumber) || hoursNumber < 1 || hoursNumber > 168) {
      Alert.alert("Error", "Please enter a valid number of hours (1-168)");
      return;
    }
    if (selectedPermissions.length === 0) {
      Alert.alert("Error", "Please select at least one permission");
      return;
    }
    onCreateShare(hoursNumber, selectedPermissions);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.modalCloseText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Create Share Link</Text>
          <TouchableOpacity onPress={handleCreate}>
            <Text style={styles.modalSaveText}>Create</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.createModalContent}>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Expiration (hours)</Text>
            <TextInput
              style={styles.formInput}
              value={hours}
              onChangeText={setHours}
              placeholder="24"
              keyboardType="numeric"
            />
            <Text style={styles.formHint}>1-168 hours (1 week max)</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Permissions</Text>
            {availablePermissions.map((permission) => (
              <TouchableOpacity
                key={permission.key}
                style={styles.permissionOption}
                onPress={() => togglePermission(permission.key)}
              >
                <View
                  style={[
                    styles.checkbox,
                    {
                      backgroundColor: selectedPermissions.includes(
                        permission.key
                      )
                        ? "#3b82f6"
                        : "transparent",
                    },
                  ]}
                >
                  {selectedPermissions.includes(permission.key) && (
                    <IconSymbol name="checkmark" size={16} color="white" />
                  )}
                </View>
                <Text style={styles.permissionLabel}>{permission.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

/**
 * SharingScreen - Manages medication sharing with healthcare providers
 *
 * Features:
 * - Create secure sharing tokens with customizable permissions and expiration
 * - Display active sharing tokens with expiration status
 * - Generate QR codes for easy provider access
 * - Revoke sharing access when needed
 * - Loading states for all async operations
 * - Comprehensive error handling
 */
export default function SharingScreen() {
  const [sharingTokens, setSharingTokens] = useState<SharingToken[]>([]);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedToken, setSelectedToken] = useState<SharingToken | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [revokingTokens, setRevokingTokens] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSharingTokens();
  }, []);

  const loadSharingTokens = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const tokens = await mockDataService.getActiveSharingTokens();
      setSharingTokens(tokens);
    } catch (error) {
      console.error("Failed to load sharing tokens:", error);
      setError("Failed to load sharing tokens. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateShare = async (hours: number, permissions: string[]) => {
    try {
      setIsCreating(true);
      const token = await mockDataService.generateSharingToken(permissions);
      setSharingTokens((prev) => [token, ...prev]);
      setShowCreateModal(false);
    } catch (error) {
      console.error("Failed to create sharing token:", error);
      Alert.alert("Error", "Failed to create sharing token. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleRevokeShare = (tokenString: string) => {
    Alert.alert("Revoke Share", "Are you sure you want to revoke this share?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Revoke",
        style: "destructive",
        onPress: async () => {
          try {
            setRevokingTokens((prev) => new Set(prev).add(tokenString));
            await mockDataService.revokeSharingToken(tokenString);
            setSharingTokens((prev) =>
              prev.map((t) =>
                t.token === tokenString ? { ...t, isActive: false } : t
              )
            );
          } catch (error) {
            console.error("Failed to revoke sharing token:", error);
            Alert.alert(
              "Error",
              "Failed to revoke sharing token. Please try again."
            );
          } finally {
            setRevokingTokens((prev) => {
              const newSet = new Set(prev);
              newSet.delete(tokenString);
              return newSet;
            });
          }
        },
      },
    ]);
  };

  const handleShowQR = (token: SharingToken) => {
    setSelectedToken(token);
    setShowQRModal(true);
  };

  const renderLoadingState = () => (
    <ThemedView style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#3b82f6" />
      <ThemedText style={styles.loadingText}>
        Loading sharing tokens...
      </ThemedText>
    </ThemedView>
  );

  const renderErrorState = () => (
    <ThemedView style={styles.errorContainer}>
      <IconSymbol
        name="exclamationmark.triangle.fill"
        size={48}
        color="#ef4444"
      />
      <ThemedText style={styles.errorTitle}>Unable to Load</ThemedText>
      <ThemedText style={styles.errorText}>{error}</ThemedText>
      <TouchableOpacity style={styles.retryButton} onPress={loadSharingTokens}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </ThemedView>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.header}>
          <ThemedText style={styles.headerTitle}>Medication Sharing</ThemedText>
        </ThemedView>
        {renderLoadingState()}
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.header}>
          <ThemedText style={styles.headerTitle}>Medication Sharing</ThemedText>
        </ThemedView>
        {renderErrorState()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <ThemedText style={styles.headerTitle}>
              Medication Sharing
            </ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Share your medication list with healthcare providers
            </ThemedText>
          </View>
          <TouchableOpacity
            style={[styles.createButton, isCreating && styles.buttonDisabled]}
            onPress={() => setShowCreateModal(true)}
            disabled={isCreating}
          >
            {isCreating ? (
              <ActivityIndicator size={24} color="white" />
            ) : (
              <IconSymbol name="plus" size={24} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </ThemedView>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {sharingTokens.length === 0 ? (
          <ThemedView style={styles.emptyContainer}>
            <IconSymbol name="qrcode" size={64} color="#d1d5db" />
            <ThemedText style={styles.emptyTitle}>No Active Shares</ThemedText>
            <ThemedText style={styles.emptyText}>
              Create a share link to allow healthcare providers to access your
              medication list.
            </ThemedText>
          </ThemedView>
        ) : (
          sharingTokens.map((token) => (
            <SharingCard
              key={token.id}
              token={token}
              onRevoke={handleRevokeShare}
              onShowQR={handleShowQR}
              isRevoking={revokingTokens.has(token.token)}
            />
          ))
        )}
      </ScrollView>

      <QRModal
        visible={showQRModal}
        token={selectedToken}
        onClose={() => setShowQRModal(false)}
      />

      <CreateShareModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateShare={handleCreateShare}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  header: {
    padding: 20,
    backgroundColor: "transparent",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  createButton: {
    backgroundColor: "#3b82f6",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: {
    padding: 16,
    paddingTop: 0,
  },
  sharingCard: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  permissionsContainer: {
    marginBottom: 16,
  },
  permissionsTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  permissionItem: {
    fontSize: 13,
    color: "#6b7280",
    marginLeft: 8,
  },
  cardActions: {
    flexDirection: "row",
    gap: 12,
  },
  qrButton: {
    flex: 1,
    backgroundColor: "#3b82f6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  revokeButton: {
    flex: 1,
    backgroundColor: "#ef4444",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  buttonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.7,
    lineHeight: 22,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "white",
  },
  modalCloseText: {
    color: "#6b7280",
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  modalSaveText: {
    color: "#3b82f6",
    fontSize: 16,
    fontWeight: "600",
  },
  qrContainer: {
    alignItems: "center",
    padding: 32,
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 32,
  },
  qrCodeContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  qrSubtitle: {
    fontSize: 14,
    textAlign: "center",
    opacity: 0.7,
    marginBottom: 32,
  },
  qrInfo: {
    alignSelf: "stretch",
    marginBottom: 32,
  },
  qrInfoTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  qrInfoItem: {
    fontSize: 14,
    color: "#6b7280",
    marginLeft: 8,
    marginBottom: 2,
  },
  tokenContainer: {
    alignSelf: "stretch",
  },
  tokenTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  tokenBox: {
    backgroundColor: "#f9fafb",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 8,
  },
  tokenText: {
    fontSize: 14,
    fontFamily: "monospace",
    textAlign: "center",
    color: "#374151",
  },
  tokenSubtitle: {
    fontSize: 12,
    textAlign: "center",
    opacity: 0.7,
  },
  createModalContent: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#374151",
  },
  formInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "white",
  },
  formHint: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  permissionOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#d1d5db",
    justifyContent: "center",
    alignItems: "center",
  },
  permissionLabel: {
    fontSize: 16,
    color: "#374151",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
    opacity: 0.7,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.7,
    lineHeight: 22,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
