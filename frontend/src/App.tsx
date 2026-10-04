import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import RoleSelect from "./pages/RoleSelect";
import Lobby from "./pages/Lobby";
import Games from "./pages/Games";
import AutoMatch from "./pages/AutoMatch";
import RoomDetail from "./pages/RoomDetail";
import History from "./pages/History";
import Balance from "./pages/Balance";
import Profile from "./pages/Profile";
import AdminConfigurator from "./pages/AdminConfigurator";
import Economy from "./pages/Economy";
import ExpertLog from "./pages/ExpertLog";
import { ToastHost } from "./toast";
import { useEffect } from "react";
import { realtime } from "./realtime";

export default function App() {
  useEffect(() => {
    realtime.connect();
    return () => realtime.disconnect();
  }, []);

  return (
    <>
      <Routes>
        <Route path="/" element={<RoleSelect />} />
        <Route element={<Layout />}>
          <Route path="/lobby" element={<Lobby />} />
          <Route path="/games" element={<Games />} />
          <Route path="/auto-match" element={<AutoMatch />} />
          {/* Живая комната: ожидание → боты → розыгрыш → победитель в одном экране */}
          <Route path="/rooms/:id" element={<RoomDetail />} />
          <Route path="/history" element={<History />} />
          <Route path="/balance" element={<Balance />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<AdminConfigurator />} />
          <Route path="/economy" element={<Economy />} />
          <Route path="/log" element={<ExpertLog />} />
          <Route path="*" element={<RoleSelect />} />
        </Route>
      </Routes>
      <ToastHost />
    </>
  );
}
