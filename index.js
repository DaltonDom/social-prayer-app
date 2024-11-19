import { LogBox, RefreshControl } from "react-native";
import { createClient } from "@supabase/supabase-js";
import { ScrollView } from "react-native";
import { useState, useCallback } from "react";

// Ignore the specific warning
LogBox.ignoreLogs([
  'Unsupported top level event type "topInsetsChange" dispatched',
]);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Function to fetch all necessary data
async function fetchFriendshipData() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      console.log("No user found");
      return null;
    }

    // Get all profiles except current user
    const { data: allProfiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, profile_image_url")
      .neq("id", user.id);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      return null;
    }

    console.log("All profiles (excluding current user):", allProfiles);

    // Get all friendships for current user
    const { data: friendships, error: friendshipsError } = await supabase
      .from("friendships")
      .select("*")
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

    if (friendshipsError) {
      console.error("Error fetching friendships:", friendshipsError);
      return null;
    }

    console.log("Current user friendships:", friendships);

    // Initialize arrays
    const friends = [];
    const pendingReceived = [];
    const pendingSent = [];
    const otherUsers = [...allProfiles]; // Start with all profiles

    // Remove the import of getFriendshipCategories and process friendships directly
    if (friendships) {
      friendships.forEach((friendship) => {
        const otherUserId =
          friendship.user_id === user.id
            ? friendship.friend_id
            : friendship.user_id;
        const profileIndex = otherUsers.findIndex((p) => p.id === otherUserId);

        if (profileIndex !== -1) {
          const profile = otherUsers[profileIndex];
          // Remove from otherUsers since we found a connection
          otherUsers.splice(profileIndex, 1);

          if (friendship.status === "accepted") {
            friends.push(profile);
          } else if (friendship.status === "pending") {
            if (friendship.user_id === user.id) {
              pendingSent.push(profile);
            } else {
              pendingReceived.push(profile);
            }
          }
        }
      });
    }

    const result = {
      friends,
      pendingReceived,
      pendingSent,
      otherUsers,
    };

    console.log("Categorized users:", {
      friendsCount: friends.length,
      pendingReceivedCount: pendingReceived.length,
      pendingSentCount: pendingSent.length,
      otherUsersCount: otherUsers.length,
      friends,
      pendingReceived,
      pendingSent,
      otherUsers,
    });

    return result;
  } catch (error) {
    console.error("Error in fetchFriendshipData:", error);
    return null;
  }
}

// Function to send friend request
async function sendFriendRequest(friendId) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    // Check if friendship already exists
    const { data: existingFriendship, error: checkError } = await supabase
      .from("friendships")
      .select("*")
      .or(
        `and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`
      )
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking existing friendship:", checkError);
      return null;
    }

    if (existingFriendship) {
      console.log("Friendship already exists:", existingFriendship);
      return existingFriendship;
    }

    const { data, error } = await supabase
      .from("friendships")
      .insert({
        user_id: user.id,
        friend_id: friendId,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating friendship:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in sendFriendRequest:", error);
    return null;
  }
}

// Function to accept friend request
async function acceptFriendRequest(friendshipId) {
  try {
    const { data, error } = await supabase
      .from("friendships")
      .update({ status: "accepted" })
      .eq("id", friendshipId)
      .select()
      .single();

    if (error) {
      console.error("Error accepting friend request:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in acceptFriendRequest:", error);
    return null;
  }
}

// Function to reject friend request
async function rejectFriendRequest(friendshipId) {
  try {
    const { data, error } = await supabase
      .from("friendships")
      .update({ status: "rejected" })
      .eq("id", friendshipId)
      .select()
      .single();

    if (error) {
      console.error("Error rejecting friend request:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in rejectFriendRequest:", error);
    return null;
  }
}

// Add this at component level
const [refreshing, setRefreshing] = useState(false);

const onRefresh = useCallback(async () => {
  setRefreshing(true);
  try {
    // Add your prayer refresh logic here
    // For example:
    await fetchPrayers(); // Your existing prayer fetch function
  } catch (error) {
    console.error("Error refreshing prayers:", error);
  } finally {
    setRefreshing(false);
  }
}, []);

// In your render method, wrap your prayer list with ScrollView:
return (
  <ScrollView
    refreshControl={
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        tintColor="#000" // For iOS
        colors={["#000"]} // For Android
      />
    }
  >
    {/* Your existing prayer list content */}
  </ScrollView>
);

export {
  fetchFriendshipData,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
};
