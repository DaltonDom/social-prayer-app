import React, { createContext, useState, useContext, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useUser } from "./UserContext";

const PrayerContext = createContext();

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

  const createPrayer = async ({ title, description, category }) => {
    try {
      const newPrayer = {
        title,
        description,
        category,
        user_id: userProfile.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        prayer_count: 0,
      };

      const { data, error } = await supabase
        .from("prayers")
        .insert([newPrayer])
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setPrayers((currentPrayers) => [data, ...currentPrayers]);
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
      // Get the current prayer first
      const { data: currentPrayer, error: fetchError } = await supabase
        .from("prayers")
        .select("updates")
        .eq("id", prayerId)
        .single();

      if (fetchError) throw fetchError;

      // Create new update object
      const newUpdate = {
        id: Date.now().toString(),
        text: updateText,
        created_at: new Date().toISOString(),
      };

      // Get current updates or initialize empty array
      const currentUpdates = currentPrayer.updates || [];

      // Add new update to the array
      const { data, error } = await supabase
        .from("prayers")
        .update({
          updates: [...currentUpdates, newUpdate],
          updated_at: new Date().toISOString(),
        })
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

      // Transform the data
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
      console.error("Error adding update:", error.message);
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
      // First get the current comment count
      const { data: currentPrayer, error: countError } = await supabase
        .from("prayers")
        .select("comment_count")
        .eq("id", prayerId)
        .single();

      if (countError) throw countError;

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
        .single();

      if (commentError) throw commentError;

      // Update the prayer's comment count
      const { error: updateError } = await supabase
        .from("prayers")
        .update({
          comment_count: (currentPrayer.comment_count || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", prayerId);

      if (updateError) throw updateError;

      // Transform comment data
      const transformedComment = {
        id: commentData.id,
        userName:
          `${commentData.profiles.first_name} ${commentData.profiles.last_name}`.trim(),
        userImage: commentData.profiles.profile_image_url,
        text: commentData.text,
        date: new Date(commentData.created_at).toISOString().split("T")[0],
      };

      // Update local state
      setPrayers((currentPrayers) =>
        currentPrayers.map((prayer) => {
          if (prayer.id === prayerId) {
            return {
              ...prayer,
              comments: (prayer.comments || 0) + 1,
              comments_list: [
                transformedComment,
                ...(prayer.comments_list || []),
              ],
            };
          }
          return prayer;
        })
      );

      return { data: transformedComment, error: null };
    } catch (error) {
      console.error("Error adding comment:", error.message);
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

  const deleteUpdate = async (prayerId, updateId) => {
    try {
      // First get the current prayer and its updates
      const { data: currentPrayer, error: fetchError } = await supabase
        .from("prayers")
        .select("updates")
        .eq("id", prayerId)
        .single();

      if (fetchError) throw fetchError;

      // Filter out the update to delete
      const updatedUpdates = currentPrayer.updates.filter(
        (update) => update.id !== updateId
      );

      // Update the prayer with the new updates array
      const { data, error } = await supabase
        .from("prayers")
        .update({
          updates: updatedUpdates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", prayerId)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setPrayers((currentPrayers) =>
        currentPrayers.map((prayer) =>
          prayer.id === prayerId
            ? {
                ...prayer,
                updates: updatedUpdates.length,
                updates_list: updatedUpdates,
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
      }}
    >
      {children}
    </PrayerContext.Provider>
  );
}

export function usePrayers() {
  return useContext(PrayerContext);
}
