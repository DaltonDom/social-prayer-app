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
import { LinearGradient } from "expo-linear-gradient";

export default function PrayerDetailScreen({ route, navigation }) {
  const { theme, isDarkMode } = useTheme();
  const { prayerId } = route.params;
  const {
    prayers,
    addUpdate,
    updatePrayer,
    addComment,
    getPrayer,
    deleteUpdate,
    deleteComment,
  } = usePrayers();
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

  const categories = [
    "Health",
    "Family",
    "Work",
    "Spiritual Growth",
    "Relationships",
    "Other",
  ];

  useEffect(() => {
    loadPrayer();
  }, [prayerId]);

  const loadPrayer = async () => {
    setLoading(true);
    try {
      const { data, error } = await getPrayer(prayerId);
      if (error) {
        console.error("Error loading prayer:", error);
        Alert.alert("Error", "Failed to load prayer");
      } else {
        console.log("Prayer loaded successfully:", data);
        setPrayer(data);
      }
    } catch (error) {
      console.error("Error in loadPrayer:", error);
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
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

  const handleEdit = () => {
    setEditedPrayer({
      title: prayer.title,
      description: prayer.description,
      category: prayer.category,
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!editedPrayer.title.trim() || !editedPrayer.description.trim()) {
      Alert.alert("Error", "Title and description are required");
      return;
    }

    const { error } = await updatePrayer(prayer.id, editedPrayer);

    if (error) {
      Alert.alert("Error", "Failed to update prayer");
    } else {
      setIsEditing(false);
      loadPrayer(); // Refresh the prayer data
    }
  };

  const isOwner = userProfile?.id === prayer?.user_id;

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

  const handleDeleteUpdate = async (updateId) => {
    console.log("Attempting to delete update:", updateId);

    Alert.alert(
      "Delete Update",
      "Are you sure you want to delete this update?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            console.log("Deleting update...");
            const { error } = await deleteUpdate(prayerId, updateId);
            if (error) {
              console.error("Delete update error:", error);
              Alert.alert("Error", "Failed to delete update");
            } else {
              console.log("Update deleted successfully");
              await loadPrayer(); // Make sure to await this
            }
          },
        },
      ]
    );
  };

  const handleDeleteComment = async (commentId) => {
    console.log("Attempting to delete comment:", commentId);

    Alert.alert(
      "Delete Comment",
      "Are you sure you want to delete this comment?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            console.log("Deleting comment...");
            const { error } = await deleteComment(commentId);
            if (error) {
              console.error("Delete comment error:", error);
              Alert.alert("Error", "Failed to delete comment");
            } else {
              console.log("Comment deleted successfully");
              await loadPrayer(); // Make sure to await this
            }
          },
        },
      ]
    );
  };

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
      style={[styles.container]}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      enabled={true}
    >
      <SafeAreaView style={{ flex: 1 }} edges={["left", "right", "bottom"]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{ paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Prayer Card */}
          <View style={[styles.prayerCard, styles.cardShadow]}>
            <View style={styles.cardHeader}>
              <View style={styles.headerLeft}>
                <Image
                  source={{ uri: prayer?.userImage }}
                  style={styles.profileImage}
                />
                <View style={styles.headerText}>
                  <Text style={styles.userName}>{prayer?.userName}</Text>
                  <Text style={styles.date}>{prayer?.date}</Text>
                </View>
              </View>
              {isOwner && (
                <TouchableOpacity
                  onPress={isEditing ? handleSaveEdit : handleEdit}
                  style={styles.editButton}
                >
                  <Ionicons
                    name={isEditing ? "checkmark" : "pencil"}
                    size={20}
                    color={theme.primary}
                  />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.cardContent}>
              {isEditing ? (
                <View style={styles.editContainer}>
                  <TextInput
                    style={[styles.editInput, { backgroundColor: theme.card }]}
                    value={editedPrayer.title}
                    onChangeText={(text) =>
                      setEditedPrayer({ ...editedPrayer, title: text })
                    }
                    placeholder="Prayer title"
                    placeholderTextColor={theme.textSecondary}
                  />
                  <TextInput
                    style={[
                      styles.editInput,
                      styles.editDescription,
                      { backgroundColor: theme.card },
                    ]}
                    value={editedPrayer.description}
                    onChangeText={(text) =>
                      setEditedPrayer({ ...editedPrayer, description: text })
                    }
                    placeholder="Prayer description"
                    placeholderTextColor={theme.textSecondary}
                    multiline
                    numberOfLines={4}
                  />
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoryContainer}
                  >
                    {categories.map((category) => (
                      <TouchableOpacity
                        key={category}
                        style={[styles.categoryButton]}
                        onPress={() =>
                          setEditedPrayer({
                            ...editedPrayer,
                            category: category,
                          })
                        }
                      >
                        <LinearGradient
                          colors={
                            editedPrayer.category === category
                              ? theme.dark
                                ? ["#581C87", "#1E3A8A"]
                                : ["#E9D5FF", "#BFDBFE"]
                              : ["transparent", "transparent"]
                          }
                          style={styles.categoryGradient}
                        >
                          <View style={styles.categoryContent}>
                            <Ionicons
                              name={getCategoryIcon(category)}
                              size={14}
                              color={
                                editedPrayer.category === category
                                  ? theme.dark
                                    ? "#E9D5FF"
                                    : "#6B21A8"
                                  : theme.textSecondary
                              }
                            />
                            <Text
                              style={[
                                styles.categoryText,
                                {
                                  color:
                                    editedPrayer.category === category
                                      ? theme.dark
                                        ? "#E9D5FF"
                                        : "#6B21A8"
                                      : theme.textSecondary,
                                },
                              ]}
                            >
                              {category}
                            </Text>
                          </View>
                        </LinearGradient>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              ) : (
                <>
                  <View style={styles.contentRow}>
                    <View style={styles.descriptionContainer}>
                      <Text style={styles.title}>{prayer.title}</Text>
                      <Text style={styles.description}>
                        {prayer.description}
                      </Text>
                    </View>
                    <View style={styles.tagsContainer}>
                      <LinearGradient
                        colors={
                          theme.dark
                            ? ["#581C87", "#1E3A8A"]
                            : ["#E9D5FF", "#BFDBFE"]
                        }
                        style={styles.categoryTag}
                      >
                        <Ionicons
                          name={getCategoryIcon(prayer.category)}
                          size={14}
                          color={theme.dark ? "#E9D5FF" : "#6B21A8"}
                          style={styles.categoryIcon}
                        />
                        <Text style={styles.categoryText}>
                          {prayer.category}
                        </Text>
                      </LinearGradient>

                      {prayer.groups && (
                        <LinearGradient
                          colors={
                            theme.dark
                              ? ["#065F46", "#064E3B"]
                              : ["#D1FAE5", "#A7F3D0"]
                          }
                          style={styles.categoryTag}
                        >
                          <Ionicons
                            name="people"
                            size={14}
                            color={theme.dark ? "#D1FAE5" : "#065F46"}
                            style={styles.categoryIcon}
                          />
                          <Text
                            style={[
                              styles.categoryText,
                              { color: theme.dark ? "#D1FAE5" : "#065F46" },
                            ]}
                          >
                            {prayer.groups.name}
                          </Text>
                        </LinearGradient>
                      )}
                    </View>
                  </View>
                </>
              )}
            </View>
          </View>

          {/* Updates Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Updates</Text>
              {isOwner && (
                <TouchableOpacity
                  style={styles.addUpdateButton}
                  onPress={() => setShowUpdateInput(!showUpdateInput)}
                >
                  <LinearGradient
                    colors={
                      theme.dark
                        ? ["#581C87", "#1E3A8A"]
                        : ["#E9D5FF", "#BFDBFE"]
                    }
                    style={styles.addUpdateGradient}
                  >
                    <Ionicons
                      name="add"
                      size={20}
                      color={theme.dark ? "#E9D5FF" : "#6B21A8"}
                    />
                    <Text
                      style={[
                        styles.addUpdateText,
                        { color: theme.dark ? "#E9D5FF" : "#6B21A8" },
                      ]}
                    >
                      Add Update
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>

            {showUpdateInput && (
              <View style={styles.updateInputContainer}>
                <TextInput
                  style={[styles.updateInput, { backgroundColor: theme.card }]}
                  placeholder="Share an update..."
                  placeholderTextColor={theme.textSecondary}
                  value={newUpdate}
                  onChangeText={setNewUpdate}
                  multiline
                />
                <TouchableOpacity
                  style={[
                    styles.updateButton,
                    { backgroundColor: theme.primary },
                  ]}
                  onPress={handleAddUpdate}
                >
                  <Text style={styles.updateButtonText}>Post Update</Text>
                </TouchableOpacity>
              </View>
            )}

            {prayer.updates_list && prayer.updates_list.length > 0 ? (
              prayer.updates_list.map((update) => (
                <View
                  key={update.id}
                  style={[styles.updateCard, styles.cardShadow]}
                >
                  <View style={styles.updateHeader}>
                    <View style={styles.updateInfo}>
                      <Text style={styles.updateDate}>
                        {new Date(update.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                    {userProfile?.id === prayer.user_id && (
                      <TouchableOpacity
                        onPress={() => handleDeleteUpdate(update.id)}
                        style={[
                          styles.deleteButton,
                          { backgroundColor: "#fee2e2" },
                        ]}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={20}
                          color="#ef4444"
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text style={styles.updateText}>{update.text}</Text>
                </View>
              ))
            ) : (
              <View style={[styles.emptyCard, styles.cardShadow]}>
                <Ionicons name="refresh" size={24} style={styles.emptyIcon} />
                <Text style={styles.emptyText}>No updates yet</Text>
              </View>
            )}
          </View>

          {/* Comments Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Comments</Text>
            {prayer.comments_list && prayer.comments_list.length > 0 ? (
              prayer.comments_list.map((comment) => (
                <View key={comment.id} style={styles.commentCard}>
                  <View style={styles.commentHeader}>
                    <Image
                      source={{ uri: comment.userImage }}
                      style={styles.commentUserImage}
                    />
                    <View style={styles.commentContent}>
                      <View style={styles.commentMeta}>
                        <Text style={styles.commentUserName}>
                          {comment.userName}
                        </Text>
                        <View style={styles.commentActions}>
                          <Text style={styles.commentDate}>
                            {new Date(comment.date).toLocaleDateString()}
                          </Text>
                          {userProfile?.id === comment.user_id && (
                            <TouchableOpacity
                              onPress={() => handleDeleteComment(comment.id)}
                              style={[
                                styles.deleteButton,
                                { backgroundColor: "#fee2e2" },
                              ]}
                            >
                              <Ionicons
                                name="trash-outline"
                                size={20}
                                color="#ef4444"
                              />
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                      <Text style={styles.commentText}>{comment.text}</Text>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No comments yet</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Comment Input */}
        <View
          style={[
            styles.commentInputContainer,
            {
              paddingBottom: Platform.OS === "ios" ? 34 : 16,
            },
          ]}
        >
          <TextInput
            style={styles.commentInput}
            placeholder="Add a comment..."
            value={newComment}
            onChangeText={setNewComment}
            multiline={false}
            onFocus={() => setIsCommentFocused(true)}
            onBlur={() => setIsCommentFocused(false)}
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleAddComment}
          >
            <Ionicons name="send" size={16} color="white" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9ff",
  },
  scrollView: {
    flex: 1,
  },
  prayerCard: {
    margin: 16,
    borderRadius: 12,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#6B4EFF",
  },
  headerText: {
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  date: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  cardContent: {
    padding: 16,
  },
  contentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  descriptionContainer: {
    flex: 1,
    paddingRight: 8,
  },
  tagsContainer: {
    flexDirection: "column",
    gap: 8,
    alignItems: "flex-end",
    paddingLeft: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: "#1a1a1a",
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f0ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryIcon: {
    marginRight: 4,
    color: "#6b46c1",
  },
  categoryText: {
    color: "#6b46c1",
    fontSize: 12,
    fontWeight: "500",
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#1a1a1a",
  },
  emptyCard: {
    padding: 24,
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 12,
  },
  emptyIcon: {
    color: "#666",
    marginBottom: 8,
  },
  emptyText: {
    color: "#666",
    fontSize: 14,
  },
  commentCard: {
    padding: 16,
    marginBottom: 8,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 12,
  },
  commentHeader: {
    flexDirection: "row",
  },
  commentUserImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  commentContent: {
    flex: 1,
    marginLeft: 12,
  },
  commentMeta: {
    flexDirection: "column",
    marginBottom: 4,
  },
  commentUserName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1a1a1a",
  },
  commentDate: {
    fontSize: 12,
    color: "#666",
  },
  commentText: {
    fontSize: 14,
    color: "#1a1a1a",
  },
  commentInputContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    padding: 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    alignItems: "center",
    paddingBottom: Platform.OS === "ios" ? 34 : 16,
  },
  commentInput: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 14,
    maxHeight: 80,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#6b46c1",
    justifyContent: "center",
    alignItems: "center",
  },
  cardShadow: {
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryIcon: {
    marginRight: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
  },
  editButton: {
    padding: 8,
    borderRadius: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  addUpdateButton: {
    borderRadius: 20,
    overflow: "hidden",
  },
  addUpdateGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  addUpdateText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  updateInputContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  updateInput: {
    padding: 12,
    borderRadius: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: "top",
  },
  updateButton: {
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  updateButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  updateCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  updateDate: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  updateText: {
    fontSize: 14,
    lineHeight: 20,
  },
  editContainer: {
    gap: 16,
  },
  editInput: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  editDescription: {
    minHeight: 120,
    textAlignVertical: "top",
    paddingTop: 16,
  },
  categoryContainer: {
    flexDirection: "row",
    marginVertical: 8,
  },
  categoryButton: {
    marginRight: 8,
    borderRadius: 16,
    overflow: "hidden",
  },
  categoryGradient: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  updateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
  },
  commentActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  debugText: {
    fontSize: 12,
    color: "#666",
  },
  deleteText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ef4444",
    marginLeft: 4,
  },
  updateInfo: {
    flex: 1,
  },
});
