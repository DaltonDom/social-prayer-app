import { supabase } from '../lib/supabase';

export const prayerService = {
  // Get all relevant prayers for the home screen
  getHomePrayers: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

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
    return data;
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
};
