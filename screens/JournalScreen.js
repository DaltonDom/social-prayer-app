import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Calendar } from "react-native-calendars";
import { useJournals } from "../context/JournalContext";

export default function JournalScreen({ navigation }) {
  const { theme } = useTheme();
  const { journals } = useJournals();
  const [activeTab, setActiveTab] = useState("list");
  const [selectedDate, setSelectedDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const renderJournalItem = ({ item }) => (
    <View style={[styles.journalCard, { backgroundColor: theme.card }]}>
      <Text style={[styles.journalDate, { color: theme.textSecondary }]}>
        {item.date}
      </Text>
      <Text style={[styles.journalTitle, { color: theme.text }]}>
        {item.title}
      </Text>
      <Text style={[styles.journalPreview, { color: theme.textSecondary }]}>
        {item.content}
      </Text>
    </View>
  );

  const TabButton = ({ name, icon, isActive }) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        isActive && { backgroundColor: `${theme.primary}15` },
      ]}
      onPress={() => setActiveTab(name)}
    >
      <Ionicons
        name={icon}
        size={20}
        color={isActive ? theme.primary : theme.textSecondary}
      />
      <Text
        style={[
          styles.tabButtonText,
          { color: isActive ? theme.primary : theme.textSecondary },
        ]}
      >
        {name}
      </Text>
    </TouchableOpacity>
  );

  const getJournalsForDate = (date) => {
    return journals.filter((journal) => journal.date === date);
  };

  const handleAddPress = () => {
    navigation.navigate("AddJournal");
  };

  const getFilteredJournals = () => {
    if (!searchQuery.trim()) return [];

    return journals.filter(
      (journal) =>
        journal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        journal.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        journal.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.tabBar}>
        <TabButton name="list" icon="list" isActive={activeTab === "list"} />
        <TabButton
          name="calendar"
          icon="calendar"
          isActive={activeTab === "calendar"}
        />
        <TabButton
          name="search"
          icon="search"
          isActive={activeTab === "search"}
        />
      </View>

      {activeTab === "list" && (
        <View style={styles.content}>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.primary }]}
            onPress={handleAddPress}
          >
            <Ionicons name="add" size={24} color="white" />
            <Text style={styles.addButtonText}>New Entry</Text>
          </TouchableOpacity>
          <FlatList
            data={journals}
            renderItem={renderJournalItem}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No journal entries yet
              </Text>
            }
          />
        </View>
      )}

      {activeTab === "calendar" && (
        <View style={styles.content}>
          <Calendar
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={{
              [selectedDate]: { selected: true, selectedColor: theme.primary },
            }}
            theme={{
              calendarBackground: theme.card,
              textSectionTitleColor: theme.text,
              selectedDayBackgroundColor: theme.primary,
              selectedDayTextColor: "#ffffff",
              todayTextColor: theme.primary,
              dayTextColor: theme.text,
              textDisabledColor: theme.textSecondary,
              monthTextColor: theme.text,
            }}
          />
          {selectedDate && (
            <View
              style={[
                styles.selectedDateEntries,
                { backgroundColor: theme.card },
              ]}
            >
              <Text style={[styles.selectedDateTitle, { color: theme.text }]}>
                Entries for {selectedDate}
              </Text>
              <FlatList
                data={getJournalsForDate(selectedDate)}
                renderItem={renderJournalItem}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={
                  <Text
                    style={[styles.emptyText, { color: theme.textSecondary }]}
                  >
                    No entries for this date
                  </Text>
                }
              />
            </View>
          )}
        </View>
      )}

      {activeTab === "search" && (
        <View style={styles.content}>
          <View
            style={[styles.searchContainer, { backgroundColor: theme.card }]}
          >
            <Ionicons name="search" size={20} color={theme.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Search journal entries..."
              placeholderTextColor={theme.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          {searchQuery.trim() ? (
            <FlatList
              data={getFilteredJournals()}
              renderItem={renderJournalItem}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={
                <Text
                  style={[styles.emptyText, { color: theme.textSecondary }]}
                >
                  No matching entries found
                </Text>
              }
            />
          ) : (
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Start typing to search...
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  tabButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  journalCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  journalDate: {
    fontSize: 12,
    marginBottom: 4,
  },
  journalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  journalPreview: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 24,
    fontSize: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  selectedDateEntries: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
  },
  selectedDateTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
});
