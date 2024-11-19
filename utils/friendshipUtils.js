export const getFriendshipStatus = (
  friendships,
  currentUserId,
  otherUserId
) => {
  const friendship = friendships.find(
    (f) =>
      (f.user_id === currentUserId && f.friend_id === otherUserId) ||
      (f.user_id === otherUserId && f.friend_id === currentUserId)
  );

  if (!friendship) return "none";
  return friendship.status;
};

export const getFriendshipCategories = (
  profiles,
  friendships,
  currentUserId
) => {
  const friends = [];
  const pendingReceived = [];
  const pendingSent = [];
  const otherUsers = [];

  profiles.forEach((profile) => {
    if (profile.id === currentUserId) return; // Skip current user

    const status = getFriendshipStatus(friendships, currentUserId, profile.id);

    switch (status) {
      case "accepted":
        friends.push(profile);
        break;
      case "pending":
        const friendship = friendships.find(
          (f) =>
            (f.user_id === currentUserId && f.friend_id === profile.id) ||
            (f.user_id === profile.id && f.friend_id === currentUserId)
        );
        if (friendship.user_id === currentUserId) {
          pendingSent.push(profile);
        } else {
          pendingReceived.push(profile);
        }
        break;
      case "none":
        otherUsers.push(profile);
        break;
    }
  });

  return {
    friends,
    pendingReceived,
    pendingSent,
    otherUsers,
  };
};
