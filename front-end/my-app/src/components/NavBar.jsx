import { Link, useLocation, useNavigate } from "react-router-dom";
import { Sparkles, LogOut } from "lucide-react";
import { useCallback } from "react";
import logoMark from "../assets/logo.svg";

const NavBar = ({isAuthenticated, setIsAuthenticated}) => {
  const location = useLocation();
  const navigate = useNavigate();

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

  return (
    <header className="sticky top-0 z-50 border-b border-[#e4dcc4] bg-[rgba(255,253,246,0.92)] backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-800 transition hover:text-[#2F4D6A]">
          <img src={logoMark} alt="GradPath logo" className="h-9 w-9 rounded-2xl bg-[#2F4D6A]/10 p-1.5 shadow-sm shadow-[#2F4D6A]/10" />
          <span className="text-lg font-semibold">GradPath</span>
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link to="/" className="interactive inline-flex items-center transition hover:text-[#2F4D6A]">
            Home
          </Link>
          <Link to="/support" className="interactive inline-flex items-center transition hover:text-[#2F4D6A]">
            Support Board
          </Link>
          <button
            type="button"
            onClick={handleContactClick}
            className="interactive rounded-full border border-transparent px-4 py-2 text-slate-600 transition hover:text-[#2F4D6A]"
          >
            Contact
          </button>
        </nav>

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
      </div>
    </header>
  );
};

export default NavBar;
