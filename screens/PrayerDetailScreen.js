import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePrayers } from "../context/PrayerContext";
import { useTheme } from "../context/ThemeContext";
import GroupDropdown from "../components/GroupDropdown";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PrayerDetailScreen({ route, navigation }) {
  const { theme } = useTheme();
  const { prayerId } = route.params;
  const { prayers, addUpdate } = usePrayers();
  const [keyboardHeight] = useState(new Animated.Value(0));
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        setKeyboardVisible(true);
        Animated.timing(keyboardHeight, {
          toValue: e.endCoordinates.height,
          duration: 250,
          useNativeDriver: false,
        }).start();
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
        Animated.timing(keyboardHeight, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false,
        }).start();
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  const prayer = prayers.find((p) => p.id === prayerId) || {
    userName: "",
    userImage: "",
    date: "",
    title: "",
    category: "",
    description: "",
    updates_list: [],
    comments_list: [],
  };

  const [comments, setComments] = useState(prayer.comments_list || []);
  const [updates, setUpdates] = useState(prayer.updates_list || []);
  const [newComment, setNewComment] = useState("");
  const [showUpdateInput, setShowUpdateInput] = useState(false);
  const [newUpdate, setNewUpdate] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrayer, setEditedPrayer] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(
    prayer.groupId ? { id: prayer.groupId, name: prayer.groupName } : null
  );

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

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: (comments.length + 1).toString(),
        userName: "You",
        userImage: "https://via.placeholder.com/40",
        text: newComment,
        date: new Date().toISOString().split("T")[0],
      };
      setComments([comment, ...comments]);
      setNewComment("");
    }
  };

  const handleAddUpdate = () => {
    if (newUpdate.trim()) {
      addUpdate(prayerId, newUpdate);
      const newUpdateObj = {
        id: (updates.length + 1).toString(),
        date: new Date().toISOString().split("T")[0],
        text: newUpdate,
      };
      setUpdates([...updates, newUpdateObj]);
      setNewUpdate("");
      setShowUpdateInput(false);
    }
  };

  const handleEditPrayer = () => {
    setEditedPrayer({
      ...prayer,
      allowComments: prayer.allowComments !== false, // default to true if not set
      groupId: selectedGroup?.id,
      groupName: selectedGroup?.name,
    });
    setIsEditing(true);
  };

  const handleSaveEdits = () => {
    // Here you would update the prayer in your context/backend
    setIsEditing(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: theme.background }]}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Prayer Header with Edit Button */}
          <View style={[styles.header, { backgroundColor: theme.card }]}>
            <View style={styles.headerContent}>
              <Image
                source={{ uri: prayer.userImage }}
                style={styles.profileImage}
              />
              <View style={styles.headerText}>
                <Text style={[styles.userName, { color: theme.text }]}>
                  {prayer.userName}
                </Text>
                <Text style={[styles.date, { color: theme.textSecondary }]}>
                  {prayer.date}
                </Text>
              </View>
              {prayer.userName === "Your Name" && (
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={handleEditPrayer}
                >
                  <Ionicons name="pencil" size={20} color={theme.primary} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Edit Mode */}
          {isEditing && prayer.userName === "Your Name" && (
            <View style={[styles.editSection, { backgroundColor: theme.card }]}>
              <Text style={[styles.editTitle, { color: theme.text }]}>
                Edit Prayer Settings
              </Text>

              <Text style={[styles.label, { color: theme.text }]}>Group</Text>
              <GroupDropdown
                groups={availableGroups}
                selectedGroup={selectedGroup}
                onSelect={setSelectedGroup}
              />

              <View style={styles.toggleOption}>
                <Text style={[styles.toggleLabel, { color: theme.text }]}>
                  Allow Comments
                </Text>
                <Switch
                  value={editedPrayer.allowComments}
                  onValueChange={(value) =>
                    setEditedPrayer({ ...editedPrayer, allowComments: value })
                  }
                  trackColor={{ false: "#767577", true: theme.primary }}
                />
              </View>

              <View style={styles.editButtons}>
                <TouchableOpacity
                  style={[
                    styles.cancelButton,
                    { backgroundColor: theme.searchBg },
                  ]}
                  onPress={() => setIsEditing(false)}
                >
                  <Text style={{ color: theme.textSecondary }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    { backgroundColor: theme.primary },
                  ]}
                  onPress={handleSaveEdits}
                >
                  <Text style={{ color: "white", fontWeight: "600" }}>
                    Save Changes
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Prayer Content */}
          <View style={[styles.prayerContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.title, { color: theme.text }]}>
              {prayer.title}
            </Text>
            <View
              style={[
                styles.categoryContainer,
                { backgroundColor: `${theme.primary}20` },
              ]}
            >
              <Text style={[styles.category, { color: theme.primary }]}>
                {prayer.category}
              </Text>
            </View>
            <Text style={[styles.description, { color: theme.text }]}>
              {prayer.description}
            </Text>
          </View>

          {/* Updates Section */}
          <View style={[styles.section, { backgroundColor: theme.card }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Updates
              </Text>
              {prayer.userName === "Your Name" && !showUpdateInput && (
                <TouchableOpacity
                  style={[
                    styles.addUpdateButton,
                    { backgroundColor: `${theme.primary}15` },
                  ]}
                  onPress={() => setShowUpdateInput(true)}
                >
                  <Ionicons name="add-circle" size={20} color={theme.primary} />
                  <Text
                    style={[styles.addUpdateText, { color: theme.primary }]}
                  >
                    Add Update
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {showUpdateInput && (
              <View style={styles.updateInputContainer}>
                <TextInput
                  style={[
                    styles.updateInput,
                    {
                      backgroundColor: theme.searchBg,
                      color: theme.text,
                      borderColor: theme.border,
                    },
                  ]}
                  placeholder="Share an update about your prayer request..."
                  placeholderTextColor={theme.textSecondary}
                  value={newUpdate}
                  onChangeText={setNewUpdate}
                  multiline
                  numberOfLines={4}
                />
                <View style={styles.updateButtons}>
                  <TouchableOpacity
                    style={[
                      styles.cancelButton,
                      { backgroundColor: theme.searchBg },
                    ]}
                    onPress={() => {
                      setShowUpdateInput(false);
                      setNewUpdate("");
                    }}
                  >
                    <Text style={{ color: theme.textSecondary }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.postButton,
                      { backgroundColor: theme.primary },
                    ]}
                    onPress={handleAddUpdate}
                  >
                    <Text style={{ color: "white", fontWeight: "600" }}>
                      Post Update
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={styles.updatesContainer}>
              {updates.map((update) => (
                <View
                  key={update.id}
                  style={[
                    styles.updateItem,
                    {
                      backgroundColor: theme.searchBg,
                      borderLeftColor: theme.primary,
                    },
                  ]}
                >
                  <Text
                    style={[styles.updateDate, { color: theme.textSecondary }]}
                  >
                    {update.date}
                  </Text>
                  <Text style={[styles.updateText, { color: theme.text }]}>
                    {update.text}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Comments Section */}
          <View style={[styles.section, { backgroundColor: theme.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Comments
            </Text>
            {comments.map((comment) => (
              <View
                key={comment.id}
                style={[styles.commentItem, { backgroundColor: theme.card }]}
              >
                <Image
                  source={{ uri: comment.userImage }}
                  style={styles.commentUserImage}
                />
                <View
                  style={[
                    styles.commentContent,
                    { backgroundColor: theme.card },
                  ]}
                >
                  <View
                    style={[
                      styles.commentHeader,
                      { backgroundColor: theme.card },
                    ]}
                  >
                    <Text
                      style={[styles.commentUserName, { color: theme.text }]}
                    >
                      {comment.userName}
                    </Text>
                    <Text
                      style={[
                        styles.commentDate,
                        { color: theme.textSecondary },
                      ]}
                    >
                      {comment.date}
                    </Text>
                  </View>
                  <Text style={[styles.commentText, { color: theme.text }]}>
                    {comment.text}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Updated Comment Input Container */}
        <View
          style={[
            styles.commentInputContainer,
            {
              backgroundColor: theme.card,
              borderTopColor: theme.border,
              paddingBottom: Platform.OS === "ios" ? 20 : 12,
            },
          ]}
        >
          <TextInput
            style={[
              styles.commentInput,
              {
                backgroundColor: theme.searchBg,
                color: theme.text,
              },
            ]}
            placeholder="Add a comment..."
            placeholderTextColor={theme.textSecondary}
            value={newComment}
            onChangeText={setNewComment}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: theme.primary }]}
            onPress={handleAddComment}
          >
            <Ionicons name="send" size={24} color={theme.card} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
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
  header: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "white",
    alignItems: "center",
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  date: {
    fontSize: 14,
    color: "#666",
  },
  prayerContent: {
    backgroundColor: "white",
    padding: 16,
    marginTop: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  categoryContainer: {
    backgroundColor: "#6B4EFF20",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  category: {
    color: "#6B4EFF",
    fontSize: 14,
    fontWeight: "600",
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
  },
  section: {
    backgroundColor: "white",
    padding: 16,
    marginTop: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  addUpdateButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  addUpdateText: {
    fontWeight: "600",
    fontSize: 14,
  },
  updateItem: {
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  updateDate: {
    fontSize: 12,
    marginBottom: 4,
  },
  updateText: {
    fontSize: 14,
    lineHeight: 20,
  },
  commentItem: {
    flexDirection: "row",
    marginBottom: 16,
  },
  commentUserImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    padding: 12,
    borderRadius: 12,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  commentUserName: {
    fontWeight: "600",
  },
  commentDate: {
    fontSize: 12,
    color: "#666",
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  commentInputContainer: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  commentInput: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#6B4EFF",
    justifyContent: "center",
    alignItems: "center",
  },
  updateInputContainer: {
    marginBottom: 16,
    backgroundColor: "transparent",
  },
  updateInput: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    minHeight: 100,
    borderWidth: 1,
    fontSize: 16,
  },
  updateButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  postButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  updatesContainer: {
    marginTop: 12,
    gap: 12,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  editButton: {
    padding: 8,
    marginLeft: "auto",
  },
  editSection: {
    padding: 16,
    marginTop: 1,
  },
  editTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 16,
  },
  toggleOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  toggleLabel: {
    fontSize: 16,
  },
  editButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
});
