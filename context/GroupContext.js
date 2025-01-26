import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useUser } from "./UserContext";
import * as ImagePicker from "expo-image-picker";
import { decode } from "base64-arraybuffer";

const GroupContext = createContext({});

export function GroupProvider({ children }) {
  const [groups, setGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userProfile } = useUser();

  // Fetch all groups
  const fetchGroups = async (skipIfHasData = false) => {
    try {
      console.log("Starting fetchGroups...", {
        skipIfHasData,
        currentGroupsLength: groups.length,
      });

      if (skipIfHasData && groups.length > 0) {
        console.log("Skipping fetch due to existing data");
        return;
      }

      // First query: Get groups
      console.log("Fetching groups data...");
      const { data: groupsData, error: groupsError } = await supabase
        .from("groups")
        .select(
          `
          *,
          profiles!groups_created_by_fkey (
            id,
            first_name,
            last_name,
            profile_image_url
          )
        `
        )
        .order("created_at", { ascending: false });

      if (groupsError) {
        console.error("Groups fetch error:", groupsError);
        throw groupsError;
      }

      // Second query: Get members with correct foreign key reference
      console.log("Fetching members data...");
      const { data: membersData, error: membersError } = await supabase.from(
        "group_members"
      ).select(`
          *,
          user:user_id (
            id,
            first_name,
            last_name,
            profile_image_url
          )
        `);

      if (membersError) {
        console.error("Members fetch error:", membersError);
        throw membersError;
      }

      console.log("Transforming groups data...");
      const transformedGroups = groupsData.map((group) => {
        const groupMembers =
          membersData?.filter((member) => member.group_id === group.id) || [];

        // Find the current user's membership status
        const userMembership = groupMembers.find(
          (member) => member.user_id === userProfile?.id
        );

        const membersList = groupMembers.map((member) => ({
          id: member.user.id,
          name: `${member.user.first_name} ${member.user.last_name}`.trim(),
          profileImage:
            member.user.profile_image_url || "https://via.placeholder.com/150",
          role: member.role,
        }));

        return {
          id: group.id,
          name: group.name || "",
          description: group.description || "",
          image_url: group.image_url || "https://via.placeholder.com/150",
          created_at: group.created_at,
          created_by: group.created_by,
          creatorName: group.profiles
            ? `${group.profiles.first_name} ${group.profiles.last_name}`.trim()
            : "Unknown",
          creatorImage:
            group.profiles?.profile_image_url ||
            "https://via.placeholder.com/150",
          isAdmin:
            group.created_by === userProfile?.id ||
            userMembership?.role === "admin",
          isMember:
            userMembership?.role === "member" ||
            userMembership?.role === "admin",
          isPending: userMembership?.role === "pending",
          memberCount: membersList.length,
          membersList: membersList,
          members: membersList.map((member) => member.name).join(", "),
        };
      });

      setGroups(transformedGroups);
      setMyGroups(
        transformedGroups.filter((group) => group.isMember || group.isAdmin)
      );
    } catch (error) {
      console.error("Error in fetchGroups:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
    } finally {
      setLoading(false);
    }
  };

  // Create a new group
  const createGroup = async ({
    name,
    description,
    imageUrl,
    category,
    guidelines,
  }) => {
    try {
      const { data: groupData, error: groupError } = await supabase
        .from("groups")
        .insert([
          {
            name,
            description,
            created_by: userProfile.id,
            image_url: imageUrl || "https://via.placeholder.com/150",
            category,
            guidelines,
          },
        ])
        .select(
          `
          *,
          profiles!groups_created_by_fkey (
            id,
            first_name,
            last_name,
            profile_image_url
          )
        `
        )
        .single();

      if (groupError) throw groupError;

      const { error: memberError } = await supabase
        .from("group_members")
        .insert([
          {
            group_id: groupData.id,
            user_id: userProfile.id,
            role: "admin",
          },
        ]);

      if (memberError) throw memberError;

      await fetchGroups();

      return { data: groupData, error: null };
    } catch (error) {
      console.error("Error creating group:", error.message);
      return { data: null, error };
    }
  };

  // Request to join a group
  const requestToJoinGroup = async (groupId) => {
    try {
      const { error } = await supabase.from("group_members").insert([
        {
          group_id: groupId,
          user_id: userProfile.id,
          role: "pending",
        },
      ]);

      if (error) throw error;
      await fetchGroups();
      return { error: null };
    } catch (error) {
      console.error("Error requesting to join group:", error);
      return { error };
    }
  };

  // Approve or reject join request
  const handleJoinRequest = async (groupId, userId, approve) => {
    try {
      if (approve) {
        const { error } = await supabase
          .from("group_members")
          .update({ role: "member" })
          .match({ group_id: groupId, user_id: userId });

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("group_members")
          .delete()
          .match({ group_id: groupId, user_id: userId });

        if (error) throw error;
      }

      await fetchGroups();
      return { error: null };
    } catch (error) {
      console.error("Error handling join request:", error);
      return { error };
    }
  };

  // Leave group
  const leaveGroup = async (groupId) => {
    try {
      const { error } = await supabase
        .from("group_members")
        .delete()
        .match({ group_id: groupId, user_id: userProfile.id });

      if (error) throw error;
      await fetchGroups();
      return { error: null };
    } catch (error) {
      console.error("Error leaving group:", error);
      return { error };
    }
  };

  // Delete a group
  const deleteGroup = async (groupId) => {
    try {
      console.log("Starting delete operation for group:", groupId);

      // First verify the user has permission to delete this group
      const group = groups.find((g) => g.id === groupId);
      console.log("Group to delete:", group);
      console.log("Current user:", userProfile?.id);

      if (!group || group.created_by !== userProfile?.id) {
        console.error("Permission denied: User is not the group creator");
        return {
          error: new Error(
            "Permission denied: You can only delete groups you created"
          ),
        };
      }

      // Test query to check permissions
      console.log("Testing group access...");
      try {
        const { data: testData, error: testError } = await supabase
          .from("groups")
          .select("*")
          .eq("id", groupId)
          .single();

        console.log("Test query response:", { testData, testError });

        if (testError) {
          console.error("Permission test failed:", testError);
          return { error: testError };
        }

        if (!testData) {
          console.error("Group not found in test query");
          return { error: new Error("Group not found") };
        }

        // If we get here, we have permission to access the group
        console.log("Permission test passed, proceeding with deletion");

        // Delete the group
        console.log("Attempting to delete group record...");
        const { data: groupData, error: groupError } = await supabase
          .from("groups")
          .delete()
          .match({
            id: groupId,
            created_by: userProfile.id,
          })
          .select();

        if (groupError) {
          console.error("Error deleting group:", groupError);
          return { error: groupError };
        }

        console.log("Delete response:", { groupData, groupError });

        // Update local state
        setGroups((prev) => prev.filter((g) => g.id !== groupId));
        setMyGroups((prev) => prev.filter((g) => g.id !== groupId));

        console.log("Local state updated");
        return { error: null };
      } catch (innerError) {
        console.error("Error during test query:", innerError);
        console.error("Error details:", {
          message: innerError.message,
          code: innerError.code,
          details: innerError.details,
          hint: innerError.hint,
        });
        return { error: innerError };
      }
    } catch (error) {
      console.error("Error in deleteGroup:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      return { error };
    }
  };

  const sendJoinRequest = async (groupId) => {
    const { data, error } = await supabase
      .from("group_requests")
      .insert([
        { group_id: groupId, user_id: userProfile.id, status: "pending" },
      ]);
    return { data, error };
  };

  const getPendingRequests = async (groupId) => {
    const { data, error } = await supabase
      .from("group_requests")
      .select(
        `
        *,
        users:user_id (
          id,
          name,
          avatar_url
        )
      `
      )
      .eq("group_id", groupId)
      .eq("status", "pending");
    return { data, error };
  };

  const acceptRequest = async (requestId) => {
    // Start a transaction to update both tables
    const { data: request, error: fetchError } = await supabase
      .from("group_requests")
      .select("*")
      .eq("id", requestId)
      .single();

    if (fetchError) return { error: fetchError };

    // Add to group members and update request status
    const { error } = await supabase.rpc("accept_group_request", {
      request_id: requestId,
      group_id: request.group_id,
      user_id: request.user_id,
    });

    return { error };
  };

  const rejectRequest = async (requestId) => {
    const { error } = await supabase
      .from("group_requests")
      .update({ status: "rejected" })
      .eq("id", requestId);
    return { error };
  };

  const getGroupMembers = (groupId) => {
    // Implement this function to fetch members from your backend
    // Return an array of member objects with this structure:
    // [{ id, name, image_url, isAdmin }]

    // For now, return mock data:
    return [
      {
        id: "1",
        name: "John Doe",
        image_url: "https://via.placeholder.com/50",
        isAdmin: true,
      },
      // ... more members
    ];
  };

  const updateGroup = async (groupId, updates) => {
    try {
      const { data, error } = await supabase
        .from("groups")
        .update(updates)
        .eq("id", groupId)
        .select()
        .single();

      if (error) throw error;

      // Update the local groups state
      setGroups((prevGroups) =>
        prevGroups.map((group) =>
          group.id === groupId ? { ...group, ...updates } : group
        )
      );

      return { data, error: null };
    } catch (error) {
      console.error("Error updating group:", error);
      return { data: null, error };
    }
  };

  const uploadGroupImage = async (groupId, uri) => {
    try {
      console.log("Starting uploadGroupImage for group:", groupId);
      console.log("Image URI:", uri);

      // First fetch the image data
      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      const blob = await response.blob();
      console.log("Blob size:", blob.size);

      // Convert blob to base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64data = reader.result.split(",")[1];
          resolve(base64data);
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
      });

      const fileName = `group-${groupId}-${Date.now()}.jpg`;
      const filePath = `${fileName}`; // Simplified path

      console.log("Uploading to path:", filePath);

      // Upload to Supabase storage using base64
      const { error: uploadError } = await supabase.storage
        .from("group-images")
        .upload(filePath, decode(base64), {
          contentType: "image/jpeg",
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        console.error("Storage error:", uploadError);
        throw uploadError;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("group-images").getPublicUrl(filePath);

      if (!publicUrl) {
        throw new Error("Failed to get public URL");
      }

      console.log("Got public URL:", publicUrl);

      // Update group record with new image URL
      const { error: updateError } = await supabase
        .from("groups")
        .update({ image_url: publicUrl })
        .eq("id", groupId);

      if (updateError) {
        console.error("Update error:", updateError);
        throw updateError;
      }

      // Update local state
      setGroups((prevGroups) =>
        prevGroups.map((group) =>
          group.id === groupId ? { ...group, image_url: publicUrl } : group
        )
      );

      return { publicUrl, error: null };
    } catch (error) {
      console.error("Error in uploadGroupImage:", error);
      return { publicUrl: null, error };
    }
  };

  const refreshGroup = async (groupId) => {
    try {
      const { data: groupData, error: groupError } = await supabase
        .from("groups")
        .select(
          `
          *,
          profiles!groups_created_by_fkey (
            id,
            first_name,
            last_name,
            profile_image_url
          ),
          group_members!inner (
            user_id,
            role
          )
        `
        )
        .eq("id", groupId)
        .single();

      if (groupError) throw groupError;

      // Update groups state
      setGroups((prevGroups) =>
        prevGroups.map((group) =>
          group.id === groupId
            ? {
                ...group,
                created_by: groupData.created_by,
                isAdmin: groupData.group_members.some(
                  (m) => m.user_id === userProfile?.id && m.role === "admin"
                ),
              }
            : group
        )
      );

      return { data: groupData, error: null };
    } catch (error) {
      console.error("Error refreshing group:", error);
      return { data: null, error };
    }
  };

  useEffect(() => {
    if (userProfile) {
      fetchGroups();
    }
  }, [userProfile]);

  return (
    <GroupContext.Provider
      value={{
        groups,
        myGroups,
        loading,
        createGroup,
        requestToJoinGroup,
        handleJoinRequest,
        leaveGroup,
        refreshGroups: fetchGroups,
        deleteGroup,
        sendJoinRequest,
        getPendingRequests,
        acceptRequest,
        rejectRequest,
        getGroupMembers,
        updateGroup,
        uploadGroupImage,
        refreshGroup,
      }}
    >
      {children}
    </GroupContext.Provider>
  );
}

export function useGroups() {
  return useContext(GroupContext);
}
