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
      // First fetch all groups with creator info
      const { data: groupsData, error: groupsError } = await supabase
        .from("groups")
        .select(
          `
          *,
          creator:profiles!fk_created_by (
            id,
            first_name,
            last_name,
            profile_image_url
          )
        `
        )
        .order("created_at", { ascending: false });

      if (groupsError) throw groupsError;

      // Then fetch group members with their profiles
      const { data: membersData, error: membersError } = await supabase.from(
        "group_members"
      ).select(`
          *,
          member:profiles!fk_user_id (
            id,
            first_name,
            last_name,
            profile_image_url
          )
        `);

      if (membersError) throw membersError;

      // Transform and combine the data
      const transformedGroups = groupsData.map((group) => {
        const groupMembers = membersData.filter(
          (member) => member.group_id === group.id
        );

        // Transform members into a string array for display
        const memberNames = groupMembers.map((member) =>
          `${member.member.first_name} ${member.member.last_name}`.trim()
        );

        // Keep full member objects in a separate property
        const memberDetails = groupMembers.map((member) => ({
          id: member.member.id,
          name: `${member.member.first_name} ${member.member.last_name}`.trim(),
          profileImage: member.member.profile_image_url,
          role: member.role,
        }));

        return {
          ...group,
          creatorName:
            `${group.creator.first_name} ${group.creator.last_name}`.trim(),
          creatorImage: group.creator.profile_image_url,
          isAdmin: group.created_by === userProfile?.id,
          isMember: memberDetails.some(
            (member) =>
              member.id === userProfile?.id && member.role === "member"
          ),
          isPending: memberDetails.some(
            (member) =>
              member.id === userProfile?.id && member.role === "pending"
          ),
          memberCount: memberDetails.length,
          memberNames, // Array of strings for display
          memberDetails, // Array of objects for functionality
        };
      });

      setGroups(transformedGroups);
      setMyGroups(
        transformedGroups.filter((group) => group.isMember || group.isAdmin)
      );
    } catch (error) {
      console.error("Error fetching groups:", error);
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
          creator:profiles!fk_created_by (
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
