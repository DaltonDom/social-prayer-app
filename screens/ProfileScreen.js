import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Switch,
  Animated,
  Alert,
  ActivityIndicator,
  Linking,
  Platform,
  Modal,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePrayers } from "../context/PrayerContext";
import EditProfileModal from "../components/EditProfileModal";
import ChangePasswordModal from "../components/ChangePasswordModal";
import { useTheme } from "../context/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../lib/supabase";
import { useUser } from "../context/UserContext";
import { friendshipService } from "../services/friendshipService";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as IntentLauncher from "expo-intent-launcher";
import * as Application from "expo-application";

export default function ProfileScreen({ navigation }) {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const { userProfile, uploadProfileImage } = useUser();
  const { prayers, getUserPrayers, deletePrayer } = usePrayers();
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);
  const [friends, setFriends] = useState([]);
  const [totalFriends, setTotalFriends] = useState(0);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Filter prayers to only show user's prayers
  const userPrayers = prayers.filter(
    (prayer) => prayer.user_id === userProfile?.id
  );

  useEffect(() => {
    if (userProfile) {
      getUserPrayers();
    }
  }, [userProfile]);

  // Update userInfo to use Supabase data
  const [userInfo, setUserInfo] = useState({
    name: `${userProfile?.first_name || ""} ${
      userProfile?.last_name || ""
    }`.trim(),
    email: userProfile?.email || "",
    profileImage:
      userProfile?.profile_image_url || "https://via.placeholder.com/150",
    joinDate: "March 2024",
    friends: [
      {
        id: "1",
        name: "Sarah Wilson",
        profileImage: "https://via.placeholder.com/50",
      },
      {
        id: "2",
        name: "Michael Chen",
        profileImage: "https://via.placeholder.com/50",
      },
      {
        id: "3",
        name: "Emma Thompson",
        profileImage: "https://via.placeholder.com/50",
      },
    ],
    bio: "Passionate about prayer and community.",
  });

  // Add useEffect to update userInfo when userProfile changes
  useEffect(() => {
    if (userProfile) {
      setUserInfo((prevInfo) => ({
        ...prevInfo,
        name: `${userProfile.first_name || ""} ${
          userProfile.last_name || ""
        }`.trim(),
        email: userProfile.email || "",
        profileImage:
          userProfile.profile_image_url || "https://via.placeholder.com/150",
      }));
    }
  }, [userProfile]);

  // Remove totalPrayers from userInfo state and use computed value instead
  const totalPrayers = userPrayers.length;

  const handleDeletePrayer = (prayerId) => {
    Alert.alert(
      "Delete Prayer",
      "Are you sure you want to delete this prayer?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const { error } = await deletePrayer(prayerId);
            if (error) {
              Alert.alert("Error", "Failed to delete prayer");
            }
          },
        },
      ]
    );
  };

  const renderPrayerItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.prayerCard, { backgroundColor: theme.card }]}
      onPress={() => navigation.navigate("PrayerDetail", { prayerId: item.id })}
    >
      <View style={styles.prayerHeader}>
        <View style={styles.prayerTitleRow}>
          <View
            style={[
              styles.categoryTag,
              { backgroundColor: `${theme.primary}15` },
            ]}
          >
            <Text style={[styles.categoryText, { color: theme.primary }]}>
              {item.category}
            </Text>
          </View>
          <Text
            style={[styles.prayerTitle, { color: theme.text }]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => handleDeletePrayer(item.id)}
          style={styles.deleteButton}
        >
          <Ionicons name="trash-outline" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      <Text
        numberOfLines={2}
        style={[styles.prayerDescription, { color: theme.text }]}
      >
        {item.description}
      </Text>

      <View style={[styles.prayerStats, { borderTopColor: theme.border }]}>
        <Text style={[styles.statsText, { color: theme.textSecondary }]}>
          {item.comments || 0} Comments
        </Text>
        <Text style={[styles.statsText, { color: theme.textSecondary }]}>
          {item.updates || 0} Updates
        </Text>
      </View>
    </TouchableOpacity>
  );

  const removeFriend = (friendId) => {
    setUserInfo((prev) => ({
      ...prev,
      friends: prev.friends.filter((friend) => friend.id !== friendId),
    }));
  };

  const navigateToFriendDetail = (friend) => {
    navigation.navigate("UserProfileScreen", { userId: friend.id });
  };

  const renderFriendItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.friendItem, { backgroundColor: theme.card }]}
      onPress={() => navigateToFriendDetail(item)}
    >
      <Image source={{ uri: item.profileImage }} style={styles.friendImage} />
      <Text style={[styles.friendName, { color: theme.text }]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const handleImagePick = async () => {
    try {
      // Request permission
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("Sorry, we need camera roll permissions to make this work!");
        return;
      }

      // Launch image picker with correct enum value - using lowercase 'images'
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images", // Fixed: using lowercase string value
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const { publicUrl, error } = await uploadProfileImage(
          result.assets[0].uri
        );
        if (error) {
          console.error("Error uploading image:", error);
          Alert.alert("Error", "Failed to upload image");
        } else {
          console.log("Image uploaded successfully:", publicUrl);
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // No need to navigate manually as AuthContext will handle this
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      console.log("Fetching available users for:", userProfile.id);

      // First get all current friendships (both pending and accepted)
      const { data: friendships, error: friendshipsError } = await supabase
        .from("friendships")
        .select("*")
        .or(`user_id.eq.${userProfile.id},friend_id.eq.${userProfile.id}`);

      if (friendshipsError) {
        console.error("Error fetching friendships:", friendshipsError);
        throw friendshipsError;
      }

      // Get IDs of users who are already friends or have pending requests
      const existingConnectionIds = friendships
        ? friendships.map((friendship) =>
            friendship.user_id === userProfile.id
              ? friendship.friend_id
              : friendship.user_id
          )
        : [];

      // Add current user's ID to exclude from results
      existingConnectionIds.push(userProfile.id);

      console.log("Existing connection IDs:", existingConnectionIds);

      // Fetch all users except current friends and self
      const { data: users, error: usersError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, profile_image_url");

      if (usersError) {
        console.error("Error fetching users:", usersError);
        throw usersError;
      }

      console.log("All users:", users);

      // Filter out existing connections
      const availableUsersFiltered = users.filter(
        (user) => !existingConnectionIds.includes(user.id)
      );

      console.log("Available users filtered:", availableUsersFiltered);

      setAvailableUsers(
        availableUsersFiltered.map((user) => ({
          id: user.id,
          name: `${user.first_name} ${user.last_name}`.trim(),
          profileImage:
            user.profile_image_url || "https://via.placeholder.com/50",
        }))
      );
    } catch (error) {
      console.error("Error in fetchAvailableUsers:", error);
    }
  };

  // Add this useEffect to fetch available users when component mounts
  useEffect(() => {
    if (userProfile) {
      fetchAvailableUsers();
    }
  }, [userProfile]);

  useEffect(() => {
    let isMounted = true;

    const fetchFriendsData = async () => {
      if (!userProfile?.id) return;

      try {
        setIsLoading(true);
        console.log("Fetching friends for user:", userProfile.id);

        const { data: friendships, error } = await supabase
          .from("friendships")
          .select(
            `
            id,
            status,
            user_id,
            friend_id,
            friend:profiles!friendships_friend_id_fkey (
              id,
              first_name,
              last_name,
              profile_image_url
            ),
            user:profiles!friendships_user_id_fkey (
              id,
              first_name,
              last_name,
              profile_image_url
            )
          `
          )
          .or(`user_id.eq.${userProfile.id},friend_id.eq.${userProfile.id}`)
          .in("status", ["accepted", "pending"]);

        if (error) throw error;

        if (!isMounted) return;

        if (!friendships) {
          setFriends([]);
          setTotalFriends(0);
          return;
        }

        const transformedFriends = friendships
          .filter((friendship) => friendship.status === "accepted")
          .map((friendship) => {
            const friendInfo =
              friendship.user_id === userProfile.id
                ? friendship.friend
                : friendship.user;

            return {
              id: friendInfo.id,
              first_name: friendInfo.first_name,
              last_name: friendInfo.last_name,
              profile_image_url: friendInfo.profile_image_url,
              friendshipId: friendship.id,
            };
          });

        if (!isMounted) return;

        setFriends(transformedFriends);
        setTotalFriends(transformedFriends.length);
      } catch (error) {
        console.error("Error fetching friends:", error);
        if (isMounted) {
          setFriends([]);
          setTotalFriends(0);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchFriendsData();

    return () => {
      isMounted = false;
    };
  }, [userProfile?.id]);

  const navigateToFriendsList = () => {
    navigation.navigate("FriendsList", {
      friends,
      availableUsers,
      pendingRequests,
      onUnfriend: removeFriend,
      onRefresh: () => {
        fetchFriendsData();
        fetchAvailableUsers();
      },
    });
  };

  const handleAcceptRequest = async (friendshipId) => {
    try {
      await friendshipService.acceptFriendRequest(friendshipId);
      fetchFriendsData();
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  const handleRejectRequest = async (friendshipId) => {
    try {
      await friendshipService.rejectFriendRequest(friendshipId);
      fetchFriendsData();
    } catch (error) {
      console.error("Error rejecting friend request:", error);
    }
  };

  const handleSendRequest = async (userId) => {
    try {
      await friendshipService.sendFriendRequest(userId);
      fetchFriendsData();
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  };

  const handleRemoveFriend = async (friendId) => {
    try {
      await friendshipService.removeFriend(friendId);
      fetchFriendsData();
    } catch (error) {
      console.error("Error removing friend:", error);
    }
  };

  const navigateToMyPrayers = () => {
    navigation.navigate("MyPrayersList", {
      prayers: userPrayers || [],
      onRefresh: () => {
        getUserPrayers();
      },
    });
  };

  const renderFriendsSection = () => (
    <View style={[styles.section, { backgroundColor: theme.card }]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Friends
        </Text>
        <TouchableOpacity
          style={styles.seeAllButton}
          onPress={() => navigation.navigate("FriendsList")}
        >
          <Text style={[styles.seeAllText, { color: theme.primary }]}>
            See All
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator size="small" color={theme.primary} />
      ) : (
        <FlatList
          data={friends}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.friendCard}
              onPress={() =>
                navigation.navigate("UserProfileScreen", {
                  userId: item.id,
                })
              }
            >
              <Image
                source={{
                  uri:
                    item.profile_image_url || "https://via.placeholder.com/50",
                }}
                style={styles.friendImage}
              />
              <Text style={[styles.friendName, { color: theme.text }]}>
                {`${item.first_name} ${item.last_name}`}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              {isLoading ? "Loading..." : "No friends yet"}
            </Text>
          }
        />
      )}
    </View>
  );

  const statsContainer = (
    <View style={styles.statsContainer}>
      <TouchableOpacity style={styles.statItem} onPress={navigateToMyPrayers}>
        <Text style={[styles.statNumber, { color: theme.primary }]}>
          {totalPrayers}
        </Text>
        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
          Prayers
        </Text>
      </TouchableOpacity>
      <View
        style={[
          styles.statDivider,
          {
            backgroundColor: theme.dark
              ? "rgba(255, 255, 255, 0.1)"
              : theme.border,
          },
        ]}
      />
      <TouchableOpacity style={styles.statItem} onPress={navigateToFriendsList}>
        <Text style={[styles.statNumber, { color: theme.primary }]}>
          {totalFriends}
        </Text>
        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
          Friends
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Add this useEffect to check notification status on mount
  useEffect(() => {
    checkNotificationStatus();
  }, []);

  const checkNotificationStatus = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setNotificationsEnabled(status === "granted");
  };

  const handleNotificationToggle = async () => {
    const currentStatus = await Notifications.getPermissionsAsync();

    if (currentStatus.status === "granted") {
      // If notifications are currently enabled, open settings to let them disable
      openNotificationSettings();
    } else {
      // If notifications are disabled, request permissions again
      const { status } = await Notifications.requestPermissionsAsync();

      if (status === "granted") {
        setNotificationsEnabled(true);
        await AsyncStorage.setItem("notificationStatus", "granted");
      } else {
        // If they deny again, prompt to open settings
        Alert.alert(
          "Enable Notifications",
          "To enable notifications, please update your device settings.",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Open Settings",
              onPress: openNotificationSettings,
            },
          ]
        );
      }
    }
  };

  const openNotificationSettings = () => {
    if (Platform.OS === "ios") {
      Linking.openSettings();
    } else {
      IntentLauncher.startActivityAsync(
        IntentLauncher.ActivityAction.NOTIFICATION_SETTINGS
      );
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.background }}
      edges={["top"]}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View
          style={[
            styles.header,
            {
              backgroundColor: theme.card,
              borderBottomColor: theme.dark ? "transparent" : "#eee", // Remove border in dark mode
            },
          ]}
        >
          <View style={styles.profileImageContainer}>
            <TouchableOpacity onPress={handleImagePick}>
              <Image
                source={{ uri: userInfo.profileImage }}
                style={styles.profileImage}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.editImageButton}
              onPress={handleImagePick}
            >
              <Ionicons name="camera" size={20} color="white" />
            </TouchableOpacity>
          </View>
          <Text style={[styles.userName, { color: theme.text }]}>
            {userInfo.name}
          </Text>
          <Text style={[styles.userEmail, { color: theme.textSecondary }]}>
            {userInfo.email}
          </Text>
          {statsContainer}
        </View>

        {renderFriendsSection()}

        {/* Settings Section */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Settings
          </Text>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setEditProfileVisible(true)}
          >
            <View style={styles.settingLeft}>
              <Ionicons
                name="person-outline"
                size={24}
                color={theme.textSecondary}
              />
              <Text style={[styles.settingText, { color: theme.text }]}>
                Edit Profile
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={24}
              color={theme.textSecondary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setChangePasswordVisible(true)}
          >
            <View style={styles.settingLeft}>
              <Ionicons
                name="lock-closed-outline"
                size={24}
                color={theme.textSecondary}
              />
              <Text style={[styles.settingText, { color: theme.text }]}>
                Change Password
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={24}
              color={theme.textSecondary}
            />
          </TouchableOpacity>
          <View style={[styles.settingItem, { backgroundColor: theme.card }]}>
            <View style={styles.settingLeft}>
              <Ionicons
                name="notifications-outline"
                size={24}
                color={theme.textSecondary}
              />
              <Text style={[styles.settingText, { color: theme.text }]}>
                Notifications
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: theme.textSecondary, true: theme.primary }}
              thumbColor={
                Platform.OS === "ios"
                  ? "#FFFFFF"
                  : notificationsEnabled
                  ? theme.primary
                  : "#f4f3f4"
              }
            />
          </View>
          <View style={[styles.settingItem, { backgroundColor: theme.card }]}>
            <View style={styles.settingLeft}>
              <Ionicons
                name={isDarkMode ? "moon" : "moon-outline"}
                size={24}
                color={theme.textSecondary}
              />
              <Text style={[styles.settingText, { color: theme.text }]}>
                Dark Mode
              </Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.textSecondary, true: theme.primary }}
              thumbColor={
                Platform.OS === "ios"
                  ? "#FFFFFF"
                  : isDarkMode
                  ? theme.primary
                  : "#f4f3f4"
              }
            />
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: theme.card }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      <EditProfileModal
        visible={editProfileVisible}
        onClose={() => setEditProfileVisible(false)}
        userInfo={userProfile}
        style={{
          backgroundColor: theme.dark ? theme.background : theme.card,
        }}
        textStyle={{
          color: theme.text,
        }}
        onSave={(updatedInfo) => {
          setUserInfo((prev) => ({
            ...prev,
            name: `${updatedInfo.firstName} ${updatedInfo.lastName}`.trim(),
            email: updatedInfo.email,
            profileImage: updatedInfo.profileImageUrl,
          }));
        }}
      />

      <ChangePasswordModal
        visible={changePasswordVisible}
        onClose={() => setChangePasswordVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editImageButton: {
    position: "absolute",
    right: 0,
    bottom: 0,
    backgroundColor: "#6B4EFF",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "white",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#eee",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#6B4EFF",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  section: {
    backgroundColor: "white",
    marginTop: 16,
    padding: 16,
    paddingBottom: 4,
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
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  lastSettingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingText: {
    fontSize: 16,
  },
  emptyText: {
    textAlign: "center",
    padding: 20,
    fontSize: 16,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    marginTop: 16,
    marginBottom: 0,
    padding: 16,
  },
  logoutText: {
    color: "#FF3B30",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  seeAllButton: {
    padding: 8,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600",
  },
  friendItem: {
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginRight: 12,
    width: 100,
  },
  friendImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  friendName: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  subsection: {
    paddingVertical: 16,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  friendCard: {
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginRight: 12,
    width: 100,
  },
  requestButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  acceptButton: {
    backgroundColor: "#6B4EFF",
    padding: 8,
    borderRadius: 8,
    width: "45%",
  },
  rejectButton: {
    backgroundColor: "#FF3B30",
    padding: 8,
    borderRadius: 8,
    width: "45%",
  },
  buttonText: {
    fontSize: 14,
    color: "white",
    fontWeight: "600",
    textAlign: "center",
  },
  removeFriendButton: {
    backgroundColor: "#FF3B30",
    padding: 4,
    borderRadius: 8,
    width: "100%",
    marginTop: 8,
  },
  removeFriendText: {
    fontSize: 14,
    color: "white",
    fontWeight: "600",
    textAlign: "center",
  },
  addFriendButton: {
    backgroundColor: "#6B4EFF",
    padding: 4,
    borderRadius: 8,
    width: "100%",
    marginTop: 8,
  },
  addFriendText: {
    fontSize: 14,
    color: "white",
    fontWeight: "600",
    textAlign: "center",
  },
  friendRequestCard: {
    width: 100,
    alignItems: "center",
    marginRight: 16,
    padding: 8,
  },
  requestsPreview: {
    marginTop: 16,
  },
  modal: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    padding: 20,
    borderRadius: 12,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  modalBody: {
    marginBottom: 20,
  },
  input: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
  },
  modalFooter: {
    alignItems: "center",
  },
  button: {
    padding: 12,
    borderRadius: 8,
    width: "100%",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
