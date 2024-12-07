import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../lib/supabase";

export default function EditProfileModal({
  visible,
  onClose,
  userInfo,
  onSave,
}) {
  const [editedInfo, setEditedInfo] = useState({
    firstName: "",
    lastName: "",
    profileImageUrl: "",
  });
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (visible && userInfo?.id) {
      fetchProfile();
    }
  }, [visible, userInfo]);

  const fetchProfile = async () => {
    if (!userInfo?.id) {
      console.error("No user ID provided");
      return;
    }

    try {
      console.log("Fetching profile for ID:", userInfo.id);
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userInfo.id)
        .single();

      if (error) throw error;

      console.log("Fetched profile:", profile);

      if (profile) {
        const updatedInfo = {
          firstName: profile.first_name || "",
          lastName: profile.last_name || "",
          profileImageUrl: profile.profile_image_url || "",
        };
        console.log("Setting editedInfo to:", updatedInfo);
        setEditedInfo(updatedInfo);
        setImage(profile.profile_image_url);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  useEffect(() => {
    console.log("Current editedInfo:", editedInfo);
  }, [editedInfo]);

  const handleSave = async () => {
    try {
      console.log("Updating profile for ID:", userInfo.id);
      console.log("New values:", {
        first_name: editedInfo.firstName,
        last_name: editedInfo.lastName,
        profile_image_url: editedInfo.profileImageUrl,
      });

      const { data, error } = await supabase
        .from("profiles")
        .update({
          first_name: editedInfo.firstName,
          last_name: editedInfo.lastName,
          profile_image_url: editedInfo.profileImageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userInfo.id)
        .select();

      if (error) {
        console.error("Error updating profile:", error);
        Alert.alert("Error", "Failed to update profile");
        return;
      }

      console.log("Profile updated successfully:", data);

      // Call onSave with the updated info
      onSave(editedInfo);

      // Close the modal
      onClose();

      // Optional: Show success message
      Alert.alert("Success", "Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile");
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setEditedInfo({ ...editedInfo, profileImageUrl: result.assets[0].uri });
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalContainer}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.imageContainer}>
              <Image source={{ uri: image }} style={styles.profileImage} />
              <TouchableOpacity
                style={styles.changePhotoButton}
                onPress={pickImage}
              >
                <Text style={styles.changePhotoText}>Change Photo</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                value={editedInfo.firstName}
                onChangeText={(text) =>
                  setEditedInfo({ ...editedInfo, firstName: text })
                }
                placeholder="Your first name"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={editedInfo.lastName}
                onChangeText={(text) =>
                  setEditedInfo({ ...editedInfo, lastName: text })
                }
                placeholder="Your last name"
              />
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  changePhotoButton: {
    backgroundColor: "#6B4EFF20",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  changePhotoText: {
    color: "#6B4EFF",
    fontWeight: "600",
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#6B4EFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 16,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
