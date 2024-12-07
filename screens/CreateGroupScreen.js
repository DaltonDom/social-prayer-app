import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { useGroups } from "../context/GroupContext";
import { supabase } from "../lib/supabase";
import { useUser } from "../context/UserContext";
import uuid from "react-native-uuid";
import { decode } from "base64-arraybuffer";
import { LinearGradient } from "expo-linear-gradient";

export default function CreateGroupScreen({ navigation }) {
  const { theme } = useTheme();
  const { createGroup } = useGroups();
  const { userProfile } = useUser();
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [category, setCategory] = useState("");
  const [groupImage, setGroupImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please grant permission to access your photos"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      console.log("Image picker result:", result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setGroupImage(result.assets[0].uri);
        console.log("Selected image URI:", result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const uploadImage = async (uri) => {
    try {
      // First convert URI to base64
      const response = await fetch(uri);
      const blob = await response.blob();

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const base64Str = reader.result.split(",")[1];
            const fileName = `${uuid.v4()}.jpg`;
            const filePath = `groups/${fileName}`;

            // Convert base64 to ArrayBuffer using base64-arraybuffer
            const arrayBuffer = decode(base64Str);

            const { data, error: uploadError } = await supabase.storage
              .from("group-images")
              .upload(filePath, arrayBuffer, {
                contentType: "image/jpeg",
              });

            if (uploadError) throw uploadError;

            const {
              data: { publicUrl },
            } = supabase.storage.from("group-images").getPublicUrl(filePath);

            resolve(publicUrl);
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error in uploadImage:", error);
      throw error;
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert("Error", "Please enter a group name");
      return;
    }

    try {
      setIsLoading(true);
      let imageUrl = null;

      if (groupImage) {
        try {
          imageUrl = await uploadImage(groupImage);
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
          Alert.alert("Warning", "Failed to upload image. Please try again.");
          setIsLoading(false);
          return;
        }
      }

      const { error } = await createGroup({
        name: groupName.trim(),
        description: description.trim(),
        imageUrl,
        isPrivate,
        category: category.trim(),
      });

      if (error) throw error;
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Failed to create group");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <SafeAreaView style={{ flex: 1, marginTop: 0 }} edges={["top"]}>
        <ScrollView
          style={[styles.scrollView, { marginTop: 0 }]}
          contentContainerStyle={{ paddingTop: 0 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.form, { marginTop: 0, paddingTop: 0 }]}>
            <View
              style={[
                styles.imageSection,
                {
                  backgroundColor: theme.card,
                  marginTop: 0,
                  marginBottom: 16,
                },
              ]}
            >
              <TouchableOpacity
                onPress={pickImage}
                style={styles.imageContainer}
              >
                {groupImage ? (
                  <Image
                    source={{ uri: groupImage }}
                    style={styles.groupImage}
                  />
                ) : (
                  <View
                    style={[
                      styles.placeholderImage,
                      { backgroundColor: theme.searchBg },
                    ]}
                  >
                    <Ionicons
                      name="image-outline"
                      size={40}
                      color={theme.textSecondary}
                    />
                  </View>
                )}
                <LinearGradient
                  colors={
                    theme.dark ? ["#581C87", "#1E3A8A"] : ["#E9D5FF", "#BFDBFE"]
                  }
                  style={styles.editImageButton}
                >
                  <Ionicons
                    name="camera"
                    size={20}
                    color={theme.dark ? "#E9D5FF" : "#6B21A8"}
                  />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View
              style={[styles.inputWrapper, { backgroundColor: theme.card }]}
            >
              <Text style={[styles.label, { color: theme.text }]}>
                Group Name
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: theme.text,
                    borderColor: theme.dark ? "#475569" : "#e2e8f0",
                    backgroundColor: theme.searchBg,
                  },
                ]}
                placeholder="Enter group name"
                placeholderTextColor={theme.textSecondary}
                value={groupName}
                onChangeText={setGroupName}
                keyboardAppearance={theme.dark ? "dark" : "light"}
              />

              <Text style={[styles.label, { color: theme.text }]}>
                Description
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    color: theme.text,
                    borderColor: theme.dark ? "#475569" : "#e2e8f0",
                    backgroundColor: theme.searchBg,
                  },
                ]}
                placeholder="Describe your group's purpose"
                placeholderTextColor={theme.textSecondary}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                keyboardAppearance={theme.dark ? "dark" : "light"}
              />

              <Text style={[styles.label, { color: theme.text }]}>
                Category
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: theme.text,
                    borderColor: theme.dark ? "#475569" : "#e2e8f0",
                    backgroundColor: theme.searchBg,
                  },
                ]}
                placeholder="Enter group category"
                placeholderTextColor={theme.textSecondary}
                value={category}
                onChangeText={setCategory}
                keyboardAppearance={theme.dark ? "dark" : "light"}
              />
            </View>

            <View
              style={[styles.buttonWrapper, { backgroundColor: theme.card }]}
            >
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleCreateGroup}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={
                    theme.dark ? ["#581C87", "#1E3A8A"] : ["#E9D5FF", "#BFDBFE"]
                  }
                  style={styles.submitGradient}
                >
                  {isLoading ? (
                    <ActivityIndicator
                      color={theme.dark ? "#E9D5FF" : "#6B21A8"}
                    />
                  ) : (
                    <Text
                      style={[
                        styles.submitButtonText,
                        { color: theme.dark ? "#E9D5FF" : "#6B21A8" },
                      ]}
                    >
                      Create Group
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
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
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 16,
    paddingTop: 0,
  },
  imageSection: {
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
  },
  imageContainer: {
    position: "relative",
  },
  groupImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  editImageButton: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "white",
  },
  inputWrapper: {
    borderRadius: 16,
    padding: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    padding: 12,
    fontSize: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "transparent",
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "transparent",
  },
  buttonWrapper: {
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  submitButton: {
    borderRadius: 16,
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
  disabledButton: {
    opacity: 0.7,
  },
});
