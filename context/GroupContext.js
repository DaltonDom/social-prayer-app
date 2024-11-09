import React, { createContext, useContext, useState } from 'react';

const GroupContext = createContext();

const initialGroups = [
  {
    id: "1",
    name: "Youth Prayer Warriors",
    logo: "https://via.placeholder.com/50",
    members: 45,
    description: "A group dedicated to young people praying together",
    lastActive: "2 hours ago",
    prayerCount: 128,
  },
  {
    id: "2",
    name: "Family & Marriage",
    logo: "https://via.placeholder.com/50",
    members: 89,
    description: "Supporting families through prayer",
    lastActive: "5 mins ago",
    prayerCount: 256,
  },
  {
    id: "3",
    name: "Healing Ministry",
    logo: "https://via.placeholder.com/50",
    members: 67,
    description: "Praying for physical and spiritual healing",
    lastActive: "1 day ago",
    prayerCount: 312,
  },
];

export function GroupProvider({ children }) {
  const [groups, setGroups] = useState(initialGroups);

  const addGroup = (newGroup) => {
    setGroups(currentGroups => [newGroup, ...currentGroups]);
  };

  return (
    <GroupContext.Provider value={{ groups, addGroup }}>
      {children}
    </GroupContext.Provider>
  );
}

export function useGroups() {
  const context = useContext(GroupContext);
  if (!context) {
    throw new Error('useGroups must be used within a GroupProvider');
  }
  return context;
} 