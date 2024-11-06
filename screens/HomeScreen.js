import React from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
} from "react-native";
import { usePrayers } from "../context/PrayerContext";
import { useTheme } from "../context/ThemeContext";
import Ionicons from "react-native-vector-icons/Ionicons";

export default function HomeScreen({ navigation }) {
  const { prayers } = usePrayers();
  const { theme } = useTheme();

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
      </View>
      <View style={styles.tagsContainer}>
        {item.groupName && (
          <View
            style={[
              styles.tag,
              styles.groupTag,
              { backgroundColor: `${theme.primary}15` },
            ]}
          >
            <Ionicons name="people" size={14} color={theme.primary} />
            <Text style={[styles.tagText, { color: theme.primary }]}>
              {item.groupName}
            </Text>
          </View>
        )}
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
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={prayers}
        renderItem={renderPrayerCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
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
    borderColor: "#6B4EFF30",
  },
  tagText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
