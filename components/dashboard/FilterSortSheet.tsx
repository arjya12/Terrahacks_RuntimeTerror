import { AppIcon, FilterIcon, SortIcon } from "@/components/icons/IconSystem";
import React from "react";
import {
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface FilterSortSheetProps {
  visible: boolean;
  onClose: () => void;
  onFilter: (filter: string) => void;
  onSort: (sortBy: string) => void;
  onClear: () => void;
  activeFilter: string;
  sortBy: string;
}

interface FilterOptionData {
  id: string;
  label: string;
  filter: "all_medications" | "active_only" | "due_today" | "missed_doses";
  description?: string;
}

interface SortOptionData {
  id: string;
  label: string;
  sort: "name_az" | "due_time" | "adherence_rate" | "date_added";
  description?: string;
}

const { height: screenHeight } = Dimensions.get("window");

/**
 * FilterSortSheet - Unified filter and sort interface
 *
 * Features:
 * - Combined filter and sort in single bottom sheet
 * - Clear visual sections with consistent design
 * - Immediate feedback and state indication
 * - Optimized for one-handed use
 * - Full accessibility support
 */
export function FilterSortSheet({
  visible,
  onClose,
  onFilter,
  onSort,
  onClear,
  activeFilter,
  sortBy,
}: FilterSortSheetProps) {
  const slideAnim = React.useRef(new Animated.Value(screenHeight)).current;
  const overlayAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const filterOptions: FilterOptionData[] = [
    {
      id: "all",
      filter: "all_medications",
      label: "All Medications",
      description: "Show all medications in your list",
    },
    {
      id: "active",
      filter: "active_only",
      label: "Active Only",
      description: "Currently prescribed medications",
    },
    {
      id: "due_today",
      filter: "due_today",
      label: "Due Today",
      description: "Medications scheduled for today",
    },
    {
      id: "missed",
      filter: "missed_doses",
      label: "Missed Doses",
      description: "Overdue medications requiring attention",
    },
  ];

  const sortOptions: SortOptionData[] = [
    {
      id: "name",
      sort: "name_az",
      label: "Name (A-Z)",
      description: "Alphabetical order by medication name",
    },
    {
      id: "due_time",
      sort: "due_time",
      label: "Due Time",
      description: "Next scheduled dose time",
    },
    {
      id: "adherence",
      sort: "adherence_rate",
      label: "Adherence Rate",
      description: "Medication compliance percentage",
    },
    {
      id: "date_added",
      sort: "date_added",
      label: "Date Added",
      description: "Most recently added medications first",
    },
  ];

  const handleFilterSelect = (filterId: string) => {
    onFilter(filterId);
    // Add subtle haptic feedback on iOS
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(50);
    }
  };

  const handleSortSelect = (sortId: string) => {
    onSort(sortId);
    // Add subtle haptic feedback on iOS
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(50);
    }
  };

  const handleClearAll = () => {
    onClear();
    onClose();
  };

  const hasActiveFilters = activeFilter !== "all" || sortBy !== "name";

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Overlay */}
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: overlayAnim,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.overlayTouch}
          activeOpacity={1}
          onPress={onClose}
        />
      </Animated.View>

      {/* Bottom Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Handle Bar */}
        <View style={styles.handleBar} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Filter & Sort</Text>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            accessibilityLabel="Close filter and sort options"
            accessibilityRole="button"
          >
            <AppIcon name="control_close" size="small" color="default" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Filter Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Filter By</Text>
            <Text style={styles.sectionDescription}>
              Choose which medications to display
            </Text>

            <View style={styles.optionsGrid}>
              {filterOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.option,
                    activeFilter === option.id && styles.optionActive,
                  ]}
                  onPress={() => handleFilterSelect(option.id)}
                  accessibilityLabel={`Filter by ${option.label}. ${option.description}`}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: activeFilter === option.id }}
                >
                  <View style={styles.optionHeader}>
                    <View
                      style={[
                        styles.optionIcon,
                        activeFilter === option.id && styles.optionIconActive,
                      ]}
                    >
                      <FilterIcon
                        filter={option.filter}
                        isActive={activeFilter === option.id}
                      />
                    </View>
                    {activeFilter === option.id && (
                      <View style={styles.checkIcon}>
                        <AppIcon
                          name="feedback_completed"
                          size="mini"
                          color="active"
                        />
                      </View>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.optionLabel,
                      activeFilter === option.id && styles.optionLabelActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                  <Text style={styles.optionDescription}>
                    {option.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Sort Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sort By</Text>
            <Text style={styles.sectionDescription}>
              Choose how to order your medications
            </Text>

            <View style={styles.optionsGrid}>
              {sortOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.option,
                    sortBy === option.id && styles.optionActive,
                  ]}
                  onPress={() => handleSortSelect(option.id)}
                  accessibilityLabel={`Sort by ${option.label}. ${option.description}`}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: sortBy === option.id }}
                >
                  <View style={styles.optionHeader}>
                    <View
                      style={[
                        styles.optionIcon,
                        sortBy === option.id && styles.optionIconActive,
                      ]}
                    >
                      <SortIcon
                        sort={option.sort}
                        isActive={sortBy === option.id}
                      />
                    </View>
                    {sortBy === option.id && (
                      <View style={styles.checkIcon}>
                        <AppIcon
                          name="feedback_completed"
                          size="mini"
                          color="active"
                        />
                      </View>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.optionLabel,
                      sortBy === option.id && styles.optionLabelActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                  <Text style={styles.optionDescription}>
                    {option.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Footer Actions */}
        <View style={styles.footer}>
          {hasActiveFilters && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearAll}
              accessibilityLabel="Clear all filters and sorting"
              accessibilityRole="button"
            >
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.applyButton,
              !hasActiveFilters && styles.applyButtonSingle,
            ]}
            onPress={onClose}
            accessibilityLabel="Apply current filter and sort settings"
            accessibilityRole="button"
          >
            <Text style={styles.applyButtonText}>
              {hasActiveFilters ? "Apply" : "Done"}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  overlayTouch: {
    flex: 1,
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: screenHeight * 0.85,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  },
  handleBar: {
    width: 36,
    height: 4,
    backgroundColor: "#D1D5DB",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  option: {
    flex: 1,
    minWidth: "48%",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "transparent",
    position: "relative",
  },
  optionActive: {
    backgroundColor: "#EFF6FF",
    borderColor: "#3B82F6",
  },
  optionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  optionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  optionIconActive: {
    backgroundColor: "#DBEAFE",
  },
  checkIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  optionLabelActive: {
    color: "#1E40AF",
  },
  optionDescription: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginHorizontal: -20,
  },
  footer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    gap: 12,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
  },
  applyButtonSingle: {
    flex: 2,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
