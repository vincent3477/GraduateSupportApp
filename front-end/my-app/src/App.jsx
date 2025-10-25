import { Route, Routes } from "react-router-dom";
import Home from "./sections/Home.jsx";
import Onboarding from "./pages/Onboarding.jsx";
import Login from "./pages/Login.jsx";
import SupportBoard from "./pages/SupportBoard.jsx";
import CommunityChat from "./pages/CommunityChat.jsx";
import RoomChat from "./pages/RoomChat.jsx";
import NavBar from "./components/NavBar.jsx";

const App = () => {
  return (
    <div className="min-h-screen bg-[#FFFDF6] text-slate-900">
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/login" element={<Login />} />
        <Route path="/support" element={<SupportBoard />} />
        <Route path="/community-chat" element={<CommunityChat />} />
        <Route path="/community-chat/:roomId" element={<RoomChat />} />
      </Routes>
    </div>
  );
};

export default App;
