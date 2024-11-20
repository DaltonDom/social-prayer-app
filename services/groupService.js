import { supabase } from '../lib/supabase';

export const groupService = {
  // Get all groups the user is a member of
  getUserGroups: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('groups')
      .select(`
        *,
        group_members!inner (
          role
        ),
        profiles:created_by (
          first_name,
          last_name,
          profile_image_url
        )
      `)
      .eq('group_members.user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get groups the user can join (not a member of)
  getAvailableGroups: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('groups')
      .select(`
        *,
        profiles:created_by (
          first_name,
          last_name,
          profile_image_url
        )
      `)
      .not('id', 'in', `(
        select group_id 
        from group_members 
        where user_id = '${user.id}'
      )`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Create a new group
  createGroup: async ({ name, description, category, guidelines, imageUrl }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Start a transaction
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .insert([{
        name,
        description,
        category,
        guidelines,
        image_url: imageUrl,
        created_by: user.id,
      }])
      .select()
      .single();

    if (groupError) throw groupError;

    // Add creator as admin member
    const { error: memberError } = await supabase
      .from('group_members')
      .insert([{
        group_id: group.id,
        user_id: user.id,
        role: 'admin',
      }]);

    if (memberError) throw memberError;
    return group;
  },

  // Join a group
  joinGroup: async (groupId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('group_members')
      .insert([{
        group_id: groupId,
        user_id: user.id,
        role: 'member',
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Leave a group
  leaveGroup: async (groupId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', user.id);

    if (error) throw error;
    return true;
  },

  // Update group details (admin only)
  updateGroup: async (groupId, updates) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Verify user is admin
    const { data: membership, error: membershipError } = await supabase
      .from('group_members')
      .select('role')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .single();

    if (membershipError) throw membershipError;
    if (membership.role !== 'admin') throw new Error('Not authorized');

    const { data, error } = await supabase
      .from('groups')
      .update(updates)
      .eq('id', groupId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete group (admin only)
  deleteGroup: async (groupId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Verify user is admin
    const { data: membership, error: membershipError } = await supabase
      .from('group_members')
      .select('role')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .single();

    if (membershipError) throw membershipError;
    if (membership.role !== 'admin') throw new Error('Not authorized');

    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', groupId);

    if (error) throw error;
    return true;
  },
};
