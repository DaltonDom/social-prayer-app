import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
  Platform,
  RefreshControl,
} from "react-native";
import { usePrayers } from "../context/PrayerContext";
import { useTheme } from "../context/ThemeContext";
import Ionicons from "react-native-vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen({ navigation }) {
  const { prayers, fetchPrayers } = usePrayers();
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchPrayers();
    } catch (error) {
      console.error("Error refreshing prayers:", error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchPrayers]);

  const renderPrayerCard = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.card }]}
      onPress={() => navigation.navigate("PrayerDetail", { prayerId: item.id })}
    >
      <View style={styles.cardHeader}>
        <Image source={{ uri: item.userImage }} style={styles.profileImage} />
        <View style={styles.headerText}>
          <Text style={[styles.userName, { color: theme.text }]}>
            {item.userName}
          </Text>
          <Text style={[styles.date, { color: theme.textSecondary }]}>
            {item.date}
          </Text>
        </View>
      </View>
      <View style={styles.titleContainer}>
        <View
          style={[
            styles.categoryTag,
            { backgroundColor: `${theme.primary}10` },
          ]}
        >
          <Ionicons
            name={getCategoryIcon(item.category)}
            size={16}
            color={theme.primary}
          />
        </View>
        <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
        {item.groupName && (
          <View
            style={[
              styles.tag,
              styles.groupTag,
              {
                backgroundColor: "#F2EEFF",
                borderColor: "#6B4EFF",
              },
            ]}
          >
            <Text style={[styles.tagText, { color: "#6B4EFF" }]}>
              {item.groupName}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.tagsContainer}>
        {/* Group tag moved to title container */}
      </View>
      <Text style={[styles.description, { color: theme.text }]}>
        {item.description}
      </Text>
      <View style={[styles.cardFooter, { borderTopColor: theme.border }]}>
        <Text style={[styles.footerText, { color: theme.textSecondary }]}>
          {item.comments} Comments
        </Text>
        <Text style={[styles.footerText, { color: theme.textSecondary }]}>
          {item.updates} Updates
        </Text>
      </View>
    </TouchableOpacity>
  );

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

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={["top"]}
    >
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.background,
            borderBottomColor: theme.border,
          },
        ]}
      >
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Tefillah
        </Text>
        <TouchableOpacity
          style={[
            styles.notificationButton,
            {
              backgroundColor: `${theme.primary}10`,
              borderRadius: 20,
            },
          ]}
          onPress={() => {
            console.log("Navigating to Notifications");
            navigation.navigate("Notifications");
          }}
        >
          <Ionicons name="notifications-outline" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={prayers}
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
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: Platform.OS === "ios" ? "Helvetica Neue" : "sans-serif-medium",
  },
  notificationButton: {
    padding: 8,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  date: {
    fontSize: 12,
    color: "#666",
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 12,
  },
  footerText: {
    fontSize: 12,
    color: "#666",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  categoryTag: {
    alignItems: "center",
    justifyContent: "center",
    padding: 6,
    borderRadius: 12,
    aspectRatio: 1,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  groupTag: {
    borderStyle: "dashed",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 60,
    alignItems: "center",
  },
  tagText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
