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
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGroups } from "../context/GroupContext";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useUser } from "../context/UserContext";

export default function GroupsScreen({ navigation }) {
  const { theme, isDarkMode } = useTheme();
  const { groups, refreshGroups } = useGroups();
  const { user, userProfile } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredGroups, setFilteredGroups] = useState(groups);
  const [pendingGroups, setPendingGroups] = useState([]);

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

  const handleJoinGroup = (groupId) => {
    setPendingGroups([...pendingGroups, groupId]);
  };

  const renderGroupCard = ({ item }) => {
    const isPending = pendingGroups.includes(item.id);
    const isMember = Boolean(
      item.membersList?.some((member) => member.id === userProfile?.id) ||
        item.created_by === userProfile?.id
    );

    const getButtonConfig = (isPending, isMember) => {
      if (isMember) {
        return {
          colors: ["#86EFAC", "#22C55E"],
          icon: "checkmark-circle-outline",
          text: "",
          textColor: "#166534",
          iconColor: "#166534",
        };
      }
      if (isPending) {
        return {
          colors: ["#FEF3C7", "#FCD34D"],
          icon: "hourglass-outline",
          text: "Pending",
          textColor: "#92400E",
          iconColor: "#92400E",
        };
      }
      return {
        colors: theme.dark ? ["#581C87", "#1E3A8A"] : ["#E9D5FF", "#BFDBFE"],
        icon: "person-add-outline",
        text: "Join",
        textColor: theme.dark ? "#E9D5FF" : "#6B21A8",
        iconColor: theme.dark ? "#E9D5FF" : "#6B21A8",
      };
    };

    const buttonConfig = getButtonConfig(isPending, isMember);

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: theme.card }]}
        onPress={() => {
          if (isMember) {
            navigation.navigate("GroupDetail", {
              group: {
                ...item,
                isAdmin: item.created_by === userProfile?.id,
              },
            });
          }
        }}
        disabled={!isMember}
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
            <TouchableOpacity
              onPress={() => !isMember && handleJoinGroup(item.id)}
              disabled={isPending || isMember}
            >
              <LinearGradient
                colors={buttonConfig.colors}
                style={[styles.statBadge, isMember && styles.memberBadge]}
              >
                <Ionicons
                  name={buttonConfig.icon}
                  size={isMember ? 20 : 16}
                  color={buttonConfig.iconColor}
                />
                {buttonConfig.text && (
                  <Text
                    style={[styles.statText, { color: buttonConfig.textColor }]}
                  >
                    {buttonConfig.text}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (!userProfile) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </SafeAreaView>
    );
  }

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
        <TouchableOpacity onPress={handleAddGroup}>
          <LinearGradient
            colors={
              theme.dark ? ["#581C87", "#1E3A8A"] : ["#E9D5FF", "#BFDBFE"]
            }
            style={styles.addButton}
          >
            <Ionicons
              name="add"
              size={24}
              color={theme.dark ? "#E9D5FF" : "#6B21A8"}
            />
          </LinearGradient>
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
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
