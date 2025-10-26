import { ArrowLeft } from "lucide-react";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

const PageBackButton = ({ label = "Back", fallback = "/", className = "" }) => {
  const navigate = useNavigate();

  const handleBack = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  }, [fallback, navigate]);

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`interactive inline-flex items-center gap-2 rounded-full border border-[#d8d2c0] bg-white/80 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-[#2F4D6A] hover:text-[#2F4D6A] ${className}`}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </button>
  );
};

export default PageBackButton;
