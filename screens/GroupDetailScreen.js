import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePrayers } from "../context/PrayerContext";
import { Ionicons } from "@expo/vector-icons";

export default function GroupDetailScreen({ route, navigation }) {
  const { theme } = useTheme();
  const { group } = route.params;
  const { getGroupPrayers } = usePrayers();

  const groupPrayers = group?.id ? getGroupPrayers(group.id) : [];

  console.log("Group:", group);
  console.log("Group ID:", group?.id);
  console.log("Group Prayers:", groupPrayers);

  const renderPrayerItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.prayerCard, { backgroundColor: theme.card }]}
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
            { backgroundColor: `${theme.primary}15` },
          ]}
        >
          <Ionicons name="bookmark" size={14} color={theme.primary} />
          <Text style={[styles.categoryText, { color: theme.primary }]}>
            {item.category}
          </Text>
        </View>
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

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {/* Group Header */}
      <View style={[styles.groupHeader, { backgroundColor: theme.card }]}>
        <Image
          source={{ uri: group.image_url || "https://via.placeholder.com/150" }}
          style={styles.groupLogo}
        />
        <Text style={[styles.groupName, { color: theme.text }]}>
          {group.name}
        </Text>
        <Text style={[styles.groupDescription, { color: theme.textSecondary }]}>
          {group.description}
        </Text>

        <View style={styles.groupStats}>
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

        {/* Members List */}
        <View style={styles.membersContainer}>
          <Text style={[styles.sectionSubtitle, { color: theme.text }]}>
            Members
          </Text>
          <View style={styles.membersList}>
            {group.membersList?.map((member, index) => (
              <View key={index} style={styles.memberItem}>
                <Image
                  source={{ uri: member.profileImage }}
                  style={styles.memberAvatar}
                />
                <Text style={[styles.memberName, { color: theme.text }]}>
                  {member.name}
                </Text>
                {member.role === "admin" && (
                  <Text style={[styles.adminBadge, { color: theme.primary }]}>
                    Admin
                  </Text>
                )}
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Prayers List */}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  groupHeader: {
    padding: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  groupLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  groupName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  groupDescription: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  groupStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 14,
  },
  prayersSection: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  list: {
    paddingBottom: 16,
  },
  prayerCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
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
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 4,
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
    borderTopWidth: 1,
    paddingTop: 12,
  },
  footerText: {
    fontSize: 12,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    marginTop: 24,
  },
  categoriesContainer: {
    width: "100%",
    marginTop: 16,
    paddingHorizontal: 20,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  categoriesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  guidelinesContainer: {
    width: "100%",
    marginTop: 16,
    paddingHorizontal: 20,
  },
  guidelines: {
    fontSize: 14,
    lineHeight: 20,
  },
  membersContainer: {
    width: "100%",
    marginTop: 16,
    paddingHorizontal: 20,
  },
  membersList: {
    marginTop: 8,
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  memberAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  memberName: {
    fontSize: 14,
    flex: 1,
  },
  adminBadge: {
    fontSize: 12,
    fontWeight: "600",
  },
});
