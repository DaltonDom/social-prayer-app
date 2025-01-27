import React, { createContext, useState, useContext, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { decode } from "base64-arraybuffer";

const UserContext = createContext({});

export function UserProvider({ children }) {
  const [userProfile, setUserProfile] = useState(null);
  const [friendships, setFriendships] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchFriendships = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("friendships")
        .select(
          `
          *,
          friend:profiles!friendships_friend_id_fkey (
            id,
            first_name,
            last_name,
            profile_image_url
          ),
          user:profiles!friendships_user_id_fkey (
            id,
            first_name,
            last_name,
            profile_image_url
          )
        `
        )
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
        .eq("status", "accepted");

      if (error) throw error;
      setFriendships(data);
      return data;
    } catch (error) {
      console.error("Error fetching friendships:", error);
      return [];
    }
  };

  const fetchUserProfile = async (userId) => {
    try {
      const { data: existingProfile, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (fetchError) {
        if (fetchError.code === "PGRST116") {
          const { data: newProfile, error: createError } = await supabase
            .from("profiles")
            .upsert(
              [
                {
                  id: userId,
                  first_name: "User",
                  last_name: "",
                  profile_image_url: "https://via.placeholder.com/150",
                  updated_at: new Date().toISOString(),
                },
              ],
              {
                onConflict: "id",
                ignoreDuplicates: false,
              }
            )
            .select()
            .single();

          if (createError) throw createError;
          setUserProfile(newProfile);
        } else {
          throw fetchError;
        }
      } else {
        setUserProfile(existingProfile);
        await fetchFriendships(userId);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });
  }, []);

  const updateProfile = async (updates) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", userProfile.id)
        .single();

      if (error) throw error;
      setUserProfile({ ...userProfile, ...data });
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const sendFriendRequest = async (friendId) => {
    try {
      const { data, error } = await supabase.from("friendships").insert({
        user_id: userProfile.id,
        friend_id: friendId,
        status: "pending",
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const acceptFriendRequest = async (friendshipId) => {
    try {
      const { data, error } = await supabase
        .from("friendships")
        .update({ status: "accepted" })
        .eq("id", friendshipId);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const uploadProfileImage = async (imageUri) => {
    try {
      // Get file extension
      const ext = imageUri.split(".").pop().toLowerCase();
      const fileName = `${Date.now()}.${ext}`;
      const filePath = `${userProfile.id}/${fileName}`;

      // Fetch the image and convert to blob
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // Create FormData and append the file
      const formData = new FormData();
      formData.append("file", {
        uri: imageUri,
        name: fileName,
        type: `image/${ext}`,
      });

      // Upload using formData
      const { data, error: uploadError } = await supabase.storage
        .from("profile-images")
        .upload(filePath, formData.get("file"), {
          contentType: `image/${ext}`,
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("profile-images").getPublicUrl(filePath);

      // Update profile with new image URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ profile_image_url: publicUrl })
        .eq("id", userProfile.id);

      if (updateError) throw updateError;

      // Update local state
      setUserProfile((prev) => ({
        ...prev,
        profile_image_url: publicUrl,
      }));

      return { publicUrl, error: null };
    } catch (error) {
      console.error("Error uploading image:", error.message);
      return { publicUrl: null, error };
    }
  };

  return (
    <UserContext.Provider
      value={{
        userProfile,
        friendships,
        loading,
        updateProfile,
        sendFriendRequest,
        acceptFriendRequest,
        uploadProfileImage,
        fetchFriendships,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
