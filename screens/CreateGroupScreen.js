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

export default function CreateGroupScreen({ navigation }) {
  const { theme } = useTheme();
  const { createGroup } = useGroups();
  const { userProfile } = useUser();
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [category, setCategory] = useState("");
  const [guidelines, setGuidelines] = useState("");
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
        guidelines: guidelines.trim(),
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
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
        edges={["left", "right"]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={[styles.imageSection, { backgroundColor: theme.card }]}>
            <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
              {groupImage ? (
                <Image source={{ uri: groupImage }} style={styles.groupImage} />
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
              <View
                style={[
                  styles.editImageButton,
                  { backgroundColor: theme.primary },
                ]}
              >
                <Ionicons name="camera" size={20} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          <View style={[styles.section, { backgroundColor: theme.card }]}>
            <Text style={[styles.label, { color: theme.text }]}>
              Group Name
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.searchBg,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              placeholder="Enter group name"
              placeholderTextColor={theme.textSecondary}
              value={groupName}
              onChangeText={setGroupName}
            />

            <Text style={[styles.label, { color: theme.text }]}>
              Description
            </Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor: theme.searchBg,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              placeholder="Describe your group's purpose"
              placeholderTextColor={theme.textSecondary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />

            <Text style={[styles.label, { color: theme.text }]}>Category</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.searchBg,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              placeholder="Enter group category"
              placeholderTextColor={theme.textSecondary}
              value={category}
              onChangeText={setCategory}
            />

            <Text style={[styles.label, { color: theme.text }]}>
              Guidelines
            </Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor: theme.searchBg,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              placeholder="Enter group guidelines (optional)"
              placeholderTextColor={theme.textSecondary}
              value={guidelines}
              onChangeText={setGuidelines}
              multiline
              numberOfLines={4}
            />
          </View>
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: theme.card }]}>
          <TouchableOpacity
            style={[
              styles.createButton,
              { backgroundColor: theme.primary },
              isLoading && styles.disabledButton,
            ]}
            onPress={handleCreateGroup}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.createButtonText}>Create Group</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  imageSection: {
    alignItems: "center",
    padding: 16,
    marginBottom: 16,
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
  section: {
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  textArea: {
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: "top",
  },
  privacyContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
  },
  privacyNote: {
    fontSize: 14,
    marginTop: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  createButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  createButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.7,
  },
});
