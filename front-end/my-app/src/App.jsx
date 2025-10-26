import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./sections/Home.jsx";
import Onboarding from "./pages/Onboarding.jsx";
import Login from "./pages/Login.jsx";
import SupportBoard from "./pages/SupportBoard.jsx";
import CommunityChat from "./pages/CommunityChat.jsx";
import RoomChat from "./pages/RoomChat.jsx";
import NavBar from "./components/NavBar.jsx";
import PrivateMatchChat from "./pages/PrivateMatchChat.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";

const App = () => {
  const location = useLocation();
  const hideGlobalNav = ["/community-chat", "/private-match-chat"].some((prefix) =>
    location.pathname.startsWith(prefix)
  );

  return (
    <div className="min-h-screen bg-[#FFFDF6] text-slate-900">
      {!hideGlobalNav && <NavBar />}
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/login" element={<Login />} />
        <Route path="/support" element={<SupportBoard />} />
        <Route path="/community-chat" element={<CommunityChat />} />
        <Route path="/community-chat/:roomId" element={<RoomChat />} />
        <Route path="/private-match-chat" element={<PrivateMatchChat />} />
      </Routes>
    </div>
  );
};

export default App;
