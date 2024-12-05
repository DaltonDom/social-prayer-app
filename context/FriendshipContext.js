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
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "friend_requests",
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

      // Fetch accepted friendships
      const { data: friendshipsData, error: friendshipsError } = await supabase
        .from("friendships")
        .select("*")
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

      if (friendshipsError) throw friendshipsError;
      setFriendships(friendshipsData || []);

      // Fetch pending friend requests
      const { data: pendingData, error: pendingError } = await supabase
        .from("friend_requests")
        .select("*")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .eq("status", "pending");

      if (pendingError) throw pendingError;
      setPendingFriendships(pendingData || []);
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
