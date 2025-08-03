/**
 * Gemini Chat Component
 * Interactive chat interface with Gemini AI
 */

import React, { useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../constants/Colors";
import { useColorScheme } from "../../hooks/useColorScheme";
import { ChatMessage, useChat } from "../../hooks/useGemini";
import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";
import { LoadingSpinner } from "../ui/LoadingSpinner";

// ============================================================================
// Types
// ============================================================================

interface GeminiChatProps {
  initialPrompt?: string;
  placeholder?: string;
  style?: any;
}

// ============================================================================
// Message Component
// ============================================================================

function MessageBubble({ message }: { message: ChatMessage }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const isUser = message.role === "user";

  return (
    <View
      style={[
        styles.messageBubble,
        isUser ? styles.userBubble : styles.assistantBubble,
        {
          backgroundColor: isUser ? colors.tint : colors.background,
          borderColor: colors.border,
        },
      ]}
    >
      <Text
        style={[styles.messageText, { color: isUser ? "white" : colors.text }]}
      >
        {message.text}
      </Text>
      <Text
        style={[
          styles.timestamp,
          { color: isUser ? "rgba(255,255,255,0.7)" : colors.tabIconDefault },
        ]}
      >
        {message.timestamp.toLocaleTimeString()}
      </Text>
    </View>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function GeminiChat({
  initialPrompt,
  placeholder = "Ask me anything...",
  style,
}: GeminiChatProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [input, setInput] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const { messages, sendMessage, clearChat, isLoading, error } = useChat();

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const message = input.trim();
    setInput("");

    await sendMessage(message);

    // Scroll to bottom after sending
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleClear = () => {
    clearChat();
  };

  React.useEffect(() => {
    if (initialPrompt && messages.length === 0) {
      sendMessage(initialPrompt);
    }
  }, [initialPrompt, messages.length, sendMessage]);

  return (
    <KeyboardAvoidingView
      style={[styles.container, style]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ThemedView style={styles.chatContainer}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <ThemedText type="subtitle" style={styles.headerTitle}>
            AI Assistant
          </ThemedText>
          {messages.length > 0 && (
            <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
              <Text style={{ color: colors.tint }}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MessageBubble message={item} />}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Text
                style={[styles.emptyIcon, { color: colors.tabIconDefault }]}
              >
                🤖
              </Text>
              <ThemedText style={styles.emptyText}>
                Hi! I'm your AI assistant. How can I help you today?
              </ThemedText>
            </View>
          )}
        />

        {/* Error Display */}
        {error && (
          <View style={[styles.errorContainer, { backgroundColor: "#FFE5E5" }]}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <LoadingSpinner size="small" />
            <Text
              style={[styles.loadingText, { color: colors.tabIconDefault }]}
            >
              AI is thinking...
            </Text>
          </View>
        )}

        {/* Input */}
        <View
          style={[styles.inputContainer, { borderTopColor: colors.border }]}
        >
          <TextInput
            style={[
              styles.textInput,
              {
                borderColor: colors.border,
                backgroundColor: colors.background,
                color: colors.text,
              },
            ]}
            placeholder={placeholder}
            placeholderTextColor={colors.tabIconDefault}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={1000}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor:
                  input.trim() && !isLoading
                    ? colors.tint
                    : colors.tabIconDefault,
              },
            ]}
            onPress={handleSend}
            disabled={!input.trim() || isLoading}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chatContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
    margin: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontWeight: "600",
  },
  clearButton: {
    padding: 8,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
  },
  userBubble: {
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
  },
  errorContainer: {
    margin: 16,
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    color: "#D32F2F",
    textAlign: "center",
    fontSize: 14,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    alignItems: "flex-end",
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default GeminiChat;
