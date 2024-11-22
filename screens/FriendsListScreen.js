import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { friendshipService } from "../services/friendshipService";
import { Ionicons } from "@expo/vector-icons";

export default function FriendsListScreen({ navigation }) {
  const { theme } = useTheme();
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await friendshipService.getFriendshipStatuses();

      console.log("Raw data from service:", data); // Debug log

      setFriends(data.friends || []);
      setPendingRequests(data.pendingReceived || []);
      setAvailableUsers(data.availableUsers || []);
    } catch (error) {
      console.error("Error fetching friends:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAcceptRequest = async (friendshipId) => {
    try {
      await friendshipService.acceptFriendRequest(friendshipId);
      fetchData();
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  const handleRejectRequest = async (friendshipId) => {
    try {
      await friendshipService.rejectFriendRequest(friendshipId);
      fetchData();
    } catch (error) {
      console.error("Error rejecting friend request:", error);
    }
  };

  const handleRemoveFriend = async (friendId) => {
    try {
      await friendshipService.removeFriend(friendId);
      fetchData();
    } catch (error) {
      console.error("Error removing friend:", error);
    }
  };

  const handleSendRequest = async (userId) => {
    try {
      await friendshipService.sendFriendRequest(userId);
      fetchData();
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  };

  const filterData = (data) => {
    if (!searchQuery) return data;
    const query = searchQuery.toLowerCase();
    return data.filter(
      (item) =>
        item.first_name?.toLowerCase().includes(query) ||
        item.last_name?.toLowerCase().includes(query)
    );
  };

  const renderFriend = ({ item }) => (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      <Image
        source={{
          uri: item.profile_image_url || "https://via.placeholder.com/50",
        }}
        style={styles.profileImage}
      />
      <View style={styles.cardContent}>
        <Text style={[styles.name, { color: theme.text }]}>
          {item.first_name} {item.last_name}
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.removeButton, { backgroundColor: theme.danger }]}
        onPress={() => handleRemoveFriend(item.id)}
      >
        <Text style={styles.buttonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPendingRequest = ({ item }) => (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      <Image
        source={{
          uri: item.profile_image_url || "https://via.placeholder.com/50",
        }}
        style={styles.profileImage}
      />
      <View style={styles.cardContent}>
        <Text style={[styles.name, { color: theme.text }]}>
          {item.first_name} {item.last_name}
        </Text>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.acceptButton, { backgroundColor: theme.primary }]}
          onPress={() => handleAcceptRequest(item.friendshipId)}
        >
          <Text style={styles.buttonText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.rejectButton, { backgroundColor: theme.danger }]}
          onPress={() => handleRejectRequest(item.friendshipId)}
        >
          <Text style={styles.buttonText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPotentialFriend = ({ item }) => (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      <Image
        source={{
          uri: item.profile_image_url || "https://via.placeholder.com/50",
        }}
        style={styles.profileImage}
      />
      <View style={styles.cardContent}>
        <Text style={[styles.name, { color: theme.text }]}>
          {item.first_name} {item.last_name}
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: theme.primary }]}
        onPress={() => handleSendRequest(item.id)}
      >
        <Text style={styles.buttonText}>Add Friend</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
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
      edges={["left", "right"]}
    >
      <View style={[styles.searchContainer, { backgroundColor: theme.card }]}>
        <Ionicons
          name="search"
          size={20}
          color={theme.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search friends..."
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={[
          {
            title: "Friend Requests",
            data: filterData(pendingRequests),
            renderItem: renderPendingRequest,
          },
          {
            title: "Friends",
            data: filterData(friends),
            renderItem: renderFriend,
          },
          {
            title: "People You May Know",
            data: filterData(availableUsers),
            renderItem: renderPotentialFriend,
          },
        ]}
        renderItem={({ item: section }) => (
          <>
            {section.data.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  {section.title} ({section.data.length})
                </Text>
                <FlatList
                  data={section.data}
                  renderItem={section.renderItem}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                />
              </View>
            )}
          </>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: "100%",
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  card: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
  },
  actionButtons: {
    flexDirection: "row",
  },
  acceptButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
  },
  rejectButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
  },
  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  buttonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});
