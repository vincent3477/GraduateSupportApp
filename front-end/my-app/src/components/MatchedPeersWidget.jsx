import { useEffect, useState } from "react";
import { Users, MapPin, Target } from "lucide-react";

const MatchedPeersWidget = ({ userId }) => {
  const [peers, setPeers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchSimilarUsers = async () => {
      console.log("🔍 Fetching top 5 similar users for:", userId);

      try {
        const response = await fetch(`/api/users/${userId}/similar?top_k=5`);

        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }

        const data = await response.json();
        console.log("✅ Matched peers loaded:", data);

        setPeers(data.similar_users || []);
        setError(null);
      } catch (err) {
        console.error("❌ Failed to fetch similar users:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarUsers();
  }, [userId]);

  if (!userId) {
    return (
      <div className="rounded-3xl border border-[#e4dcc4] bg-white/90 p-6 shadow-sm">
        <div className="text-center text-sm text-slate-600">
          <p className="font-medium">Complete onboarding to see your matches</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-[#e4dcc4] bg-white/90 p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Users size={18} className="text-[#2F4D6A]" />
          <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-[#2F4D6A]">
            Your Top Matches
          </h3>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2F4D6A] mx-auto"></div>
          <p className="mt-3 text-sm text-slate-600">Finding similar graduates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-[#e4dcc4] bg-white/90 p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Users size={18} className="text-[#2F4D6A]" />
          <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-[#2F4D6A]">
            Your Top Matches
          </h3>
        </div>
        <p className="text-sm text-slate-600">
          Could not load matches right now. Try refreshing the page.
        </p>
      </div>
    );
  }

  if (peers.length === 0) {
    return (
      <div className="rounded-3xl border border-[#e4dcc4] bg-white/90 p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Users size={18} className="text-[#2F4D6A]" />
          <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-[#2F4D6A]">
            Your Top Matches
          </h3>
        </div>
        <p className="text-sm text-slate-600">
          No matches found yet. Complete your preferences to get matched!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-[#e4dcc4] bg-white/90 p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Users size={18} className="text-[#2F4D6A]" />
        <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-[#2F4D6A]">
          Your Top 5 Matches
        </h3>
      </div>

      <div className="space-y-3">
        {peers.map((peer, index) => (
          <div
            key={peer.user_id}
            className="rounded-2xl border border-[#e4dcc4] bg-white p-4 hover:border-[#2F4D6A] transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900 text-sm">{peer.name}</h4>
                <div className="flex items-center gap-1 mt-1">
                  <Target size={12} className="text-slate-500" />
                  <p className="text-xs text-slate-600">{peer.major}</p>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin size={12} className="text-slate-500" />
                  <p className="text-xs text-slate-500">{peer.location}</p>
                </div>
              </div>
              <span className="rounded-full bg-[#2F4D6A]/10 px-2.5 py-1 text-xs font-bold text-[#2F4D6A]">
                #{index + 1}
              </span>
            </div>

            {/* Goals */}
            {peer.goals && peer.goals.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {peer.goals.slice(0, 2).map((goal, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-[#8FB3BF]/20 px-2 py-0.5 text-xs text-slate-700 border border-[#8FB3BF]/30"
                  >
                    {goal}
                  </span>
                ))}
                {peer.goals.length > 2 && (
                  <span className="text-xs text-slate-500">
                    +{peer.goals.length - 2} more
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

        <div className="mt-4 pt-4 border-t border-[#e4dcc4]">
          <p className="text-xs text-slate-500 text-center">
            Matched using AI vector similarity
          </p>
          <p className="text-xs text-slate-400 text-center mt-1">
            Based on goals, interests, and major
          </p>
        </div>
      </div>

      {/* Helpful tip card below */}
      <div className="rounded-3xl border border-[#e4dcc4] bg-gradient-to-br from-[#f7f2e4] to-white p-6 shadow-sm">
        <h4 className="text-sm font-semibold text-slate-900 mb-2">
          Why peer matching matters
        </h4>
        <p className="text-xs text-slate-600 leading-relaxed">
          These graduates share similar career goals and interests with you.
          Reach out through the matched chat to exchange advice, accountability,
          and support as you navigate post-grad life together.
        </p>
      </div>
    </div>
  );
};

export default MatchedPeersWidget;
