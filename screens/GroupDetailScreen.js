import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  Alert,
  Platform,
  TextInput,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePrayers } from "../context/PrayerContext";
import { useGroups } from "../context/GroupContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Modal from "react-native-modal";
import { supabase } from "../lib/supabase";

export default function GroupDetailScreen({ route, navigation }) {
  const { theme } = useTheme();
  const { group } = route.params;
  const { getGroupPrayers } = usePrayers();
  const { deleteGroup } = useGroups();
  const [isRequestModalVisible, setRequestModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(group.name);
  const [editedDescription, setEditedDescription] = useState(group.description);
  const [membershipRequests, setMembershipRequests] = useState([]);

  useEffect(() => {
    console.log("=== Group Detail Screen ===");
    console.log("Group:", JSON.stringify(group, null, 2));
    console.log("Is admin?", group.isAdmin);
    console.log("========================");
  }, [group]);

  useEffect(() => {
    if (group?.id) {
      fetchMembershipRequests();
    }
  }, [group?.id]);

  const fetchMembershipRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("group_requests")
        .select(
          `
          id,
          created_at,
          profiles:user_id (
            id,
            first_name,
            last_name,
            profile_image_url
          )
        `
        )
        .eq("group_id", group.id)
        .eq("status", "pending");

      if (error) throw error;
      setMembershipRequests(
        data.map((request) => ({
          id: request.id,
          name: `${request.profiles.first_name || ""} ${
            request.profiles.last_name || ""
          }`.trim(),
          image:
            request.profiles.profile_image_url ||
            "https://via.placeholder.com/40",
          userId: request.profiles.id,
        }))
      );
    } catch (error) {
      console.error("Error fetching membership requests:", error);
      Alert.alert("Error", "Failed to load membership requests");
    }
  };

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

  const handleAddPrayer = () => {
    navigation.navigate("AddGroupPrayer", {
      groupId: group.id,
      groupName: group.name,
    });
  };

  const handleViewMembers = () => {
    navigation.navigate("GroupMembers", {
      groupId: group.id,
      groupName: group.name,
    });
  };

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

  const handleAcceptRequest = async (requestId) => {
    try {
      // Update the request status
      const { error: requestError } = await supabase
        .from("group_requests")
        .update({ status: "accepted" })
        .eq("id", requestId);

      if (requestError) throw requestError;

      // Add the user to group_members
      const request = membershipRequests.find((r) => r.id === requestId);
      const { error: memberError } = await supabase
        .from("group_members")
        .insert({
          group_id: group.id,
          user_id: request.userId,
          role: "member",
        });

      if (memberError) throw memberError;

      // Fetch updated group details including new member count
      const { data: updatedGroup, error: groupError } = await supabase
        .from("groups")
        .select("*, group_members(count)")
        .eq("id", group.id)
        .single();

      if (groupError) throw groupError;

      // Update the local group state with new member count
      navigation.setParams({
        group: {
          ...group,
          memberCount: updatedGroup.group_members[0].count,
        },
      });

      // Refresh the requests list
      fetchMembershipRequests();
    } catch (error) {
      console.error("Error accepting request:", error);
      Alert.alert("Error", "Failed to accept request");
    }
  };

  const handleDeclineRequest = (requestId) => {
    // Implement decline logic
    console.log("Declined request:", requestId);
  };

  const handleSaveChanges = async () => {
    try {
      // Implement your update logic here
      // const { error } = await updateGroup(group.id, {
      //   name: editedName,
      //   description: editedDescription,
      // });

      // if (error) throw error;
      setIsEditing(false);
      // You might want to refresh the group data here
    } catch (error) {
      Alert.alert("Error", "Failed to update group details");
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={styles.content}>
        <View style={[styles.groupInfo, { backgroundColor: theme.card }]}>
          <TouchableOpacity
            style={styles.imageContainer}
            onPress={() =>
              group.isAdmin &&
              Alert.alert("Coming soon", "Image upload functionality")
            }
          >
            <Image
              source={{
                uri: group.image_url || "https://via.placeholder.com/150",
              }}
              style={styles.groupImage}
            />
            {group.isAdmin && (
              <View style={styles.editImageOverlay}>
                <Ionicons name="camera" size={20} color="white" />
              </View>
            )}
          </TouchableOpacity>

          {isEditing ? (
            <TextInput
              value={editedName}
              onChangeText={setEditedName}
              style={[styles.editInput, { color: theme.text }]}
              placeholder="Group Name"
            />
          ) : (
            <Text style={[styles.groupName, { color: theme.text }]}>
              {group.name}
            </Text>
          )}

          {isEditing ? (
            <TextInput
              value={editedDescription}
              onChangeText={setEditedDescription}
              style={[
                styles.editInput,
                styles.descriptionInput,
                { color: theme.text },
              ]}
              placeholder="Group Description"
              multiline
            />
          ) : (
            <Text
              style={[styles.groupDescription, { color: theme.textSecondary }]}
            >
              {group.description}
            </Text>
          )}

          {group.isAdmin && (
            <>
              <TouchableOpacity
                style={[
                  styles.editButton,
                  { backgroundColor: `${theme.primary}15` },
                ]}
                onPress={() => setIsEditing(!isEditing)}
              >
                <Ionicons
                  name={isEditing ? "checkmark" : "pencil"}
                  size={20}
                  color={theme.primary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.deleteButton,
                  { backgroundColor: `${theme.error}15` },
                ]}
                onPress={handleDeleteGroup}
              >
                <Ionicons name="trash-outline" size={24} color={theme.error} />
              </TouchableOpacity>
            </>
          )}

          <View style={styles.stats}>
            <TouchableOpacity
              style={styles.statItem}
              onPress={handleViewMembers}
            >
              <Text style={[styles.statNumber, { color: theme.primary }]}>
                {group.memberCount || 0}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Members
              </Text>
            </TouchableOpacity>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.primary }]}>
                {groupPrayers?.length || 0}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Prayers
              </Text>
            </View>
          </View>
        </View>

        {group.isAdmin && (
          <TouchableOpacity
            style={[styles.requestsCard, { backgroundColor: theme.card }]}
            onPress={() => setRequestModalVisible(true)}
          >
            <View style={styles.requestsHeader}>
              <Text style={[styles.requestsTitle, { color: theme.text }]}>
                Membership Requests
              </Text>
              <View style={styles.requestsBadge}>
                <Text style={styles.requestsBadgeText}>
                  {membershipRequests.length}
                </Text>
              </View>
            </View>
            <Text
              style={[styles.requestsSubtitle, { color: theme.textSecondary }]}
            >
              Tap to review pending requests
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.prayersSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Prayer Requests
            </Text>
            <TouchableOpacity onPress={handleAddPrayer}>
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

        <Modal
          isVisible={isRequestModalVisible}
          onBackdropPress={() => setRequestModalVisible(false)}
          style={styles.modal}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Membership Requests
              </Text>
              <TouchableOpacity onPress={() => setRequestModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={membershipRequests}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.requestItem}>
                  <View style={styles.requestInfo}>
                    <Image
                      source={{ uri: item.image }}
                      style={styles.requestImage}
                    />
                    <Text style={[styles.requestName, { color: theme.text }]}>
                      {item.name}
                    </Text>
                  </View>
                  <View style={styles.requestActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.acceptButton]}
                      onPress={() => handleAcceptRequest(item.id)}
                    >
                      <Text style={styles.actionButtonText}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.declineButton]}
                      onPress={() => handleDeclineRequest(item.id)}
                    >
                      <Text
                        style={[
                          styles.actionButtonText,
                          { color: theme.error },
                        ]}
                      >
                        Decline
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <Text
                  style={[styles.emptyText, { color: theme.textSecondary }]}
                >
                  No pending requests
                </Text>
              }
            />
          </View>
        </Modal>
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
    padding: 16,
    alignItems: "center",
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: -12,
    marginBottom: 16,
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
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#6B4EFF",
    marginBottom: 8,
  },
  groupName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 6,
  },
  groupDescription: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 12,
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 12,
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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
  requestsCard: {
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  requestsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  requestsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  requestsBadge: {
    backgroundColor: "#6B4EFF",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  requestsBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  requestsSubtitle: {
    fontSize: 14,
  },
  modal: {
    margin: 0,
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 24,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  requestItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  requestInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  requestImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  requestName: {
    fontSize: 16,
    fontWeight: "500",
  },
  requestActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  acceptButton: {
    backgroundColor: "#6B4EFF",
    borderColor: "#6B4EFF",
  },
  declineButton: {
    borderColor: "#FF4444",
    backgroundColor: "transparent",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "white",
  },
  imageContainer: {
    position: "relative",
    marginBottom: 8,
  },
  editImageOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 12,
    padding: 4,
  },
  editButton: {
    position: "absolute",
    top: 12,
    left: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  editInput: {
    fontSize: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    width: "100%",
    marginBottom: 8,
  },
  descriptionInput: {
    height: 80,
    textAlignVertical: "top",
  },
});
