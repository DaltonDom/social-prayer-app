import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useJournals } from "../context/JournalContext";
import DateTimePicker from "@react-native-community/datetimepicker";
import { supabase } from "../lib/supabase";

const categories = [
  "Prayer",
  "Gratitude",
  "Scripture",
  "Reflection",
  "Testimony",
  "Other",
];

export default function JournalDetailScreen({ route, navigation }) {
  const { theme } = useTheme();
  const { updateJournal } = useJournals();
  const { journal } = route.params;
  const [isEditing, setIsEditing] = useState(false);
  const [editedJournal, setEditedJournal] = useState(journal);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSave = async () => {
    if (!editedJournal.title.trim()) {
      Alert.alert("Error", "Please enter a title");
      return;
    }

    if (!editedJournal.category) {
      Alert.alert("Error", "Please select a category");
      return;
    }

    if (!editedJournal.content.trim()) {
      Alert.alert("Error", "Please write your journal entry");
      return;
    }

    try {
      // Get the current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Update the journal entry in Supabase
      const { error } = await supabase
        .from("journals")
        .update({
          title: editedJournal.title,
          content: editedJournal.content,
          category: editedJournal.category,
          date: editedJournal.date,
          user_id: user.id,
        })
        .eq("id", editedJournal.id);

      if (error) throw error;

      setIsEditing(false);
      Alert.alert("Success", "Journal entry updated successfully");
      navigation.goBack(); // Optional: go back to refresh the list
    } catch (error) {
      console.error("Error updating journal:", error);
      Alert.alert("Error", "Failed to update journal entry");
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setEditedJournal({
        ...editedJournal,
        date: selectedDate.toISOString().split("T")[0],
      });
    }
  };

  if (isEditing) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <ScrollView style={styles.scrollView}>
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            {/* Date Picker */}
            <TouchableOpacity
              style={[styles.dateButton, { backgroundColor: theme.searchBg }]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={[styles.dateButtonText, { color: theme.text }]}>
                {editedJournal.date}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={new Date(editedJournal.date)}
                mode="date"
                display="default"
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}

            {/* Title Input */}
            <TextInput
              style={[styles.titleInput, { color: theme.text }]}
              value={editedJournal.title}
              onChangeText={(text) =>
                setEditedJournal({ ...editedJournal, title: text })
              }
              placeholder="Title"
              placeholderTextColor={theme.textSecondary}
            />

            {/* Category Selection */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoryContainer}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryButton,
                      {
                        backgroundColor:
                          editedJournal.category === category
                            ? theme.primary
                            : `${theme.primary}20`,
                      },
                    ]}
                    onPress={() =>
                      setEditedJournal({ ...editedJournal, category: category })
                    }
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        {
                          color:
                            editedJournal.category === category
                              ? "white"
                              : theme.primary,
                        },
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Content Input */}
            <TextInput
              style={[styles.contentInput, { color: theme.text }]}
              value={editedJournal.content}
              onChangeText={(text) =>
                setEditedJournal({ ...editedJournal, content: text })
              }
              multiline
              placeholder="Write your journal entry..."
              placeholderTextColor={theme.textSecondary}
            />

            {/* Save Button */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.searchBg }]}
                onPress={() => setIsEditing(false)}
              >
                <Text style={{ color: theme.textSecondary }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.primary }]}
                onPress={handleSave}
              >
                <Text style={{ color: "white" }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView style={styles.scrollView}>
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <View style={styles.header}>
            <Text style={[styles.date, { color: theme.textSecondary }]}>
              {journal.date}
            </Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(true)}
            >
              <Ionicons name="pencil" size={20} color={theme.primary} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.title, { color: theme.text }]}>
            {journal.title}
          </Text>
          <View
            style={[
              styles.categoryTag,
              { backgroundColor: `${theme.primary}20` },
            ]}
          >
            <Ionicons name="bookmark" size={14} color={theme.primary} />
            <Text style={[styles.categoryText, { color: theme.primary }]}>
              {journal.category}
            </Text>
          </View>
          <Text style={[styles.content, { color: theme.text }]}>
            {journal.content}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
  },
  categoryTag: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
    gap: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "600",
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    padding: 0,
  },
  contentInput: {
    fontSize: 16,
    lineHeight: 24,
    minHeight: 200,
    textAlignVertical: "top",
    marginTop: 16,
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
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 16,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  dateButton: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  dateButtonText: {
    fontSize: 14,
  },
});
