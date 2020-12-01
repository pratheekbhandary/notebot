import React, {
  createContext,
  FC,
  ReactNode,
  useState,
  useMemo,
  useEffect,
} from "react";
import { initSockets } from "sockets";
import { IContext } from "types/contexts";
import { localStorageKeys } from "utils/constants";

const AppContext = createContext<IContext>({} as IContext);

export const AppProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState(
    localStorage.getItem(localStorageKeys.theme) || "DARK"
  );

  const [textFromSpeach, setTextFromSpeach] = useState("");
  const [isSocketReady, setIsSocketReady] = useState(false);

  const value = useMemo<IContext>(
    () => ({
      theme: {
        states: { theme },
        actions: { setTheme },
      },
      socket: {
        states: { textFromSpeach, isSocketReady },
        actions: { setTextFromSpeach },
      },
    }),
    []
  );

  useEffect(() => {
    initSockets({ setTextFromSpeach, setIsSocketReady });
  }, []);

  return (
    <AppContext.Provider value={value as IContext}>
      {children}
    </AppContext.Provider>
  );
};

// export const AppConsumer = AppContext.Consumer;
export default AppContext;
