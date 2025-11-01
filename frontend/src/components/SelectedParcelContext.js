import React, { createContext, useState } from "react";

export const SelectedParcelContext = createContext();

export default function SelectedParcelProvider({ children }) {
  const [selected, setSelected] = useState(null);
  return (
    <SelectedParcelContext.Provider value={{ selected, setSelected }}>
      {children}
    </SelectedParcelContext.Provider>
  );
}
