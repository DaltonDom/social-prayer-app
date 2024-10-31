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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePrayers } from "../context/PrayerContext";
import EditProfileModal from "../components/EditProfileModal";
import ChangePasswordModal from "../components/ChangePasswordModal";
import { useTheme } from "../context/ThemeContext";

export default function ProfileScreen({ navigation }) {
  const { prayers, deletePrayer } = usePrayers();
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);
  const { isDarkMode, toggleTheme, theme } = useTheme();

  // Filter prayers to only show user's prayers
  const userPrayers = prayers.filter(
    (prayer) => prayer.userName === "Your Name"
  );

  const [userInfo, setUserInfo] = useState({
    name: "John Smith",
    email: "john.smith@example.com",
    profileImage: "https://via.placeholder.com/150",
    joinDate: "March 2024",
    totalPrayers: userPrayers.length,
    totalComments: 45,
    bio: "Passionate about prayer and community.",
  });

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
          <Text style={[styles.prayerTitle, { color: theme.text }]}>
            {item.title}
          </Text>
          <TouchableOpacity
            onPress={() => handleDeletePrayer(item.id)}
            style={styles.deleteButton}
          >
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
        <View
          style={[
            styles.categoryTag,
            { backgroundColor: `${theme.primary}20` },
          ]}
        >
          <Text style={[styles.categoryText, { color: theme.primary }]}>
            {item.category}
          </Text>
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

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={[styles.header, { backgroundColor: theme.card }]}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{ uri: userInfo.profileImage }}
              style={styles.profileImage}
            />
            <TouchableOpacity style={styles.editImageButton}>
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
                {userInfo.totalPrayers}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Prayers
              </Text>
            </View>
            <View
              style={[styles.statDivider, { backgroundColor: theme.border }]}
            />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.primary }]}>
                {userInfo.totalComments}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Comments
              </Text>
            </View>
          </View>
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
    </>
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
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    transform: [{ scale: 1 }],
  },
  prayerContent: {
    padding: 16,
  },
  deleteButton: {
    padding: 8,
  },
  prayerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  prayerTitle: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  categoryTag: {
    backgroundColor: "#6B4EFF20",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  categoryText: {
    color: "#6B4EFF",
    fontSize: 12,
    fontWeight: "600",
  },
  prayerDate: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  prayerDescription: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
  },
  prayerStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statsText: {
    fontSize: 12,
    color: "#666",
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
});
