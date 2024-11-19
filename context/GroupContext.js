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
  const fetchGroups = async () => {
    try {
      console.log("Fetching groups for user:", userProfile?.id);

      // First fetch all groups with creator profiles
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

      console.log("Fetched groups:", groupsData);

      // Then fetch group members with specific foreign key relationship
      const { data: membersData, error: membersError } = await supabase.from(
        "group_members"
      ).select(`
          *,
          profiles!group_members_user_id_fkey (
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

      // Transform and combine the data
      const transformedGroups = groupsData.map((group) => {
        const groupMembers =
          membersData?.filter((member) => member.group_id === group.id) || [];

        const membersList = groupMembers.map((member) => ({
          id: member.profiles.id,
          name: `${member.profiles.first_name} ${member.profiles.last_name}`.trim(),
          profileImage:
            member.profiles.profile_image_url ||
            "https://via.placeholder.com/150",
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

      console.log("Transformed groups:", transformedGroups);

      setGroups(transformedGroups);
      setMyGroups(
        transformedGroups.filter((group) => group.isMember || group.isAdmin)
      );
    } catch (error) {
      console.error("Error in fetchGroups:", error);
    } finally {
      setLoading(false);
    }
  };

  // Create a new group
  const createGroup = async ({ name, description, imageUrl }) => {
    try {
      // Create the group
      const { data: groupData, error: groupError } = await supabase
        .from("groups")
        .insert([
          {
            name,
            description,
            created_by: userProfile.id,
            image_url: imageUrl || "https://via.placeholder.com/150",
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

      // Add creator as admin member
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

      // Refresh groups to get updated list
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

  // Add this new function
  const addGroup = async ({ name, description, imageUrl }) => {
    try {
      // Create the group
      const { data: groupData, error: groupError } = await supabase
        .from("groups")
        .insert([
          {
            name,
            description,
            created_by: userProfile.id,
            image_url: imageUrl || "https://via.placeholder.com/150",
          },
        ])
        .select(
          `
          *,
          profiles!fk_groups_created_by (
            id,
            first_name,
            last_name,
            profile_image_url
          )
        `
        )
        .single();

      if (groupError) throw groupError;

      // Add creator as admin member
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

      // Refresh groups to get updated list
      await fetchGroups();

      return { data: groupData, error: null };
    } catch (error) {
      console.error("Error adding group:", error.message);
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
        addGroup,
      }}
    >
      {children}
    </GroupContext.Provider>
  );
}

export function useGroups() {
  return useContext(GroupContext);
}
