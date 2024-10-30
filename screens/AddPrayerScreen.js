import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePrayers } from "../context/PrayerContext";
import { useTheme } from "../context/ThemeContext";

export default function AddPrayerScreen({ navigation }) {
  const { addPrayer } = usePrayers();
  const [prayerData, setPrayerData] = useState({
    title: "",
    description: "",
    category: "",
    isPrivate: false,
    allowComments: true,
  });

  const categories = [
    "Health",
    "Family",
    "Work",
    "Spiritual Growth",
    "Relationships",
    "Other",
  ];

  const { theme } = useTheme();

  const handleSubmit = () => {
    if (!prayerData.description.trim()) {
      Alert.alert("Error", "Please enter a prayer description");
      return;
    }

    if (!prayerData.title.trim()) {
      Alert.alert("Error", "Please enter a prayer title");
      return;
    }

    if (!prayerData.category) {
      Alert.alert("Error", "Please select a category");
      return;
    }

    // Add the new prayer
    addPrayer(prayerData);

    // Show success message and navigate back
    Alert.alert("Success", "Prayer request added successfully", [
      {
        text: "OK",
        onPress: () => {
          navigation.navigate("Home");
          // Reset form
          setPrayerData({
            title: "",
            description: "",
            category: "",
            isPrivate: false,
            allowComments: true,
          });
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          <Text style={[styles.label, { color: theme.text }]}>
            Title (Optional)
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
            placeholder="Enter a title for your prayer request"
            placeholderTextColor={theme.textSecondary}
            value={prayerData.title}
            onChangeText={(text) =>
              setPrayerData({ ...prayerData, title: text })
            }
            maxLength={50}
          />

          <Text style={styles.label}>Prayer Description*</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Share your prayer request..."
            value={prayerData.description}
            onChangeText={(text) =>
              setPrayerData({ ...prayerData, description: text })
            }
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />

          <Text style={styles.label}>Category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryContainer}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  prayerData.category === category &&
                    styles.categoryButtonActive,
                ]}
                onPress={() =>
                  setPrayerData({ ...prayerData, category: category })
                }
              >
                <Text
                  style={[
                    styles.categoryText,
                    prayerData.category === category &&
                      styles.categoryTextActive,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.toggleContainer}>
            <View style={styles.toggleOption}>
              <Text style={styles.toggleLabel}>Private Prayer</Text>
              <TouchableOpacity
                style={[
                  styles.toggle,
                  prayerData.isPrivate && styles.toggleActive,
                ]}
                onPress={() =>
                  setPrayerData({
                    ...prayerData,
                    isPrivate: !prayerData.isPrivate,
                  })
                }
              >
                <Ionicons
                  name={prayerData.isPrivate ? "eye-off" : "eye"}
                  size={20}
                  color={prayerData.isPrivate ? "white" : "#666"}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.toggleOption}>
              <Text style={styles.toggleLabel}>Allow Comments</Text>
              <TouchableOpacity
                style={[
                  styles.toggle,
                  prayerData.allowComments && styles.toggleActive,
                ]}
                onPress={() =>
                  setPrayerData({
                    ...prayerData,
                    allowComments: !prayerData.allowComments,
                  })
                }
              >
                <Ionicons
                  name={
                    prayerData.allowComments
                      ? "chatbubble"
                      : "chatbubble-outline"
                  }
                  size={20}
                  color={prayerData.allowComments ? "white" : "#666"}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Share Prayer Request</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  categoryContainer: {
    flexDirection: "row",
    marginVertical: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  categoryButtonActive: {
    backgroundColor: "#6B4EFF",
    borderColor: "#6B4EFF",
  },
  categoryText: {
    color: "#666",
    fontSize: 14,
  },
  categoryTextActive: {
    color: "white",
  },
  toggleContainer: {
    marginVertical: 16,
  },
  toggleOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 8,
  },
  toggleLabel: {
    fontSize: 16,
    color: "#333",
  },
  toggle: {
    backgroundColor: "#f0f0f0",
    padding: 8,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  toggleActive: {
    backgroundColor: "#6B4EFF",
  },
  submitButton: {
    backgroundColor: "#6B4EFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 24,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
