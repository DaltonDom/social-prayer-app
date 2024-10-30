import React, { createContext, useState, useContext } from "react";
import { DUMMY_PRAYERS } from "../data/dummyData";

const PrayerContext = createContext();

export function PrayerProvider({ children }) {
  const [prayers, setPrayers] = useState(DUMMY_PRAYERS);

  const addPrayer = (newPrayer) => {
    setPrayers((currentPrayers) => [
      {
        id: (currentPrayers.length + 1).toString(),
        userName: "Your Name", // This would come from user auth
        userImage: "https://via.placeholder.com/50",
        date: new Date().toISOString().split("T")[0],
        comments: 0,
        updates: 0,
        ...newPrayer,
      },
      ...currentPrayers,
    ]);
  };

  const deletePrayer = (prayerId) => {
    setPrayers((currentPrayers) =>
      currentPrayers.filter((prayer) => prayer.id !== prayerId)
    );
  };

  return (
    <PrayerContext.Provider value={{ prayers, addPrayer, deletePrayer }}>
      {children}
    </PrayerContext.Provider>
  );
}

export function usePrayers() {
  return useContext(PrayerContext);
}
