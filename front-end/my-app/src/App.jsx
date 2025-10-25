import { Route, Routes } from "react-router-dom";
import Home from "./sections/Home.jsx";
import Onboarding from "./pages/Onboarding.jsx";

const App = () => {
  return (
    <div className="min-h-screen bg-[#FFFDF6] text-slate-900">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/onboarding" element={<Onboarding />} />
      </Routes>
    </div>
  );
};

export default App;
