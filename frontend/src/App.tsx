import React from "react";
import "./App.css";
import ListeningAnimation from "components/iconsAndAnimation/ListeningAnimation";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <div style={{ height: "400px" }}></div>
        <ListeningAnimation isSpeaking={true} />
      </header>
    </div>
  );
}

export default App;
