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
        is_answered: false,
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
      const { data, error } = await supabase
        .from("prayers")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", prayerId)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setPrayers((currentPrayers) =>
        currentPrayers.map((prayer) =>
          prayer.id === prayerId ? { ...prayer, ...data } : prayer
        )
      );

      return { data, error: null };
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
    return prayers.filter((prayer) => prayer.group_id === groupId);
  };

  const addUpdate = async (prayerId, updateText) => {
    try {
      const prayer = prayers.find((p) => p.id === prayerId);
      if (!prayer) throw new Error("Prayer not found");

      const updates = prayer.updates || [];
      const newUpdate = {
        id: Date.now(),
        text: updateText,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("prayers")
        .update({
          updates: [...updates, newUpdate],
          updated_at: new Date().toISOString(),
        })
        .eq("id", prayerId)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setPrayers((currentPrayers) =>
        currentPrayers.map((prayer) =>
          prayer.id === prayerId ? { ...prayer, ...data } : prayer
        )
      );

      return { data, error: null };
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
        is_answered: false,
        prayer_count: 0,
        comment_count: 0,
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
        comments: 0,
        updates: 0,
        updates_list: [],
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
          )
        `
        )
        .eq("id", prayerId)
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
      };

      return { data: transformedData, error: null };
    } catch (error) {
      console.error("Error fetching prayer:", error.message);
      return { data: null, error };
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
        getPrayer,
      }}
    >
      {children}
    </PrayerContext.Provider>
  );
}

export function usePrayers() {
  return useContext(PrayerContext);
}
