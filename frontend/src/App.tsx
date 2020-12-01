import React from "react";
import "./App.css";
import ListeningAnimation from "components/iconsAndAnimation/ListeningAnimation";
import Microphone from "components/iconsAndAnimation/microphone";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <div style={{ width: "200px" }}>
          <Microphone />
        </div>
      </header>
    </div>
  );
}

export default App;
