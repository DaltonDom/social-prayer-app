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

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <FlatList
        data={prayers}
        renderItem={renderPrayerItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  prayerCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  prayerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  prayerTitleRow: {
    flex: 1,
    flexDirection: "column",
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
  },
  prayerTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  prayerDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  prayerStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
  },
  statsText: {
    fontSize: 14,
  },
  deleteButton: {
    padding: 4,
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
