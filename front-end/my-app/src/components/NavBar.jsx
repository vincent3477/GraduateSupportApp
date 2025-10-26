import { Link, useLocation, useNavigate } from "react-router-dom";
<<<<<<< HEAD
import { Sparkles, LogOut } from "lucide-react";
import { useCallback } from "react";
=======
import { Sparkles } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
>>>>>>> df3b948 (added new features)
import logoMark from "../assets/logo.svg";
import { LS_KEYS, loadSupportData } from "../utils/supportStorage.js";

const NavBar = ({isAuthenticated, setIsAuthenticated}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(() => loadSupportData().user);

  const handleContactClick = useCallback(() => {
    if (location.pathname !== "/") {
      navigate("/", { state: { scrollTo: "contact" } });
      return;
    }
    const target = document.getElementById("contact");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location.pathname, navigate]);

<<<<<<< HEAD
  const handleSignOut = useCallback(async() => {
    localStorage.removeItem('authToken');
    try {
      await fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }
    setIsAuthenticated(false);
    navigate('/')
  },[setIsAuthenticated, navigate]);
=======
  useEffect(() => {
    const syncProfile = () => {
      const { user } = loadSupportData();
      setProfile(user || null);
    };

    syncProfile();

    const handleStorage = (event) => {
      if (event.key && event.key !== LS_KEYS.user) return;
      syncProfile();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("gradpath:user-updated", syncProfile);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("gradpath:user-updated", syncProfile);
    };
  }, []);

  useEffect(() => {
    const { user } = loadSupportData();
    setProfile(user || null);
  }, [location.key, location.pathname]);

  const displayName = profile?.name?.trim() || profile?.username?.trim() || "";
  const shortName = displayName ? displayName.split(" ")[0] : "";
  const avatarUrl =
    profile?.avatarUrl || profile?.avatar || profile?.photoUrl || profile?.imageUrl || profile?.photo;
  const initials = shortName
    ? shortName[0].toUpperCase()
    : displayName
    ? displayName[0].toUpperCase()
    : "G";
>>>>>>> df3b948 (added new features)

  return (
    <header className="sticky top-0 z-50 border-b border-[#e4dcc4] bg-[rgba(255,253,246,0.92)] backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-800 transition hover:text-[#2F4D6A]">
          <img src={logoMark} alt="GradPath logo" className="h-9 w-9 rounded-2xl bg-[#2F4D6A]/10 p-1.5 shadow-sm shadow-[#2F4D6A]/10" />
          <span className="text-lg font-semibold">GradPath</span>
        </Link>

        <nav className="flex items-center gap-3 text-sm font-medium text-slate-600">
          <Link
            to="/"
            className="interactive inline-flex items-center rounded-full border border-transparent px-4 py-2 transition hover:border-[#2F4D6A] hover:text-[#2F4D6A]"
          >
            Home
          </Link>
          <Link
            to="/support"
            className="interactive inline-flex items-center rounded-full border border-transparent px-4 py-2 transition hover:border-[#2F4D6A] hover:text-[#2F4D6A]"
          >
            Support Board
          </Link>
          <button
            type="button"
            onClick={handleContactClick}
            className="interactive inline-flex items-center rounded-full border border-transparent px-4 py-2 transition hover:border-[#2F4D6A] hover:text-[#2F4D6A]"
          >
            Contact
          </button>
        </nav>

<<<<<<< HEAD
        <div className="flex items-center gap-3 text-sm font-semibold">
          {isAuthenticated ? (
            // Signed in - show sign out
            <button
              onClick={handleSignOut}
              className="interactive inline-flex items-center gap-2 rounded-full bg-[#2F4D6A] px-5 py-2 text-sm font-semibold text-[#FFFDF6] shadow shadow-[#2F4D6A]/20 transition hover:bg-[#375d80]"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          ) : (
            // Not signed in - show login and signup
            <>
              <Link
                to="/login"
                className="interactive rounded-full border border-transparent px-4 py-2 text-slate-600 transition hover:text-[#2F4D6A]"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="interactive inline-flex items-center gap-2 rounded-full bg-[#2F4D6A] px-5 py-2 text-sm font-semibold text-[#FFFDF6] shadow shadow-[#2F4D6A]/20 transition hover:bg-[#375d80]"
              >
                <Sparkles className="h-4 w-4" />
                Sign up
              </Link>
            </>
          )}
        </div>
=======
        {profile ? (
          <Link
            to="/support"
            className="interactive inline-flex items-center gap-3 rounded-full border border-[#d8d2c0] bg-white/80 px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#2F4D6A] hover:text-[#2F4D6A]"
            aria-label={`Open ${displayName || "your"} support board`}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={`${displayName}'s avatar`}
                className="h-9 w-9 rounded-full object-cover shadow-sm"
              />
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2F4D6A]/10 text-base font-semibold text-[#2F4D6A] shadow-sm">
                {initials}
              </span>
            )}
            <span className="pr-2">{shortName || displayName || "Your profile"}</span>
          </Link>
        ) : (
          <div className="flex items-center gap-3 text-sm font-semibold">
            <Link
              to="/login"
              className="interactive rounded-full border border-transparent px-4 py-2 text-slate-600 transition hover:text-[#2F4D6A]"
            >
              Log in
            </Link>
            <Link
              to="/onboarding"
              className="interactive inline-flex items-center gap-2 rounded-full bg-[#2F4D6A] px-5 py-2 text-sm font-semibold text-[#FFFDF6] shadow shadow-[#2F4D6A]/20 transition hover:bg-[#375d80]"
            >
              <Sparkles className="h-4 w-4" />
              Sign up
            </Link>
          </div>
        )}
>>>>>>> df3b948 (added new features)
      </div>
    </header>
  );
};

export default NavBar;
