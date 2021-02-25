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
  const [socketSessionId, setSocketSessionId] = useState<null | string>(null);

  const value = {
    theme: {
      states: { theme },
      actions: { setTheme },
    },
    socket: {
      states: { textFromSpeach, isSocketReady, socketSessionId },
      actions: { setTextFromSpeach, setSocketSessionId, setIsSocketReady },
    },
  };

  return (
    <AppContext.Provider value={value as IContext}>
      {children}
    </AppContext.Provider>
  );
};

export const AppConsumer = AppContext.Consumer;
export default AppContext;
