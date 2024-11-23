import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useUser } from "./UserContext";

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
          isAdmin: group.created_by === userProfile?.id,
          isMember: groupMembers.some(
            (member) =>
              member.user_id === userProfile?.id && member.role === "member"
          ),
          isPending: groupMembers.some(
            (member) =>
              member.user_id === userProfile?.id && member.role === "pending"
          ),
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
      }}
    >
      {children}
    </GroupContext.Provider>
  );
}

export function useGroups() {
  return useContext(GroupContext);
}
