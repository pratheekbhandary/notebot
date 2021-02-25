import React, { useContext, useEffect } from "react";
import "./App.css";
import ListeningAnimation from "components/iconsAndAnimation/ListeningAnimation";
import Microphone from "components/iconsAndAnimation/microphone";
import AppContext from "contexts/AppContext";
import { initSockets } from "sockets";
import { sendHi } from "sockets/emitters";

function App() {
  const {
    socket: { actions },
  } = useContext(AppContext);

  useEffect(() => {
    initSockets({
      setTextFromSpeach: actions!.setTextFromSpeach,
      setIsSocketReady: actions!.setIsSocketReady,
      setSessionId: actions!.setSocketSessionId,
    });
  }, [actions]);

  return (
    <div className="App">
      <header className="App-header">
        <div style={{ width: "200px" }}>
          <Microphone />
          <button onClick={sendHi}>send hi</button>
        </div>
      </header>
    </div>
  );
}

export default App;
