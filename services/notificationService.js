import { supabase } from "../lib/supabase";

export const notificationService = {
  async getNotifications() {
    try {
      const { data: notifications, error } = await supabase
        .from("notifications")
        .select(
          `
          *,
          profiles!sender_id (
            id,
            first_name,
            last_name,
            profile_image_url
          ),
          prayers (
            id,
            title
          ),
          friendships (
            id,
            status
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      return notifications.map((notification) => ({
        id: notification.id,
        type: notification.type,
        sender: {
          id: notification.profiles.id,
          name: `${notification.profiles.first_name} ${notification.profiles.last_name}`,
          image: notification.profiles.profile_image_url,
        },
        prayer: notification.prayers,
        friendship: notification.friendships,
        read: notification.read,
        createdAt: notification.created_at,
      }));
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }
  },

  async markAsRead(notificationId) {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId);

      if (error) throw error;
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  },
};
