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
import GroupDropdown from "../components/GroupDropdown";

export default function AddPrayerScreen({ navigation }) {
  const { addPrayer } = usePrayers();
  const [prayerData, setPrayerData] = useState({
    title: "",
    description: "",
    category: "",
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

  const { theme, isDarkMode } = useTheme();

  const [selectedGroup, setSelectedGroup] = useState(null);

  const availableGroups = [
    {
      id: "1",
      name: "Youth Prayer Warriors",
    },
    {
      id: "2",
      name: "Family & Marriage",
    },
    {
      id: "3",
      name: "Healing Ministry",
    },
  ];

  const handleSubmit = () => {
    if (!prayerData.title.trim()) {
      Alert.alert("Error", "Please enter a prayer title");
      return;
    }

    if (!prayerData.category) {
      Alert.alert("Error", "Please select a category");
      return;
    }

    if (!prayerData.description.trim()) {
      Alert.alert("Error", "Please enter a prayer description");
      return;
    }

    addPrayer({
      ...prayerData,
      groupId: selectedGroup?.id,
      groupName: selectedGroup?.name,
    });

    Alert.alert("Success", "Prayer request added successfully", [
      {
        text: "OK",
        onPress: () => {
          navigation.navigate("Home");
          setPrayerData({
            title: "",
            description: "",
            category: "",
            allowComments: true,
          });
          setSelectedGroup(null);
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
          {/* Group Selection (Optional) */}
          <Text style={[styles.label, { color: theme.text }]}>
            Group (Optional)
          </Text>
          <GroupDropdown
            groups={availableGroups}
            selectedGroup={selectedGroup}
            onSelect={setSelectedGroup}
          />

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
                style={[
                  styles.categoryButton,
                  {
                    backgroundColor:
                      prayerData.category === category
                        ? theme.primary
                        : theme.card,
                    borderColor: theme.border,
                  },
                ]}
                onPress={() =>
                  setPrayerData({ ...prayerData, category: category })
                }
              >
                <Text
                  style={[
                    styles.categoryText,
                    {
                      color:
                        prayerData.category === category ? "white" : theme.text,
                    },
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Title Input */}
          <Text style={[styles.label, { color: theme.text }]}>Title</Text>
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
            keyboardAppearance={isDarkMode ? "dark" : "light"}
          />

          {/* Prayer Description */}
          <Text style={[styles.label, { color: theme.text }]}>
            Prayer Description
          </Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
            placeholder="Share your prayer request..."
            placeholderTextColor={theme.textSecondary}
            value={prayerData.description}
            onChangeText={(text) =>
              setPrayerData({ ...prayerData, description: text })
            }
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            keyboardAppearance={isDarkMode ? "dark" : "light"}
          />

          {/* Allow Comments Toggle */}
          <View style={styles.toggleContainer}>
            <View style={styles.toggleOption}>
              <Text style={[styles.toggleLabel, { color: theme.text }]}>
                Allow Comments
              </Text>
              <TouchableOpacity
                style={[
                  styles.toggle,
                  {
                    backgroundColor: prayerData.allowComments
                      ? theme.primary
                      : theme.card,
                    borderColor: theme.border,
                  },
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
                  color={
                    prayerData.allowComments ? "white" : theme.textSecondary
                  }
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
    paddingTop: Platform.OS === "ios" ? 50 : 20,
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
