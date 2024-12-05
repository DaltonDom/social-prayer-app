import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { useGroups } from "../context/GroupContext";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";

export default function GroupMembersScreen({ route, navigation }) {
  const { theme } = useTheme();
  const { groupId, groupName } = route.params;
  const [members, setMembers] = React.useState([]);

  React.useEffect(() => {
    fetchGroupMembers();
  }, [groupId]);

  const fetchGroupMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("group_members")
        .select(
          `
          user_id,
          role,
          profiles:user_id (
            id,
            first_name,
            last_name,
            profile_image_url
          )
        `
        )
        .eq("group_id", groupId);

      if (error) throw error;

      const formattedMembers = data.map((member) => ({
        id: member.profiles.id,
        name: `${member.profiles.first_name || ""} ${
          member.profiles.last_name || ""
        }`.trim(),
        image_url: member.profiles.profile_image_url,
        isAdmin: member.role === "admin",
      }));

      setMembers(formattedMembers);
    } catch (error) {
      console.error("Error fetching group members:", error);
    }
  };

  const renderMember = ({ item }) => (
    <TouchableOpacity
      style={[styles.memberCard, { backgroundColor: theme.card }]}
      onPress={() => navigation.navigate("FriendDetail", { friendId: item.id })}
    >
      <Image source={{ uri: item.image_url }} style={styles.memberImage} />
      <View style={styles.memberInfo}>
        <Text style={[styles.memberName, { color: theme.text }]}>
          {item.name}
        </Text>
        {item.isAdmin && (
          <Text style={[styles.adminBadge, { color: theme.primary }]}>
            Admin
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={24} color={theme.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={["left", "right"]}
    >
      <FlatList
        data={members}
        renderItem={renderMember}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            No members found
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 0,
  },
  list: {
    padding: 16,
  },
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  memberImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "500",
  },
  adminBadge: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    marginTop: 24,
  },
});
