import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import RoleSelect from "./pages/RoleSelect";
import Lobby from "./pages/Lobby";
import Games from "./pages/Games";
import AutoMatch from "./pages/AutoMatch";
import RoomDetail from "./pages/RoomDetail";
import Waiting from "./pages/Waiting";
import BotsFilling from "./pages/BotsFilling";
import Draw from "./pages/Draw";
import Winners from "./pages/Winners";
import History from "./pages/History";
import Balance from "./pages/Balance";
import Profile from "./pages/Profile";
import AdminConfigurator from "./pages/AdminConfigurator";
import Economy from "./pages/Economy";
import ExpertLog from "./pages/ExpertLog";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RoleSelect />} />
      <Route element={<Layout />}>
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/games" element={<Games />} />
        <Route path="/auto-match" element={<AutoMatch />} />
        <Route path="/rooms/:id" element={<RoomDetail />} />
        <Route path="/rooms/:id/waiting" element={<Waiting />} />
        <Route path="/rooms/:id/bots" element={<BotsFilling />} />
        <Route path="/rooms/:id/draw" element={<Draw />} />
        <Route path="/rooms/:id/winners" element={<Winners />} />
        <Route path="/history" element={<History />} />
        <Route path="/balance" element={<Balance />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<AdminConfigurator />} />
        <Route path="/economy" element={<Economy />} />
        <Route path="/log" element={<ExpertLog />} />
        <Route path="*" element={<RoleSelect />} />
      </Route>
    </Routes>
  );
}
