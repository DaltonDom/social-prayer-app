import { supabase } from '../lib/supabase';

export const friendshipService = {
  // Get all accepted friends
  getFriends: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get friends where user is the sender
    const { data: sentFriendships, error: error1 } = await supabase
      .from('friendships')
      .select(`
        friend:profiles!friendships_friend_id_fkey (
          id,
          first_name,
          last_name,
          profile_image_url
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'accepted');

    if (error1) throw error1;
    
    // Get friends where user is the recipient
    const { data: receivedFriendships, error: error2 } = await supabase
      .from('friendships')
      .select(`
        friend:profiles!friendships_user_id_fkey (
          id,
          first_name,
          last_name,
          profile_image_url
        )
      `)
      .eq('friend_id', user.id)
      .eq('status', 'accepted');

    if (error2) throw error2;

    // Combine and format the results
    const friends = [
      ...(sentFriendships?.map(f => f.friend) || []),
      ...(receivedFriendships?.map(f => f.friend) || [])
    ];

    return friends;
  },

  // Get pending friend requests received
  getPendingRequests: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get pending requests with sender's profile information
    const { data, error } = await supabase
      .from('friendships')
      .select(`
        id,
        created_at,
        sender:profiles!friendships_user_id_fkey (
          id,
          first_name,
          last_name,
          profile_image_url
        )
      `)
      .eq('friend_id', user.id)
      .eq('status', 'pending');

    if (error) throw error;
    
    // Format the response to match the expected structure
    return data?.map(request => ({
      id: request.sender.id,
      first_name: request.sender.first_name,
      last_name: request.sender.last_name,
      profile_image_url: request.sender.profile_image_url,
      friendshipId: request.id
    })) || [];
  },

  // Get potential friends (users who are not friends or have pending requests)
  getPotentialFriends: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // First get all friendship IDs for the user
    const { data: friendships, error: friendshipError } = await supabase
      .from('friendships')
      .select('friend_id, user_id')
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

    if (friendshipError) throw friendshipError;

    // Create array of all connected user IDs
    const connectedUserIds = friendships?.reduce((acc, friendship) => {
      if (friendship.user_id === user.id) {
        acc.push(friendship.friend_id);
      } else {
        acc.push(friendship.user_id);
      }
      return acc;
    }, []) || [];

    // Add current user ID to excluded list
    connectedUserIds.push(user.id);

    // Get users who are not connected
    const { data, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, profile_image_url')
      .not('id', 'in', `(${connectedUserIds.join(',') || user.id})`)
      .limit(20);

    if (error) throw error;
    return data || [];
  },

  // Send friend request
  sendFriendRequest: async (friendId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('friendships')
      .insert({
        user_id: user.id,
        friend_id: friendId,
        status: 'pending'
      });

    if (error) throw error;
  },

  // Accept friend request
  acceptFriendRequest: async (friendshipId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', friendshipId)
      .eq('friend_id', user.id);

    if (error) throw error;
  },

  // Reject friend request
  rejectFriendRequest: async (friendshipId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', friendshipId)
      .eq('friend_id', user.id);

    if (error) throw error;
  },

  // Remove friend
  removeFriend: async (friendId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('friendships')
      .delete()
      .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`);

    if (error) throw error;
  }
};
