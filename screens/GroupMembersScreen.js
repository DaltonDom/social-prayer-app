import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { useGroups } from "../context/GroupContext";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { useFriendships } from "../context/FriendshipContext";
import { Menu } from "react-native-paper";

export default function GroupMembersScreen({ route, navigation }) {
  const { theme } = useTheme();
  const { groupId, groupName } = route.params;
  const [members, setMembers] = React.useState([]);
  const [currentUserId, setCurrentUserId] = React.useState(null);
  const { friendships, pendingFriendships } = useFriendships();
  const [menuVisible, setMenuVisible] = React.useState(null);
  const [isCurrentUserAdmin, setIsCurrentUserAdmin] = React.useState(false);

  React.useEffect(() => {
    getCurrentUser();
    fetchGroupMembers();
  }, [groupId]);

  React.useEffect(() => {
    checkCurrentUserAdminStatus();
  }, [members, currentUserId]);

  const getCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setCurrentUserId(user?.id);
  };

  const fetchGroupMembers = async () => {
    try {
      console.log("Fetching members for group:", groupId);

      // First, let's check if the group exists
      const { data: groupData, error: groupError } = await supabase
        .from("groups")
        .select("*")
        .eq("id", groupId)
        .single();

      console.log("Group data:", groupData);

      const { data, error } = await supabase
        .from("group_members")
        .select(
          `
          *,
          profiles:user_id (
            id,
            first_name,
            last_name,
            profile_image_url
          )
        `
        )
        .eq("group_id", groupId);

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      console.log("Raw data from supabase:", data);

      if (!data || data.length === 0) {
        console.log("No members found in database for this group");
        return;
      }

      const formattedMembers = data.map((member) => ({
        id: member.profiles.id,
        name: `${member.profiles.first_name || ""} ${
          member.profiles.last_name || ""
        }`.trim(),
        image_url: member.profiles.profile_image_url,
        isAdmin: member.role === "admin",
      }));

      console.log("Formatted members:", formattedMembers);
      console.log("Current user ID:", currentUserId);

      const sortedMembers = formattedMembers.sort((a, b) => {
        if (a.id === currentUserId) return -1;
        if (b.id === currentUserId) return 1;

        if (a.isAdmin && !b.isAdmin) return -1;
        if (!a.isAdmin && b.isAdmin) return 1;

        return 0;
      });

      console.log("Sorted members:", sortedMembers);
      setMembers(sortedMembers);
    } catch (error) {
      console.error("Error fetching group members:", error.message);
    }
  };

  const checkCurrentUserAdminStatus = () => {
    const currentUserMember = members.find(
      (member) => member.id === currentUserId
    );
    setIsCurrentUserAdmin(currentUserMember?.isAdmin || false);
  };

  const handleTransferAdmin = async (newAdminId) => {
    try {
      // Start a transaction using RPC for atomicity
      const { data, error } = await supabase.rpc("transfer_group_admin", {
        p_group_id: groupId,
        p_old_admin_id: currentUserId,
        p_new_admin_id: newAdminId,
      });

      if (error) throw error;

      // Refresh the members list
      await fetchGroupMembers();

      // Update local state immediately
      setMembers((prevMembers) =>
        prevMembers.map((member) => ({
          ...member,
          isAdmin: member.id === newAdminId,
        }))
      );

      setIsCurrentUserAdmin(false);
      setMenuVisible(null);

      // Navigate back to refresh the group detail screen
      navigation.goBack();
    } catch (error) {
      console.error("Error transferring admin role:", error);
      Alert.alert("Error", "Failed to transfer admin role. Please try again.");
    }
  };

  const renderMember = ({ item }) => {
    const isCurrentUser = item.id === currentUserId;
    const isFriend = friendships.some(
      (friendship) =>
        friendship.friend_id === item.id || friendship.user_id === item.id
    );
    const isPending = pendingFriendships.some(
      (request) =>
        request.receiver_id === item.id || request.sender_id === item.id
    );

    const MemberContent = () => (
      <View style={[styles.memberCard, { backgroundColor: theme.card }]}>
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

        {!isCurrentUser && (
          <View style={styles.actionContainer}>
            {isFriend ? (
              <Ionicons name="checkmark-circle" size={24} color="green" />
            ) : isPending ? (
              <Ionicons name="time" size={24} color={theme.textSecondary} />
            ) : (
              <TouchableOpacity
                onPress={() => handleSendFriendRequest(item.id)}
                style={styles.addButton}
              >
                <Ionicons name="person-add" size={24} color={theme.primary} />
              </TouchableOpacity>
            )}
          </View>
        )}

        {isCurrentUserAdmin && !item.isAdmin && item.id !== currentUserId && (
          <Menu
            visible={menuVisible === item.id}
            onDismiss={() => setMenuVisible(null)}
            anchor={
              <TouchableOpacity onPress={() => setMenuVisible(item.id)}>
                <Ionicons
                  name="ellipsis-vertical"
                  size={24}
                  color={theme.textSecondary}
                />
              </TouchableOpacity>
            }
          >
            <Menu.Item
              onPress={() => handleTransferAdmin(item.id)}
              title="Transfer Admin Role"
            />
          </Menu>
        )}
      </View>
    );

    if (isCurrentUser) {
      return <MemberContent />;
    }

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate("UserProfile", { userId: item.id })}
      >
        <MemberContent />
      </TouchableOpacity>
    );
  };

  const handleSendFriendRequest = async (receiverId) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data, error } = await supabase.from("friend_requests").insert([
        {
          sender_id: user.id,
          receiver_id: receiverId,
        },
      ]);

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      console.log("Friend request sent successfully");
    } catch (error) {
      console.error("Error sending friend request:", error.message);
    }
  };

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
  actionContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
