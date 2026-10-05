import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { RoleProvider } from "./role";
import { EconomyProvider } from "./state/economy";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RoleProvider>
      <EconomyProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </EconomyProvider>
    </RoleProvider>
  </React.StrictMode>,
);
