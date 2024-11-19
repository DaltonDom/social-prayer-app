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
  Switch,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePrayers } from "../context/PrayerContext";
import { useTheme } from "../context/ThemeContext";
import GroupDropdown from "../components/GroupDropdown";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "../context/UserContext";

export default function PrayerDetailScreen({ route, navigation }) {
  const { theme, isDarkMode } = useTheme();
  const { prayerId } = route.params;
  const { prayers, addUpdate, updatePrayer, addComment, getPrayer } =
    usePrayers();
  const { userProfile } = useUser();
  const [keyboardHeight] = useState(new Animated.Value(0));
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [prayer, setPrayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [newUpdate, setNewUpdate] = useState("");
  const [showUpdateInput, setShowUpdateInput] = useState(false);
  const [editedPrayer, setEditedPrayer] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isCommentFocused, setIsCommentFocused] = useState(false);

  useEffect(() => {
    loadPrayer();
  }, [prayerId]);

  const loadPrayer = async () => {
    const { data, error } = await getPrayer(prayerId);
    if (error) {
      console.error("Error loading prayer:", error);
    } else {
      setPrayer(data);
    }
    setLoading(false);
  };

  const handleAddComment = async () => {
    if (newComment.trim()) {
      const { error } = await addComment(prayerId, newComment);
      if (error) {
        Alert.alert("Error", "Failed to add comment");
      } else {
        setNewComment("");
        Keyboard.dismiss();
        loadPrayer();
      }
    }
  };

  const handleAddUpdate = async () => {
    if (newUpdate.trim()) {
      const { error } = await addUpdate(prayerId, newUpdate);
      if (error) {
        Alert.alert("Error", "Failed to add update");
      } else {
        setNewUpdate("");
        setShowUpdateInput(false);
        loadPrayer();
      }
    }
  };

  const handleEditPrayer = () => {
    if (!isOwner) return;

    setEditedPrayer({
      ...prayer,
      allowComments: prayer.allowComments !== false,
      groupId: selectedGroup?.id,
      groupName: selectedGroup?.name,
    });
    setIsEditing(true);
  };

  const handleSaveEdits = () => {
    updatePrayer(prayer.id, editedPrayer);
    setIsEditing(false);
    Alert.alert("Success", "Prayer settings updated successfully");
  };

  const isOwner = userProfile?.id === prayer?.user_id;

  if (loading) {
    return (
      <View
        style={[styles.loadingContainer, { backgroundColor: theme.background }]}
      >
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!prayer) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.text }]}>
          Prayer not found
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: theme.background }]}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      enabled={isCommentFocused}
    >
      <SafeAreaView style={{ flex: 1 }} edges={["left", "right", "bottom"]}>
        <ScrollView
          style={[styles.scrollView, { backgroundColor: theme.background }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={{ paddingBottom: 80 }}
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
              {isOwner && (
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
          {isEditing && isOwner && (
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
              {isOwner && !showUpdateInput && (
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
              {prayer.updates_list && prayer.updates_list.length > 0 ? (
                prayer.updates_list.map((update) => (
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
                      style={[
                        styles.updateDate,
                        { color: theme.textSecondary },
                      ]}
                    >
                      {new Date(update.created_at).toLocaleDateString()}
                    </Text>
                    <Text style={[styles.updateText, { color: theme.text }]}>
                      {update.text}
                    </Text>
                  </View>
                ))
              ) : (
                <Text
                  style={[styles.emptyText, { color: theme.textSecondary }]}
                >
                  No updates yet
                </Text>
              )}
            </View>
          </View>

          {/* Comments Section */}
          <View style={[styles.section, { backgroundColor: theme.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Comments
            </Text>
            {prayer.comments_list && prayer.comments_list.length > 0 ? (
              prayer.comments_list.map((comment) => (
                <View key={comment.id} style={styles.commentItem}>
                  <Image
                    source={{ uri: comment.userImage }}
                    style={styles.commentUserImage}
                  />
                  <View style={styles.commentContent}>
                    <Text
                      style={[styles.commentUserName, { color: theme.text }]}
                    >
                      {comment.userName}
                    </Text>
                    <Text style={[styles.commentText, { color: theme.text }]}>
                      {comment.text}
                    </Text>
                    <Text
                      style={[
                        styles.commentDate,
                        { color: theme.textSecondary },
                      ]}
                    >
                      {new Date(comment.date).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No comments yet
              </Text>
            )}
          </View>
        </ScrollView>

        {/* Comment Input Container */}
        <View
          style={[
            styles.commentInputContainer,
            {
              backgroundColor: theme.card,
              borderTopColor: theme.border,
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
            keyboardAppearance={isDarkMode ? "dark" : "light"}
            onFocus={() => setIsCommentFocused(true)}
            onBlur={() => setIsCommentFocused(false)}
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
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "white",
    alignItems: "center",
    marginTop: 0,
    paddingTop: 10,
    borderTopWidth: 0,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
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
    marginTop: 0,
    borderTopWidth: 0,
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
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === "ios" ? 30 : 12,
  },
  commentInput: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    maxHeight: 100,
    textAlignVertical: "center",
    minHeight: 40,
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
  emptyText: {
    textAlign: "center",
    fontSize: 14,
    paddingVertical: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 16,
  },
});
