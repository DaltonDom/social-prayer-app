import React, { useState } from "react";
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
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePrayers } from "../context/PrayerContext";
import EditProfileModal from "../components/EditProfileModal";
import ChangePasswordModal from "../components/ChangePasswordModal";
import { useTheme } from "../context/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";

export default function ProfileScreen({ navigation }) {
  const { getUserPrayers, deletePrayer, userProfile, updateUserProfile } =
    usePrayers();
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);
  const { isDarkMode, toggleTheme, theme } = useTheme();

  // Filter prayers to only show user's prayers
  const userPrayers = getUserPrayers();

  const [userInfo, setUserInfo] = useState({
    name: "John Smith",
    email: "john.smith@example.com",
    profileImage: "https://via.placeholder.com/150",
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
      // Add more friends as needed
    ],
    bio: "Passionate about prayer and community.",
  });

  // Remove totalPrayers from userInfo state and use computed value instead
  const totalPrayers = userPrayers.length;

  // Remove totalComments and use friends length instead
  const totalFriends = userInfo.friends.length;

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
          onPress: () => deletePrayer(prayerId),
        },
      ]
    );
  };

  const renderPrayerItem = ({ item }) => (
    <Animated.View style={[styles.prayerCard, { backgroundColor: theme.card }]}>
      <TouchableOpacity
        style={styles.prayerContent}
        onPress={() =>
          navigation.navigate("PrayerDetail", { prayerId: item.id })
        }
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
            {item.comments} Comments
          </Text>
          <Text style={[styles.statsText, { color: theme.textSecondary }]}>
            {item.updates} Updates
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const removeFriend = (friendId) => {
    setUserInfo((prev) => ({
      ...prev,
      friends: prev.friends.filter((friend) => friend.id !== friendId),
    }));
  };

  const navigateToFriendDetail = (friend) => {
    navigation.navigate("FriendDetail", {
      friend,
      onUnfriend: removeFriend,
    });
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

  const pickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Sorry, we need camera roll permissions to change your profile picture!"
      );
      return;
    }

    // Pick the image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      // Update profile image in context
      updateUserProfile({
        ...userProfile,
        profileImage: result.assets[0].uri,
      });

      // Update local state
      setUserInfo((prev) => ({
        ...prev,
        profileImage: result.assets[0].uri,
      }));
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={[styles.header, { backgroundColor: theme.card }]}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{ uri: userProfile.profileImage }}
              style={styles.profileImage}
            />
            <TouchableOpacity
              style={styles.editImageButton}
              onPress={pickImage}
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
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.primary }]}>
                {totalPrayers}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Prayers
              </Text>
            </View>
            <View
              style={[styles.statDivider, { backgroundColor: theme.border }]}
            />
            <TouchableOpacity
              style={styles.statItem}
              onPress={() =>
                navigation.navigate("FriendsList", {
                  friends: userInfo.friends,
                  onUnfriend: removeFriend,
                })
              }
            >
              <Text style={[styles.statNumber, { color: theme.primary }]}>
                {totalFriends}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Friends
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Friends Section */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Friends
            </Text>
            <TouchableOpacity
              style={styles.seeAllButton}
              onPress={() =>
                navigation.navigate("FriendsList", {
                  friends: userInfo.friends,
                  onUnfriend: removeFriend,
                })
              }
            >
              <Text style={[styles.seeAllText, { color: theme.primary }]}>
                See All
              </Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={userInfo.friends.slice(0, 3)} // Show only first 3 friends
            renderItem={renderFriendItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>

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
          <View style={styles.settingItem}>
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
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: "#767577", true: theme.primary }}
            />
          </View>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons
                name="mail-outline"
                size={24}
                color={theme.textSecondary}
              />
              <Text style={[styles.settingText, { color: theme.text }]}>
                Email Updates
              </Text>
            </View>
            <Switch
              value={emailUpdates}
              onValueChange={setEmailUpdates}
              trackColor={{ false: "#767577", true: theme.primary }}
            />
          </View>
          <View style={styles.settingItem}>
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
              trackColor={{ false: "#767577", true: theme.primary }}
            />
          </View>
        </View>

        {/* My Prayers Section */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            My Prayers
          </Text>
          <FlatList
            data={userPrayers}
            renderItem={renderPrayerItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ListEmptyComponent={
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No prayers added yet
              </Text>
            }
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: theme.card }]}
        >
          <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      <EditProfileModal
        visible={editProfileVisible}
        onClose={() => setEditProfileVisible(false)}
        userInfo={userInfo}
        onSave={setUserInfo}
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
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "white",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingText: {
    fontSize: 16,
    marginLeft: 12,
  },
  prayerCard: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 12,
    marginHorizontal: 4,
    marginTop: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
    width: "98%",
    alignSelf: "center",
  },
  prayerContent: {
    padding: 16,
  },
  deleteButton: {
    padding: 4,
  },
  prayerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  prayerTitleRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginRight: 8,
  },
  prayerTitle: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
  },
  prayerDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  prayerStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    paddingTop: 12,
  },
  statsText: {
    fontSize: 12,
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    fontSize: 16,
    marginTop: 20,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    marginTop: 16,
    marginBottom: 32,
    padding: 16,
  },
  logoutText: {
    color: "#FF3B30",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  seeAllButton: {
    padding: 4,
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
});
