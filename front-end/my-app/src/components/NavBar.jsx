import { Link, useLocation, useNavigate } from "react-router-dom";
import { Sparkles, LogOut, LogIn, LayoutDashboard } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import logoMark from "../assets/logo.svg";
import { LS_KEYS, loadSupportData } from "../utils/supportStorage.js";

const NavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(() => loadSupportData().user);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

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

  useEffect(() => {
    const syncProfile = () => {
      const { user } = loadSupportData();
      setProfile(user || null);
    };

    syncProfile();
    setMenuOpen(false);

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
    setMenuOpen(false);
  }, [location.key, location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const handleLogout = useCallback(() => {
    [LS_KEYS.user, LS_KEYS.prefs, LS_KEYS.recs, LS_KEYS.chat].forEach((key) => {
      localStorage.removeItem(key);
    });
    setProfile(null);
    setMenuOpen(false);
    window.dispatchEvent(new Event("gradpath:user-updated"));
    navigate("/login");
  }, [navigate]);

  const displayName = profile?.name?.trim() || profile?.username?.trim() || "";
  const shortName = displayName ? displayName.split(" ")[0] : "";
  const avatarUrl =
    profile?.avatarUrl || profile?.avatar || profile?.photoUrl || profile?.imageUrl || profile?.photo;
  const initials = shortName
    ? shortName[0].toUpperCase()
    : displayName
    ? displayName[0].toUpperCase()
    : "G";

  return (
    <header className="sticky top-0 z-50 border-b border-[#e4dcc4] bg-[rgba(255,253,246,0.92)] backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-800 transition hover:text-[#2F4D6A]">
          <img
            src={logoMark}
            alt="GradPath logo"
            className="h-9 w-9 rounded-2xl bg-[#2F4D6A]/10 p-1.5 shadow-sm shadow-[#2F4D6A]/10"
          />
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

        {profile ? (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="flex items-center gap-2 rounded-full px-2 py-1 text-sm font-semibold text-slate-700 transition hover:text-[#2F4D6A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F4D6A]/40 bg-transparent hover:bg-transparent active:bg-transparent"
              style={{ backgroundColor: "transparent" }}
              aria-haspopup="true"
              aria-expanded={menuOpen}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={`${displayName}'s avatar`}
                  className="h-9 w-9 rounded-full object-cover shadow-sm"
                />
              ) : (
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d8d2c0] bg-white text-base font-semibold text-[#2F4D6A]">
                  {initials}
                </span>
              )}
              <span className="text-slate-700">{shortName || displayName || "Your profile"}</span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-[#e4dcc4] bg-white/95 p-2 text-sm text-slate-700 shadow-lg shadow-[#e4dcc4]/10">

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[#b91c1c] transition hover:bg-[#fee2e2] hover:text-[#7f1d1d]"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3 text-sm font-semibold">
            <Link
              to="/login"
              className="interactive rounded-full border border-transparent px-4 py-2 text-slate-600 transition hover:text-[#2F4D6A]"
            >
              <span className="inline-flex items-center gap-1">
                <LogIn className="h-4 w-4" />
                Log in
              </span>
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
      </div>
    </header>
  );
};

export default NavBar;
