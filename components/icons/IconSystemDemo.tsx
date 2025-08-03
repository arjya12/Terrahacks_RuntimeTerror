import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  AppIcon,
  FilterIcon,
  NavIcon,
  SortIcon,
  StatusIcon,
} from "./IconSystem";

/**
 * IconSystemDemo - Comprehensive demonstration of the icon system
 *
 * This component showcases how the new icon system provides:
 * - Consistent visual language across all app functions
 * - Semantic meaning through appropriate icon selection
 * - Proper accessibility with automatic labels
 * - Color coding that reinforces app states and actions
 * - Scalable sizing for different UI contexts
 */
export function IconSystemDemo() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Dashboard Stats Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dashboard Stats</Text>
        <View style={styles.statsGrid}>
          {[
            {
              icon: "stats_due_today",
              color: "warning",
              label: "Due Today",
              value: "3",
            },
            {
              icon: "stats_adherence_rate",
              color: "success",
              label: "Adherence",
              value: "94%",
            },
            {
              icon: "stats_day_streak",
              color: "active",
              label: "Streak",
              value: "12 days",
            },
            {
              icon: "stats_total_medications",
              color: "default",
              label: "Total",
              value: "8",
            },
          ].map((stat) => (
            <TouchableOpacity key={stat.icon} style={styles.statCard}>
              <AppIcon
                name={stat.icon as any}
                size="large"
                color={stat.color as any}
              />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Medication Status Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Medication Status</Text>
        <View style={styles.statusGrid}>
          {[
            { status: "taken", label: "Taken", description: "Completed doses" },
            {
              status: "due_soon",
              label: "Due Soon",
              description: "Upcoming doses",
            },
            {
              status: "overdue",
              label: "Overdue",
              description: "Missed doses",
            },
            {
              status: "not_due",
              label: "Not Due",
              description: "Future doses",
            },
          ].map((item) => (
            <View key={item.status} style={styles.statusItem}>
              <StatusIcon status={item.status as any} size="medium" />
              <View style={styles.statusText}>
                <Text style={styles.statusLabel}>{item.label}</Text>
                <Text style={styles.statusDescription}>{item.description}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Navigation Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Navigation</Text>
        <View style={styles.navGrid}>
          {[
            { type: "medications", label: "Medications", active: true },
            { type: "schedule", label: "Schedule", active: false },
            { type: "scan", label: "Scan", active: false },
            { type: "profile", label: "Profile", active: false },
          ].map((nav) => (
            <TouchableOpacity key={nav.type} style={styles.navItem}>
              <NavIcon type={nav.type as any} isActive={nav.active} />
              <Text
                style={[styles.navLabel, nav.active && styles.navLabelActive]}
              >
                {nav.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Filter & Sort Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Filter & Sort Options</Text>

        <Text style={styles.subsectionTitle}>Filters</Text>
        <View style={styles.filterGrid}>
          {[
            { filter: "all_medications", label: "All", active: false },
            { filter: "active_only", label: "Active", active: true },
            { filter: "due_today", label: "Due Today", active: false },
            { filter: "missed_doses", label: "Missed", active: false },
          ].map((filter) => (
            <TouchableOpacity
              key={filter.filter}
              style={[
                styles.filterItem,
                filter.active && styles.filterItemActive,
              ]}
            >
              <FilterIcon
                filter={filter.filter as any}
                isActive={filter.active}
              />
              <Text
                style={[
                  styles.filterLabel,
                  filter.active && styles.filterLabelActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.subsectionTitle}>Sort Options</Text>
        <View style={styles.sortGrid}>
          {[
            { sort: "name_az", label: "Name", active: false },
            { sort: "due_time", label: "Due Time", active: false },
            { sort: "adherence_rate", label: "Adherence", active: true },
            { sort: "date_added", label: "Date Added", active: false },
          ].map((sort) => (
            <TouchableOpacity
              key={sort.sort}
              style={[styles.sortItem, sort.active && styles.sortItemActive]}
            >
              <SortIcon sort={sort.sort as any} isActive={sort.active} />
              <Text
                style={[
                  styles.sortLabel,
                  sort.active && styles.sortLabelActive,
                ]}
              >
                {sort.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Action Icons Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Medication Actions</Text>
        <View style={styles.actionsGrid}>
          {[
            {
              icon: "action_add_medication",
              color: "active",
              label: "Add Med",
            },
            {
              icon: "action_mark_taken",
              color: "success",
              label: "Mark Taken",
            },
            { icon: "action_skip_dose", color: "warning", label: "Skip Dose" },
            { icon: "action_edit", color: "default", label: "Edit" },
            { icon: "action_delete", color: "error", label: "Delete" },
            { icon: "action_view_details", color: "default", label: "Details" },
          ].map((action) => (
            <TouchableOpacity key={action.icon} style={styles.actionItem}>
              <AppIcon
                name={action.icon as any}
                size="medium"
                color={action.color as any}
              />
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Medication Types Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Medication Types</Text>
        <View style={styles.typesGrid}>
          {[
            { icon: "med_type_pill", label: "Pill" },
            { icon: "med_type_capsule", label: "Capsule" },
            { icon: "med_type_liquid", label: "Liquid" },
            { icon: "med_type_injection", label: "Injection" },
            { icon: "med_type_inhaler", label: "Inhaler" },
            { icon: "med_type_patch", label: "Patch" },
          ].map((type) => (
            <View key={type.icon} style={styles.typeItem}>
              <AppIcon name={type.icon as any} size="medium" color="default" />
              <Text style={styles.typeLabel}>{type.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Time & Schedule Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Time & Schedule</Text>
        <View style={styles.timeGrid}>
          {[
            { icon: "time_morning", label: "Morning", color: "warning" },
            { icon: "time_afternoon", label: "Afternoon", color: "active" },
            { icon: "time_evening", label: "Evening", color: "success" },
            { icon: "time_night", label: "Night", color: "default" },
          ].map((time) => (
            <View key={time.icon} style={styles.timeItem}>
              <AppIcon
                name={time.icon as any}
                size="medium"
                color={time.color as any}
              />
              <Text style={styles.timeLabel}>{time.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Feedback & Status Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Feedback & Status</Text>
        <View style={styles.feedbackGrid}>
          {[
            { icon: "feedback_completed", color: "success", label: "Success" },
            { icon: "feedback_failed", color: "error", label: "Failed" },
            { icon: "feedback_retry", color: "warning", label: "Retry" },
            { icon: "feedback_connected", color: "active", label: "Connected" },
          ].map((feedback) => (
            <View key={feedback.icon} style={styles.feedbackItem}>
              <AppIcon
                name={feedback.icon as any}
                size="medium"
                color={feedback.color as any}
              />
              <Text style={styles.feedbackLabel}>{feedback.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Size Demonstration */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Icon Sizing</Text>
        <View style={styles.sizingDemo}>
          <View style={styles.sizeGroup}>
            <AppIcon name="action_add_medication" size="mini" color="active" />
            <Text style={styles.sizeLabel}>Mini (16px)</Text>
          </View>
          <View style={styles.sizeGroup}>
            <AppIcon name="action_add_medication" size="small" color="active" />
            <Text style={styles.sizeLabel}>Small (20px)</Text>
          </View>
          <View style={styles.sizeGroup}>
            <AppIcon
              name="action_add_medication"
              size="medium"
              color="active"
            />
            <Text style={styles.sizeLabel}>Medium (24px)</Text>
          </View>
          <View style={styles.sizeGroup}>
            <AppIcon name="action_add_medication" size="large" color="active" />
            <Text style={styles.sizeLabel}>Large (32px)</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 12,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },

  // Status Grid
  statusGrid: {
    gap: 12,
  },
  statusItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
  },
  statusText: {
    marginLeft: 12,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  statusDescription: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },

  // Navigation Grid
  navGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  navItem: {
    alignItems: "center",
    padding: 12,
  },
  navLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  navLabelActive: {
    color: "#3b82f6",
    fontWeight: "600",
  },

  // Filter Grid
  filterGrid: {
    flexDirection: "row",
    gap: 8,
  },
  filterItem: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  filterItemActive: {
    backgroundColor: "#eff6ff",
    borderColor: "#3b82f6",
  },
  filterLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  filterLabelActive: {
    color: "#3b82f6",
    fontWeight: "600",
  },

  // Sort Grid
  sortGrid: {
    flexDirection: "row",
    gap: 8,
  },
  sortItem: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  sortItemActive: {
    backgroundColor: "#eff6ff",
    borderColor: "#3b82f6",
  },
  sortLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  sortLabelActive: {
    color: "#3b82f6",
    fontWeight: "600",
  },

  // Actions Grid
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionItem: {
    flex: 1,
    minWidth: "30%",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
  },
  actionLabel: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 4,
    textAlign: "center",
  },

  // Types Grid
  typesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  typeItem: {
    flex: 1,
    minWidth: "30%",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
  },
  typeLabel: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 4,
  },

  // Time Grid
  timeGrid: {
    flexDirection: "row",
    gap: 8,
  },
  timeItem: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
  },
  timeLabel: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 4,
  },

  // Feedback Grid
  feedbackGrid: {
    flexDirection: "row",
    gap: 8,
  },
  feedbackItem: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
  },
  feedbackLabel: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 4,
  },

  // Sizing Demo
  sizingDemo: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  sizeGroup: {
    alignItems: "center",
  },
  sizeLabel: {
    fontSize: 10,
    color: "#6b7280",
    marginTop: 8,
  },
});
