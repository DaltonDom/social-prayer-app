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
import { useGroups } from "../context/GroupContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

export default function AddPrayerScreen({ navigation }) {
  const { addPrayer } = usePrayers();
  const [prayerData, setPrayerData] = useState({
    title: "",
    description: "",
    category: "",
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

  const { groups, myGroups } = useGroups();

  const availableGroups = myGroups.map((group) => ({
    id: group.id,
    name: group.name,
  }));

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
          });
          setSelectedGroup(null);
        },
      },
    ]);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Health":
        return "fitness";
      case "Family":
        return "home";
      case "Work":
        return "briefcase";
      case "Spiritual Growth":
        return "leaf";
      case "Relationships":
        return "heart";
      default:
        return "bookmark";
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.primary }]}>
            New Prayer
          </Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.form}>
            {/* Group Selection (Optional) */}
            <Text style={[styles.label, { color: theme.text }]}>Group</Text>
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
                  onPress={() =>
                    setPrayerData({ ...prayerData, category: category })
                  }
                >
                  <LinearGradient
                    colors={
                      prayerData.category === category
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
                        prayerData.category === category
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
                            prayerData.category === category
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
                placeholder="Enter a title for your prayer request"
                placeholderTextColor={theme.textSecondary}
                value={prayerData.title}
                onChangeText={(text) =>
                  setPrayerData({ ...prayerData, title: text })
                }
                maxLength={50}
                keyboardAppearance={isDarkMode ? "dark" : "light"}
              />
            </View>

            {/* Prayer Description */}
            <Text style={[styles.label, { color: theme.text }]}>
              Prayer Description
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
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <LinearGradient
                colors={
                  theme.dark
                    ? ["#581C87", "#1E3A8A"] // dark mode: purple-900 to blue-900
                    : ["#E9D5FF", "#BFDBFE"] // light mode: purple-200 to blue-200
                }
                style={styles.submitGradient}
              >
                <Text
                  style={[
                    styles.submitButtonText,
                    { color: theme.dark ? "#E9D5FF" : "#6B21A8" }, // dark: purple-200, light: purple-800
                  ]}
                >
                  Share Prayer Request
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "transparent",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
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
    overflow: "hidden", // Important for the gradient to respect borderRadius
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
