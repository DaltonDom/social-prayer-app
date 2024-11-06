import React, { createContext, useState, useContext } from "react";

const JournalContext = createContext();

export function JournalProvider({ children }) {
  const [journals, setJournals] = useState([]);

  const addJournal = (newJournal) => {
    setJournals((currentJournals) => [
      {
        id: Date.now().toString(),
        date: new Date().toISOString().split("T")[0],
        ...newJournal,
      },
      ...currentJournals,
    ]);
  };

  return (
    <JournalContext.Provider value={{ journals, addJournal }}>
      {children}
    </JournalContext.Provider>
  );
}

export function useJournals() {
  return useContext(JournalContext);
}
