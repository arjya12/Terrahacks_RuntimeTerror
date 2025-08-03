import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { AppIcon } from "@/components/icons/IconSystem";
import React, { useMemo, useState } from "react";
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: screenWidth } = Dimensions.get("window");

interface MedicationSchedule {
  id: string;
  name: string;
  dosage: string;
  times: string[];
  color: string;
  taken?: boolean;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  medications: MedicationSchedule[];
}

interface MedicationCalendarViewProps {
  visible: boolean;
  onClose: () => void;
  medications?: { id: string; name: string }[];
}

export default function MedicationCalendarView({
  visible,
  onClose,
}: MedicationCalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Mock medication schedule data
  const mockSchedules: MedicationSchedule[] = [
    {
      id: "1",
      name: "Lisinopril",
      dosage: "10mg",
      times: ["08:00", "20:00"],
      color: "#FF6B6B",
    },
    {
      id: "2",
      name: "Metformin",
      dosage: "500mg",
      times: ["07:00", "19:00"],
      color: "#4ECDC4",
    },
    {
      id: "3",
      name: "Vitamin D",
      dosage: "1000 IU",
      times: ["09:00"],
      color: "#45B7D1",
    },
    {
      id: "4",
      name: "Omega-3",
      dosage: "1000mg",
      times: ["09:00"],
      color: "#96CEB4",
    },
  ];

  const generateCalendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // Get first day of month and how many days to show from previous month
    const firstDay = new Date(year, month, 1);

    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: CalendarDay[] = [];
    const today = new Date();

    // Generate 42 days (6 weeks) for calendar grid
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const isCurrentMonth = date.getMonth() === month;
      const isToday =
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();

      days.push({
        date,
        isCurrentMonth,
        isToday,
        medications: isCurrentMonth ? mockSchedules : [],
      });
    }

    return days;
  }, [currentMonth]);

  const selectedDayMedications = useMemo(() => {
    const selectedDateMeds = mockSchedules.map((med) => ({
      ...med,
      scheduleForDay: med.times.map((time) => ({
        time,
        taken: Math.random() > 0.3, // Mock some as taken
      })),
    }));
    return selectedDateMeds;
  }, [selectedDate]);

  const navigateMonth = (direction: "prev" | "next") => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(
      currentMonth.getMonth() + (direction === "next" ? 1 : -1)
    );
    setCurrentMonth(newMonth);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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
            Medication Calendar
          </ThemedText>
          <View style={styles.headerSpacer} />
        </ThemedView>

        <ScrollView style={styles.content}>
          {/* Month Navigation */}
          <ThemedView style={styles.monthHeader}>
            <TouchableOpacity
              onPress={() => navigateMonth("prev")}
              style={styles.monthButton}
            >
              <AppIcon name="nav_back" size="small" color="secondary" />
            </TouchableOpacity>

            <ThemedText style={styles.monthTitle}>
              {formatMonthYear(currentMonth)}
            </ThemedText>

            <TouchableOpacity
              onPress={() => navigateMonth("next")}
              style={styles.monthButton}
            >
              <AppIcon name="nav_forward" size="small" color="secondary" />
            </TouchableOpacity>
          </ThemedView>

          {/* Week Days Header */}
          <ThemedView style={styles.weekHeader}>
            {weekDays.map((day) => (
              <View key={day} style={styles.weekDay}>
                <Text style={styles.weekDayText}>{day}</Text>
              </View>
            ))}
          </ThemedView>

          {/* Calendar Grid */}
          <ThemedView style={styles.calendar}>
            {generateCalendarDays.map((day, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.calendarDay,
                  !day.isCurrentMonth && styles.otherMonth,
                  day.isToday && styles.today,
                  selectedDate.toDateString() === day.date.toDateString() &&
                    styles.selected,
                ]}
                onPress={() => setSelectedDate(day.date)}
              >
                <Text
                  style={[
                    styles.dayNumber,
                    !day.isCurrentMonth && styles.otherMonthText,
                    day.isToday && styles.todayText,
                    selectedDate.toDateString() === day.date.toDateString() &&
                      styles.selectedText,
                  ]}
                >
                  {day.date.getDate()}
                </Text>

                {/* Medication Indicators */}
                {day.isCurrentMonth && day.medications.length > 0 && (
                  <View style={styles.medicationIndicators}>
                    {day.medications.slice(0, 3).map((med) => (
                      <View
                        key={med.id}
                        style={[
                          styles.medicationDot,
                          { backgroundColor: med.color },
                        ]}
                      />
                    ))}
                    {day.medications.length > 3 && (
                      <Text style={styles.moreIndicator}>
                        +{day.medications.length - 3}
                      </Text>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ThemedView>

          {/* Selected Date Schedule */}
          <ThemedView style={styles.scheduleSection}>
            <ThemedText style={styles.scheduleSectionTitle}>
              Schedule for {formatDate(selectedDate)}
            </ThemedText>

            {selectedDayMedications.length > 0 ? (
              <View style={styles.scheduleList}>
                {selectedDayMedications.map((med) => (
                  <ThemedView key={med.id} style={styles.medicationCard}>
                    <View style={styles.medicationHeader}>
                      <View
                        style={[
                          styles.medicationColorBar,
                          { backgroundColor: med.color },
                        ]}
                      />
                      <View style={styles.medicationInfo}>
                        <ThemedText style={styles.medicationName}>
                          {med.name}
                        </ThemedText>
                        <ThemedText style={styles.medicationDosage}>
                          {med.dosage}
                        </ThemedText>
                      </View>
                    </View>

                    <View style={styles.timeSchedules}>
                      {med.scheduleForDay.map((schedule, index) => (
                        <View key={index} style={styles.timeSlot}>
                          <ThemedText style={styles.timeText}>
                            {schedule.time}
                          </ThemedText>
                          <TouchableOpacity
                            style={[
                              styles.checkButton,
                              schedule.taken && styles.checkButtonTaken,
                            ]}
                          >
                            <AppIcon
                              name={
                                schedule.taken
                                  ? "status_check"
                                  : "status_pending"
                              }
                              size="small"
                              color={schedule.taken ? "success" : "secondary"}
                            />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  </ThemedView>
                ))}
              </View>
            ) : (
              <ThemedView style={styles.noSchedule}>
                <AppIcon name="status_info" size="large" color="secondary" />
                <ThemedText style={styles.noScheduleText}>
                  No medications scheduled for this day
                </ThemedText>
              </ThemedView>
            )}
          </ThemedView>
        </ScrollView>
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
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  monthButton: {
    padding: 8,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  weekHeader: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  weekDay: {
    flex: 1,
    alignItems: "center",
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6c757d",
  },
  calendar: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
  },
  calendarDay: {
    width: (screenWidth - 32) / 7,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    marginBottom: 4,
    position: "relative",
  },
  otherMonth: {
    opacity: 0.3,
  },
  today: {
    backgroundColor: "#e3f2fd",
  },
  selected: {
    backgroundColor: "#1976d2",
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  otherMonthText: {
    color: "#999",
  },
  todayText: {
    color: "#1976d2",
    fontWeight: "600",
  },
  selectedText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  medicationIndicators: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  medicationDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 1,
  },
  moreIndicator: {
    fontSize: 8,
    color: "#666",
    marginLeft: 2,
  },
  scheduleSection: {
    padding: 16,
    marginTop: 16,
  },
  scheduleSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  scheduleList: {
    gap: 12,
  },
  medicationCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  medicationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  medicationColorBar: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  medicationDosage: {
    fontSize: 14,
    color: "#666",
  },
  timeSchedules: {
    gap: 8,
  },
  timeSlot: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  timeText: {
    fontSize: 14,
    fontWeight: "500",
  },
  checkButton: {
    padding: 4,
  },
  checkButtonTaken: {
    backgroundColor: "#e8f5e8",
    borderRadius: 12,
  },
  noSchedule: {
    alignItems: "center",
    padding: 32,
  },
  noScheduleText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
  },
});
