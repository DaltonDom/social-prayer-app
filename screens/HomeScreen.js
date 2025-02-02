import React, { useState, useCallback, useEffect } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
  Platform,
  RefreshControl,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
} from "react-native";
import { usePrayers } from "../context/PrayerContext";
import { useTheme } from "../context/ThemeContext";
import Ionicons from "react-native-vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Modal from "react-native-modal";
import { useAuth } from "../context/AuthContext";
import { useUser } from "../context/UserContext";
import { notificationService } from "../services/notificationService";
import { supabase } from "../lib/supabase";

export default function HomeScreen({ navigation }) {
  const { prayers, fetchPrayers, setPrayers } = usePrayers();
  const { user } = useAuth();
  const { friendships } = useUser();
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [isNotificationModalVisible, setNotificationModalVisible] =
    useState(false);
  const [notifications, setNotifications] = useState([]);

  // Add debug logs

  const filteredPrayers = prayers.filter((prayer) => {
    const isOwnPrayer = prayer.user_id === user.id;
    const isFriendsPrayer = friendships?.some(
      (friendship) =>
        (friendship.user_id === user.id &&
          friendship.friend_id === prayer.user_id) ||
        (friendship.friend_id === user.id &&
          friendship.user_id === prayer.user_id)
    );

    return isOwnPrayer || isFriendsPrayer;
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const { data: prayers, error } = await supabase
        .from("prayers")
        .select(
          `
          *,
          profiles!prayers_user_id_fkey (
            id,
            first_name,
            last_name,
            profile_image_url
          ),
          groups!prayers_group_id_fkey (
            id,
            name
          ),
          prayer_comments:prayer_comments(count)
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching prayers:", error);
        return;
      }

      const transformedPrayers = prayers.map((prayer) => ({
        ...prayer,
        userName:
          `${prayer.profiles.first_name} ${prayer.profiles.last_name}`.trim(),
        userImage: prayer.profiles.profile_image_url,
        date: new Date(prayer.created_at).toISOString().split("T")[0],
        comments: prayer.prayer_comments[0].count,
        groupName: prayer.groups?.name || null,
      }));

      setPrayers(transformedPrayers);
    } catch (error) {
      console.error("Error refreshing prayers:", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const renderPrayerCard = ({ item }) => {
    // Add this console log to debug
    console.log("Theme state:", theme.dark);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate("PrayerDetail", { prayerId: item.id })
        }
      >
        <LinearGradient
          colors={
            theme.dark
              ? ["#2D2D2D", "#1A1A1A"] // dark mode colors (dark gray to near-black)
              : [theme.card, "#F8F7FF"] // light mode colors (unchanged)
          }
          style={styles.cardGradient}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Image
                source={{ uri: item.userImage }}
                style={[styles.profileImage, styles.profileImageRing]}
              />
              <View style={styles.headerText}>
                <Text style={[styles.userName, { color: theme.text }]}>
                  {item.userName}
                </Text>
                <Text style={[styles.date, { color: theme.textSecondary }]}>
                  {item.date}
                </Text>
              </View>
            </View>
            <View style={styles.tagsContainer}>
              <LinearGradient
                colors={
                  theme.dark ? ["#581C87", "#1E3A8A"] : ["#E9D5FF", "#BFDBFE"]
                }
                style={styles.categoryTag}
              >
                <Ionicons
                  name={getCategoryIcon(item.category)}
                  size={14}
                  color={theme.dark ? "#E9D5FF" : "#6B21A8"}
                  style={styles.categoryIcon}
                />
                <Text
                  style={[
                    styles.categoryText,
                    { color: theme.dark ? "#E9D5FF" : "#6B21A8" },
                  ]}
                >
                  {item.category}
                </Text>
              </LinearGradient>

              {item.groups && (
                <LinearGradient
                  colors={
                    theme.dark ? ["#065F46", "#064E3B"] : ["#D1FAE5", "#A7F3D0"]
                  }
                  style={styles.groupTag}
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
                    {item.groups.name}
                  </Text>
                </LinearGradient>
              )}
            </View>
          </View>

          <Text style={[styles.title, { color: theme.text }]}>
            {item.title}
          </Text>

          <View
            style={[
              styles.cardFooter,
              {
                backgroundColor: theme.dark
                  ? "rgba(255, 255, 255, 0.1)" // Lighter background for dark mode
                  : `${theme.background}50`,
                alignSelf: "flex-start", // Changed to flex-start
                borderRadius: 16,
                marginTop: 12,
                marginLeft: "auto", // Added to push to right side
              },
            ]}
          >
            <TouchableOpacity style={styles.footerButton} activeOpacity={0.7}>
              <Ionicons
                name="chatbubble-outline"
                size={16}
                color={theme.primary}
              />
              <Text style={[styles.footerText, { color: theme.primary }]}>
                {item.comments || 0} Comments
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  // Helper function to get category icons
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

  // Add this function to fetch notifications
  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  // Add this useEffect to load notifications
  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    // Subscribe to prayer changes (including comments and updates)
    const prayerChangesSubscription = supabase
      .channel("prayer-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "prayers",
        },
        (payload) => {
          // Only update the prayer data directly from the payload
          // without fetching again to avoid race conditions
          if (payload.new) {
            setPrayers((currentPrayers) =>
              currentPrayers.map((prayer) =>
                prayer.id === payload.new.id
                  ? {
                      ...prayer,
                      ...payload.new,
                      comments: payload.new.comment_count || 0,
                    }
                  : prayer
              )
            );
          }
        }
      )
      .subscribe();

    // Also subscribe to comment changes
    const commentChangesSubscription = supabase
      .channel("comment-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "prayer_comments",
        },
        (payload) => {
          // Let the prayer changes subscription handle the update
          // This prevents double-counting
          return;
        }
      )
      .subscribe();

    // Cleanup subscriptions
    return () => {
      prayerChangesSubscription.unsubscribe();
      commentChangesSubscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchInitialPrayers = async () => {
      try {
        const { data: prayers, error } = await supabase
          .from("prayers")
          .select(
            `
            *,
            profiles!prayers_user_id_fkey (
              id,
              first_name,
              last_name,
              profile_image_url
            ),
            groups!prayers_group_id_fkey (
              id,
              name
            ),
            prayer_comments:prayer_comments(count)
          `
          )
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching prayers:", error);
          return;
        }

        // Add detailed logging
        console.log("Raw Supabase response:", JSON.stringify(prayers, null, 2));
        console.log("Number of prayers returned:", prayers?.length);
        if (prayers?.[0]) {
          console.log("Sample prayer structure:", {
            id: prayers[0].id,
            title: prayers[0].title,
            commentCount: prayers[0].prayer_comments?.[0]?.count,
            profileData: prayers[0].profiles,
            groupData: prayers[0].groups,
          });
        }

        // Transform the data - Updated to correctly handle comment count
        const transformedPrayers = prayers.map((prayer) => ({
          ...prayer,
          userName:
            `${prayer.profiles.first_name} ${prayer.profiles.last_name}`.trim(),
          userImage: prayer.profiles.profile_image_url,
          date: new Date(prayer.created_at).toISOString().split("T")[0],
          comments:
            prayer.comment_count || prayer.prayer_comments[0]?.count || 0,
          groupName: prayer.groups?.name || null,
        }));

        setPrayers(transformedPrayers);
      } catch (error) {
        console.error("Error in fetchInitialPrayers:", error);
      }
    };

    fetchInitialPrayers();
  }, []);

  useEffect(() => {
    // Force an immediate refresh when component mounts
    onRefresh();
  }, []);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
        edges={["top"]}
      >
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.primary }]}>
            Tefillah
          </Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={[
                styles.notificationButton,
                { backgroundColor: `${theme.primary}10` },
              ]}
              onPress={() => setNotificationModalVisible(true)}
            >
              <Ionicons
                name="notifications-outline"
                size={24}
                color={theme.primary}
              />
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={filteredPrayers}
          renderItem={renderPrayerCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.primary}
              colors={[theme.primary]}
            />
          }
        />

        <Modal
          isVisible={isNotificationModalVisible}
          onBackdropPress={() => setNotificationModalVisible(false)}
          backdropOpacity={0.5}
          style={styles.modal}
          animationIn="slideInUp"
          animationOut="slideOutDown"
        >
          <View
            style={[styles.notificationModal, { backgroundColor: theme.card }]}
          >
            <View style={styles.notificationHeader}>
              <Text style={[styles.notificationTitle, { color: theme.text }]}>
                Notifications
              </Text>
              <TouchableOpacity
                onPress={() => setNotificationModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.notificationList}>
              {notifications.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons
                    name="notifications-outline"
                    size={48}
                    color={theme.textSecondary}
                  />
                  <Text
                    style={[styles.emptyText, { color: theme.textSecondary }]}
                  >
                    No notifications yet
                  </Text>
                </View>
              ) : (
                notifications.map((notification, index) => (
                  <View style={styles.notificationItem} key={index}>
                    <View style={styles.notificationIcon}>
                      <Ionicons name="person" size={20} color={theme.primary} />
                    </View>
                    <View style={styles.notificationContent}>
                      <Text
                        style={[styles.notificationText, { color: theme.text }]}
                      >
                        {notification.message}
                      </Text>
                      <Text style={styles.notificationTime}>
                        {notification.time}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </Modal>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "transparent",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  notificationButton: {
    padding: 8,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
    position: "relative",
  },
  searchIcon: {
    position: "absolute",
    left: 24,
    top: 10,
    zIndex: 1,
  },
  searchInput: {
    height: 40,
    borderRadius: 20,
    paddingLeft: 40,
    paddingRight: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardGradient: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  profileImageRing: {
    borderWidth: 2,
    borderColor: "#6B4EFF",
  },
  categoryTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-end",
  },
  categoryIcon: {
    marginRight: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B21A8", // purple-800
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 12,
    width: "auto", // Added to ensure it only takes needed width
  },
  footerButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    fontWeight: "500",
  },
  modal: {
    margin: 0,
    justifyContent: "flex-end",
  },
  notificationModal: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    paddingBottom: Platform.OS === "ios" ? 34 : 16,
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    padding: 4,
  },
  notificationList: {
    padding: 16,
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationText: {
    fontSize: 14,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: "#6B7280",
  },
  tagsContainer: {
    flexDirection: "column",
    gap: 8,
    alignItems: "flex-end",
    maxWidth: "60%",
  },
  groupTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 8,
  },
});
