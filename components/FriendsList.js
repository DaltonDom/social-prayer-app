import { useEffect, useState } from "react";
import {
  fetchFriendshipData,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
} from "../path/to/index";

export default function FriendsList() {
  const [friendshipData, setFriendshipData] = useState({
    friends: [],
    pendingReceived: [],
    pendingSent: [],
    otherUsers: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchFriendshipData();
      if (data) {
        console.log("Loaded friendship data:", data); // Debug log
        setFriendshipData(data);
      } else {
        setError("Failed to load friendship data");
      }
    } catch (err) {
      console.error("Error loading friendship data:", err);
      setError("An error occurred while loading friends");
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (friendId) => {
    try {
      await sendFriendRequest(friendId);
      // Reload the data to show updated status
      await loadData();
    } catch (err) {
      console.error("Error sending friend request:", err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Friends ({friendshipData.friends.length})</h2>
      {friendshipData.friends.length === 0 ? (
        <div>No friends yet</div>
      ) : (
        friendshipData.friends.map((friend) => (
          <div key={friend.id}>
            {friend.first_name} {friend.last_name}
          </div>
        ))
      )}

      <h2>Pending Friend Requests ({friendshipData.pendingReceived.length})</h2>
      {friendshipData.pendingReceived.length === 0 ? (
        <div>No pending requests</div>
      ) : (
        friendshipData.pendingReceived.map((user) => (
          <div key={user.id}>
            {user.first_name} {user.last_name}
            <button onClick={() => acceptFriendRequest(user.id)}>Accept</button>
            <button onClick={() => rejectFriendRequest(user.id)}>Reject</button>
          </div>
        ))
      )}

      <h2>Sent Friend Requests ({friendshipData.pendingSent.length})</h2>
      {friendshipData.pendingSent.length === 0 ? (
        <div>No sent requests</div>
      ) : (
        friendshipData.pendingSent.map((user) => (
          <div key={user.id}>
            {user.first_name} {user.last_name}
          </div>
        ))
      )}

      <h2>Other Users ({friendshipData.otherUsers.length})</h2>
      {friendshipData.otherUsers.length === 0 ? (
        <div>No other users found</div>
      ) : (
        friendshipData.otherUsers.map((user) => (
          <div key={user.id}>
            {user.first_name} {user.last_name}
            <button onClick={() => handleSendRequest(user.id)}>
              Add Friend
            </button>
          </div>
        ))
      )}
    </div>
  );
}
