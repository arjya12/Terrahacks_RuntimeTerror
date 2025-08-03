import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";

/**
 * Comprehensive Icon System for Medication Management App
 *
 * This component provides a standardized set of icons with consistent
 * styling, sizing, and semantic meaning across the entire application.
 *
 * Features:
 * - Healthcare-appropriate icon selection
 * - Consistent sizing and color system
 * - Accessibility-optimized with clear labels
 * - Supports all app functions and states
 */

export type IconSize = "mini" | "small" | "medium" | "large";
export type IconColor =
  | "default"
  | "active"
  | "success"
  | "warning"
  | "error"
  | "disabled"
  | "white";

interface IconSystemProps {
  name: IconName;
  size?: IconSize;
  color?: IconColor;
  accessibilityLabel?: string;
}

// Comprehensive icon mapping for the medication app
export type IconName =
  // Dashboard & Stats
  | "stats_due_today"
  | "stats_adherence_rate"
  | "stats_day_streak"
  | "stats_total_medications"
  | "status_perfect"
  | "status_on_track"
  | "status_needs_attention"
  | "status_behind"

  // Navigation & Primary Actions
  | "nav_medications"
  | "nav_schedule"
  | "nav_scan"
  | "nav_alerts"
  | "nav_ai_assistant"
  | "nav_profile"
  | "action_add_medication"
  | "action_quick_add"
  | "action_scan_bottle"
  | "action_emergency"

  // Filter Categories
  | "filter_all_medications"
  | "filter_active_only"
  | "filter_due_today"
  | "filter_missed_doses"
  | "filter_due_this_week"
  | "filter_low_adherence"

  // Sort Options
  | "sort_name_az"
  | "sort_due_time"
  | "sort_adherence_rate"
  | "sort_recently_added"
  | "sort_frequency"
  | "sort_date_added"

  // Medication Status
  | "med_status_taken"
  | "med_status_due_soon"
  | "med_status_overdue"
  | "med_status_skipped"
  | "med_status_not_due"

  // Quick Actions
  | "action_mark_taken"
  | "action_skip_dose"
  | "action_snooze"
  | "action_edit"
  | "action_delete"
  | "action_view_details"

  // Medication Types
  | "med_type_pill"
  | "med_type_capsule"
  | "med_type_liquid"
  | "med_type_injection"
  | "med_type_inhaler"
  | "med_type_patch"
  | "med_type_eye_drops"

  // Time & Schedule
  | "time_morning"
  | "time_afternoon"
  | "time_evening"
  | "time_night"
  | "meal_before"
  | "meal_after"
  | "meal_with_food"
  | "meal_empty_stomach"
  | "frequency_once"
  | "frequency_twice"
  | "frequency_three_times"
  | "frequency_as_needed"
  | "frequency_weekly"

  // Settings & Profile
  | "profile_personal_info"
  | "profile_medical_history"
  | "profile_emergency_contacts"
  | "profile_notifications"
  | "profile_privacy"
  | "profile_help"
  | "settings_reminders"
  | "settings_export"
  | "settings_dark_mode"
  | "settings_language"
  | "settings_backup"
  | "settings_about"

  // Communication & Sharing
  | "share_list"
  | "share_email"
  | "share_print"
  | "share_export"
  | "provider_doctor"
  | "provider_pharmacy"
  | "provider_insurance"
  | "provider_prescription"

  // Feedback & Status
  | "feedback_completed"
  | "feedback_uploaded"
  | "feedback_saved"
  | "feedback_connected"
  | "feedback_failed"
  | "feedback_no_network"
  | "feedback_error"
  | "feedback_retry"

  // Interface Controls
  | "control_search"
  | "control_filter_sort"
  | "control_calendar"
  | "control_close"
  | "control_back"
  | "control_forward"
  | "control_menu"
  | "control_refresh";

// Icon mapping to Material Icons (available through @expo/vector-icons)
const ICON_MAP: Record<IconName, string> = {
  // Dashboard & Stats
  stats_due_today: "access-time",
  stats_adherence_rate: "trending-up",
  stats_day_streak: "local-fire-department",
  stats_total_medications: "medication",
  status_perfect: "check-circle",
  status_on_track: "verified",
  status_needs_attention: "warning",
  status_behind: "error",

  // Navigation & Primary Actions
  nav_medications: "medication",
  nav_schedule: "schedule",
  nav_scan: "qr-code-scanner",
  nav_alerts: "notifications",
  nav_ai_assistant: "smart-toy",
  nav_profile: "person",
  action_add_medication: "add-circle",
  action_quick_add: "add",
  action_scan_bottle: "qr-code-scanner",
  action_emergency: "emergency",

  // Filter Categories
  filter_all_medications: "list",
  filter_active_only: "check-circle",
  filter_due_today: "today",
  filter_missed_doses: "error",
  filter_due_this_week: "date-range",
  filter_low_adherence: "trending-down",

  // Sort Options
  sort_name_az: "sort-by-alpha",
  sort_due_time: "schedule",
  sort_adherence_rate: "analytics",
  sort_recently_added: "new-releases",
  sort_frequency: "repeat",
  sort_date_added: "date-range",

  // Medication Status
  med_status_taken: "check-circle",
  med_status_due_soon: "schedule",
  med_status_overdue: "error",
  med_status_skipped: "remove-circle",
  med_status_not_due: "access-time",

  // Quick Actions
  action_mark_taken: "done",
  action_skip_dose: "skip-next",
  action_snooze: "snooze",
  action_edit: "edit",
  action_delete: "delete",
  action_view_details: "info",

  // Medication Types
  med_type_pill: "medication",
  med_type_capsule: "healing",
  med_type_liquid: "opacity",
  med_type_injection: "medical-services",
  med_type_inhaler: "air",
  med_type_patch: "healing",
  med_type_eye_drops: "visibility",

  // Time & Schedule
  time_morning: "wb-sunny",
  time_afternoon: "wb-sunny",
  time_evening: "brightness-3",
  time_night: "brightness-2",
  meal_before: "restaurant",
  meal_after: "done",
  meal_with_food: "fastfood",
  meal_empty_stomach: "remove-circle-outline",
  frequency_once: "looks-one",
  frequency_twice: "looks-two",
  frequency_three_times: "looks-3",
  frequency_as_needed: "help",
  frequency_weekly: "date-range",

  // Settings & Profile
  profile_personal_info: "person",
  profile_medical_history: "history",
  profile_emergency_contacts: "contacts",
  profile_notifications: "notifications",
  profile_privacy: "security",
  profile_help: "help",
  settings_reminders: "alarm",
  settings_export: "file-download",
  settings_dark_mode: "dark-mode",
  settings_language: "language",
  settings_backup: "backup",
  settings_about: "info",

  // Communication & Sharing
  share_list: "share",
  share_email: "email",
  share_print: "print",
  share_export: "download",
  provider_doctor: "medical-services",
  provider_pharmacy: "local-pharmacy",
  provider_insurance: "card-membership",
  provider_prescription: "receipt",

  // Feedback & Status
  feedback_completed: "check-circle",
  feedback_uploaded: "cloud-done",
  feedback_saved: "save",
  feedback_connected: "wifi",
  feedback_failed: "error",
  feedback_no_network: "wifi-off",
  feedback_error: "error-outline",
  feedback_retry: "refresh",

  // Interface Controls
  control_search: "search",
  control_filter_sort: "filter-list",
  control_calendar: "calendar-today",
  control_close: "close",
  control_back: "arrow-back",
  control_forward: "arrow-forward",
  control_menu: "menu",
  control_refresh: "refresh",
};

// Size mapping
const SIZE_MAP: Record<IconSize, number> = {
  mini: 16,
  small: 20,
  medium: 24,
  large: 32,
};

// Color mapping
const COLOR_MAP: Record<IconColor, string> = {
  default: "#6B7280", // gray-600
  active: "#3B82F6", // blue-500
  success: "#10B981", // green-500
  warning: "#F59E0B", // amber-500
  error: "#EF4444", // red-500
  disabled: "#9CA3AF", // gray-400
  white: "#FFFFFF", // white for use on colored backgrounds
};

// Accessibility labels for all icons
const ACCESSIBILITY_LABELS: Record<IconName, string> = {
  // Dashboard & Stats
  stats_due_today: "Medications due today",
  stats_adherence_rate: "Medication adherence rate",
  stats_day_streak: "Current adherence streak in days",
  stats_total_medications: "Total number of medications",
  status_perfect: "Perfect adherence status",
  status_on_track: "On track with medication schedule",
  status_needs_attention: "Medications need attention",
  status_behind: "Behind on medication schedule",

  // Navigation & Primary Actions
  nav_medications: "Medications list",
  nav_schedule: "Medication schedule",
  nav_scan: "Scan medication bottle",
  nav_alerts: "Alerts and notifications",
  nav_ai_assistant: "AI Assistant chat",
  nav_profile: "User profile",
  action_add_medication: "Add new medication",
  action_quick_add: "Quick add medication",
  action_scan_bottle: "Scan medication bottle",
  action_emergency: "Emergency contact",

  // Filter Categories
  filter_all_medications: "Show all medications",
  filter_active_only: "Show only active medications",
  filter_due_today: "Show medications due today",
  filter_missed_doses: "Show missed medication doses",
  filter_due_this_week: "Show medications due this week",
  filter_low_adherence: "Show medications with low adherence",

  // Sort Options
  sort_name_az: "Sort by medication name alphabetically",
  sort_due_time: "Sort by next due time",
  sort_adherence_rate: "Sort by adherence rate",
  sort_recently_added: "Sort by recently added",
  sort_frequency: "Sort by dosing frequency",
  sort_date_added: "Sort by date added",

  // Medication Status
  med_status_taken: "Medication taken",
  med_status_due_soon: "Medication due soon",
  med_status_overdue: "Medication overdue",
  med_status_skipped: "Medication dose skipped",
  med_status_not_due: "Medication not yet due",

  // Quick Actions
  action_mark_taken: "Mark medication as taken",
  action_skip_dose: "Skip this medication dose",
  action_snooze: "Snooze medication reminder",
  action_edit: "Edit medication details",
  action_delete: "Delete medication",
  action_view_details: "View medication details",

  // Medication Types
  med_type_pill: "Pill or tablet medication",
  med_type_capsule: "Capsule medication",
  med_type_liquid: "Liquid medication",
  med_type_injection: "Injectable medication",
  med_type_inhaler: "Inhaler medication",
  med_type_patch: "Transdermal patch medication",
  med_type_eye_drops: "Eye drop medication",

  // Time & Schedule
  time_morning: "Morning time period",
  time_afternoon: "Afternoon time period",
  time_evening: "Evening time period",
  time_night: "Night time period",
  meal_before: "Take before meals",
  meal_after: "Take after meals",
  meal_with_food: "Take with food",
  meal_empty_stomach: "Take on empty stomach",
  frequency_once: "Once daily dosing",
  frequency_twice: "Twice daily dosing",
  frequency_three_times: "Three times daily dosing",
  frequency_as_needed: "Take as needed",
  frequency_weekly: "Weekly dosing",

  // Settings & Profile
  profile_personal_info: "Personal information",
  profile_medical_history: "Medical history",
  profile_emergency_contacts: "Emergency contacts",
  profile_notifications: "Notification settings",
  profile_privacy: "Privacy settings",
  profile_help: "Help and support",
  settings_reminders: "Reminder settings",
  settings_export: "Export data",
  settings_dark_mode: "Dark mode setting",
  settings_language: "Language settings",
  settings_backup: "Backup settings",
  settings_about: "About this app",

  // Communication & Sharing
  share_list: "Share medication list",
  share_email: "Email medication information",
  share_print: "Print medication list",
  share_export: "Export medication data",
  provider_doctor: "Doctor information",
  provider_pharmacy: "Pharmacy information",
  provider_insurance: "Insurance information",
  provider_prescription: "Prescription information",

  // Feedback & Status
  feedback_completed: "Task completed successfully",
  feedback_uploaded: "Data uploaded successfully",
  feedback_saved: "Information saved",
  feedback_connected: "Connected to network",
  feedback_failed: "Operation failed",
  feedback_no_network: "No network connection",
  feedback_error: "Error occurred",
  feedback_retry: "Retry operation",

  // Interface Controls
  control_search: "Search medications",
  control_filter_sort: "Filter and sort options",
  control_calendar: "Calendar view",
  control_close: "Close",
  control_back: "Go back",
  control_forward: "Go forward",
  control_menu: "Menu options",
  control_refresh: "Refresh data",
};

/**
 * Main Icon System Component
 *
 * Provides standardized icons with consistent styling and accessibility
 */
export function AppIcon({
  name,
  size = "medium",
  color = "default",
}: IconSystemProps) {
  const iconName = ICON_MAP[name];
  const iconSize = SIZE_MAP[size];
  const iconColor = COLOR_MAP[color];

  if (!iconName) {
    console.warn(`Icon "${name}" not found in icon system`);
    return null;
  }

  return (
    <MaterialIcons
      name={iconName as keyof typeof MaterialIcons.glyphMap}
      size={iconSize}
      color={iconColor}
    />
  );
}

/**
 * Convenience components for common icon categories
 */

// Status icons with automatic color coding
export function StatusIcon({
  status,
  size = "small",
}: {
  status: "taken" | "due_soon" | "overdue" | "skipped" | "not_due";
  size?: IconSize;
}) {
  const colorMap = {
    taken: "success" as IconColor,
    due_soon: "warning" as IconColor,
    overdue: "error" as IconColor,
    skipped: "disabled" as IconColor,
    not_due: "default" as IconColor,
  };

  return (
    <AppIcon
      name={`med_status_${status}` as IconName}
      size={size}
      color={colorMap[status]}
    />
  );
}

// Navigation icons with consistent sizing
export function NavIcon({
  type,
  isActive = false,
}: {
  type: "medications" | "schedule" | "scan" | "profile";
  isActive?: boolean;
}) {
  return (
    <AppIcon
      name={`nav_${type}` as IconName}
      size="medium"
      color={isActive ? "active" : "default"}
    />
  );
}

// Filter icons with active state support
export function FilterIcon({
  filter,
  isActive = false,
}: {
  filter:
    | "all_medications"
    | "active_only"
    | "due_today"
    | "missed_doses"
    | "due_this_week"
    | "low_adherence";
  isActive?: boolean;
}) {
  return (
    <AppIcon
      name={`filter_${filter}` as IconName}
      size="small"
      color={isActive ? "active" : "default"}
    />
  );
}

// Sort icons with active state support
export function SortIcon({
  sort,
  isActive = false,
}: {
  sort:
    | "name_az"
    | "due_time"
    | "adherence_rate"
    | "recently_added"
    | "frequency"
    | "date_added";
  isActive?: boolean;
}) {
  return (
    <AppIcon
      name={`sort_${sort}` as IconName}
      size="small"
      color={isActive ? "active" : "default"}
    />
  );
}

// Export the complete icon system
export {
  ACCESSIBILITY_LABELS,
  COLOR_MAP,
  ICON_MAP,
  SIZE_MAP,
  AppIcon as default,
};
