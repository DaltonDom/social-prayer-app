import { supabase } from '../lib/supabase';

export const prayerService = {
  // Get all relevant prayers for the home screen
  getHomePrayers: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get prayers with raw comment count
    const { data, error } = await supabase
      .from('prayers')
      .select(`
        *,
        profiles:user_id (
          first_name,
          last_name,
          profile_image_url
        ),
        groups:group_id (
          name,
          image_url
        )
      `)
      .or(`user_id.eq.${user.id},group_id.in.(
        select group_id from group_members where user_id = '${user.id}'
      ),and(
        user_id.in.(
          select case 
            when user_id = '${user.id}' then friend_id 
            else user_id 
          end 
          from friendships 
          where (user_id = '${user.id}' or friend_id = '${user.id}')
          and status = 'accepted'
        ),
        group_id.is.null,
        is_private.eq.false
      )`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Get comment counts for each prayer
    const transformedData = await Promise.all(data.map(async (prayer) => {
      // Get raw comment count
      const { count } = await supabase
        .from('prayer_comments')
        .select('*', { count: 'exact', head: true })
        .eq('prayer_id', prayer.id);

      return {
        ...prayer,
        comment_count: count,
        updates_count: prayer.updates?.length || 0,
        userName: `${prayer.profiles.first_name} ${prayer.profiles.last_name}`.trim(),
        userImage: prayer.profiles.profile_image_url,
        date: new Date(prayer.created_at).toISOString().split('T')[0],
        groupName: prayer.groups?.name || null
      };
    }));

    return transformedData;
  },

  // Get prayers for a specific group
  getGroupPrayers: async (groupId) => {
    const { data, error } = await supabase
      .from('prayers')
      .select(`
        *,
        profiles:user_id (
          first_name,
          last_name,
          profile_image_url
        )
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Create a new prayer
  createPrayer: async ({ title, description, category, isPrivate, groupId }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('prayers')
      .insert([{
        user_id: user.id,
        title,
        description,
        category,
        is_private: isPrivate,
        group_id: groupId,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update a prayer
  updatePrayer: async (prayerId, updates) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('prayers')
      .update(updates)
      .eq('id', prayerId)
      .eq('user_id', user.id) // Ensure user owns the prayer
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a prayer
  deletePrayer: async (prayerId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('prayers')
      .delete()
      .eq('id', prayerId)
      .eq('user_id', user.id); // Ensure user owns the prayer

    if (error) throw error;
    return true;
  },

  // Add this function to your prayer service
  const addComment = async (prayerId, text, userId) => {
    try {
      // First, insert the comment
      const { data: newComment, error: insertError } = await supabase
        .from('prayer_comments')
        .insert([
          {
            prayer_id: prayerId,
            user_id: userId,
            text: text
          }
        ])
        .select(`
          *,
          profiles (
            id,
            first_name,
            last_name,
            profile_image_url
          )
        `)
        .single();

      if (insertError) {
        throw insertError;
      }

      // Get the actual comment count
      const { count, error: countError } = await supabase
        .from('prayer_comments')
        .select('*', { count: 'exact', head: true })
        .eq('prayer_id', prayerId);

      if (!countError && count !== null) {
        // Update the prayer's comment_count with the actual count
        const { error: updateError } = await supabase
          .from('prayers')
          .update({ comment_count: count })
          .eq('id', prayerId);

        if (updateError) {
          console.error("Error updating prayer count:", updateError);
        }
      }

      // Transform and return the comment data
      return {
        id: newComment.id,
        text: newComment.text,
        user_id: newComment.user_id,
        userName: `${newComment.profiles.first_name} ${newComment.profiles.last_name}`.trim(),
        userImage: newComment.profiles.profile_image_url,
        date: new Date(newComment.created_at).toISOString().split('T')[0]
      };
    } catch (error) {
      console.error("Error in addComment:", error);
      throw error;
    }
  },
};
