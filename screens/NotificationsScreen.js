import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { notificationService } from "../services/notificationService";
import { friendshipService } from "../services/friendshipService";

export default function NotificationsScreen({ navigation }) {
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    const data = await notificationService.getNotifications();
    setNotifications(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleAcceptRequest = async (friendshipId) => {
    try {
      await friendshipService.acceptFriendRequest(friendshipId);
      fetchNotifications();
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  const handleRejectRequest = async (friendshipId) => {
    try {
      await friendshipService.rejectFriendRequest(friendshipId);
      fetchNotifications();
    } catch (error) {
      console.error("Error rejecting friend request:", error);
    }
  };

  const handleNotificationPress = async (notification) => {
    await notificationService.markAsRead(notification.id);

    if (notification.type === "comment") {
      navigation.navigate("PrayerDetail", { prayerId: notification.prayer.id });
    }
  };

  const renderNotification = ({ item }) => {
    const isFriendRequest = item.type === "friend_request";

    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          { backgroundColor: theme.card },
          !item.read && styles.unreadNotification,
        ]}
        onPress={() => handleNotificationPress(item)}
        disabled={isFriendRequest}
      >
        <Image
          source={{
            uri: item.sender.image || "https://via.placeholder.com/50",
          }}
          style={styles.senderImage}
        />
        <View style={styles.notificationContent}>
          <Text style={[styles.notificationText, { color: theme.text }]}>
            {isFriendRequest ? (
              <Text>
                <Text style={styles.senderName}>{item.sender.name}</Text> sent
                you a friend request
              </Text>
            ) : (
              <Text>
                <Text style={styles.senderName}>{item.sender.name}</Text>{" "}
                commented on your prayer "{item.prayer.title}"
              </Text>
            )}
          </Text>
          <Text
            style={[styles.notificationTime, { color: theme.textSecondary }]}
          >
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        {isFriendRequest && item.friendship && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.acceptButton, { backgroundColor: theme.primary }]}
              onPress={() => handleAcceptRequest(item.friendship.id)}
            >
              <Text style={styles.buttonText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.rejectButton, { backgroundColor: "#FF3B30" }]}
              onPress={() => handleRejectRequest(item.friendship.id)}
            >
              <Text style={styles.buttonText}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  }, []);

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <ActivityIndicator size="large" color={theme.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="notifications-outline"
              size={48}
              color={theme.textSecondary}
            />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No notifications yet
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  list: {
    padding: 16,
    flexGrow: 1,
  },
  notificationItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationText: {
    fontSize: 16,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
  },
});
