import React from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "react-native";
import { supabase } from "../lib/supabase";

const getCategoryIcon = (category) => {
  switch (category) {
    case "Health":
      return "fitness";
    case "Family":
      return "home";
    case "Work":
      return "briefcase";
    default:
      return "help-circle";
  }
};

export default function MyPrayersScreen({ route, navigation }) {
  const { prayers = [] } = route?.params || {};
  const { theme } = useTheme();

  if (!prayers || prayers.length === 0) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.text }]}>
            No prayers found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderPrayerItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={async () => {
        try {
          const { data: prayerData, error } = await supabase
            .from("prayers")
            .select(
              `
              *,
              prayer_comments(*)
            `
            )
            .eq("id", item.id)
            .single();

          if (error) throw error;

          console.log("Raw prayer data:", prayerData);

          // Create a new object with guaranteed structure
          const formattedPrayer = {
            ...prayerData,
            // Handle the JSONB updates field correctly
            updates_list: prayerData.updates || [],
            updates: prayerData.updates?.length || 0,
            prayer_comments: prayerData.prayer_comments || [],
            id: prayerData.id,
            title: prayerData.title || "",
            description: prayerData.description || "",
            category: prayerData.category || "",
            date: item.date || "",
            userName: item.userName || "",
            userImage: item.userImage || "",
            comments: prayerData.comment_count || 0,
            groups: item.groups || null,
            prayer_count: prayerData.prayer_count || 0,
            user_id: prayerData.user_id,
            is_private: prayerData.is_private || false,
          };

          console.log("Formatted prayer:", formattedPrayer);

          navigation.navigate("PrayerDetail", {
            prayerId: item.id,
            prayer: formattedPrayer,
          });
        } catch (error) {
          console.error("Error fetching prayer details:", error);
          console.error("Error stack:", error.stack);
        }
      }}
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
                  {typeof item.groups === "string"
                    ? item.groups
                    : item.groups.name}
                </Text>
              </LinearGradient>
            )}
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
              alignSelf: "flex-start",
              borderRadius: 16,
              marginTop: 12,
              marginLeft: "auto",
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

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={["bottom"]}
    >
      <FlatList
        data={prayers}
        renderItem={renderPrayerItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 0,
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
    flexShrink: 1,
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
  headerText: {
    flex: 1,
    marginRight: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
  },
  date: {
    fontSize: 12,
  },
  tagsContainer: {
    flexDirection: "column",
    gap: 8,
    alignItems: "flex-end",
    maxWidth: "50%",
    flexShrink: 1,
  },
  categoryTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 16,
    maxWidth: "100%",
    flexShrink: 1,
  },
  groupTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 16,
    maxWidth: "100%",
    flexShrink: 1,
  },
  categoryIcon: {
    marginRight: 4,
    flexShrink: 0,
    width: 14,
    height: 14,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    flexShrink: 1,
    flexWrap: "wrap",
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 12,
    width: "auto",
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
});
