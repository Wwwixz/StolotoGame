import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { RoleProvider } from "./role";
import { PlayerProvider } from "./player";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RoleProvider>
      <PlayerProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </PlayerProvider>
    </RoleProvider>
  </React.StrictMode>,
);
