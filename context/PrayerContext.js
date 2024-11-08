import React, { createContext, useState, useContext } from "react";
import { DUMMY_PRAYERS } from "../data/dummyData";

const PrayerContext = createContext();

export function PrayerProvider({ children }) {
  const [prayers, setPrayers] = useState(DUMMY_PRAYERS);
  const [userProfile, setUserProfile] = useState({
    name: "John Smith",
    email: "john.smith@example.com",
    profileImage: "https://via.placeholder.com/150",
  });

  const updateUserProfile = (newProfile) => {
    setUserProfile(newProfile);
    // Update profile image and name in prayers and comments
    setPrayers((currentPrayers) =>
      currentPrayers.map((prayer) => {
        if (prayer.userName === userProfile.name) {
          return {
            ...prayer,
            userName: newProfile.name,
            userImage: newProfile.profileImage,
            comments_list: prayer.comments_list?.map((comment) =>
              comment.userName === userProfile.name
                ? {
                    ...comment,
                    userName: newProfile.name,
                    userImage: newProfile.profileImage,
                  }
                : comment
            ),
          };
        }
        return prayer;
      })
    );
  };

  const addPrayer = (newPrayer) => {
    setPrayers((currentPrayers) => {
      const uniqueId = `${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      return [
        {
          id: uniqueId,
          userName: userProfile.name,
          userImage: userProfile.profileImage,
          date: new Date().toISOString().split("T")[0],
          comments: 0,
          updates: 0,
          updates_list: [],
          comments_list: [],
          ...newPrayer,
        },
        ...currentPrayers,
      ];
    });
  };

  const addUpdate = (prayerId, updateText) => {
    setPrayers((currentPrayers) =>
      currentPrayers.map((prayer) => {
        if (prayer.id === prayerId) {
          const uniqueUpdateId = `u-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}`;
          const newUpdate = {
            id: uniqueUpdateId,
            date: new Date().toISOString().split("T")[0],
            text: updateText,
          };
          return {
            ...prayer,
            updates: (prayer.updates || 0) + 1,
            updates_list: [...(prayer.updates_list || []), newUpdate],
          };
        }
        return prayer;
      })
    );
  };

  const deletePrayer = (prayerId) => {
    setPrayers((currentPrayers) =>
      currentPrayers.filter((prayer) => prayer.id !== prayerId)
    );
  };

  const updatePrayer = (prayerId, updates) => {
    setPrayers((currentPrayers) =>
      currentPrayers.map((prayer) =>
        prayer.id === prayerId ? { ...prayer, ...updates } : prayer
      )
    );
  };

  return (
    <PrayerContext.Provider
      value={{
        prayers,
        addPrayer,
        addUpdate,
        deletePrayer,
        updatePrayer,
        userProfile,
        updateUserProfile,
      }}
    >
      {children}
    </PrayerContext.Provider>
  );
}

export function usePrayers() {
  return useContext(PrayerContext);
}
