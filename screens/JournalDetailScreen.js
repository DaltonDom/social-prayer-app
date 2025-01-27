import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useJournals } from "../context/JournalContext";
import DateTimePicker from "@react-native-community/datetimepicker";
import { supabase } from "../lib/supabase";
import { LinearGradient } from "expo-linear-gradient";

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

  const handleDatePress = () => {
    setShowDatePicker(true);
  };

  if (isEditing) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.form}>
            {/* Date Selection */}
            <View>
              <TouchableOpacity
                style={[styles.inputWrapper, { backgroundColor: theme.card }]}
                onPress={handleDatePress}
              >
                <Text style={[styles.input, { color: theme.text }]}>
                  {editedJournal.date}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <View style={styles.datePickerContainer}>
                  <DateTimePicker
                    value={new Date(editedJournal.date)}
                    mode="date"
                    display={Platform.OS === "ios" ? "inline" : "default"}
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                  />
                </View>
              )}
            </View>

            {/* Title Input */}
            <View>
              <TextInput
                style={[
                  styles.titleInput,
                  {
                    color: theme.text,
                    backgroundColor: theme.dark ? "#2D2D2D" : "white",
                    borderColor: theme.dark ? "#404040" : "#E2E8F0",
                  },
                ]}
                value={editedJournal.title}
                onChangeText={(text) =>
                  setEditedJournal({ ...editedJournal, title: text })
                }
                placeholder="Title"
                placeholderTextColor={theme.textSecondary}
              />
            </View>

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
              style={[
                styles.contentInput,
                {
                  color: theme.text,
                  backgroundColor: theme.dark ? "#2D2D2D" : "white",
                  borderColor: theme.dark ? "#404040" : "#E2E8F0",
                },
              ]}
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
        <View style={styles.card}>
          <LinearGradient
            colors={
              theme.dark ? ["#2D2D2D", "#1A1A1A"] : [theme.card, "#F8F7FF"]
            }
            style={styles.cardGradient}
          >
            <View style={styles.header}>
              <Text style={[styles.date, { color: theme.textSecondary }]}>
                {journal.date}
              </Text>
              <TouchableOpacity
                style={[
                  styles.editButton,
                  { backgroundColor: `${theme.primary}10` },
                ]}
                onPress={() => setIsEditing(true)}
              >
                <Ionicons name="pencil" size={20} color={theme.primary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.title, { color: theme.text }]}>
              {journal.title}
            </Text>

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
                {journal.category}
              </Text>
            </LinearGradient>

            <Text style={[styles.content, { color: theme.text }]}>
              {journal.content}
            </Text>
          </LinearGradient>
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
    flex: 1,
    margin: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cardGradient: {
    padding: 24,
    borderRadius: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  date: {
    fontSize: 14,
    paddingVertical: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  categoryTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  categoryIcon: {
    marginRight: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    paddingHorizontal: 8,
    marginTop: 16,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 32,
    marginBottom: 24,
    padding: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    marginHorizontal: 8,
    backgroundColor: "white",
  },
  contentInput: {
    fontSize: 16,
    lineHeight: 24,
    minHeight: 200,
    textAlignVertical: "top",
    marginTop: 12,
    padding: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    marginHorizontal: 8,
    backgroundColor: "white",
  },
  categoryContainer: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 12,
    paddingHorizontal: 8,
    marginHorizontal: 8,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 6,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 20,
    marginHorizontal: 8,
    marginRight: 8,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  dateButton: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 6,
    paddingHorizontal: 20,
    marginHorizontal: 8,
  },
  dateButtonText: {
    fontSize: 14,
  },
  editButton: {
    padding: 8,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    marginHorizontal: 8,
  },
  inputWrapper: {
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginHorizontal: 8,
  },
  input: {
    padding: 12,
    fontSize: 16,
  },
  datePickerContainer: {
    marginBottom: 10,
  },
  form: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 0,
  },
});
