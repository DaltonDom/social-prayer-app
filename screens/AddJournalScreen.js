import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { useJournals } from "../context/JournalContext";
import DateTimePicker from "@react-native-community/datetimepicker";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";

const categories = [
  "Prayer",
  "Gratitude",
  "Scripture",
  "Reflection",
  "Testimony",
  "Other",
];

export default function AddJournalScreen({ navigation }) {
  const { theme, isDarkMode } = useTheme();
  const { addJournal } = useJournals();
  const [journalData, setJournalData] = useState({
    title: "",
    category: "",
    content: "",
    date: new Date(),
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDatePress = () => {
    setShowDatePicker(true);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setJournalData({ ...journalData, date: selectedDate });
    }
  };

  const handleSubmit = async () => {
    if (!journalData.title.trim()) {
      Alert.alert("Error", "Please enter a title");
      return;
    }

    if (!journalData.category) {
      Alert.alert("Error", "Please select a category");
      return;
    }

    if (!journalData.content.trim()) {
      Alert.alert("Error", "Please write your journal entry");
      return;
    }

    try {
      // Get the current user's ID
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      const date = new Date(journalData.date);
      const formattedDate = date.toLocaleDateString("en-CA");

      const { data, error } = await supabase.from("journals").insert({
        title: journalData.title,
        content: journalData.content,
        category: journalData.category,
        date: formattedDate,
        user_id: user.id,
      });

      if (error) throw error;

      Alert.alert("Success", "Journal entry added successfully", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Prayer":
        return "hand-left";
      case "Gratitude":
        return "heart";
      case "Scripture":
        return "book";
      case "Reflection":
        return "bulb";
      case "Testimony":
        return "megaphone";
      default:
        return "bookmark";
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <SafeAreaView style={[styles.safeArea]} edges={["top"]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.form}>
            {/* Date Selection */}
            <Text style={[styles.label, { color: theme.text }]}>Date</Text>
            <TouchableOpacity
              style={[styles.inputWrapper, { backgroundColor: theme.card }]}
              onPress={handleDatePress}
            >
              <Text style={[styles.input, { color: theme.text }]}>
                {journalData.date.toLocaleDateString()}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={journalData.date}
                mode="date"
                display={Platform.OS === "ios" ? "inline" : "default"}
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}

            {/* Category Selection */}
            <Text style={[styles.label, { color: theme.text }]}>Category</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryContainer}
            >
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  onPress={() =>
                    setJournalData({ ...journalData, category: category })
                  }
                >
                  <LinearGradient
                    colors={
                      journalData.category === category
                        ? theme.dark
                          ? ["#581C87", "#1E3A8A"]
                          : ["#E9D5FF", "#BFDBFE"]
                        : [theme.card, theme.card]
                    }
                    style={styles.categoryTag}
                  >
                    <Ionicons
                      name={getCategoryIcon(category)}
                      size={14}
                      color={
                        journalData.category === category
                          ? theme.dark
                            ? "#E9D5FF"
                            : "#6B21A8"
                          : theme.textSecondary
                      }
                      style={styles.categoryIcon}
                    />
                    <Text
                      style={[
                        styles.categoryText,
                        {
                          color:
                            journalData.category === category
                              ? theme.dark
                                ? "#E9D5FF"
                                : "#6B21A8"
                              : theme.textSecondary,
                        },
                      ]}
                    >
                      {category}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Title Input */}
            <Text style={[styles.label, { color: theme.text }]}>Title</Text>
            <View
              style={[styles.inputWrapper, { backgroundColor: theme.card }]}
            >
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Enter title"
                placeholderTextColor={theme.textSecondary}
                value={journalData.title}
                onChangeText={(text) =>
                  setJournalData({ ...journalData, title: text })
                }
                keyboardAppearance={isDarkMode ? "dark" : "light"}
              />
            </View>

            {/* Journal Content */}
            <Text style={[styles.label, { color: theme.text }]}>
              Journal Entry
            </Text>
            <View
              style={[
                styles.inputWrapper,
                styles.textAreaWrapper,
                { backgroundColor: theme.card },
              ]}
            >
              <TextInput
                style={[styles.input, styles.textArea, { color: theme.text }]}
                placeholder="Write your journal entry..."
                placeholderTextColor={theme.textSecondary}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                value={journalData.content}
                onChangeText={(text) =>
                  setJournalData({ ...journalData, content: text })
                }
                keyboardAppearance={isDarkMode ? "dark" : "light"}
              />
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <LinearGradient
                colors={
                  theme.dark ? ["#581C87", "#1E3A8A"] : ["#E9D5FF", "#BFDBFE"]
                }
                style={styles.submitGradient}
              >
                <Text
                  style={[
                    styles.submitButtonText,
                    { color: theme.dark ? "#E9D5FF" : "#6B21A8" },
                  ]}
                >
                  Save Journal Entry
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingTop: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingTop: 0,
  },
  form: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 0,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 16,
  },
  inputWrapper: {
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  input: {
    padding: 12,
    fontSize: 16,
  },
  textAreaWrapper: {
    height: 120,
  },
  textArea: {
    height: "100%",
  },
  categoryContainer: {
    flexDirection: "row",
    marginVertical: 8,
  },
  categoryTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  categoryIcon: {
    marginRight: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
  },
  submitButton: {
    borderRadius: 16,
    marginTop: 24,
    overflow: "hidden",
  },
  submitGradient: {
    padding: 16,
    alignItems: "center",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
