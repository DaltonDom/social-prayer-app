import { supabase } from "../lib/supabase";

export const friendshipService = {
  getFriendshipStatuses: async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      console.log("Current user:", user.id); // Debug log

      // Get all friendships for current user
      const { data: friendships, error: friendshipsError } = await supabase
        .from("friendships")
        .select(
          `
          id,
          status,
          user_id,
          friend_id,
          profiles!friendships_friend_id_fkey (
            id,
            first_name,
            last_name,
            profile_image_url
          )
        `
        )
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

      if (friendshipsError) throw friendshipsError;

      console.log("Fetched friendships:", friendships); // Debug log

      // Process friendships
      const friends = [];
      const pendingReceived = [];
      const connectedUserIds = new Set([user.id]);

      friendships?.forEach((friendship) => {
        const otherUserId =
          friendship.user_id === user.id
            ? friendship.friend_id
            : friendship.user_id;
        const profile = friendship.profiles;

        connectedUserIds.add(otherUserId);

        if (friendship.status === "accepted") {
          friends.push(profile);
        } else if (
          friendship.status === "pending" &&
          friendship.friend_id === user.id
        ) {
          pendingReceived.push({
            ...profile,
            friendshipId: friendship.id,
          });
        }
      });

      // Get available users - FIXED QUERY
      let availableUsers = [];
      if (connectedUserIds.size > 0) {
        const { data: potentialFriends, error: availableError } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, profile_image_url")
          .not("id", "eq", user.id); // First exclude current user

        if (availableError) throw availableError;

        // Filter out connected users in JavaScript instead of SQL
        availableUsers =
          potentialFriends?.filter(
            (profile) => !connectedUserIds.has(profile.id)
          ) || [];
      }

      console.log("Processed data:", {
        friends,
        pendingReceived,
        availableUsers,
      }); // Debug log

      return {
        friends,
        pendingReceived,
        availableUsers: availableUsers || [],
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
    const { error } = await supabase
      .from("friendships")
      .update({ status: "accepted" })
      .eq("id", friendshipId);

    if (error) throw error;
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
