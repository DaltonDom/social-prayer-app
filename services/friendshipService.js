import { supabase } from "../lib/supabase";

export const friendshipService = {
  getFriendshipStatuses: async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      console.log("Current user ID:", user.id);

      // Step 1: Get ALL friendships (both pending and accepted)
      const { data: friendships, error: friendshipsError } = await supabase
        .from("friendships")
        .select(
          `
          id,
          status,
          user_id,
          friend_id,
          friend:profiles!friendships_friend_id_fkey (
            id,
            first_name,
            last_name,
            profile_image_url,
            email
          ),
          user:profiles!friendships_user_id_fkey (
            id,
            first_name,
            last_name,
            profile_image_url,
            email
          )
        `
        )
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

      if (friendshipsError) throw friendshipsError;

      console.log("All friendships:", JSON.stringify(friendships, null, 2));

      // Step 2: Initialize arrays
      const friends = [];
      const pendingReceived = [];
      const pendingSent = [];
      const connectedUserIds = new Set([user.id]);

      // Step 3: Process each friendship
      friendships?.forEach((friendship) => {
        const isSender = friendship.user_id === user.id;
        const otherUser = isSender ? friendship.friend : friendship.user;

        // Add to connected users regardless of status
        connectedUserIds.add(otherUser.id);

        if (friendship.status === "accepted") {
          friends.push(otherUser);
        } else if (friendship.status === "pending") {
          if (isSender) {
            pendingSent.push({
              ...otherUser,
              friendshipId: friendship.id,
            });
          } else {
            pendingReceived.push({
              ...otherUser,
              friendshipId: friendship.id,
            });
          }
        }
      });

      // Step 4: Get available users
      const { data: allUsers, error: usersError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, profile_image_url, email");

      if (usersError) throw usersError;

      console.log("Connected User IDs:", Array.from(connectedUserIds));

      // Step 5: Filter available users
      const availableUsers = allUsers.filter(
        (profile) => !connectedUserIds.has(profile.id)
      );

      // Step 6: Log results for debugging
      console.log("Processed Results:", {
        friendsCount: friends.length,
        pendingReceivedCount: pendingReceived.length,
        pendingSentCount: pendingSent.length,
        availableUsersCount: availableUsers.length,
      });

      return {
        friends,
        pendingReceived,
        pendingSent,
        availableUsers,
      };
    } catch (error) {
      console.error("Error in getFriendshipStatuses:", error);
      throw error;
    }
  },

  sendFriendRequest: async (userId) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase.from("friendships").insert({
      user_id: user.id,
      friend_id: userId,
      status: "pending",
    });

    if (error) throw error;
  },

  acceptFriendRequest: async (friendshipId) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      console.log("Attempting to accept friendship with ID:", friendshipId);

      // First, verify the friendship exists
      const { data: existingFriendship, error: checkError } = await supabase
        .from("friendships")
        .select("*")
        .or(
          `and(user_id.eq.${user.id},friend_id.eq.${friendshipId}),and(user_id.eq.${friendshipId},friend_id.eq.${user.id})`
        )
        .single();

      if (checkError) {
        console.error("Error finding friendship:", checkError);
        throw checkError;
      }

      console.log("Found existing friendship:", existingFriendship);

      // Then update it
      const { data, error } = await supabase
        .from("friendships")
        .update({ status: "accepted" })
        .or(
          `and(user_id.eq.${user.id},friend_id.eq.${friendshipId}),and(user_id.eq.${friendshipId},friend_id.eq.${user.id})`
        )
        .select()
        .single();

      if (error) throw error;

      console.log("Updated friendship data:", data);
      return data;
    } catch (error) {
      console.error("Error in acceptFriendRequest:", error);
      throw error;
    }
  },

  rejectFriendRequest: async (friendshipId) => {
    const { error } = await supabase
      .from("friendships")
      .delete()
      .eq("id", friendshipId);

    if (error) throw error;
  },

  removeFriend: async (friendId) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase
      .from("friendships")
      .delete()
      .or(
        `and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`
      );

    if (error) throw error;
  },
};
