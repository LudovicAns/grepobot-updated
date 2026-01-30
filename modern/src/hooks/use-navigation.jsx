import { createContext, useContext, useState } from "react";

const NavigationContext = createContext({
  activeTab: 0,
  setActiveTab: () => null,
});

export function NavigationProvider({ children }) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <NavigationContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </NavigationContext.Provider>
  );
}

export const useNavigation = () => useContext(NavigationContext);
