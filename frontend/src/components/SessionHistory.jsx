import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, ChevronDown, ChevronUp, Activity, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:8000';

export default function SessionHistory({ onBack }) {
  const { token } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    // Fetch sessions when the component mounts
    // We pass the JWT in the Authorization header so the backend knows who we are
    const fetchSessions = async () => {
      try {
        const response = await fetch(`${API_URL}/sessions/`, {
          headers: {
            // "Bearer <token>" is the standard way to send a JWT
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          setError('Failed to load session history.');
          return;
        }

        const data = await response.json();
        setSessions(data);
      } catch {
        setError('Cannot connect to server.');
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [token]);

  const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id);

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="max-w-3xl mx-auto w-full px-4 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="p-2 hover:bg-neutral-800 rounded-full transition-colors text-neutral-400 hover:text-white"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Session History</h2>
          <p className="text-neutral-400 text-sm mt-1">All your past practice sessions</p>
        </div>
      </div>

      {/* States */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mb-4" />
          Loading your sessions...
        </div>
      )}

      {error && (
        <div className="bg-red-950/40 border border-red-900/50 rounded-2xl p-6 text-red-400 text-center">
          {error}
        </div>
      )}

      {!loading && !error && sessions.length === 0 && (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🗂️</div>
          <h3 className="text-xl font-semibold text-neutral-300 mb-2">No sessions yet</h3>
          <p className="text-neutral-500">Complete your first practice session to see it here.</p>
        </div>
      )}

      {/* Session Cards */}
      <div className="space-y-4">
        {sessions.map((session) => {
          const isExpanded = expandedId === session.id;
          const data = session.dashboard_data;

          return (
            <div
              key={session.id}
              className="bg-neutral-900/50 border border-neutral-800 rounded-2xl overflow-hidden transition-all hover:border-neutral-700"
            >
              {/* Session Summary Row */}
              <button
                onClick={() => toggleExpand(session.id)}
                className="w-full text-left p-5 flex items-start gap-4"
              >
                <div className="p-2 bg-purple-500/10 rounded-xl mt-0.5 shrink-0">
                  <Activity className="w-5 h-5 text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-neutral-100 font-medium leading-snug line-clamp-2 mb-1">
                    {session.scenario}
                  </p>
                  <p className="text-neutral-500 text-sm flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(session.created_at)}
                  </p>
                </div>
                <div className="shrink-0 text-neutral-500 mt-1">
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </button>

              {/* Expanded Dashboard Details */}
              {isExpanded && data && (
                <div className="border-t border-neutral-800 p-5 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
                  {/* Overall Feedback */}
                  {data.overallFeedback && (
                    <div className="bg-neutral-950/50 rounded-xl p-4">
                      <p className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-2">Overall Feedback</p>
                      <p className="text-neutral-300 text-sm leading-relaxed">{data.overallFeedback}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Strengths */}
                    {data.strengths?.length > 0 && (
                      <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-4">
                        <p className="text-emerald-400 text-sm font-semibold flex items-center gap-1.5 mb-3">
                          <CheckCircle className="w-4 h-4" /> What Went Well
                        </p>
                        <ul className="space-y-1.5">
                          {data.strengths.map((s, i) => (
                            <li key={i} className="text-neutral-300 text-sm flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Areas for Improvement */}
                    {data.areasForImprovement?.length > 0 && (
                      <div className="bg-amber-950/20 border border-amber-900/30 rounded-xl p-4">
                        <p className="text-amber-400 text-sm font-semibold flex items-center gap-1.5 mb-3">
                          <AlertTriangle className="w-4 h-4" /> Areas to Improve
                        </p>
                        <ul className="space-y-1.5">
                          {data.areasForImprovement.map((a, i) => (
                            <li key={i} className="text-neutral-300 text-sm flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                              {a}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {isExpanded && !data && (
                <div className="border-t border-neutral-800 p-5 text-neutral-500 text-sm text-center">
                  No analysis data available for this session.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
