import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePrayers } from "../context/PrayerContext";
import { useGroups } from "../context/GroupContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function GroupDetailScreen({ route, navigation }) {
  const { theme } = useTheme();
  const { group } = route.params;
  const { getGroupPrayers } = usePrayers();
  const { deleteGroup } = useGroups();

  useEffect(() => {
    console.log("=== Group Detail Screen ===");
    console.log("Group:", JSON.stringify(group, null, 2));
    console.log("Is admin?", group.isAdmin);
    console.log("========================");
  }, [group]);

  const groupPrayers = group?.id ? getGroupPrayers(group.id) : [];

  const handleDeleteGroup = () => {
    Alert.alert(
      "Delete Group",
      "Are you sure you want to delete this group? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await deleteGroup(group.id);
              if (error) {
                Alert.alert(
                  "Error",
                  "Could not delete group. Please try again."
                );
                return;
              }
              navigation.reset({
                index: 0,
                routes: [{ name: "MainTabs", params: { screen: "Groups" } }],
              });
            } catch (error) {
              Alert.alert(
                "Error",
                "An unexpected error occurred. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  console.log("Group:", group);
  console.log("Group ID:", group?.id);
  console.log("Group Prayers:", groupPrayers);

  const renderPrayerItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("PrayerDetail", { prayerId: item.id })}
    >
      <LinearGradient
        colors={[theme.card, "#F8F7FF"]}
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
          <LinearGradient
            colors={
              theme.dark ? ["#581C87", "#1E3A8A"] : ["#E9D5FF", "#BFDBFE"]
            }
            style={styles.categoryTag}
          >
            <Ionicons
              name="bookmark"
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
        </View>

        <Text style={[styles.description, { color: theme.text }]}>
          {item.description}
        </Text>

        <View
          style={[
            styles.cardFooter,
            { backgroundColor: `${theme.background}50` },
          ]}
        >
          <TouchableOpacity style={styles.footerButton}>
            <Ionicons
              name="chatbubble-outline"
              size={16}
              color={theme.primary}
            />
            <Text style={[styles.footerText, { color: theme.primary }]}>
              {item.comments} Comments
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerButton}>
            <Ionicons name="refresh-outline" size={16} color={theme.primary} />
            <Text style={[styles.footerText, { color: theme.primary }]}>
              {item.updates} Updates
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={styles.content}>
        <View style={[styles.groupInfo, { backgroundColor: theme.card }]}>
          <Image
            source={{
              uri: group.image_url || "https://via.placeholder.com/150",
            }}
            style={styles.groupImage}
          />
          <Text style={[styles.groupName, { color: theme.text }]}>
            {group.name}
          </Text>
          <Text
            style={[styles.groupDescription, { color: theme.textSecondary }]}
          >
            {group.description}
          </Text>

          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.primary }]}>
                {group.memberCount || 0}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Members
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.primary }]}>
                {groupPrayers?.length || 0}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Prayers
              </Text>
            </View>
          </View>

          {group.isAdmin && (
            <TouchableOpacity
              style={[
                styles.deleteButton,
                { backgroundColor: `${theme.error}15` },
              ]}
              onPress={handleDeleteGroup}
            >
              <Ionicons name="trash-outline" size={24} color={theme.error} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.prayersSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Prayer Requests
          </Text>
          <FlatList
            data={groupPrayers}
            renderItem={renderPrayerItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No prayers in this group yet
              </Text>
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  groupInfo: {
    padding: 20,
    alignItems: "center",
    borderRadius: 12,
    margin: 16,
    marginTop: 0,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  groupImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#6B4EFF",
    marginBottom: 12,
  },
  groupName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  groupDescription: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 16,
    gap: 32,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "600",
  },
  statLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  deleteButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  prayersSection: {
    flex: 1,
    padding: 16,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    width: "100%",
  },
  cardGradient: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
    flexWrap: "nowrap",
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
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
  categoryTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryIcon: {
    marginRight: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 8,
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
  list: {
    paddingBottom: 16,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    marginTop: 24,
  },
});
