import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { useJournals } from "../context/JournalContext";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Platform } from "react-native";

const categories = [
  "Prayer",
  "Gratitude",
  "Scripture",
  "Reflection",
  "Testimony",
  "Other",
];

export default function AddJournalScreen({ navigation }) {
  const { theme } = useTheme();
  const { addJournal } = useJournals();
  const [journalData, setJournalData] = useState({
    title: "",
    category: "",
    content: "",
    date: new Date(),
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setJournalData({ ...journalData, date: selectedDate });
    }
  };

  const handleSubmit = () => {
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

    addJournal({
      ...journalData,
      date: journalData.date.toISOString().split("T")[0],
    });

    Alert.alert("Success", "Journal entry added successfully", [
      {
        text: "OK",
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={[styles.label, { color: theme.text }]}>Date</Text>
      <TouchableOpacity
        style={[styles.dateButton, { backgroundColor: theme.card }]}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={[styles.dateButtonText, { color: theme.text }]}>
          {journalData.date.toLocaleDateString()}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={journalData.date}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}

      <Text style={[styles.label, { color: theme.text }]}>Title</Text>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: theme.card, color: theme.text },
        ]}
        placeholder="Enter title"
        placeholderTextColor={theme.textSecondary}
        value={journalData.title}
        onChangeText={(text) => setJournalData({ ...journalData, title: text })}
      />

      <Text style={[styles.label, { color: theme.text }]}>Category</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.categoryContainer}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                {
                  backgroundColor:
                    journalData.category === category
                      ? theme.primary
                      : theme.card,
                },
              ]}
              onPress={() =>
                setJournalData({ ...journalData, category: category })
              }
            >
              <Text
                style={[
                  styles.categoryText,
                  {
                    color:
                      journalData.category === category ? "white" : theme.text,
                  },
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Text style={[styles.label, { color: theme.text }]}>Journal Entry</Text>
      <TextInput
        style={[
          styles.input,
          styles.contentInput,
          { backgroundColor: theme.card, color: theme.text },
        ]}
        placeholder="Write your journal entry..."
        placeholderTextColor={theme.textSecondary}
        multiline
        textAlignVertical="top"
        value={journalData.content}
        onChangeText={(text) =>
          setJournalData({ ...journalData, content: text })
        }
      />

      <TouchableOpacity
        style={[styles.submitButton, { backgroundColor: theme.primary }]}
        onPress={handleSubmit}
      >
        <Text style={styles.submitButtonText}>Save Entry</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  contentInput: {
    height: 200,
    textAlignVertical: "top",
  },
  categoryContainer: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "600",
  },
  submitButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 24,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  dateButton: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  dateButtonText: {
    fontSize: 16,
  },
});
