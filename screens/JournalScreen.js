import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Calendar } from "react-native-calendars";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../lib/supabase";
import { LinearGradient } from "expo-linear-gradient";

export default function JournalScreen({ navigation }) {
  const { theme, isDarkMode } = useTheme();
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("list");
  const [selectedDate, setSelectedDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchJournals();

    const unsubscribe = navigation.addListener("focus", () => {
      fetchJournals();
    });

    return unsubscribe;
  }, [navigation]);

  const fetchJournals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("journals")
        .select("*")
        .order("date", { ascending: false });

      if (error) throw error;
      setJournals(data || []);
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "Failed to load journal entries");
    } finally {
      setLoading(false);
    }
  };

  const renderJournalItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("JournalDetail", { journal: item })}
    >
      <LinearGradient
        colors={
          theme.dark
            ? ["#2D2D2D", "#1A1A1A"] // dark mode colors to match HomeScreen
            : [theme.card, "#F8F7FF"] // light mode colors unchanged
        }
        style={styles.cardGradient}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={styles.headerText}>
              <Text style={[styles.journalTitle, { color: theme.text }]}>
                {item.title}
              </Text>
              <Text
                style={[styles.journalDate, { color: theme.textSecondary }]}
              >
                {item.date}
              </Text>
            </View>
          </View>
          <LinearGradient
            colors={
              theme.dark ? ["#581C87", "#1E3A8A"] : ["#E9D5FF", "#BFDBFE"]
            }
            style={styles.categoryTag}
          >
            <Ionicons
              name="bookmark"
              size={14}
              color={theme.dark ? "#E9D5FF" : "#6B21A8"}
              style={styles.categoryIcon}
            />
            <Text
              style={[
                styles.categoryText,
                { color: theme.dark ? "#E9D5FF" : "#6B21A8" },
              ]}
            >
              {item.category}
            </Text>
          </LinearGradient>
        </View>

        <Text
          style={[styles.journalPreview, { color: theme.text }]}
          numberOfLines={3}
        >
          {item.content}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
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
    if (!searchQuery.trim()) return journals;

    return journals.filter(
      (journal) =>
        journal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        journal.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        journal.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getMarkedDates = () => {
    const marked = {};

    journals.forEach((journal) => {
      marked[journal.date] = {
        marked: true,
        dotColor: theme.primary,
      };
    });

    if (selectedDate) {
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: theme.primary,
        marked: marked[selectedDate]?.marked || false,
        dotColor: theme.primary,
      };
    }

    return marked;
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={["right", "left", "bottom"]}
    >
      <View
        style={[
          styles.tabBar,
          { borderBottomColor: theme.dark ? theme.background : "#eee" },
        ]}
      >
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
        <View style={styles.listContent}>
          <TouchableOpacity style={styles.addButton} onPress={handleAddPress}>
            <LinearGradient
              colors={
                theme.dark
                  ? ["#581C87", "#1E3A8A"] // dark mode: purple-900 to blue-900
                  : ["#E9D5FF", "#BFDBFE"] // light mode: purple-200 to blue-200
              }
              style={styles.addButtonGradient}
            >
              <Ionicons
                name="add"
                size={24}
                color={theme.dark ? "#E9D5FF" : "#6B21A8"}
              />
              <Text
                style={[
                  styles.addButtonText,
                  { color: theme.dark ? "#E9D5FF" : "#6B21A8" },
                ]}
              >
                New Entry
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          {loading ? (
            <ActivityIndicator size="large" color={theme.primary} />
          ) : (
            <FlatList
              data={journals}
              renderItem={renderJournalItem}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={
                <Text
                  style={[styles.emptyText, { color: theme.textSecondary }]}
                >
                  No journal entries yet
                </Text>
              }
            />
          )}
        </View>
      )}

      {activeTab === "calendar" && (
        <View style={styles.content}>
          <Calendar
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={getMarkedDates()}
            theme={{
              calendarBackground: theme.card,
              textSectionTitleColor: theme.text,
              selectedDayBackgroundColor: theme.primary,
              selectedDayTextColor: "#ffffff",
              todayTextColor: theme.primary,
              dayTextColor: theme.text,
              textDisabledColor: theme.textSecondary,
              monthTextColor: theme.text,
              dotColor: theme.primary,
              selectedDotColor: "#ffffff",
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
        <View style={styles.searchContent}>
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
              keyboardAppearance={isDarkMode ? "dark" : "light"}
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
    </SafeAreaView>
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
    paddingTop: Platform.OS === "ios" ? 50 : 20,
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
  listContent: {
    flex: 1,
    padding: 16,
    paddingTop: 8,
  },
  searchContent: {
    flex: 1,
    padding: 16,
    paddingTop: 8,
  },
  addButton: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
  },
  addButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardGradient: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  categoryTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
  },
  categoryIcon: {
    marginRight: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
  },
  headerText: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  journalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  journalDate: {
    fontSize: 12,
    marginBottom: 4,
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
