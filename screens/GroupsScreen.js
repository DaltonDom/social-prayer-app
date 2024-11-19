import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGroups } from "../context/GroupContext";

export default function GroupsScreen({ navigation }) {
  const { theme, isDarkMode } = useTheme();
  const { groups } = useGroups();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredGroups, setFilteredGroups] = useState(groups);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = groups.filter(
      (group) =>
        group.name.toLowerCase().includes(query) ||
        group.description.toLowerCase().includes(query)
    );
    setFilteredGroups(filtered);
  }, [searchQuery, groups]);

  const handleAddGroup = () => {
    navigation.navigate("CreateGroup");
  };

  const renderGroupCard = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.card }]}
      onPress={() =>
        navigation.navigate("GroupDetail", {
          group: {
            id: item.id,
            name: item.name,
            description: item.description,
            image_url: item.image_url,
            memberCount: item.memberCount,
            membersList: item.membersList,
          },
        })
      }
    >
      <View style={styles.cardHeader}>
        <Image source={{ uri: item.logo }} style={styles.groupLogo} />
        <View style={styles.headerText}>
          <Text style={[styles.groupName, { color: theme.text }]}>
            {item.name}
          </Text>
          <Text style={[styles.memberCount, { color: theme.textSecondary }]}>
            {item.members} members
          </Text>
        </View>
      </View>
      <Text style={[styles.description, { color: theme.text }]}>
        {item.description}
      </Text>
      <View style={[styles.cardFooter, { borderTopColor: theme.border }]}>
        <View style={styles.footerItem}>
          <Ionicons name="time-outline" size={16} color={theme.textSecondary} />
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            {item.lastActive}
          </Text>
        </View>
        <View style={styles.footerItem}>
          <Ionicons
            name="heart-outline"
            size={16}
            color={theme.textSecondary}
          />
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            {item.prayerCount} prayers
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={["right", "left", "bottom"]}
    >
      <View
        style={[
          styles.header,
          { backgroundColor: theme.card, borderBottomColor: theme.border },
        ]}
      >
        <View
          style={[styles.searchContainer, { backgroundColor: theme.searchBg }]}
        >
          <Ionicons
            name="search"
            size={20}
            color={theme.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search groups..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            keyboardAppearance={isDarkMode ? "dark" : "light"}
          />
        </View>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          onPress={handleAddGroup}
        >
          <Ionicons name="add" size={24} color={theme.card} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={filteredGroups}
        renderItem={renderGroupCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
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
    flexDirection: "row",
    padding: 16,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    alignItems: "center",
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#6B4EFF",
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
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  groupLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  groupName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  memberCount: {
    fontSize: 14,
    color: "#666",
  },
  description: {
    fontSize: 14,
    color: "#333",
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
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
});
