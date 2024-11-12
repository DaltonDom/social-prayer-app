import React, { createContext, useState, useContext, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { decode } from "base64-arraybuffer";

const UserContext = createContext({});

export function UserProvider({ children }) {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No profile found, create one
          const { data: newProfile, error: createError } = await supabase
            .from("profiles")
            .insert([
              {
                id: userId,
                first_name: "John", // Default name
                last_name: "Smith", // Default name
                profile_image_url: "https://via.placeholder.com/150",
              },
            ])
            .single();

          if (createError) throw createError;
          setUserProfile(newProfile);
        } else {
          throw error;
        }
      } else {
        setUserProfile(data);
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
      // Get the file extension
      const ext = imageUri.substring(imageUri.lastIndexOf(".") + 1);

      // Create a unique file name with user ID as folder name
      const fileName = `${userProfile.id}/${Date.now()}.${ext}`;

      // Convert image URI to Blob
      const fetchResponse = await fetch(imageUri);
      const blobData = await fetchResponse.blob();

      // Create FormData
      const formData = new FormData();
      formData.append("file", {
        uri: imageUri,
        name: fileName,
        type: `image/${ext}`,
      });

      // Upload to Supabase Storage using fetch
      const { data, error } = await supabase.storage
        .from("profile-images")
        .upload(fileName, blobData, {
          contentType: `image/${ext}`,
          cacheControl: "3600",
          upsert: true,
        });

      if (error) throw error;

      // Get the public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("profile-images").getPublicUrl(fileName);

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
        loading,
        updateProfile,
        sendFriendRequest,
        acceptFriendRequest,
        uploadProfileImage,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
