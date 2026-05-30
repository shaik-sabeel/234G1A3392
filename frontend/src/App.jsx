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
  User,
  Clock,
  LogOut,
  Bell
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

function App() {
  const [notifications, setNotifications] = useState([]);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Student Profile details loaded from backend
  const [profile, setProfile] = useState({
    name: 'Student',
    rollNo: '234G1A3392',
    email: '234g1a3392@srit.ac.in'
  });

  const [readIds, setReadIds] = useState(() => {
    try {
      const saved = localStorage.getItem('srit_read_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('srit_read_notifications', JSON.stringify(readIds));
  }, [readIds]);

  // Fetch profile details
  useEffect(() => {
    axios.get(`${API_BASE}/profile`)
      .then(res => setProfile(res.data))
      .catch(err => console.log('Could not fetch student profile', err));
  }, []);

  const loadNotifications = useCallback(async (nLimit, hiddenIds) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE}/notifications`, {
        params: {
          n: nLimit,
          readIds: hiddenIds.join(',')
        }
      });
      if (response.data?.success) {
        setNotifications(response.data.notifications || []);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || 'Server connection failed. Run backend server first.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications(limit, readIds);
  }, [limit, readIds, loadNotifications]);

  const handleMarkAsRead = (id) => {
    setReadIds(prev => [...prev, id]);
  };

  const handleResetHistory = () => {
    setReadIds([]);
  };

  const getCategoryTheme = (type) => {
    switch (type?.toLowerCase()) {
      case 'placement':
        return {
          badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
          icon: <Briefcase className="w-5 h-5 text-violet-400" />
        };
      case 'result':
        return {
          badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          icon: <GraduationCap className="w-5 h-5 text-emerald-400" />
        };
      case 'event':
        return {
          badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          icon: <Calendar className="w-5 h-5 text-amber-400" />
        };
      default:
        return {
          badge: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
          icon: <Info className="w-5 h-5 text-slate-400" />
        };
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      {/* Header bar */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-500 to-indigo-600 flex items-center justify-center shadow-md shadow-indigo-500/10">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                SRIT Campus Hub
              </h1>
              <p className="text-xs text-slate-500">Student Notification Portal</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Gateway
            </span>
            <button
              onClick={() => loadNotifications(limit, readIds)}
              disabled={loading}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition border border-slate-800 disabled:opacity-50"
              title="Refresh feed"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sidebar panel */}
        <section className="space-y-6 lg:col-span-1">
          {/* Profile Card */}
          <div className="bg-gradient-to-b from-slate-900/60 to-slate-900/30 border border-slate-900 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5 pointer-events-none">
              <User className="w-36 h-36" />
            </div>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
              My Profile
            </h2>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-lg">
                {profile.name[0]}
              </div>
              <div className="min-w-0">
                <p className="text-base font-semibold text-white truncate">{profile.name}</p>
                <p className="text-xs text-indigo-400 font-mono font-medium">{profile.rollNo}</p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">{profile.email}</p>
              </div>
            </div>
          </div>

          {/* Quick Priorities list */}
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
              Feed Categories
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-900/60">
                <span className="text-sm text-slate-200">Placements</span>
                <span className="text-[10px] font-bold text-violet-400 bg-violet-400/5 px-2 py-0.5 rounded border border-violet-400/10">Priority: High</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-900/60">
                <span className="text-sm text-slate-200">Results</span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/5 px-2 py-0.5 rounded border border-emerald-400/10">Priority: Medium</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-900/60">
                <span className="text-sm text-slate-200">Events</span>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-400/5 px-2 py-0.5 rounded border border-amber-400/10">Priority: Low</span>
              </div>
            </div>
          </div>

          {/* Control Settings */}
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
              Feed Controls
            </h2>
            
            <div className="space-y-5">
              <div>
                <label className="text-xs text-slate-500 font-semibold block mb-2">
                  MAX NOTIFICATIONS TO SHOW: {limit}
                </label>
                <input
                  type="range"
                  min="3"
                  max="30"
                  value={limit}
                  onChange={(e) => setLimit(parseInt(e.target.value, 10))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-900/80 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-semibold block">
                    READ LOGS
                  </span>
                  <span className="text-[11px] text-slate-400">{readIds.length} hidden from feed</span>
                </div>
                {readIds.length > 0 && (
                  <button
                    onClick={handleResetHistory}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
                  >
                    Reset & Show All
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Feed Column */}
        <section className="lg:col-span-2 space-y-4">
          
          {/* Error banner */}
          {error && (
            <div className="bg-rose-500/5 border border-rose-500/10 rounded-2xl p-5 flex gap-4">
              <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-rose-400">Gateway Error</h3>
                <p className="text-xs text-slate-400 mt-1 leading-normal">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* Heading */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              My Priority Feed
            </span>
          </div>

          {loading ? (
            /* Skeleton Loading */
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-slate-900/10 border border-slate-900/60 rounded-2xl p-5 animate-pulse flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-800/40 shrink-0"></div>
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-3 bg-slate-800/40 rounded w-1/4"></div>
                    <div className="h-3.5 bg-slate-800/40 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            /* Empty State */
            <div className="bg-slate-900/10 border border-slate-900 border-dashed rounded-2xl p-12 text-center flex flex-col items-center justify-center">
              <CheckCircle className="w-12 h-12 text-slate-800 mb-3" />
              <h3 className="text-sm font-semibold text-slate-400">Feed clean</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs leading-normal">
                {readIds.length > 0 
                  ? 'All campus updates have been checked. Reset filter history to show them again.'
                  : 'No notification stream active. Check back later.'
                }
              </p>
              {readIds.length > 0 && (
                <button
                  onClick={handleResetHistory}
                  className="mt-4 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition"
                >
                  Reset History
                </button>
              )}
            </div>
          ) : (
            /* Notifications list */
            <div className="space-y-4">
              {notifications.map((notif) => {
                const theme = getCategoryTheme(notif.Type);
                return (
                  <div 
                    key={notif.ID}
                    className="group bg-slate-900/20 hover:bg-slate-900/40 border border-slate-900 hover:border-slate-800 rounded-2xl p-5 flex items-start gap-4 transition duration-200"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center border border-slate-900 shrink-0">
                      {theme.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2 mb-1">
                        <span className={`text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded border ${theme.badge}`}>
                          {notif.Type}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {notif.Timestamp}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed font-medium">
                        {notif.Message}
                      </p>
                      <span className="text-[9px] text-slate-600 block mt-1 font-mono select-all truncate">
                        ID: {notif.ID}
                      </span>
                    </div>

                    <div className="shrink-0 self-center opacity-0 group-hover:opacity-100 transition duration-150">
                      <button
                        onClick={() => handleMarkAsRead(notif.ID)}
                        className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold rounded-lg border border-slate-800 transition"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 mt-12 bg-slate-950">
        <div className="max-w-6xl mx-auto px-6 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <p>© 2026 Sumathi Reddy Institute of Technology. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="cursor-default">SRIT Campus Portal</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
