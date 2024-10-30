import React, { useState } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePrayers } from "../context/PrayerContext";
import { useTheme } from "../context/ThemeContext";

export default function PrayerDetailScreen({ route, navigation }) {
  const { theme } = useTheme();
  const { prayerId } = route.params;
  const { prayers } = usePrayers();
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Prayer Header */}
        <View style={[styles.header, { backgroundColor: theme.card }]}>
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
        </View>

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
          <View style={[styles.sectionHeader, { backgroundColor: theme.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Updates
            </Text>
            {prayer.userName === "Your Name" && (
              <TouchableOpacity
                style={[
                  styles.addUpdateButton,
                  { backgroundColor: theme.primary },
                ]}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={24}
                  color={theme.card}
                />
                <Text style={[styles.addUpdateText, { color: theme.card }]}>
                  Add Update
                </Text>
              </TouchableOpacity>
            )}
          </View>
          {updates.map((update) => (
            <View
              key={update.id}
              style={[styles.updateItem, { backgroundColor: theme.card }]}
            >
              <Text style={[styles.updateDate, { color: theme.textSecondary }]}>
                {update.date}
              </Text>
              <Text style={[styles.updateText, { color: theme.text }]}>
                {update.text}
              </Text>
            </View>
          ))}
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
                style={[styles.commentContent, { backgroundColor: theme.card }]}
              >
                <View
                  style={[
                    styles.commentHeader,
                    { backgroundColor: theme.card },
                  ]}
                >
                  <Text style={[styles.commentUserName, { color: theme.text }]}>
                    {comment.userName}
                  </Text>
                  <Text
                    style={[styles.commentDate, { color: theme.textSecondary }]}
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

      {/* Comment Input */}
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
        />
        <TouchableOpacity
          style={[styles.sendButton, { backgroundColor: theme.primary }]}
          onPress={handleAddComment}
        >
          <Ionicons name="send" size={24} color={theme.card} />
        </TouchableOpacity>
      </View>
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
  },
  addUpdateText: {
    color: "#6B4EFF",
    marginLeft: 4,
    fontWeight: "600",
  },
  updateItem: {
    backgroundColor: "#f8f8f8",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
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
});
