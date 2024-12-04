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
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

export default function GroupsScreen({ navigation }) {
  const { theme, isDarkMode } = useTheme();
  const { groups, refreshGroups } = useGroups();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredGroups, setFilteredGroups] = useState(groups);

  useFocusEffect(
    React.useCallback(() => {
      refreshGroups(true); // Skip refresh if we already have data
    }, [refreshGroups])
  );

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

  const renderGroupCard = ({ item }) => {
    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: theme.card }]}
        onPress={() => {
          const groupData = {
            id: item.id,
            name: item.name,
            description: item.description,
            image_url: item.image_url,
            memberCount: item.memberCount,
            membersList: item.membersList,
            isAdmin: item.isAdmin,
            created_by: item.created_by,
          };
          navigation.navigate("GroupDetail", {
            group: groupData,
          });
        }}
      >
        <View style={styles.cardHeader}>
          <Image
            source={{
              uri: item.image_url || "https://via.placeholder.com/150",
            }}
            style={styles.groupLogo}
          />
          <View style={styles.headerInfo}>
            <Text style={[styles.groupName, { color: theme.text }]}>
              {item.name}
            </Text>
            <Text style={[styles.memberCount, { color: theme.textSecondary }]}>
              {item.memberCount || 0} members
            </Text>
          </View>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <LinearGradient
                colors={
                  theme.dark ? ["#581C87", "#1E3A8A"] : ["#E9D5FF", "#BFDBFE"]
                }
                style={styles.statBadge}
              >
                <Ionicons
                  name="add"
                  size={16}
                  color={theme.dark ? "#E9D5FF" : "#6B21A8"}
                />
                <Text
                  style={[
                    styles.statText,
                    { color: theme.dark ? "#E9D5FF" : "#6B21A8" },
                  ]}
                >
                  Join
                </Text>
              </LinearGradient>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={["right", "left"]}
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
  },
  groupLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
    justifyContent: "center",
  },
  groupName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  memberCount: {
    fontSize: 14,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
    color: "#666",
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
  statsContainer: {
    flexDirection: "column",
    justifyContent: "center",
    gap: 4,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  statText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
