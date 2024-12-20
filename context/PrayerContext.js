import React, { createContext, useState, useContext, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useUser } from "./UserContext";
import { Platform } from "react-native";
import * as Crypto from "expo-crypto";

export const PrayerContext = createContext();

export function PrayerProvider({ children }) {
  const [prayers, setPrayers] = useState([]);
  const { userProfile } = useUser();

  // Fetch prayers when component mounts
  useEffect(() => {
    if (userProfile) {
      getUserPrayers();
    }
  }, [userProfile]);

  const getUserPrayers = async () => {
    try {
      const { data, error } = await supabase
        .from("prayers")
        .select(
          `
          *,
          profiles!prayers_user_id_fkey (
            id,
            first_name,
            last_name,
            profile_image_url
          ),
          groups!prayers_group_id_fkey (
            id,
            name
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform the data to match the expected format
      const transformedData = data.map((prayer) => ({
        ...prayer,
        userName:
          `${prayer.profiles.first_name} ${prayer.profiles.last_name}`.trim(),
        userImage: prayer.profiles.profile_image_url,
        date: new Date(prayer.created_at).toISOString().split("T")[0],
        comments: prayer.comment_count || 0,
        updates: prayer.updates?.length || 0,
        groupName: prayer.groups?.name || null,
      }));

      setPrayers(transformedData);
      return { data: transformedData, error: null };
    } catch (error) {
      console.error("Error fetching prayers:", error.message);
      return { data: null, error };
    }
  };

  const createPrayer = async ({ title, description, category, groupId }) => {
    try {
      const newPrayer = {
        title,
        description,
        category,
        user_id: userProfile.id,
        group_id: groupId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        comment_count: 0,
      };

      const { data, error } = await supabase
        .from("prayers")
        .insert([newPrayer])
        .select(
          `
          *,
          profiles!prayers_user_id_fkey (
            id,
            first_name,
            last_name,
            profile_image_url
          ),
          groups!prayers_group_id_fkey (
            id,
            name
          )
        `
        )
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error("Error creating prayer:", error.message);
      return { data: null, error };
    }
  };

  const updatePrayer = async (prayerId, updates) => {
    try {
      // Ensure we're only sending valid fields to Supabase
      const validUpdateFields = {
        title: updates.title,
        description: updates.description,
        category: updates.category,
        updated_at: new Date().toISOString(),
        updates: updates.updates || [],
        comment_count: updates.comment_count || 0,
      };

      const { data, error } = await supabase
        .from("prayers")
        .update(validUpdateFields)
        .eq("id", prayerId)
        .select(
          `
          *,
          profiles!prayers_user_id_fkey (
            id,
            first_name,
            last_name,
            profile_image_url
          ),
          groups!prayers_group_id_fkey (
            id,
            name
          )
        `
        )
        .single();

      if (error) throw error;

      // Transform the data to match the expected format
      const transformedData = {
        ...data,
        userName:
          `${data.profiles.first_name} ${data.profiles.last_name}`.trim(),
        userImage: data.profiles.profile_image_url,
        date: new Date(data.created_at).toISOString().split("T")[0],
        comments: data.comment_count || 0,
        updates: data.updates?.length || 0,
        updates_list: data.updates || [],
        groupName: data.groups?.name || null,
      };

      // Update local state
      setPrayers((currentPrayers) =>
        currentPrayers.map((prayer) =>
          prayer.id === prayerId ? transformedData : prayer
        )
      );

      return { data: transformedData, error: null };
    } catch (error) {
      console.error("Error updating prayer:", error.message);
      return { data: null, error };
    }
  };

  const deletePrayer = async (prayerId) => {
    try {
      const { error } = await supabase
        .from("prayers")
        .delete()
        .eq("id", prayerId);

      if (error) throw error;

      // Update local state
      setPrayers((currentPrayers) =>
        currentPrayers.filter((prayer) => prayer.id !== prayerId)
      );

      return { error: null };
    } catch (error) {
      console.error("Error deleting prayer:", error.message);
      return { error };
    }
  };

  const getGroupPrayers = (groupId) => {
    if (!groupId) {
      console.log("No group ID provided to getGroupPrayers");
      return [];
    }

    try {
      const groupPrayers = prayers.filter(
        (prayer) => prayer.group_id === groupId
      );
      console.log(`Found ${groupPrayers.length} prayers for group ${groupId}`);
      return groupPrayers;
    } catch (error) {
      console.error("Error in getGroupPrayers:", error);
      return [];
    }
  };

  const addUpdate = async (prayerId, updateText) => {
    try {
      console.log("📝 Starting addUpdate for prayer:", prayerId);

      if (!prayerId) {
        throw new Error("Prayer ID is required");
      }

      // Get current prayer data
      const { data: currentPrayer, error: fetchError } = await supabase
        .from("prayers")
        .select("updates")
        .eq("id", prayerId)
        .single();

      if (fetchError) {
        console.error("Error fetching current prayer:", fetchError);
        throw fetchError;
      }

      console.log("Current prayer data:", currentPrayer);

      // Prepare new update
      const newUpdate = {
        id: Crypto.randomUUID(),
        text: updateText,
        created_at: new Date().toISOString(),
      };

      // Add new update to updates array
      const updates = [...(currentPrayer.updates || []), newUpdate];

      // Update the prayer
      const { data: updatedPrayer, error: updateError } = await supabase
        .from("prayers")
        .update({
          updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", prayerId)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating prayer:", updateError);
        throw updateError;
      }

      console.log("Prayer updated successfully:", updatedPrayer);

      // Transform and update local state
      const transformedPrayer = {
        ...updatedPrayer,
        userName:
          `${updatedPrayer.profiles.first_name} ${updatedPrayer.profiles.last_name}`.trim(),
        userImage: updatedPrayer.profiles.profile_image_url,
        date: new Date(updatedPrayer.created_at).toISOString().split("T")[0],
        comments: updatedPrayer.comment_count || 0,
        updates: updates.length,
        updates_list: updates,
        groupName: updatedPrayer.groups?.name || null,
      };

      // Update local state
      setPrayers((currentPrayers) =>
        currentPrayers.map((prayer) =>
          prayer.id === prayerId ? transformedPrayer : prayer
        )
      );

      return { data: newUpdate, error: null };
    } catch (error) {
      console.error("Error in addUpdate:", error);
      return { data: null, error };
    }
  };

  const addPrayer = async (newPrayer) => {
    try {
      const prayerData = {
        title: newPrayer.title,
        description: newPrayer.description,
        category: newPrayer.category,
        user_id: userProfile.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        prayer_count: 0,
        comment_count: 0,
        group_id: newPrayer.groupId || null,
      };

      const { data, error } = await supabase
        .from("prayers")
        .insert([prayerData])
        .select(
          `
          *,
          profiles!prayers_user_id_fkey (
            id,
            first_name,
            last_name,
            profile_image_url
          ),
          groups!prayers_group_id_fkey (
            id,
            name
          )
        `
        )
        .single();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      // Transform the data to match the expected format
      const transformedData = {
        ...data,
        userName:
          `${data.profiles.first_name} ${data.profiles.last_name}`.trim(),
        userImage: data.profiles.profile_image_url,
        date: new Date(data.created_at).toISOString().split("T")[0],
        comments: 0,
        updates: 0,
        updates_list: [],
        groupName: data.groups?.name || null,
      };

      // Update local state
      setPrayers((currentPrayers) => [transformedData, ...currentPrayers]);
      return { data: transformedData, error: null };
    } catch (error) {
      console.error("Error adding prayer:", error.message);
      return { data: null, error };
    }
  };

  const getPrayer = async (prayerId) => {
    try {
      const [prayerResult, commentsResult] = await Promise.all([
        supabase
          .from("prayers")
          .select(
            `
            *,
            profiles!prayers_user_id_fkey (
              id,
              first_name,
              last_name,
              profile_image_url
            ),
            groups!prayers_group_id_fkey (
              id,
              name
            )
          `
          )
          .eq("id", prayerId)
          .single(),
        supabase
          .from("prayer_comments")
          .select(
            `
            *,
            profiles (
              id,
              first_name,
              last_name,
              profile_image_url
            )
          `
          )
          .eq("prayer_id", prayerId)
          .order("created_at", { ascending: false }),
      ]);

      if (prayerResult.error) throw prayerResult.error;
      if (commentsResult.error) throw commentsResult.error;

      // Transform comments data
      const transformedComments = commentsResult.data.map((comment) => ({
        id: comment.id,
        user_id: comment.user_id,
        userName:
          `${comment.profiles.first_name} ${comment.profiles.last_name}`.trim(),
        userImage: comment.profiles.profile_image_url,
        text: comment.text,
        date: new Date(comment.created_at).toISOString().split("T")[0],
      }));

      // Transform prayer data
      const transformedPrayer = {
        ...prayerResult.data,
        userName:
          `${prayerResult.data.profiles.first_name} ${prayerResult.data.profiles.last_name}`.trim(),
        userImage: prayerResult.data.profiles.profile_image_url,
        date: new Date(prayerResult.data.created_at)
          .toISOString()
          .split("T")[0],
        comments: transformedComments.length,
        comments_list: transformedComments,
        updates: prayerResult.data.updates?.length || 0,
        updates_list: prayerResult.data.updates || [],
        groupName: prayerResult.data.groups?.name || null,
      };

      return { data: transformedPrayer, error: null };
    } catch (error) {
      console.error("Error in getPrayer:", error);
      return { data: null, error };
    }
  };

  const addComment = async (prayerId, commentText) => {
    try {
      console.log("📝 Starting addComment for prayer:", prayerId);

      // First get the current comment count
      const { data: currentPrayer, error: countError } = await supabase
        .from("prayers")
        .select("comment_count")
        .eq("id", prayerId)
        .single();

      console.log("Current prayer data:", currentPrayer);
      if (countError) {
        console.error("Error fetching current prayer:", countError);
        throw countError;
      }

      // Create the comment
      const { data: commentData, error: commentError } = await supabase
        .from("prayer_comments")
        .insert([
          {
            prayer_id: prayerId,
            user_id: userProfile.id,
            text: commentText,
          },
        ])
        .select()
        .single();

      console.log("New comment created:", commentData);
      if (commentError) {
        console.error("Error creating comment:", commentError);
        throw commentError;
      }

      // Update the prayer's comment count
      const newCount = (currentPrayer.comment_count || 0) + 1;
      console.log("Updating prayer with new count:", newCount);

      const { data: updatedPrayer, error: updateError } = await supabase
        .from("prayers")
        .update({
          comment_count: newCount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", prayerId)
        .select()
        .single();

      console.log("Prayer updated:", updatedPrayer);
      if (updateError) {
        console.error("Error updating prayer:", updateError);
        throw updateError;
      }

      return { data: commentData, error: null };
    } catch (error) {
      console.error("Error in addComment:", error);
      return { data: null, error };
    }
  };

  const getComments = async (prayerId) => {
    try {
      const { data, error } = await supabase
        .from("prayer_comments")
        .select(
          `
          *,
          profiles (
            id,
            first_name,
            last_name,
            profile_image_url
          )
        `
        )
        .eq("prayer_id", prayerId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform comments data
      const transformedComments = data.map((comment) => ({
        id: comment.id,
        userName:
          `${comment.profiles.first_name} ${comment.profiles.last_name}`.trim(),
        userImage: comment.profiles.profile_image_url,
        text: comment.text,
        date: new Date(comment.created_at).toISOString().split("T")[0],
      }));

      return { data: transformedComments, error: null };
    } catch (error) {
      console.error("Error fetching comments:", error.message);
      return { data: null, error };
    }
  };

  const fetchPrayers = async () => {
    try {
      const { data: prayers, error } = await supabase
        .from("prayers")
        .select(
          `
          *,
          profiles!prayers_user_id_fkey (
            id,
            first_name,
            last_name,
            profile_image_url
          ),
          groups!prayers_group_id_fkey (
            id,
            name
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform prayers with correct updates count
      const transformedPrayers = prayers.map((prayer) => {
        // Get updates count directly from the raw_updates field
        const updatesCount = prayer.raw_updates || 0;

        return {
          ...prayer,
          userName:
            `${prayer.profiles.first_name} ${prayer.profiles.last_name}`.trim(),
          userImage: prayer.profiles.profile_image_url,
          date: new Date(prayer.created_at).toISOString().split("T")[0],
          comment_count: prayer.comment_count || 0,
          updates_count: updatesCount, // Use the raw_updates count
          updates: prayer.updates || [],
          groupName: prayer.groups?.name || null,
        };
      });

      console.log("Transformed prayers with counts:", transformedPrayers[0]);
      setPrayers(transformedPrayers);
      return { data: transformedPrayers, error: null };
    } catch (error) {
      console.error("Error in fetchPrayers:", error);
      return { data: null, error };
    }
  };

  const deleteUpdate = async (prayerId, updateId) => {
    try {
      // Get current prayer data
      const { data: currentPrayer, error: fetchError } = await supabase
        .from("prayers")
        .select("updates")
        .eq("id", prayerId)
        .single();

      if (fetchError) throw fetchError;

      // Filter out the update to delete
      const updates = currentPrayer.updates.filter(
        (update) => update.id !== updateId
      );

      // Update the prayer
      const { data: updatedPrayer, error: updateError } = await supabase
        .from("prayers")
        .update({
          updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", prayerId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Update local state
      setPrayers((currentPrayers) =>
        currentPrayers.map((prayer) =>
          prayer.id === prayerId
            ? {
                ...prayer,
                updates_count: updates.length,
                updates: updates,
              }
            : prayer
        )
      );

      return { error: null };
    } catch (error) {
      console.error("Error deleting update:", error.message);
      return { error };
    }
  };

  const deleteComment = async (commentId) => {
    try {
      // Get the comment to find its prayer_id before deletion
      const { data: comment, error: fetchError } = await supabase
        .from("prayer_comments")
        .select("prayer_id")
        .eq("id", commentId)
        .single();

      if (fetchError) throw fetchError;

      if (!comment || !comment.prayer_id) {
        console.error("No prayer_id found for comment:", commentId);
        throw new Error("Invalid prayer_id");
      }

      // Delete the comment
      const { error: deleteError } = await supabase
        .from("prayer_comments")
        .delete()
        .eq("id", commentId);

      if (deleteError) throw deleteError;

      // Get current prayer to get the comment count
      const { data: prayer, error: prayerError } = await supabase
        .from("prayers")
        .select("comment_count")
        .eq("id", comment.prayer_id)
        .single();

      if (prayerError) throw prayerError;

      // Update the prayer's comment count
      const { error: updateError } = await supabase
        .from("prayers")
        .update({
          comment_count: Math.max(0, (prayer.comment_count || 1) - 1),
          updated_at: new Date().toISOString(),
        })
        .eq("id", comment.prayer_id);

      if (updateError) throw updateError;

      // Update local state
      setPrayers((currentPrayers) =>
        currentPrayers.map((prayer) => {
          if (prayer.id === comment.prayer_id) {
            return {
              ...prayer,
              comments: Math.max(0, (prayer.comments || 1) - 1),
              comments_list:
                prayer.comments_list?.filter((c) => c.id !== commentId) || [],
            };
          }
          return prayer;
        })
      );

      return { error: null };
    } catch (error) {
      console.error("Error deleting comment:", error.message);
      return { error };
    }
  };

  return (
    <PrayerContext.Provider
      value={{
        prayers,
        addPrayer,
        createPrayer,
        updatePrayer,
        deletePrayer,
        getUserPrayers,
        getGroupPrayers,
        addUpdate,
        deleteUpdate,
        deleteComment,
        getPrayer,
        addComment,
        getComments,
        fetchPrayers,
        setPrayers,
      }}
    >
      {children}
    </PrayerContext.Provider>
  );
}

export function usePrayers() {
  return useContext(PrayerContext);
}
