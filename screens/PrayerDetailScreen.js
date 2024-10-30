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

export default function PrayerDetailScreen({ route, navigation }) {
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
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        {/* Prayer Header */}
        <View style={styles.header}>
          <Image
            source={{ uri: prayer.userImage }}
            style={styles.profileImage}
          />
          <View style={styles.headerText}>
            <Text style={styles.userName}>{prayer.userName}</Text>
            <Text style={styles.date}>{prayer.date}</Text>
          </View>
        </View>

        {/* Prayer Content */}
        <View style={styles.prayerContent}>
          <Text style={styles.title}>{prayer.title}</Text>
          <View style={styles.categoryContainer}>
            <Text style={styles.category}>{prayer.category}</Text>
          </View>
          <Text style={styles.description}>{prayer.description}</Text>
        </View>

        {/* Updates Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Updates</Text>
            {prayer.userName === "Your Name" && (
              <TouchableOpacity style={styles.addUpdateButton}>
                <Ionicons name="add-circle-outline" size={24} color="#6B4EFF" />
                <Text style={styles.addUpdateText}>Add Update</Text>
              </TouchableOpacity>
            )}
          </View>
          {updates.map((update) => (
            <View key={update.id} style={styles.updateItem}>
              <Text style={styles.updateDate}>{update.date}</Text>
              <Text style={styles.updateText}>{update.text}</Text>
            </View>
          ))}
        </View>

        {/* Comments Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comments</Text>
          {comments.map((comment) => (
            <View key={comment.id} style={styles.commentItem}>
              <Image
                source={{ uri: comment.userImage }}
                style={styles.commentUserImage}
              />
              <View style={styles.commentContent}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentUserName}>{comment.userName}</Text>
                  <Text style={styles.commentDate}>{comment.date}</Text>
                </View>
                <Text style={styles.commentText}>{comment.text}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Comment Input */}
      <View style={styles.commentInputContainer}>
        <TextInput
          style={styles.commentInput}
          placeholder="Add a comment..."
          value={newComment}
          onChangeText={setNewComment}
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleAddComment}>
          <Ionicons name="send" size={24} color="white" />
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
