import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { useTheme } from "../context/ThemeContext";

export default function ChangePasswordModal({ visible, onClose }) {
  const { theme } = useTheme();
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }

    try {
      setLoading(true);

      // First verify the current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: (await supabase.auth.getUser()).data.user?.email || "",
        password: passwords.current,
      });

      if (signInError) {
        Alert.alert("Error", "Current password is incorrect");
        return;
      }

      // Update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwords.new,
      });

      if (updateError) throw updateError;

      Alert.alert("Success", "Password changed successfully", [
        {
          text: "OK",
          onPress: () => {
            setPasswords({ current: "", new: "", confirm: "" });
            onClose();
          },
        },
      ]);
    } catch (error) {
      console.error("Error changing password:", error);
      Alert.alert("Error", "Failed to change password. Please try again.");
    } finally {
      setLoading(false);
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
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 60}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalContainer}>
            <View
              style={[
                styles.modalContent,
                { backgroundColor: theme?.dark ? "#1C1C1E" : "white" },
              ]}
            >
              <View style={styles.modalHeader}>
                <Text
                  style={[
                    styles.modalTitle,
                    { color: theme?.dark ? "white" : "#333" },
                  ]}
                >
                  Change Password
                </Text>
                <TouchableOpacity onPress={onClose}>
                  <Ionicons
                    name="close"
                    size={24}
                    color={theme?.dark ? "white" : "#333"}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Text
                  style={[
                    styles.label,
                    { color: theme?.dark ? "white" : "#666" },
                  ]}
                >
                  Current Password
                </Text>
                <TextInput
                  style={[styles.input, { color: "black" }]}
                  value={passwords.current}
                  onChangeText={(text) =>
                    setPasswords({ ...passwords, current: text })
                  }
                  secureTextEntry
                  placeholder="Enter current password"
                  placeholderTextColor="#666"
                  editable={!loading}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text
                  style={[
                    styles.label,
                    { color: theme?.dark ? "white" : "#666" },
                  ]}
                >
                  New Password
                </Text>
                <TextInput
                  style={[styles.input, { color: "black" }]}
                  value={passwords.new}
                  onChangeText={(text) =>
                    setPasswords({ ...passwords, new: text })
                  }
                  secureTextEntry
                  placeholder="Enter new password"
                  placeholderTextColor="#666"
                  editable={!loading}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text
                  style={[
                    styles.label,
                    { color: theme?.dark ? "white" : "#666" },
                  ]}
                >
                  Confirm New Password
                </Text>
                <TextInput
                  style={[styles.input, { color: "black" }]}
                  value={passwords.confirm}
                  onChangeText={(text) =>
                    setPasswords({ ...passwords, confirm: text })
                  }
                  secureTextEntry
                  placeholder="Confirm new password"
                  placeholderTextColor="#666"
                  editable={!loading}
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.changeButton,
                  loading && styles.changeButtonDisabled,
                ]}
                onPress={handleChangePassword}
                disabled={loading}
              >
                <Text style={styles.changeButtonText}>
                  {loading ? "Changing Password..." : "Change Password"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
    paddingBottom: Platform.OS === "ios" ? 40 : 30,
    maxHeight: Platform.OS === "ios" ? "75%" : "85%",
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
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
  },
  changeButton: {
    backgroundColor: "#6B4EFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 24,
  },
  changeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  changeButtonDisabled: {
    opacity: 0.7,
  },
});
