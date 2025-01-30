import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { supabase } from "../lib/supabase";
import { LinearGradient } from "expo-linear-gradient";

export default function UserProfileScreen({ route, navigation }) {
  const { userId } = route.params;
  const { theme } = useTheme();
  const [userProfile, setUserProfile] = useState(null);
  const [userPrayers, setUserPrayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [friendsCount, setFriendsCount] = useState(0);

  useEffect(() => {
    fetchUserProfile();
    fetchUserPrayers();
    fetchFriendsCount();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const fetchUserPrayers = async () => {
    try {
      const { data, error } = await supabase
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
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const transformedPrayers = data.map((prayer) => ({
        ...prayer,
        userName:
          `${prayer.profiles.first_name} ${prayer.profiles.last_name}`.trim(),
        userImage: prayer.profiles.profile_image_url,
        date: new Date(prayer.created_at).toISOString().split("T")[0],
        comments: prayer.prayer_comments[0]?.count || 0,
        groupName: prayer.groups?.name || null,
      }));

      setUserPrayers(transformedPrayers);
    } catch (error) {
      console.error("Error fetching user prayers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFriendsCount = async () => {
    try {
      const { count, error } = await supabase
        .from("friendships")
        .select("*", { count: "exact" })
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
        .eq("status", "accepted");

      if (error) throw error;
      setFriendsCount(count);
    } catch (error) {
      console.error("Error fetching friends count:", error);
    }
  };

  const renderPrayerCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("PrayerDetail", { prayerId: item.id })}
    >
      <LinearGradient
        colors={theme.dark ? ["#2D2D2D", "#1A1A1A"] : [theme.card, "#F8F7FF"]}
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
              <Text
                style={[
                  styles.categoryText,
                  { color: theme.dark ? "#E9D5FF" : "#6B21A8" },
                ]}
              >
                {item.category}
              </Text>
            </LinearGradient>
          </View>
        </View>

        <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>

        <View
          style={[
            styles.cardFooter,
            {
              backgroundColor: theme.dark
                ? "rgba(255, 255, 255, 0.1)"
                : `${theme.background}50`,
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

  if (isLoading || !userProfile) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={["top"]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { backgroundColor: theme.card }]}>
          <Image
            source={{ uri: userProfile.profile_image_url }}
            style={styles.profileImage}
          />
          <Text style={[styles.userName, { color: theme.text }]}>
            {`${userProfile.first_name} ${userProfile.last_name}`.trim()}
          </Text>

          <View style={styles.statsContainer}>
            <TouchableOpacity
              style={styles.statItem}
              onPress={() => navigation.navigate("UserPrayers", { userId })}
            >
              <Text style={[styles.statNumber, { color: theme.primary }]}>
                {userPrayers.length}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Prayers
              </Text>
            </TouchableOpacity>

            <View
              style={[styles.statDivider, { backgroundColor: theme.border }]}
            />

            <TouchableOpacity
              style={styles.statItem}
              onPress={() => navigation.navigate("UserFriends", { userId })}
            >
              <Text style={[styles.statNumber, { color: theme.primary }]}>
                {friendsCount}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Friends
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.prayersContainer}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Recent Prayers
          </Text>
          <FlatList
            data={userPrayers}
            renderItem={renderPrayerCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ListEmptyComponent={
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No prayers yet
              </Text>
            }
          />
        </View>
      </ScrollView>
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
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  statItem: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    marginHorizontal: 16,
  },
  prayersContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
  },
  cardGradient: {
    padding: 16,
  },
  // ... rest of the styles from HomeScreen
});
