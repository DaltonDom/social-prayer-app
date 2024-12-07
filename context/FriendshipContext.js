import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const FriendshipContext = createContext();

export function FriendshipProvider({ children }) {
  const [friendships, setFriendships] = useState([]);
  const [pendingFriendships, setPendingFriendships] = useState([]);

  useEffect(() => {
    fetchFriendships();
    const subscription = supabase
      .channel("friendship_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "friendships",
        },
        fetchFriendships
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchFriendships = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch all friendships for the current user
      const { data: friendshipsData, error } = await supabase
        .from("friendships")
        .select(
          `
          *,
          friend:profiles!friendships_friend_id_fkey (
            id,
            first_name,
            last_name,
            profile_image_url
          )
        `
        )
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

      if (error) throw error;

      // Separate accepted and pending friendships
      const accepted = [];
      const pending = [];

      friendshipsData?.forEach((friendship) => {
        if (friendship.status === "accepted") {
          accepted.push(friendship);
        } else if (friendship.status === "pending") {
          pending.push(friendship);
        }
      });

      setFriendships(accepted);
      setPendingFriendships(pending);
    } catch (error) {
      console.error("Error fetching friendships:", error);
    }
  };

  return (
    <FriendshipContext.Provider
      value={{
        friendships,
        pendingFriendships,
        refreshFriendships: fetchFriendships,
      }}
    >
      {children}
    </FriendshipContext.Provider>
  );
}

export function useFriendships() {
  const context = useContext(FriendshipContext);
  if (context === undefined) {
    throw new Error("useFriendships must be used within a FriendshipProvider");
  }
  return context;
}
