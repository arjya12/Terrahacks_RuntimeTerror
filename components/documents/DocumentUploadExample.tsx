import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ProtectedRoute } from "@/components/auth/SupabaseAuthSync";
import { AppIcon } from "@/components/icons/IconSystem";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Database } from "@/config/supabase";
import {
  useDeleteDocument,
  useMedicalDocuments,
  useUploadDocument,
} from "@/hooks/useSupabase";
import * as DocumentPicker from "expo-document-picker";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type MedicalDocument = Database["public"]["Tables"]["medical_documents"]["Row"];
type DocumentType =
  | "prescription"
  | "lab_result"
  | "medical_record"
  | "insurance"
  | "other";

const documentTypes: { value: DocumentType; label: string; icon: string }[] = [
  { value: "prescription", label: "Prescription", icon: "nav_medications" },
  { value: "lab_result", label: "Lab Result", icon: "feedback_info" },
  { value: "medical_record", label: "Medical Record", icon: "nav_profile" },
  { value: "insurance", label: "Insurance", icon: "status_pending" },
  { value: "other", label: "Other", icon: "general_more" },
];

interface DocumentCardProps {
  document: MedicalDocument;
  onDelete: (id: string) => void;
}

function DocumentCard({ document, onDelete }: DocumentCardProps) {
  const documentType = documentTypes.find(
    (type) => type.value === document.document_type
  );
  const uploadDate = new Date(document.upload_date);
  const fileSizeKB = Math.round(document.file_size / 1024);

  const handleDelete = () => {
    Alert.alert(
      "Delete Document",
      `Are you sure you want to delete "${document.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete(document.id),
        },
      ]
    );
  };

  return (
    <ThemedView style={styles.documentCard}>
      <View style={styles.documentHeader}>
        <View style={styles.documentIcon}>
          <AppIcon
            name={(documentType?.icon as any) || "general_more"}
            size="small"
            color="primary"
          />
        </View>
        <View style={styles.documentInfo}>
          <ThemedText style={styles.documentTitle}>{document.title}</ThemedText>
          <ThemedText style={styles.documentMeta}>
            {documentType?.label} • {fileSizeKB}KB
          </ThemedText>
          <ThemedText style={styles.documentDate}>
            Uploaded {uploadDate.toLocaleDateString()}
          </ThemedText>
        </View>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <AppIcon name="feedback_error" size="small" color="error" />
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

interface UploadModalProps {
  visible: boolean;
  onClose: () => void;
  onUpload: (file: any, metadata: any) => void;
  isUploading: boolean;
}

function UploadModal({
  visible,
  onClose,
  onUpload,
  isUploading,
}: UploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [documentType, setDocumentType] = useState<DocumentType>("other");
  const [showTypePicker, setShowTypePicker] = useState(false);

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        setSelectedFile(file);
        setTitle(file.name.replace(/\.[^/.]+$/, "")); // Remove file extension for title
      }
    } catch (error) {
      console.error("Error picking document:", error);
      Alert.alert("Error", "Failed to pick document. Please try again.");
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      Alert.alert("Error", "Please select a file first.");
      return;
    }

    if (!title.trim()) {
      Alert.alert("Error", "Please enter a title for the document.");
      return;
    }

    const metadata = {
      title: title.trim(),
      file_type: selectedFile.mimeType,
      file_size: selectedFile.size,
      document_type: documentType,
    };

    onUpload(selectedFile, metadata);
  };

  const handleClose = () => {
    setSelectedFile(null);
    setTitle("");
    setDocumentType("other");
    setShowTypePicker(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={handleClose}>
            <ThemedText style={styles.cancelText}>Cancel</ThemedText>
          </TouchableOpacity>
          <ThemedText style={styles.modalTitle}>Upload Document</ThemedText>
          <TouchableOpacity
            onPress={handleUpload}
            disabled={!selectedFile || !title.trim() || isUploading}
          >
            <ThemedText
              style={[
                styles.uploadText,
                (!selectedFile || !title.trim() || isUploading) &&
                  styles.uploadTextDisabled,
              ]}
            >
              {isUploading ? "Uploading..." : "Upload"}
            </ThemedText>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {/* File Selection */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Select File</ThemedText>
            <TouchableOpacity
              style={styles.filePicker}
              onPress={handlePickDocument}
            >
              {selectedFile ? (
                <View style={styles.selectedFile}>
                  <AppIcon
                    name="general_attachment"
                    size="medium"
                    color="success"
                  />
                  <View style={styles.fileInfo}>
                    <ThemedText style={styles.fileName}>
                      {selectedFile.name}
                    </ThemedText>
                    <ThemedText style={styles.fileSize}>
                      {Math.round(selectedFile.size / 1024)}KB
                    </ThemedText>
                  </View>
                </View>
              ) : (
                <View style={styles.filePickerEmpty}>
                  <AppIcon name="action_upload" size="large" color="disabled" />
                  <ThemedText style={styles.filePickerText}>
                    Tap to select a PDF or image file
                  </ThemedText>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Title */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Document Title</ThemedText>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter document title"
              maxLength={100}
            />
          </View>

          {/* Document Type */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Document Type</ThemedText>
            <TouchableOpacity
              style={styles.typePicker}
              onPress={() => setShowTypePicker(!showTypePicker)}
            >
              <View style={styles.typePickerContent}>
                <AppIcon
                  name={
                    (documentTypes.find((t) => t.value === documentType)
                      ?.icon as any) || "general_more"
                  }
                  size="small"
                  color="default"
                />
                <ThemedText style={styles.typePickerText}>
                  {documentTypes.find((t) => t.value === documentType)?.label}
                </ThemedText>
              </View>
              <AppIcon name="actions_arrow_down" size="small" color="default" />
            </TouchableOpacity>

            {showTypePicker && (
              <View style={styles.typeOptions}>
                {documentTypes.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={styles.typeOption}
                    onPress={() => {
                      setDocumentType(type.value);
                      setShowTypePicker(false);
                    }}
                  >
                    <AppIcon
                      name={type.icon as any}
                      size="small"
                      color="default"
                    />
                    <ThemedText style={styles.typeOptionText}>
                      {type.label}
                    </ThemedText>
                    {documentType === type.value && (
                      <AppIcon
                        name="status_success"
                        size="small"
                        color="success"
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {isUploading && (
            <View style={styles.uploadingContainer}>
              <LoadingSpinner size="large" />
              <ThemedText style={styles.uploadingText}>
                Uploading document...
              </ThemedText>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function DocumentUploadExampleContent() {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const {
    data: documentsResult,
    isLoading,
    error,
    refetch,
  } = useMedicalDocuments();
  const uploadDocument = useUploadDocument();
  const deleteDocument = useDeleteDocument();

  const documents = documentsResult?.data || [];

  const handleUpload = async (file: any, metadata: any) => {
    try {
      // Convert the file to a Blob for upload
      const response = await fetch(file.uri);
      const blob = await response.blob();

      await uploadDocument.mutateAsync({ file: blob, metadata });
      Alert.alert("Success", "Document uploaded successfully!");
      setShowUploadModal(false);
    } catch (error) {
      console.error("Upload failed:", error);
      Alert.alert("Error", "Failed to upload document. Please try again.");
    }
  };

  const handleDelete = async (documentId: string) => {
    try {
      await deleteDocument.mutateAsync(documentId);
      Alert.alert("Success", "Document deleted successfully!");
    } catch (error) {
      console.error("Delete failed:", error);
      Alert.alert("Error", "Failed to delete document. Please try again.");
    }
  };

  const renderDocument = ({ item }: { item: MedicalDocument }) => (
    <DocumentCard document={item} onDelete={handleDelete} />
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner size="large" />
        <ThemedText style={styles.loadingText}>Loading documents...</ThemedText>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.errorContainer}>
          <AppIcon name="feedback_error" size="large" color="error" />
          <ThemedText style={styles.errorTitle}>
            Unable to Load Documents
          </ThemedText>
          <ThemedText style={styles.errorText}>
            Failed to load your documents. Please try again.
          </ThemedText>
          <TouchableOpacity
            onPress={() => refetch()}
            style={styles.retryButton}
          >
            <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <ThemedText style={styles.headerTitle}>Medical Documents</ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          {documents.length} document{documents.length !== 1 ? "s" : ""} stored
        </ThemedText>
      </ThemedView>

      {/* Documents List */}
      {documents.length === 0 ? (
        <ThemedView style={styles.emptyState}>
          <AppIcon name="general_attachment" size="large" color="disabled" />
          <ThemedText style={styles.emptyTitle}>No Documents Yet</ThemedText>
          <ThemedText style={styles.emptyText}>
            Upload your medical documents, prescriptions, and lab results to
            keep them organized and secure.
          </ThemedText>
          <TouchableOpacity
            style={styles.uploadFirstButton}
            onPress={() => setShowUploadModal(true)}
          >
            <AppIcon name="action_upload" size="small" color="white" />
            <Text style={styles.uploadFirstButtonText}>
              Upload First Document
            </Text>
          </TouchableOpacity>
        </ThemedView>
      ) : (
        <FlatList
          data={documents}
          renderItem={renderDocument}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.documentsList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Floating Action Button */}
      {documents.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowUploadModal(true)}
        >
          <AppIcon name="action_upload" size="medium" color="white" />
        </TouchableOpacity>
      )}

      {/* Upload Modal */}
      <UploadModal
        visible={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUpload}
        isUploading={uploadDocument.isPending}
      />
    </SafeAreaView>
  );
}

export function DocumentUploadExample() {
  return (
    <ProtectedRoute>
      <DocumentUploadExampleContent />
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  loadingText: {
    marginTop: 16,
    textAlign: "center",
    opacity: 0.7,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
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
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "600",
  },
  header: {
    padding: 20,
    backgroundColor: "transparent",
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
  documentsList: {
    padding: 20,
    paddingTop: 0,
  },
  documentCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  documentHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  documentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  documentMeta: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 2,
  },
  documentDate: {
    fontSize: 12,
    opacity: 0.5,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  uploadFirstButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3b82f6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  uploadFirstButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    backgroundColor: "#3b82f6",
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "white",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  cancelText: {
    fontSize: 16,
    color: "#6b7280",
  },
  uploadText: {
    fontSize: 16,
    color: "#3b82f6",
    fontWeight: "600",
  },
  uploadTextDisabled: {
    opacity: 0.5,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  filePicker: {
    borderWidth: 2,
    borderColor: "#d1d5db",
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 20,
    backgroundColor: "white",
  },
  filePickerEmpty: {
    alignItems: "center",
    paddingVertical: 20,
  },
  filePickerText: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 12,
    textAlign: "center",
  },
  selectedFile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 14,
    opacity: 0.7,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "white",
  },
  typePicker: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
  },
  typePickerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  typePickerText: {
    fontSize: 16,
  },
  typeOptions: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "white",
    overflow: "hidden",
  },
  typeOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    gap: 8,
  },
  typeOptionText: {
    fontSize: 16,
    flex: 1,
  },
  uploadingContainer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  uploadingText: {
    fontSize: 16,
    marginTop: 16,
    opacity: 0.7,
  },
});
