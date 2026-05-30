import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  Briefcase, 
  GraduationCap, 
  Calendar, 
  RefreshCw, 
  Sliders, 
  CheckCircle, 
  AlertTriangle, 
  Sparkles,
  Info,
  Layers,
  Clock
} from 'lucide-react';

const BACKEND_URL = 'http://localhost:5000/api';

function App() {
  const [notifications, setNotifications] = useState([]);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Keep track of read notifications in LocalStorage
  const [readIds, setReadIds] = useState(() => {
    try {
      const saved = localStorage.getItem('affordmed_read_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persist read notification IDs
  useEffect(() => {
    localStorage.setItem('affordmed_read_ids', JSON.stringify(readIds));
  }, [readIds]);

  // Fetch priority notifications from Express backend
  const fetchNotifications = useCallback(async (currentLimit, currentReadIds) => {
    setLoading(true);
    setError(null);
    try {
      // Pass marked read IDs to the backend so the priority algorithm filters them out
      const readIdsParam = currentReadIds.join(',');
      const response = await axios.get(`${BACKEND_URL}/notifications`, {
        params: {
          n: currentLimit,
          readIds: readIdsParam
        }
      });
      
      if (response.data?.success) {
        setNotifications(response.data.notifications || []);
      } else {
        setError('Failed to load notifications from backend API.');
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      const msg = err.response?.data?.error || err.message || 'Cannot connect to backend server. Make sure it is running on port 5000.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data on load or when parameters change
  useEffect(() => {
    fetchNotifications(limit, readIds);
  }, [limit, readIds, fetchNotifications]);

  // Mark a notification as read (filters it out from the priority list)
  const markAsRead = (id) => {
    setReadIds(prev => [...prev, id]);
  };

  // Reset all marked read notifications
  const resetRead = () => {
    setReadIds([]);
  };

  // Get color styles for the notification badges
  const getTypeBadgeStyles = (type) => {
    switch (type?.toLowerCase()) {
      case 'placement':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      case 'result':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'event':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  // Get the icon corresponding to the notification type
  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'placement':
        return <Briefcase className="w-5 h-5 text-indigo-400" />;
      case 'result':
        return <GraduationCap className="w-5 h-5 text-emerald-400" />;
      case 'event':
        return <Calendar className="w-5 h-5 text-amber-400" />;
      default:
        return <Info className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation / Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Campus Priority Inbox
              </h1>
              <p className="text-xs text-slate-500">Affordmed Assessment System</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Gateway
            </span>
            <button
              onClick={() => fetchNotifications(limit, readIds)}
              disabled={loading}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-all border border-slate-800 disabled:opacity-50"
              title="Refresh Feed"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main content grid */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Setup guides & priorities */}
        <section className="space-y-6 lg:col-span-1">
          {/* Priority Rules card */}
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 backdrop-blur-sm">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              Priority Algorithm
            </h2>
            <p className="text-sm text-slate-400 mb-5">
              Notifications are dynamically sorted using a Min-Heap of size <code className="text-indigo-300 font-mono">n</code> on the backend.
            </p>
            
            <div className="space-y-3.5">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-900/60">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                  <span className="text-sm font-medium text-slate-200">Placements</span>
                </div>
                <span className="text-xs font-semibold text-indigo-400 bg-indigo-400/5 px-2 py-0.5 rounded border border-indigo-400/10">Weight 3 (Highest)</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-900/60">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="text-sm font-medium text-slate-200">Results</span>
                </div>
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-400/5 px-2 py-0.5 rounded border border-emerald-400/10">Weight 2 (Medium)</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-900/60">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span className="text-sm font-medium text-slate-200">Events</span>
                </div>
                <span className="text-xs font-semibold text-amber-400 bg-amber-400/5 px-2 py-0.5 rounded border border-amber-400/10">Weight 1 (Lowest)</span>
              </div>
            </div>

            <div className="mt-5 p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex gap-2.5">
              <Clock className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-400 leading-normal">
                <strong>Recency Tie-Breaker:</strong> If weights are identical, notifications with newer timestamps are prioritized first.
              </p>
            </div>
          </div>

          {/* Control Settings card */}
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 backdrop-blur-sm">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-400" />
              Inbox Control
            </h2>
            
            <div className="space-y-5">
              <div>
                <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-2">
                  Display Limit (n = {limit})
                </label>
                <input
                  type="range"
                  min="3"
                  max="30"
                  value={limit}
                  onChange={(e) => setLimit(parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-[10px] text-slate-600 mt-1 font-mono">
                  <span>3 Notif</span>
                  <span>15 Notif</span>
                  <span>30 Notif</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-900/80 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">
                    Read Filter
                  </span>
                  <span className="text-[11px] text-slate-400">{readIds.length} notifications hidden</span>
                </div>
                {readIds.length > 0 && (
                  <button
                    onClick={resetRead}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Reset & Show All
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Right column: Notification lists */}
        <section className="lg:col-span-2 space-y-4">
          
          {/* Status logs error message */}
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-5 flex gap-4">
              <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-rose-400">Backend Connection Error</h3>
                <p className="text-xs text-slate-400 mt-1 leading-normal">
                  {error}
                </p>
                <div className="mt-3 flex gap-2">
                  <span className="text-[10px] font-mono bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded">
                    Port: 5000
                  </span>
                  <span className="text-[10px] font-mono bg-slate-950/60 text-slate-400 px-2 py-0.5 rounded">
                    Endpoint: /api/notifications
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Feed Title & List */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Top Priority Feed
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Showing {notifications.length} of {limit} capacity
            </span>
          </div>

          {loading ? (
            /* Skeleton Loading State */
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-slate-900/20 border border-slate-900 rounded-2xl p-5 animate-pulse flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 shrink-0"></div>
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-slate-800 rounded w-1/4"></div>
                    <div className="h-3 bg-slate-800 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            /* Empty State */
            <div className="bg-slate-900/10 border border-slate-900 border-dashed rounded-2xl p-12 text-center flex flex-col items-center justify-center">
              <CheckCircle className="w-12 h-12 text-slate-700 mb-4" />
              <h3 className="text-base font-semibold text-slate-300">All caught up!</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm leading-normal">
                {readIds.length > 0 
                  ? 'All notifications have been marked as read. Reset the filter in the settings panel to review them again.'
                  : 'No notifications available on the server. Make sure your server is registered and connected correctly.'
                }
              </p>
              {readIds.length > 0 && (
                <button
                  onClick={resetRead}
                  className="mt-4 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all"
                >
                  Reset Read Filter
                </button>
              )}
            </div>
          ) : (
            /* Feed List */
            <div className="space-y-4">
              {notifications.map((notif) => (
                <div 
                  key={notif.ID}
                  className="group bg-slate-900/30 hover:bg-slate-900/60 border border-slate-900 hover:border-slate-800/80 rounded-2xl p-5 flex items-start gap-4 transition-all duration-300 shadow-sm"
                >
                  {/* Glowing Icon Base */}
                  <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center border border-slate-800 group-hover:scale-105 transition-transform duration-300 shrink-0">
                    {getTypeIcon(notif.Type)}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2 mb-1.5">
                      <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded border ${getTypeBadgeStyles(notif.Type)}`}>
                        {notif.Type}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {notif.Timestamp}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed font-medium group-hover:text-slate-100 transition-colors">
                      {notif.Message || 'No descriptive message provided.'}
                    </p>
                    <span className="text-[10px] text-slate-600 block mt-1 font-mono truncate select-all">
                      ID: {notif.ID}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="shrink-0 self-center opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => markAsRead(notif.ID)}
                      className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold rounded-lg border border-slate-800 transition-all"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 mt-12 bg-slate-950">
        <div className="max-w-6xl mx-auto px-6 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <p>© 2026 Campus Notification Portal. Clean, production-grade assessment project.</p>
          <div className="flex gap-4">
            <span className="hover:text-slate-400 cursor-default transition-colors">MERN Stack</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-default transition-colors">Tailwind CSS v4</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-default transition-colors">Min-Heap sorting</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
