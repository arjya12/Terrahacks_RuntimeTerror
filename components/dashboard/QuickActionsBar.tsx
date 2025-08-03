import { AppIcon } from "@/components/icons/IconSystem";
import React, { useState } from "react";
import {
  Animated,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { FilterSortSheet } from "./FilterSortSheet";

interface QuickActionsBarProps {
  onSearch?: (query: string) => void;
  onFilter?: (filter: string) => void;
  onSort?: (sortBy: string) => void;
  onClear?: () => void;
  onCalendarPress?: () => void;
  searchQuery?: string;
  activeFilter?: string;
  sortBy?: string;
}

type ActionType = "search" | null;

/**
 * QuickActionsBar - Search, combined filter & sort, and calendar controls
 *
 * Features:
 * - Expandable search input with real-time filtering
 * - Combined filter & sort bottom sheet (reduces header clutter)
 * - Filter options: All, Active, Due Today, Missed Doses
 * - Sort options: Name, Due Time, Adherence Rate, Date Added
 * - Calendar access for scheduling
 * - Smooth animations and haptic feedback
 * - Clear visual indicators for active filters/sorting
 */
export function QuickActionsBar({
  onSearch,
  onFilter,
  onSort,
  onClear,
  onCalendarPress,
  searchQuery = "",
  activeFilter = "all",
  sortBy = "name",
}: QuickActionsBarProps) {
  const [activeAction, setActiveAction] = useState<ActionType>(null);
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [showFilterSortSheet, setShowFilterSortSheet] = useState(false);

  const searchWidthAnim = React.useRef(new Animated.Value(0)).current;

  const toggleSearch = () => {
    if (activeAction === "search") {
      // Closing search
      Animated.timing(searchWidthAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start(() => {
        setActiveAction(null);
      });
    } else {
      // Opening search
      setActiveAction("search");
      Animated.timing(searchWidthAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const handleSearchSubmit = () => {
    onSearch?.(searchInput);
    if (searchInput.trim() === "") {
      toggleSearch();
    }
  };

  const handleClearAll = () => {
    onClear?.();
  };

  const hasActiveFilters = activeFilter !== "all" || sortBy !== "name";

  return (
    <View style={styles.container}>
      <View style={styles.actionsRow}>
        {/* Search Action */}
        <View style={styles.searchContainer}>
          {activeAction === "search" ? (
            <Animated.View
              style={[
                styles.searchInputContainer,
                {
                  width: searchWidthAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", "100%"],
                  }),
                },
              ]}
            >
              <AppIcon name="control_search" size="mini" color="default" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search medications..."
                value={searchInput}
                onChangeText={setSearchInput}
                onSubmitEditing={handleSearchSubmit}
                autoFocus
                returnKeyType="search"
                accessibilityLabel="Search medications"
              />
              <TouchableOpacity
                onPress={toggleSearch}
                style={styles.closeButton}
              >
                <AppIcon name="control_close" size="mini" color="default" />
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <TouchableOpacity
              style={[
                styles.actionButton,
                searchQuery && styles.activeActionButton,
              ]}
              onPress={toggleSearch}
              accessibilityLabel="Search medications"
              accessibilityRole="button"
            >
              <AppIcon
                name="control_search"
                size="small"
                color={searchQuery ? "active" : "default"}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Combined Filter & Sort Action */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            hasActiveFilters && styles.activeActionButton,
          ]}
          onPress={() => setShowFilterSortSheet(true)}
          accessibilityLabel="Filter and sort medications"
          accessibilityHint="Opens options to filter and sort your medication list"
          accessibilityRole="button"
        >
          <AppIcon
            name="control_filter_sort"
            size="small"
            color={hasActiveFilters ? "active" : "default"}
          />
          {hasActiveFilters && <View style={styles.activeDot} />}
        </TouchableOpacity>

        {/* Calendar Action */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onCalendarPress}
          accessibilityLabel="Open calendar view"
          accessibilityRole="button"
        >
          <AppIcon name="control_calendar" size="small" color="default" />
        </TouchableOpacity>
      </View>

      {/* Combined Filter & Sort Sheet */}
      <FilterSortSheet
        visible={showFilterSortSheet}
        onClose={() => setShowFilterSortSheet(false)}
        onFilter={onFilter!}
        onSort={onSort!}
        onClear={handleClearAll}
        activeFilter={activeFilter}
        sortBy={sortBy}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  searchContainer: {
    flex: 1,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#374151",
  },
  closeButton: {
    padding: 4,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    position: "relative",
  },
  activeActionButton: {
    backgroundColor: "#eff6ff",
    borderColor: "#3b82f6",
  },
  activeDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#3b82f6",
  },
});
